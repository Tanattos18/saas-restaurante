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
  const ordersService = orderService(auth.tenantId)

  const metrics = await analytics.getMetrics('today')
  const { orders: recentOrders } = await ordersService.list({ pageSize: 10 })

  const today = new Date()
  const dateStr = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1 capitalize">{dateStr}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
            Online
          </span>
        </div>
      </div>

      <StatsCards
        totalOrders={metrics.totalOrders}
        totalRevenue={metrics.totalRevenue}
        avgTicket={metrics.avgTicket}
        pendingOrders={metrics.pendingOrders}
      />

      <SalesChart
        ordersByHour={metrics.ordersByHour}
        ordersByChannel={metrics.ordersByChannel}
      />

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Últimos Pedidos</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Os 10 pedidos mais recentes</p>
          </div>
        </div>
        <RecentOrders orders={recentOrders as any} tenantSlug={auth.tenantSlug} />
      </div>
    </div>
  )
}
