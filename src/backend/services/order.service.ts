import { createTenantPrisma } from '@/backend/lib/tenant-prisma'
import prisma from '@/backend/lib/prisma'
import { notify } from '@/backend/lib/pg-notify'
import { PLANS, type PlanId } from '@/backend/lib/stripe'

interface CreateOrderInput {
  customerId?: string
  customerName: string
  customerPhone: string
  customerAddress?: string
  channel: string
  type: string
  items: Array<{ productId: string; quantity: number; notes?: string }>
  deliveryFee?: number
  discount?: number
  notes?: string
}

interface ListFilters {
  status?: string
  channel?: string
  date?: string
  customerId?: string
  search?: string
  page?: number
  pageSize?: number
}

export function orderService(tenantId: string) {
  const db = createTenantPrisma(tenantId)

  return {
    async list(filters: ListFilters = {}) {
      const page = filters.page ?? 1
      const pageSize = filters.pageSize ?? 20
      const skip = (page - 1) * pageSize

      const where: Record<string, unknown> = {}
      if (filters.status) where.status = filters.status
      if (filters.channel) where.channel = filters.channel
      if (filters.customerId) where.customerId = filters.customerId
      if (filters.search) {
        where.OR = [
          { orderNumber: isNaN(Number(filters.search)) ? undefined : Number(filters.search) },
          { customerName: { contains: filters.search, mode: 'insensitive' } },
        ].filter(Boolean)
      }
      if (filters.date) {
        const date = new Date(filters.date)
        where.createdAt = { gte: date, lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) }
      }

      const [orders, total] = await Promise.all([
        db.order.findMany({
          where: where as never,
          include: { items: { include: { product: { select: { name: true } } } }, customer: { select: { name: true, phone: true } } },
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize,
        }),
        db.order.count({ where: where as never }),
      ])

      const serialized = orders.map((o) => ({
        ...o,
        subtotal: Number(o.subtotal),
        deliveryFee: Number(o.deliveryFee),
        discount: Number(o.discount),
        total: Number(o.total),
        items: o.items.map((i) => ({ ...i, unitPrice: Number(i.unitPrice), totalPrice: Number(i.totalPrice) })),
      }))
      return { orders: serialized, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
    },

    async getById(id: string) {
      const order = await db.order.findUnique({
        where: { id },
        include: {
          items: { include: { product: { select: { name: true, image: true } } } },
          customer: true,
          payments: true,
        },
      })
      if (!order) return null
      return {
        ...order,
        subtotal: Number(order.subtotal),
        deliveryFee: Number(order.deliveryFee),
        discount: Number(order.discount),
        total: Number(order.total),
        items: order.items.map((i) => ({ ...i, unitPrice: Number(i.unitPrice), totalPrice: Number(i.totalPrice) })),
      }
    },

    async create(input: CreateOrderInput) {
      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { plan: true } })
      const planId = (tenant?.plan ?? 'FREE') as PlanId
      
      // Validar se plano existe
      if (!PLANS[planId]) {
        throw new Error(`Plano inválido configurado: ${planId}`)
      }
      
      const planConfig = PLANS[planId]

      if (planConfig.maxOrders > 0) {
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)
        const monthCount = await prisma.order.count({
          where: { tenantId, createdAt: { gte: startOfMonth } },
        })
        if (monthCount >= planConfig.maxOrders) {
          throw new Error(`Limite de ${planConfig.maxOrders} pedidos/mês atingido. Faça upgrade do plano.`)
        }
      }

      // Buscar produtos em lote (evita N+1)
      const productIds = input.items.map(i => i.productId)
      const products = await prisma.product.findMany({
        where: { id: { in: productIds }, tenantId },
      })
      const productMap = new Map(products.map(p => [p.id, p]))

      // Usar transação para orderNumber + create (evita race condition)
      return prisma.$transaction(async (tx) => {
        const lastOrder = await tx.order.findFirst({
          where: { tenantId },
          orderBy: { orderNumber: 'desc' },
          select: { orderNumber: true },
        })
        const orderNumber = (lastOrder?.orderNumber ?? 0) + 1

        let subtotal = 0
        const orderItems: Array<{ productId: string; quantity: number; unitPrice: number; totalPrice: number; notes: string | null }> = []

        for (const item of input.items) {
          const product = productMap.get(item.productId)
          if (!product) continue
          const price = Number(product.promoPrice ?? product.price)
          const qty = item.quantity ?? 1
          subtotal += price * qty
          orderItems.push({
            productId: product.id,
            quantity: qty,
            unitPrice: price,
            totalPrice: price * qty,
            notes: item.notes || null,
          })
        }

        const deliveryFee = input.deliveryFee ?? 0
        const discount = input.discount ?? 0
        const total = subtotal + deliveryFee - discount

        const orderItemsWithTenant = orderItems.map(item => ({
          ...item,
          tenantId,
        }))

        return tx.order.create({
          data: {
            tenantId,
            orderNumber,
            channel: input.channel as never,
            type: input.type as never,
            status: 'PENDING',
            customerName: input.customerName,
            customerPhone: input.customerPhone,
            customerAddress: input.customerAddress ?? null,
            customerId: input.customerId ?? null,
            subtotal,
            deliveryFee,
            discount,
            total,
            notes: input.notes ?? null,
            items: { create: orderItemsWithTenant },
          },
          include: { items: true },
        })
      })
    },

    async updateStatus(id: string, status: string, notes?: string) {
      const now = new Date()
      const timestamps: Record<string, Record<string, Date>> = {
        ACCEPTED: { acceptedAt: now },
        PREPARING: { preparingAt: now },
        READY: { readyAt: now },
        DELIVERED: { deliveredAt: now },
        CANCELED: { canceledAt: now },
      }

      const updated = await db.order.update({
        where: { id },
        data: {
          status: status as never,
          ...(timestamps[status] ?? {}),
          ...(notes ? { kitchenNotes: notes } : {}),
        },
      })
      notify(`kds_${tenantId}`, JSON.stringify({ type: 'UPDATE', orderId: id, status })).catch((err) => {
        console.error('Erro ao notificar KDS:', err)
      })
      return updated
    },

    async cancel(id: string, reason: string) {
      return this.updateStatus(id, 'CANCELED')
    },
  }
}
