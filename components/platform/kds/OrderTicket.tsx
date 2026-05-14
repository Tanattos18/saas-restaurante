'use client'

import { KitchenTimer } from './KitchenTimer'

interface OrderItem {
  quantity: number
  notes: string | null
  product: { name: string }
}

interface Customer {
  name: string
  phone: string
}

interface Order {
  id: string
  orderNumber: number
  channel: string
  status: string
  customerName: string
  kitchenNotes: string | null
  createdAt: string
  items: OrderItem[]
  customer: Customer | null
}

interface Props {
  order: Order
  onStatusChange: (orderId: string, status: string) => void
}

const channelIcons: Record<string, string> = {
  WHATSAPP: '💬',
  QR_CODE: '📱',
  COUNTER: '🏪',
  PHONE: '📞',
  IFOOD: '🟢',
}

const statusActions: Record<string, { label: string; nextStatus: string; color: string }> = {
  PENDING: { label: 'Aceitar', nextStatus: 'ACCEPTED', color: 'bg-green-600 hover:bg-green-700' },
  ACCEPTED: { label: 'Iniciar Preparo', nextStatus: 'PREPARING', color: 'bg-blue-600 hover:bg-blue-700' },
  PREPARING: { label: 'Pronto', nextStatus: 'READY', color: 'bg-yellow-600 hover:bg-yellow-700' },
}

export function OrderTicket({ order, onStatusChange }: Props) {
  const action = statusActions[order.status]

  return (
    <div className="rounded-lg bg-gray-800 p-4 shadow-lg border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">#{order.orderNumber}</span>
          <span className="text-xl">{channelIcons[order.channel] ?? '📋'}</span>
        </div>
        <KitchenTimer createdAt={order.createdAt} />
      </div>

      <div className="text-sm text-gray-400 mb-2">
        {order.customer?.name ?? order.customerName}
      </div>

      <ul className="space-y-1 mb-3">
        {order.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
            <span className="text-gray-500">{item.quantity}x</span>
            <span>{item.product.name}</span>
          </li>
        ))}
      </ul>

      {order.kitchenNotes && (
        <div className="mb-3 rounded bg-yellow-900/40 p-2 text-sm text-yellow-300">
          📝 {order.kitchenNotes}
        </div>
      )}

      {action && (
        <button
          onClick={() => onStatusChange(order.id, action.nextStatus)}
          className={`w-full rounded px-3 py-2 text-sm font-medium text-white ${action.color} transition-colors`}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
