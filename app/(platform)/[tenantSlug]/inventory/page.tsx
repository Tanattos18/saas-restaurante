'use client'

import { useState, useEffect, use } from 'react'
import { IconSearch, IconPlus, IconInventory } from '@/components/ui/Icons'

interface Product {
  id: string
  name: string
  stock: number
  minStock: number
  price: number
  category: string
}

export default function InventoryPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const resolvedParams = use(params)
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'low'>('all')

  useEffect(() => {
    fetch(`/api/products?tenantSlug=${resolvedParams.tenantSlug}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setProducts(d.data)
      })
  }, [resolvedParams.tenantSlug])

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'low' ? p.stock <= p.minStock : true
    return matchesSearch && matchesFilter
  })

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Estoque</h1>
          <p className="text-muted-foreground">Gerencie o estoque dos produtos</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <IconPlus className="w-4 h-4" />
          Nova Entrada
        </button>
      </div>

      {lowStockCount > 0 && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            <strong>{lowStockCount}</strong> produto(s) com estoque baixo
          </p>
        </div>
      )}

      <div className="flex gap-4">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'low')}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">Todos</option>
          <option value="low">Estoque Baixo</option>
        </select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Produto</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Categoria</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Estoque</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Mínimo</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Valor</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  <IconInventory className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum produto encontrado</p>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{product.category}</td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3 text-muted-foreground">{product.minStock}</td>
                  <td className="px-4 py-3">R$ {product.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    {product.stock <= product.minStock ? (
                      <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">Baixo</span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Normal</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}