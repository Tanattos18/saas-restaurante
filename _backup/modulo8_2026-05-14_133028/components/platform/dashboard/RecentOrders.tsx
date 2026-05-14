interface OrderItem {
  product: { name: string }
  quantity: number
}

interface Order {
  id: string
  orderNumber: number
  customerName: string
  status: string
  total: number
  createdAt: string
  items: OrderItem[]
}

interface Props {
  orders: Order[]
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pendente', ACCEPTED: 'Aceito', PREPARING: 'Preparando',
  READY: 'Pronto', DELIVERED: 'Entregue', CANCELED: 'Cancelado',
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  ACCEPTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  PREPARING: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  READY: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  DELIVERED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  CANCELED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

export function RecentOrders({ orders }: Props) {
  if (orders.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">Nenhum pedido hoje.</p>
  }

  return (
    <div className="space-y-2">
      {orders.slice(0, 10).map((order) => (
        <div key={order.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
          <div className="flex items-center gap-3">
            <span className="font-medium">#{order.orderNumber}</span>
            <span className="text-muted-foreground truncate max-w-[200px]">{order.customerName}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status] ?? ''}`}>
              {statusLabels[order.status] ?? order.status}
            </span>
            <span className="font-medium">R$ {Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
