interface OrderItem {
  quantity: number
  product: { name: string }
}

interface Order {
  id: string
  orderNumber: number
  customerName: string
  status: string
  total: number
  channel: string
  createdAt: string
  items: OrderItem[]
}

interface Props {
  order: Order
  onClick: (id: string) => void
}

const statusColors: Record<string, string> = {
  PENDING: 'border-l-yellow-500', ACCEPTED: 'border-l-blue-500',
  PREPARING: 'border-l-purple-500', READY: 'border-l-green-500',
  ON_DELIVERY: 'border-l-orange-500', DELIVERED: 'border-l-gray-500',
  CANCELED: 'border-l-red-500',
}

const channelIcons: Record<string, string> = {
  WHATSAPP: '💬', QR_CODE: '📱', COUNTER: '🏪', PHONE: '📞', IFOOD: '🟢',
}

export function OrderCard({ order, onClick }: Props) {
  return (
    <button
      onClick={() => onClick(order.id)}
      className={`w-full text-left rounded-lg border border-l-4 bg-card p-3 shadow-sm hover:shadow-md transition-shadow ${statusColors[order.status] ?? 'border-l-gray-300'}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-lg">#{order.orderNumber}</span>
        <span className="text-lg">{channelIcons[order.channel] ?? '📋'}</span>
      </div>
      <p className="text-sm font-medium truncate">{order.customerName}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {order.items.length} item(ns) · R$ {Number(order.total).toFixed(2)}
      </p>
      <p className="text-xs text-muted-foreground">
        {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
      </p>
    </button>
  )
}
