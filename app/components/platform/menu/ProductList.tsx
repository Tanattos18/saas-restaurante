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
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Buscar produto..."
          className="w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Link
          href={`/${tenantSlug}/menu/new`}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Novo Produto
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum produto encontrado.</p>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Produto</th>
                <th className="px-4 py-3 text-left font-medium">Categoria</th>
                <th className="px-4 py-3 text-right font-medium">Preço</th>
                <th className="px-4 py-3 text-right font-medium">Estoque</th>
                <th className="px-4 py-3 text-center font-medium">Ativo</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <span className={product.active ? '' : 'text-muted-foreground line-through'}>
                      {product.name}
                    </span>
                    {product.promoPrice && (
                      <span className="ml-2 rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700 dark:bg-green-900 dark:text-green-300">
                        Promo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {product.category?.icon} {product.category?.name}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {product.promoPrice ? (
                      <>
                        <span className="text-muted-foreground line-through">R$ {product.price.toFixed(2)}</span>
                        <span className="ml-1 font-medium text-green-600">R$ {product.promoPrice.toFixed(2)}</span>
                      </>
                    ) : (
                      <span>R$ {product.price.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {product.stock === null ? (
                      <span className="text-muted-foreground">∞</span>
                    ) : product.stock <= product.minStock ? (
                      <span className="font-medium text-destructive">{product.stock}</span>
                    ) : (
                      <span>{product.stock}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleProduct(product.id)}
                      className={`h-6 w-12 rounded-full transition-colors ${
                        product.active ? 'bg-green-500' : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`block h-4 w-4 translate-x-1 rounded-full bg-white transition-transform ${
                          product.active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/${tenantSlug}/menu/${product.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
