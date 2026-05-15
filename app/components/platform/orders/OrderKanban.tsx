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
  { key: 'PENDING', label: 'Pendente', color: 'border-t-yellow-500' },
  { key: 'ACCEPTED', label: 'Aceito', color: 'border-t-blue-500' },
  { key: 'PREPARING', label: 'Preparando', color: 'border-t-purple-500' },
  { key: 'READY', label: 'Pronto', color: 'border-t-green-500' },
  { key: 'DELIVERED', label: 'Entregue', color: 'border-t-gray-500' },
]

export function OrderKanban({ orders, tenantSlug }: Props) {
  const router = useRouter()
  const [filterChannel, setFilterChannel] = useState('')

  const filtered = filterChannel ? orders.filter((o) => o.channel === filterChannel) : orders

  return (
    <div>
      <div className="mb-4 flex gap-2 overflow-x-auto">
        <button onClick={() => setFilterChannel('')} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${!filterChannel ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>Todos</button>
        {['WHATSAPP', 'QR_CODE', 'COUNTER', 'PHONE'].map((ch) => (
          <button key={ch} onClick={() => setFilterChannel(ch)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${filterChannel === ch ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{ch}</button>
        ))}
      </div>

      <div className="grid gap-4 overflow-x-auto pb-4" style={{ gridTemplateColumns: `repeat(${columns.length}, 280px)` }}>
        {columns.map((col) => {
          const colOrders = filtered.filter((o) => o.status === col.key)
          return (
            <div key={col.key} className="rounded-lg border bg-muted/30 p-3">
              <h3 className={`text-sm font-bold mb-3 border-t-2 pt-2 ${col.color}`}>
                {col.label} ({colOrders.length})
              </h3>
              <div className="space-y-2">
                {colOrders.map((order) => (
                  <OrderCard key={order.id} order={order} onClick={(id) => router.push(`/${tenantSlug}/orders/${id}`)} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
