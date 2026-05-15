'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  promoPrice: number | null
  active: boolean
  stock: number | null
  minStock: number
  category: { name: string; icon: string | null } | null
}

interface Props {
  tenantSlug: string
}

export function ProductList({ tenantSlug }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      if (data.success) setProducts(data.data)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  async function toggleProduct(id: string) {
    await fetch(`/api/products/${id}/toggle`, { method: 'POST' })
    fetchProducts()
  }

  return (
    <div className="space-y-4">
      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Buscar produto..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link
          href={`/${tenantSlug}/menu/new`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-all shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path d="M12 4v16m8-8H4" />
          </svg>
          Novo Produto
        </Link>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-7 h-7 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg className="w-12 h-12 text-muted-foreground/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
          <p className="text-sm text-muted-foreground">
            {search ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3.5 text-left font-semibold text-foreground">Produto</th>
                  <th className="px-4 py-3.5 text-left font-semibold text-foreground">Categoria</th>
                  <th className="px-4 py-3.5 text-right font-semibold text-foreground">Preço</th>
                  <th className="px-4 py-3.5 text-right font-semibold text-foreground">Estoque</th>
                  <th className="px-4 py-3.5 text-center font-semibold text-foreground">Ativo</th>
                  <th className="px-4 py-3.5 text-right font-semibold text-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, i) => (
                  <tr key={product.id} className={`border-b last:border-0 transition-colors hover:bg-muted/30 ${i < 3 ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={product.active ? 'font-medium text-foreground' : 'text-muted-foreground line-through'}>
                          {product.name}
                        </span>
                        {product.promoPrice && (
                          <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                            Promo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs">
                        {product.category?.icon} {product.category?.name || 'Sem categoria'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {product.promoPrice ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-xs text-muted-foreground line-through">R$ {Number(product.price).toFixed(2)}</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">R$ {Number(product.promoPrice).toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="font-medium">R$ {Number(product.price).toFixed(2)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {product.stock === null ? (
                        <span className="text-muted-foreground">∞</span>
                      ) : product.stock <= product.minStock ? (
                        <span className="font-semibold text-destructive">{product.stock}</span>
                      ) : (
                        <span>{product.stock}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => toggleProduct(product.id)}
                        className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors duration-200 ${
                          product.active ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                            product.active ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/${tenantSlug}/menu/${product.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                      >
                        Editar
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
