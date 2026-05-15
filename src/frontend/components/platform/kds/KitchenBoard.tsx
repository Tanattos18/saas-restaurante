'use client'

import { useEffect, useState, useCallback } from 'react'
import { OrderTicket } from './OrderTicket'
import { playNotificationSound } from '@/lib/sounds'

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
  deviceCode: string
}

export function KitchenBoard({ deviceCode }: Props) {
  const [orders, setOrders] = useState<Order[]>([])
  const [connected, setConnected] = useState(false)

  const updateStatus = useCallback(async (orderId: string, status: string) => {
    const res = await fetch(`/api/kds/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, deviceCode }),
    })
    const data = await res.json()
    if (data.success) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
    }
  }, [deviceCode])

  useEffect(() => {
    const eventSource = new EventSource(`/api/kds/stream?deviceCode=${deviceCode}`)
    const knownIds = new Set<string>()
    let wasOffline = false

    async function saveOrdersOffline(currentOrders: Order[]) {
      if (window.electronAPI && currentOrders.length > 0) {
        for (const order of currentOrders) {
          await window.electronAPI.saveOfflineOrder(order)
        }
      }
    }

    async function loadOfflineOrders() {
      if (!window.electronAPI) return
      const offline = await window.electronAPI.getOfflineOrders() as Order[]
      if (offline.length > 0) {
        setOrders(offline)
        await window.electronAPI.syncOfflineOrders()
      }
    }

    eventSource.onopen = async () => {
      setConnected(true)
      if (wasOffline) {
        await loadOfflineOrders()
        wasOffline = false
      }
    }

    eventSource.onerror = async () => {
      setConnected(false)
      if (!wasOffline) {
        wasOffline = true
        setOrders((prev) => {
          saveOrdersOffline(prev)
          return prev
        })
      }
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'INIT') {
          data.orders.forEach((o: Order) => knownIds.add(o.id))
          setOrders(data.orders)
        }
        if (data.type === 'UPDATE') {
          const incoming = data.orders as Order[]
          const hasNew = incoming.some((o: Order) => !knownIds.has(o.id))
          if (hasNew) {
            playNotificationSound()
          }
          incoming.forEach((o: Order) => knownIds.add(o.id))
          setOrders(incoming)
        }
      } catch {
        // ignore parse errors
      }
    }

    return () => eventSource.close()
  }, [deviceCode])

  const pending = orders.filter((o) => o.status === 'PENDING' || o.status === 'ACCEPTED')
  const preparing = orders.filter((o) => o.status === 'PREPARING')
  const ready = orders.filter((o) => o.status === 'READY')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50 px-4 py-4 lg:px-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">KDS — Cozinha</h1>
              <p className="text-xs text-slate-400 mt-0.5">Sistema de exibição de pedidos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!connected && window.electronAPI && (
              <span className="rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1.5 text-xs font-medium">
                Cache Local
              </span>
            )}
            <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-500 ${connected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
              <span className={`inline-block w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse-soft' : 'bg-red-400'}`} />
              {connected ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
      </div>

      {/* Columns */}
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          <Column
            title="Pendentes"
            count={pending.length}
            accent="from-amber-500 to-amber-600"
            dotColor="bg-amber-500"
          >
            {pending.map((order) => (
              <OrderTicket key={order.id} order={order} onStatusChange={updateStatus} />
            ))}
            {pending.length === 0 && <EmptyColumn />}
          </Column>

          <Column
            title="Em Preparo"
            count={preparing.length}
            accent="from-blue-500 to-blue-600"
            dotColor="bg-blue-500"
          >
            {preparing.map((order) => (
              <OrderTicket key={order.id} order={order} onStatusChange={updateStatus} />
            ))}
            {preparing.length === 0 && <EmptyColumn />}
          </Column>

          <Column
            title="Prontos"
            count={ready.length}
            accent="from-emerald-500 to-emerald-600"
            dotColor="bg-emerald-500"
          >
            {ready.map((order) => (
              <OrderTicket key={order.id} order={order} onStatusChange={updateStatus} />
            ))}
            {ready.length === 0 && <EmptyColumn />}
          </Column>
        </div>
      </div>
    </div>
  )
}

function Column({ title, count, accent, dotColor, children }: { title: string; count: number; accent: string; dotColor: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 overflow-hidden">
      <div className={`bg-gradient-to-r ${accent} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${dotColor}`} />
            <h2 className="text-sm font-bold text-white">{title}</h2>
          </div>
          <span className="text-2xl font-black text-white/80">{count}</span>
        </div>
      </div>
      <div className="p-3 space-y-3 max-h-[calc(100vh-13rem)] overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

function EmptyColumn() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-slate-600">
      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-xs">Nenhum pedido</p>
    </div>
  )
}
