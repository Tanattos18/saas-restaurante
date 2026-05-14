import { getAuthContext } from '@/lib/auth'
import { orderService } from '@/services/order.service'
import { OrderDetails } from '@/components/platform/orders/OrderDetails'

type Props = { params: Promise<{ tenantSlug: string; id: string }> }

export default async function OrderDetailPage({ params }: Props) {
  const auth = await getAuthContext()
  if (!auth) return null
  const { tenantSlug, id } = await params

  const orders = orderService(auth.tenantId)
  const order = await orders.getById(id)

  if (!order) return <p className="text-muted-foreground">Pedido não encontrado.</p>

  return <OrderDetails order={order as never} tenantSlug={tenantSlug} />
}