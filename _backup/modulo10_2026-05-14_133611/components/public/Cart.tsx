'use client'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface Props {
  items: CartItem[]
  onUpdateQuantity: (id: string, delta: number) => void
  onCheckout: () => void
}

export function Cart({ items, onUpdateQuantity, onCheckout }: Props) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-background p-4 shadow-lg">
      <div className="mx-auto max-w-lg">
        <div className="mb-2 space-y-1">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="truncate flex-1">{item.name}</span>
              <div className="flex items-center gap-2 ml-2">
                <button
                  onClick={() => onUpdateQuantity(item.id, -1)}
                  className="h-6 w-6 rounded-full border text-sm hover:bg-muted"
                >
                  −
                </button>
                <span className="w-6 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.id, 1)}
                  className="h-6 w-6 rounded-full border text-sm hover:bg-muted"
                >
                  +
                </button>
                <span className="w-16 text-right font-medium">
                  R$ {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t pt-2">
          <span className="text-lg font-bold">Total: R$ {total.toFixed(2)}</span>
          <button
            onClick={onCheckout}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Fechar Pedido
          </button>
        </div>
      </div>
    </div>
  )
}
