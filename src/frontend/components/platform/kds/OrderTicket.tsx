'use client'

import { useState } from 'react'
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

const statusActions: Record<string, { label: string; nextStatus: string; className: string }> = {
  PENDING: { label: 'Aceitar', nextStatus: 'ACCEPTED', className: 'bg-emerald-500 hover:bg-emerald-600 text-white' },
  ACCEPTED: { label: 'Iniciar Preparo', nextStatus: 'PREPARING', className: 'bg-blue-500 hover:bg-blue-600 text-white' },
  PREPARING: { label: 'Pronto', nextStatus: 'READY', className: 'bg-amber-500 hover:bg-amber-600 text-white' },
}

export function OrderTicket({ order, onStatusChange }: Props) {
  const [printing, setPrinting] = useState(false)
  const action = statusActions[order.status]

  async function handlePrint() {
    if (!window.electronAPI) return
    setPrinting(true)
    await window.electronAPI.printOrder({
      orderNumber: order.orderNumber,
      channel: order.channel,
      customerName: order.customer?.name ?? order.customerName,
      items: order.items,
      kitchenNotes: order.kitchenNotes,
      createdAt: order.createdAt,
    })
    setPrinting(false)
  }

  return (
    <div className="rounded-xl bg-slate-800 p-4 shadow-lg border border-slate-700/60 transition-all duration-200 hover:border-slate-600">
      {/* Header: Order number + Timer */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="text-xl font-black text-white tracking-tight">#{order.orderNumber}</span>
          <span className="text-base bg-slate-700/60 rounded-md px-2 py-0.5">{channelIcons[order.channel] ?? '📋'}</span>
        </div>
        <div className="flex items-center gap-2">
          {window.electronAPI && (
            <button
              onClick={handlePrint}
              disabled={printing}
              className="rounded-lg bg-slate-700/60 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-600 hover:text-white transition-colors disabled:opacity-50"
              title="Imprimir pedido"
            >
              {printing ? '🖨...' : '🖨'}
            </button>
          )}
          <KitchenTimer createdAt={order.createdAt} />
        </div>
      </div>

      {/* Customer name */}
      <div className="flex items-center gap-1.5 text-sm text-slate-400 mb-3">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
        <span className="font-medium text-slate-200">{order.customer?.name ?? order.customerName}</span>
      </div>

      {/* Items list */}
      <ul className="space-y-1 mb-3.5">
        {order.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
            <span className="text-slate-500 font-medium min-w-[28px]">{item.quantity}x</span>
            <span className="flex-1">{item.product.name}</span>
            {item.notes && (
              <span className="text-amber-400 text-xs italic">({item.notes})</span>
            )}
          </li>
        ))}
      </ul>

      {/* Kitchen notes */}
      {order.kitchenNotes && (
        <div className="mb-3.5 rounded-lg bg-amber-900/30 border border-amber-700/40 p-2.5 text-sm text-amber-200 flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          <span>{order.kitchenNotes}</span>
        </div>
      )}

      {/* Action button */}
      {action && (
        <button
          onClick={() => onStatusChange(order.id, action.nextStatus)}
          className={`w-full rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 shadow-lg shadow-black/20 ${action.className}`}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
