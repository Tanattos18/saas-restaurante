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
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <p className="text-4xl mb-4">✅</p>
          <h1 className="text-2xl font-bold mb-2">Pedido #{orderNumber} recebido!</h1>
          <p className="text-muted-foreground">Aguarde. Seu pedido está sendo preparado.</p>
        </div>
      </div>
    )
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