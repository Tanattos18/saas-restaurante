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
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

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
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">👨‍🍳 Cozinha</h1>
        <div className="flex items-center gap-2">
          {!connected && window.electronAPI && (
            <span className="rounded-full bg-blue-600 px-3 py-1 text-xs">📦 Cache Local</span>
          )}
          <button
            onClick={toggleFullscreen}
            className="rounded-full bg-gray-700 px-4 py-2 text-sm hover:bg-gray-600"
          >
            {isFullscreen ? '⬜ Sair' : '🖥️ Tela Cheia'}
          </button>
          <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm ${connected ? 'bg-green-600' : 'bg-red-600'}`}>
            <span className="h-2 w-2 rounded-full bg-white" />
            {connected ? 'Online' : 'Offline'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Column title="📋 Pendentes" count={pending.length} color="text-yellow-400">
          {pending.map((order) => (
            <OrderTicket key={order.id} order={order} onStatusChange={updateStatus} />
          ))}
        </Column>

        <Column title="🔥 Em Preparo" count={preparing.length} color="text-blue-400">
          {preparing.map((order) => (
            <OrderTicket key={order.id} order={order} onStatusChange={updateStatus} />
          ))}
        </Column>

        <Column title="✅ Prontos" count={ready.length} color="text-green-400">
          {ready.map((order) => (
            <OrderTicket key={order.id} order={order} onStatusChange={updateStatus} />
          ))}
        </Column>
      </div>
    </div>
  )
}

function Column({ title, count, color, children }: { title: string; count: number; color: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-gray-800 p-4">
      <h2 className={`text-lg font-bold mb-4 ${color}`}>
        {title} ({count})
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  )
}
