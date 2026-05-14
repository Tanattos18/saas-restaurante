import { getAuthContext } from '@/lib/auth'
import { analyticsService } from '@/services/analytics.service'
import { orderService } from '@/services/order.service'
import { StatsCards } from '@/components/platform/dashboard/StatsCards'
import { RecentOrders } from '@/components/platform/dashboard/RecentOrders'
import { SalesChart } from '@/components/platform/dashboard/SalesChart'

export default async function DashboardPage() {
  const auth = await getAuthContext()
  if (!auth) return null

  const analytics = analyticsService(auth.tenantId)
  const orders = orderService(auth.tenantId)

  const metrics = await analytics.getMetrics('today')
  const { orders: recentOrders } = await orders.list({ pageSize: 10 })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumo do seu restaurante hoje</p>
      </div>
      <StatsCards totalOrders={metrics.totalOrders} totalRevenue={metrics.totalRevenue} avgTicket={metrics.avgTicket} pendingOrders={metrics.pendingOrders} />
      <SalesChart ordersByHour={metrics.ordersByHour} ordersByChannel={metrics.ordersByChannel} />
      <div className="rounded-lg border bg-card p-4">
        <h2 className="text-lg font-bold mb-4">Últimos Pedidos</h2>
        <RecentOrders orders={recentOrders as never} />
      </div>
    </div>
  )
}