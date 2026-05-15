import { getAuthContext } from '@/lib/auth'
import { orderService } from '@/services/order.service'
import { OrderKanban } from '@/components/platform/orders/OrderKanban'

type Props = { params: Promise<{ tenantSlug: string }> }

export default async function OrdersPage({ params }: Props) {
  const auth = await getAuthContext()
  if (!auth) return null
  const { tenantSlug } = await params

  const ordersService = orderService(auth.tenantId)
  const { orders: allOrders } = await ordersService.list({ pageSize: 50 })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie os pedidos do seu restaurante</p>
        </div>
      </div>
      <OrderKanban orders={allOrders as never} tenantSlug={tenantSlug} />
    </div>
  )
}