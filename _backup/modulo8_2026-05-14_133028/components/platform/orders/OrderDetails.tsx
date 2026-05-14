'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Payment {
  id: string
  method: string
  amount: number
  status: string
}

interface OrderItem {
  quantity: number
  unitPrice: number
  totalPrice: number
  notes: string | null
  product: { name: string; image: string | null }
}

interface Customer {
  id: string
  name: string
  phone: string
  address: string
}

interface Order {
  id: string
  orderNumber: number
  customerName: string
  customerPhone: string
  customerAddress: string | null
  channel: string
  type: string
  status: string
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  notes: string | null
  kitchenNotes: string | null
  createdAt: string
  acceptedAt: string | null
  preparingAt: string | null
  readyAt: string | null
  deliveredAt: string | null
  canceledAt: string | null
  items: OrderItem[]
  payments: Payment[]
  customer: Customer | null
}

interface Props {
  order: Order
  tenantSlug: string
  onStatusChange?: () => void
}

const statusLabels: Record<string, string> = {
  PENDING: 'Aguardando', ACCEPTED: 'Aceito', PREPARING: 'Preparando',
  READY: 'Pronto', DELIVERED: 'Entregue', CANCELED: 'Cancelado',
}

const statusActions: Record<string, { label: string; next: string }> = {
  PENDING: { label: 'Aceitar Pedido', next: 'ACCEPTED' },
  ACCEPTED: { label: 'Iniciar Preparo', next: 'PREPARING' },
  PREPARING: { label: 'Marcar como Pronto', next: 'READY' },
  READY: { label: 'Confirmar Entrega', next: 'DELIVERED' },
}

export function OrderDetails({ order, tenantSlug, onStatusChange }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function updateStatus(status: string) {
    setLoading(true)
    await fetch(`/api/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLoading(false)
    if (onStatusChange) onStatusChange()
    router.refresh()
  }

  const timeline = [
    { label: 'Pedido Criado', time: order.createdAt, done: true },
    { label: 'Aceito', time: order.acceptedAt, done: !!order.acceptedAt },
    { label: 'Em Preparo', time: order.preparingAt, done: !!order.preparingAt },
    { label: 'Pronto', time: order.readyAt, done: !!order.readyAt },
    { label: 'Entregue', time: order.deliveredAt, done: !!order.deliveredAt },
  ]

  const action = statusActions[order.status]

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Pedido #{order.orderNumber}</h2>
              <p className="text-sm text-muted-foreground">{order.customerName} · {order.customerPhone}</p>
            </div>
            <div className="text-right">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium">{statusLabels[order.status]}</span>
            </div>
          </div>

          {order.customerAddress && (
            <p className="text-sm text-muted-foreground mb-4">📍 {order.customerAddress}</p>
          )}

          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span>{item.quantity}x {item.product.name}</span>
                <span>R$ {Number(item.totalPrice).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t mt-4 pt-4 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>R$ {Number(order.subtotal).toFixed(2)}</span></div>
            {order.deliveryFee > 0 && <div className="flex justify-between"><span>Taxa de Entrega</span><span>R$ {Number(order.deliveryFee).toFixed(2)}</span></div>}
            {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Desconto</span><span>-R$ {Number(order.discount).toFixed(2)}</span></div>}
            <div className="flex justify-between font-bold text-base pt-2 border-t"><span>Total</span><span>R$ {Number(order.total).toFixed(2)}</span></div>
          </div>

          {order.notes && <div className="mt-4 rounded bg-muted p-3 text-sm"><strong>Observações:</strong> {order.notes}</div>}
          {order.kitchenNotes && <div className="mt-2 rounded bg-yellow-50 p-3 text-sm text-yellow-800"><strong>Cozinha:</strong> {order.kitchenNotes}</div>}
        </div>

        {action && (
          <button
            onClick={() => updateStatus(action.next)}
            disabled={loading}
            className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Atualizando...' : action.label}
          </button>
        )}

        <button
          onClick={() => router.push(`/${tenantSlug}/orders`)}
          className="w-full rounded-lg border border-input py-2 text-sm font-medium hover:bg-muted"
        >
          Voltar para Pedidos
        </button>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-bold mb-3">Linha do Tempo</h3>
          <div className="space-y-3">
            {timeline.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-1 h-3 w-3 rounded-full shrink-0 ${item.done ? 'bg-green-500' : 'bg-muted'}`} />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  {item.time && <p className="text-xs text-muted-foreground">{new Date(item.time).toLocaleString('pt-BR')}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {order.payments.length > 0 && (
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-bold mb-3">Pagamentos</h3>
            {order.payments.map((p) => (
              <div key={p.id} className="flex justify-between text-sm">
                <span>{p.method}</span>
                <span>R$ {Number(p.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
