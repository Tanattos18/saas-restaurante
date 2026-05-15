'use client'

import { useState } from 'react'
import { OrderCard } from './OrderCard'
import { useRouter } from 'next/navigation'

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
  orders: Order[]
  tenantSlug: string
}

const columns = [
  { key: 'PENDING', label: 'Pendente', color: 'border-t-amber-500', countColor: 'text-amber-600 dark:text-amber-400', dotColor: 'bg-amber-500' },
  { key: 'ACCEPTED', label: 'Aceito', color: 'border-t-blue-500', countColor: 'text-blue-600 dark:text-blue-400', dotColor: 'bg-blue-500' },
  { key: 'PREPARING', label: 'Preparando', color: 'border-t-purple-500', countColor: 'text-purple-600 dark:text-purple-400', dotColor: 'bg-purple-500' },
  { key: 'READY', label: 'Pronto', color: 'border-t-emerald-500', countColor: 'text-emerald-600 dark:text-emerald-400', dotColor: 'bg-emerald-500' },
  { key: 'DELIVERED', label: 'Entregue', color: 'border-t-slate-500', countColor: 'text-slate-600 dark:text-slate-400', dotColor: 'bg-slate-500' },
]

const channelFilterOptions = [
  { key: '', label: 'Todos' },
  { key: 'WHATSAPP', label: 'WhatsApp' },
  { key: 'QR_CODE', label: 'QR Code' },
  { key: 'COUNTER', label: 'Balcão' },
  { key: 'PHONE', label: 'Telefone' },
]

export function OrderKanban({ orders, tenantSlug }: Props) {
  const router = useRouter()
  const [filterChannel, setFilterChannel] = useState('')

  const filtered = filterChannel ? orders.filter((o) => o.channel === filterChannel) : orders

  return (
    <div>
      {/* Filter Pills */}
      <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1">
        {channelFilterOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setFilterChannel(opt.key)}
            className={`shrink-0 rounded-lg px-3.5 py-2 text-xs font-medium transition-all duration-200 ${
              filterChannel === opt.key
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-200 dark:ring-emerald-800'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Kanban Columns */}
      <div className="grid gap-4 overflow-x-auto pb-4" style={{ gridTemplateColumns: `repeat(${columns.length}, 280px)` }}>
        {columns.map((col) => {
          const colOrders = filtered.filter((o) => o.status === col.key)
          return (
            <div key={col.key} className="rounded-xl border bg-muted/30 p-3.5">
              <h3 className={`flex items-center gap-2 text-sm font-bold mb-3.5 border-t-2 pt-2.5 ${col.color}`}>
                <span className={`inline-block w-2 h-2 rounded-full ${col.dotColor}`} />
                {col.label}
                <span className={`ml-auto text-xs font-medium ${col.countColor}`}>
                  {colOrders.length}
                </span>
              </h3>
              <div className="space-y-2.5 min-h-[120px]">
                {colOrders.map((order, i) => (
                  <div key={order.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                    <OrderCard key={order.id} order={order} onClick={(id) => router.push(`/${tenantSlug}/orders/${id}`)} />
                  </div>
                ))}
                {colOrders.length === 0 && (
                  <div className="flex items-center justify-center h-20 text-xs text-muted-foreground/60">
                    Nenhum pedido
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
