'use client'

import { useState, useEffect, useCallback } from 'react'
import { MenuViewer } from '@/components/public/MenuViewer'
import { Cart } from '@/components/public/Cart'
import { Checkout } from '@/components/public/Checkout'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  promoPrice: number | null
  image: string | null
  preparationTime: number
  calories: number | null
  isVegan: boolean
  isGlutenFree: boolean
}

interface Category {
  id: string
  name: string
  icon: string | null
  products: Product[]
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

type Props = { params: Promise<{ tenantSlug: string; tableNumber: string }> }

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Aguardando confirmação',
  ACCEPTED: 'Pedido aceito',
  PREPARING: 'Preparando',
  READY: 'Pronto!',
  ON_DELIVERY: 'Saiu para entrega',
  DELIVERED: 'Entregue',
  CANCELED: 'Cancelado',
}

const STATUS_ICONS: Record<string, string> = {
  PENDING: '⏳',
  ACCEPTED: '✅',
  PREPARING: '👨‍🍳',
  READY: '🍽️',
  ON_DELIVERY: '🛵',
  DELIVERED: '✅',
  CANCELED: '❌',
}

function OrderTracking({ orderNumber, tenantSlug }: { orderNumber: number; tenantSlug: string }) {
  const [status, setStatus] = useState('PENDING')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    function checkStatus() {
      fetch(`/api/orders/check-status?orderNumber=${orderNumber}&tenantSlug=${tenantSlug}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            setStatus(d.data.status)
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
    checkStatus()
    const interval = setInterval(checkStatus, 8000)
    return () => clearInterval(interval)
  }, [orderNumber, tenantSlug])

  const isFinished = status === 'DELIVERED' || status === 'CANCELED'

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-6">{STATUS_ICONS[status] || '⏳'}</div>
        <h1 className="text-2xl font-bold mb-2">Pedido #{orderNumber}</h1>
        <div className={`inline-block rounded-full px-4 py-1.5 text-sm font-medium mt-2 ${
          status === 'CANCELED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
          status === 'READY' || status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        }`}>
          {STATUS_LABELS[status] || status}
        </div>
        <p className="text-sm text-muted-foreground mt-6">
          {status === 'PENDING' && 'Aguardando o restaurante aceitar seu pedido...'}
          {status === 'ACCEPTED' && 'Seu pedido foi aceito! Em breve começaremos o preparo.'}
          {status === 'PREPARING' && 'Seu pedido está sendo preparado com carinho.'}
          {status === 'READY' && 'Seu pedido está pronto! 🎉'}
          {status === 'DELIVERED' && 'Pedido entregue. Bom apetite! 🎉'}
          {status === 'CANCELED' && 'Pedido cancelado.'}
        </p>
        {!isFinished && !loading && (
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
            Atualizando automaticamente...
          </div>
        )}
      </div>
    </div>
  )
}

export default function TableOrderingPage({ params }: Props) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [orderNumber, setOrderNumber] = useState<number | null>(null)
  const [tenantSlug, setTenantSlug] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [tenantName, setTenantName] = useState('')

  useEffect(() => {
    params.then((p) => {
      setTenantSlug(p.tenantSlug)
      setTableNumber(p.tableNumber)
      fetch(`/api/menu/${p.tenantSlug}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) { setCategories(d.data.categories); setTenantName(d.data.tenantName) }
        })
    })
  }, [params])

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { id: product.id, name: product.name, price: Number(product.promoPrice ?? product.price), quantity: 1 }]
    })
  }, [])

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCart((prev) => {
      const updated = prev.map((i) => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
      return updated.filter((i) => i.quantity > 0)
    })
  }, [])

  if (orderNumber) {
    return <OrderTracking orderNumber={orderNumber} tenantSlug={tenantSlug} />
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background pb-24">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">{tenantName || 'Mesa ' + tableNumber}</h1>
      </div>
      <MenuViewer categories={categories} onAddToCart={addToCart} />
      <Cart items={cart} onUpdateQuantity={updateQuantity} onCheckout={() => setShowCheckout(true)} />
      {showCheckout && (
        <Checkout
          items={cart}
          tenantSlug={tenantSlug}
          tableNumber={tableNumber}
          onClose={() => setShowCheckout(false)}
          onComplete={(num) => setOrderNumber(num)}
        />
      )}
    </div>
  )
}
