'use client'

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

interface Props {
  product: Product
  onAddToCart: (product: Product) => void
}

export function ProductCard({ product, onAddToCart }: Props) {
  const price = product.promoPrice ?? product.price
  const hasPromo = product.promoPrice !== null

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium">{product.name}</h3>
          {product.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-lg font-bold ${hasPromo ? 'text-green-600' : ''}`}>
              R$ {Number(price).toFixed(2)}
            </span>
            {hasPromo && (
              <span className="text-sm text-muted-foreground line-through">
                R$ {Number(product.price).toFixed(2)}
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {product.isVegan && <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700 dark:bg-green-900 dark:text-green-300">🌱 Vegano</span>}
            {product.isGlutenFree && <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">🚫 Sem Glúten</span>}
            {product.preparationTime > 0 && <span className="text-xs text-muted-foreground">⏱️ {product.preparationTime}min</span>}
          </div>
        </div>
        <button
          onClick={() => onAddToCart(product)}
          className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          + Adicionar
        </button>
      </div>
    </div>
  )
}
