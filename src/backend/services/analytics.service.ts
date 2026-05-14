import { createTenantPrisma } from '@/lib/tenant-prisma'

export function analyticsService(tenantId: string) {
  const db = createTenantPrisma(tenantId)

  async function getOrdersInRange(start: Date, end: Date) {
    return db.order.findMany({
      where: { createdAt: { gte: start, lt: end } },
      include: { items: { include: { product: { select: { name: true } } } } },
    })
  }

  return {
    async getMetrics(period: 'today' | 'week' | 'month') {
      const now = new Date()
      const start = new Date(now)

      if (period === 'today') start.setHours(0, 0, 0, 0)
      else if (period === 'week') start.setDate(now.getDate() - 7)
      else start.setMonth(now.getMonth() - 1)

      const orders = await getOrdersInRange(start, now)
      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
      const canceled = orders.filter((o) => o.status === 'CANCELED')

      const productCount: Record<string, { name: string; quantity: number; revenue: number }> = {}
      for (const order of orders) {
        for (const item of order.items) {
          const name = item.product.name
          if (!productCount[name]) productCount[name] = { name, quantity: 0, revenue: 0 }
          productCount[name].quantity += item.quantity
          productCount[name].revenue += Number(item.totalPrice)
        }
      }

      const ordersByHour: { hour: number; count: number }[] = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }))
      for (const order of orders) {
        const hour = new Date(order.createdAt).getHours()
        const slot = ordersByHour[hour]
        if (slot) slot.count++
      }

      const channelMap: Record<string, number> = {}
      for (const order of orders) {
        channelMap[order.channel] = (channelMap[order.channel] ?? 0) + 1
      }
      const ordersByChannel = Object.entries(channelMap).map(([channel, count]) => ({ channel, count }))

      const revenueByDay: Record<string, number> = {}
      for (const order of orders) {
        const parts = new Date(order.createdAt).toISOString().split('T')
        const day = parts[0]
        if (day) revenueByDay[day] = (revenueByDay[day] ?? 0) + Number(order.total)
      }

      return {
        totalOrders: orders.length,
        totalRevenue,
        avgTicket: orders.length > 0 ? totalRevenue / orders.length : 0,
        pendingOrders: orders.filter((o) => o.status === 'PENDING').length,
        cancelationRate: orders.length > 0 ? (canceled.length / orders.length) * 100 : 0,
        topProducts: Object.values(productCount).sort((a, b) => b.quantity - a.quantity).slice(0, 10),
        ordersByHour,
        ordersByChannel,
        revenueByDay: Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue })),
      }
    },
  }
}
