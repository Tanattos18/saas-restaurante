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
      .catch(() => {})
  }, [])

  if (products.length === 0) return null

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-amber-100 dark:bg-amber-900/40 p-2 shrink-0">
          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            {products.length} produto{products.length !== 1 ? 's' : ''} com estoque baixo
          </p>
          <ul className="mt-2 space-y-1">
            {products.slice(0, 5).map((p) => (
              <li key={p.id} className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                <span className="truncate">{p.name}</span>
                <span className="shrink-0 font-medium text-amber-600 dark:text-amber-300">
                  {p.stock}/{p.minStock}
                </span>
                {p.category?.name && (
                  <span className="shrink-0 text-xs text-amber-500 dark:text-amber-500">
                    ({p.category.name})
                  </span>
                )}
              </li>
            ))}
            {products.length > 5 && (
              <li className="text-sm text-amber-600 dark:text-amber-500">
                ...e mais {products.length - 5} produto{products.length - 5 !== 1 ? 's' : ''}
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
