import { createTenantPrisma } from '@/lib/tenant-prisma'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export function financialService(tenantId: string) {
  const db = createTenantPrisma(tenantId)

  function getDateRange(period: string) {
    const now = new Date()
    switch (period) {
      case 'today': return { gte: startOfDay(now), lt: endOfDay(now) }
      case 'week': return { gte: startOfWeek(now, { weekStartsOn: 0 }), lt: endOfWeek(now, { weekStartsOn: 0 }) }
      case 'month': return { gte: startOfMonth(now), lt: endOfMonth(now) }
      default: return { gte: startOfDay(now), lt: endOfDay(now) }
    }
  }

  return {
    async getSummary(period: string = 'today') {
      const dateRange = getDateRange(period)

      const orders = await db.order.findMany({
        where: { createdAt: dateRange, status: { notIn: ['CANCELED'] } },
        select: { total: true, paymentMethod: true, paymentStatus: true, status: true, deliveryFee: true },
      })

      const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0)
      const totalOrders = orders.length
      const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0
      const totalFees = orders.reduce((s, o) => s + Number(o.deliveryFee), 0)

      const byPaymentMethod: Record<string, number> = {}
      for (const o of orders) {
        const m = o.paymentMethod ?? 'OUTROS'
        byPaymentMethod[m] = (byPaymentMethod[m] ?? 0) + Number(o.total)
      }

      return { totalRevenue, totalOrders, avgTicket, totalFees, byPaymentMethod }
    },

    async getTransactions(period: string = 'today', page: number = 1, pageSize: number = 20) {
      const dateRange = getDateRange(period)
      const skip = (page - 1) * pageSize

      const [orders, total] = await Promise.all([
        db.order.findMany({
          where: { createdAt: dateRange },
          include: {
            items: { include: { product: { select: { name: true } } } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize,
        }),
        db.order.count({ where: { createdAt: dateRange } }),
      ])

      return { orders, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
    },

    async getDailyRevenue(days: number = 7) {
      const now = new Date()
      const start = new Date(now)
      start.setDate(start.getDate() - days)
      start.setHours(0, 0, 0, 0)

      const orders = await db.order.findMany({
        where: { createdAt: { gte: start }, status: { notIn: ['CANCELED'] } },
        select: { total: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      })

      const byDay: Record<string, number> = {}
      for (let i = 0; i <= days; i++) {
        const d = new Date(start)
        d.setDate(d.getDate() + i)
        const key = d.toISOString().split('T')[0] ?? ''
        byDay[key] = 0
      }
      for (const o of orders) {
        const day = o.createdAt.toISOString().split('T')[0] ?? ''
        if (byDay[day] !== undefined) byDay[day] += Number(o.total)
      }

      return Object.entries(byDay).map(([date, revenue]) => ({ date, revenue }))
    },
  }
}
