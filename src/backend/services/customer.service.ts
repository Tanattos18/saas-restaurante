import { createTenantPrisma } from '@/backend/lib/tenant-prisma'

export function customerService(tenantId: string) {
  const db = createTenantPrisma(tenantId)

  return {
    async list(filters?: { search?: string; level?: string; minOrders?: number }) {
      const where: Record<string, unknown> = {}
      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { phone: { contains: filters.search } },
        ]
      }
      if (filters?.level) where.loyaltyLevel = filters.level
      if (filters?.minOrders) where.totalOrders = { gte: filters.minOrders }

      return db.customer.findMany({
        where: where as never,
        orderBy: { totalOrders: 'desc' },
        take: 50,
      })
    },

    async getById(id: string) {
      return db.customer.findUnique({
        where: { id },
        include: {
          orders: { orderBy: { createdAt: 'desc' }, take: 10, include: { items: { include: { product: { select: { name: true } } } } } },
        },
      })
    },

    async update(id: string, data: { name?: string; address?: string; phone?: string }) {
      return db.customer.update({ where: { id }, data })
    },

    async getTopCustomers(limit = 10) {
      return db.customer.findMany({ orderBy: { totalSpent: 'desc' }, take: limit })
    },

    async getChurnRisk() {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return db.customer.findMany({
        where: { lastOrderAt: { lt: thirtyDaysAgo }, totalOrders: { gte: 3 } },
        orderBy: { lastOrderAt: 'asc' },
        take: 20,
      })
    },
  }
}
