import { createTenantPrisma } from '@/lib/tenant-prisma'

export function inventoryService(tenantId: string) {
  const db = createTenantPrisma(tenantId)

  return {
    async list(search?: string) {
      return db.inventoryItem.findMany({
        where: search ? { name: { contains: search, mode: 'insensitive' } } : {},
        include: { product: { select: { name: true } } },
        orderBy: { name: 'asc' },
      })
    },

    async getById(id: string) {
      return db.inventoryItem.findUnique({
        where: { id },
        include: {
          product: { select: { name: true } },
          logs: { orderBy: { createdAt: 'desc' }, take: 20 },
        },
      })
    },

    async create(data: {
      name: string
      unit: string
      currentStock: number
      minStock: number
      maxStock: number
      cost: number
      supplier?: string
    }) {
      const item = await db.inventoryItem.create({
        data: { tenantId, ...data, currentStock: data.currentStock ?? 0 },
      })
      await db.inventoryLog.create({
        data: {
          tenantId,
          inventoryItemId: item.id,
          type: 'IN',
          quantity: data.currentStock ?? 0,
          previousStock: 0,
          newStock: data.currentStock ?? 0,
          reason: 'Estoque inicial',
        },
      })
      return item
    },

    async update(id: string, data: Partial<{
      name: string
      unit: string
      minStock: number
      maxStock: number
      cost: number
      supplier: string
    }>) {
      return db.inventoryItem.update({ where: { id }, data })
    },

    async delete(id: string) {
      await db.inventoryLog.deleteMany({ where: { inventoryItemId: id } })
      return db.inventoryItem.delete({ where: { id } })
    },

    async addMovement(id: string, input: {
      type: 'IN' | 'OUT' | 'ADJUST'
      quantity: number
      reason: string
      notes?: string
      orderId?: string
    }) {
      const item = await db.inventoryItem.findUnique({ where: { id } })
      if (!item) throw new Error('Item não encontrado')

      const qty = input.type === 'OUT' ? -Math.abs(input.quantity) : input.type === 'ADJUST' ? input.quantity : Math.abs(input.quantity)
      const newStock = Number(item.currentStock) + qty
      if (newStock < 0) throw new Error('Estoque não pode ficar negativo')

      const log = await db.inventoryLog.create({
        data: {
          tenantId,
          inventoryItemId: id,
          type: input.type,
          quantity: Math.abs(input.quantity),
          previousStock: Number(item.currentStock),
          newStock,
          reason: input.reason,
          notes: input.notes,
          orderId: input.orderId,
        },
      })

      await db.inventoryItem.update({ where: { id }, data: { currentStock: newStock } })
      return log
    },

    async getLowStock() {
      const items = await db.inventoryItem.findMany({ orderBy: { currentStock: 'asc' } })
      return items.filter((i) => Number(i.currentStock) <= Number(i.minStock))
    },
  }
}
