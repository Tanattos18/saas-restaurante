import { getAuthContext } from '@/lib/auth'
import { orderService } from '@/services/order.service'
import { OrderKanban } from '@/components/platform/orders/OrderKanban'

type Props = { params: Promise<{ tenantSlug: string }> }

export default async function OrdersPage({ params }: Props) {
  const auth = await getAuthContext()
  if (!auth) return null
  const { tenantSlug } = await params

  const orders = orderService(auth.tenantId)
  const { orders: allOrders } = await orders.list({ pageSize: 50 })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p className="text-sm text-muted-foreground">Gerencie os pedidos do seu restaurante</p>
      </div>
      <OrderKanban orders={allOrders as never} tenantSlug={tenantSlug} />
    </div>
  )
}