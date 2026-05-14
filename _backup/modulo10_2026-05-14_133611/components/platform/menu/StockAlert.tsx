'use client'

import { useState, useEffect } from 'react'

interface LowStockProduct {
  id: string
  name: string
  stock: number
  minStock: number
  category: { name: string } | null
}

export function StockAlert() {
  const [products, setProducts] = useState<LowStockProduct[]>([])

  useEffect(() => {
    fetch('/api/products?active=true')
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) return
        const low = d.data.filter(
          (p: LowStockProduct) => p.stock !== null && p.stock <= p.minStock
        )
        setProducts(low)
      })
  }, [])

  if (products.length === 0) return null

  return (
    <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4">
      <h3 className="text-sm font-medium text-destructive mb-2">
        ⚠️ {products.length} produto(s) com estoque baixo
      </h3>
      <ul className="space-y-1">
        {products.slice(0, 5).map((p) => (
          <li key={p.id} className="text-sm text-muted-foreground">
            {p.name} — <span className="font-medium text-destructive">{p.stock}</span>/{p.minStock} {p.category?.name ? `(${p.category.name})` : ''}
          </li>
        ))}
        {products.length > 5 && (
          <li className="text-sm text-muted-foreground">...e mais {products.length - 5} produto(s)</li>
        )}
      </ul>
    </div>
  )
}
