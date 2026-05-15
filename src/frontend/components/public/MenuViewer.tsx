'use client'

import { useState } from 'react'
import { ProductCard } from './ProductCard'

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

interface Props {
  categories: Category[]
  onAddToCart: (product: Product) => void
}

export function MenuViewer({ categories, onAddToCart }: Props) {
  const [activeCategory, setActiveCategory] = useState('')

  const allProducts = categories.flatMap((c) => c.products)
  const activeProducts = activeCategory
    ? categories.find((c) => c.id === activeCategory)?.products ?? []
    : allProducts

  return (
    <div>
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex gap-2 overflow-x-auto p-4 pb-3 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('')}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === ''
                ? 'bg-emerald-500 text-white'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            🍽️ Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? 'bg-emerald-500 text-white'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {activeProducts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1">
              <path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <p className="text-muted-foreground">Nenhum produto disponível</p>
          </div>
        ) : (
          activeProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))
        )}
      </div>
    </div>
  )
}
