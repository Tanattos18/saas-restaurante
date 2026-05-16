'use client'

import Link from 'next/link'

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
  channel: string
  createdAt: string
  items: OrderItem[]
}

interface Props {
  orders: Order[]
  tenantSlug: string
}

const statusConfig: Record<string, { label: string; dot: string; bg: string }> = {
  PENDING: { label: 'Pendente', dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  ACCEPTED: { label: 'Aceito', dot: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  PREPARING: { label: 'Preparando', dot: 'bg-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  READY: { label: 'Pronto', dot: 'bg-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30' },
  ON_DELIVERY: { label: 'Saiu p/ Entrega', dot: 'bg-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  DELIVERED: { label: 'Entregue', dot: 'bg-gray-500', bg: 'bg-gray-50 dark:bg-gray-950/30' },
  CANCELED: { label: 'Cancelado', dot: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-950/30' },
}

const channelIcons: Record<string, string> = {
  WHATSAPP: '??', QR_CODE: '??', COUNTER: '??', PHONE: '??', IFOOD: '??',
}

export function RecentOrders({ orders, tenantSlug }: Props) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <svg className="w-12 h-12 text-muted-foreground/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        <p className="text-sm text-muted-foreground">Nenhum pedido hoje</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {orders.slice(0, 10).map((order, i) => {
        const status = statusConfig[order.status] || { label: order.status, dot: 'bg-gray-500', bg: '' }
        const time = new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        return (
          <Link
            key={order.id}
            href={`/${tenantSlug}/orders/${order.id}`}
            className={`flex items-center gap-3 rounded-lg border bg-card p-3.5 text-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-violet-200 dark:hover:border-violet-800 ${i < 2 ? 'animate-fade-in-up' : ''}`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {/* Order number + channel */}
            <div className="flex items-center gap-2 min-w-[80px]">
              <span className="font-bold text-foreground">#{order.orderNumber}</span>
              <span className="text-base">{channelIcons[order.channel] || '??'}</span>
            </div>

            {/* Customer name */}
            <span className="flex-1 truncate text-muted-foreground">{order.customerName}</span>

            {/* Time */}
            <span className="hidden sm:block text-xs text-muted-foreground/60">{time}</span>

            {/* Status badge */}
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.bg}`}>
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>

            {/* Total */}
            <span className="font-semibold text-foreground min-w-[70px] text-right">
              R$ {Number(order.total).toFixed(2)}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
