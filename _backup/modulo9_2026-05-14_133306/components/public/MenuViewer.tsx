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
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? '')

  const activeProducts = categories.find((c) => c.id === activeCategory)?.products ?? []

  return (
    <div>
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex gap-2 overflow-x-auto p-4 pb-3 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
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
          <p className="text-center text-muted-foreground py-8">Nenhum produto nesta categoria.</p>
        ) : (
          activeProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))
        )}
      </div>
    </div>
  )
}
