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

const statusBorders: Record<string, string> = {
  PENDING: 'border-l-amber-500', ACCEPTED: 'border-l-blue-500',
  PREPARING: 'border-l-purple-500', READY: 'border-l-emerald-500',
  ON_DELIVERY: 'border-l-orange-500', DELIVERED: 'border-l-slate-500',
  CANCELED: 'border-l-red-500',
}

const statusDots: Record<string, string> = {
  PENDING: 'bg-amber-500', ACCEPTED: 'bg-blue-500',
  PREPARING: 'bg-purple-500', READY: 'bg-emerald-500',
  ON_DELIVERY: 'bg-orange-500', DELIVERED: 'bg-slate-500',
  CANCELED: 'bg-red-500',
}

const channelIcons: Record<string, string> = {
  WHATSAPP: '💬', QR_CODE: '📱', COUNTER: '🏪', PHONE: '📞', IFOOD: '🟢',
}

const channelLabels: Record<string, string> = {
  WHATSAPP: 'WhatsApp', QR_CODE: 'QR Code', COUNTER: 'Balcão', PHONE: 'Telefone', IFOOD: 'iFood',
}

export function OrderCard({ order, onClick }: Props) {
  return (
    <button
      onClick={() => onClick(order.id)}
      className={`w-full text-left rounded-xl border border-l-[3px] bg-card p-3.5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${statusBorders[order.status] || 'border-l-slate-300'}`}
    >
      {/* Header: Order number + Channel */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-base text-foreground tracking-tight">#{order.orderNumber}</span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
          <span className="text-sm">{channelIcons[order.channel] ?? '📋'}</span>
          <span className="hidden sm:inline">{channelLabels[order.channel] || order.channel}</span>
        </span>
      </div>

      {/* Customer */}
      <p className="text-sm font-medium text-foreground truncate">{order.customerName}</p>

      {/* Items & Total */}
      <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
        {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
        <span className="text-muted-foreground/40">·</span>
        <span className="font-medium text-foreground">R$ {Number(order.total).toFixed(2)}</span>
      </p>

      {/* Time */}
      <p className="text-[11px] text-muted-foreground/60 mt-1.5">
        {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
      </p>

      {/* Status indicator dot */}
      <span className={`absolute top-3 right-3 inline-block w-1.5 h-1.5 rounded-full ${statusDots[order.status] || 'bg-slate-400'}`} />
    </button>
  )
}
