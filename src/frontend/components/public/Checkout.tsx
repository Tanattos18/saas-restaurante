'use client'

import { useState } from 'react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface Props {
  items: CartItem[]
  tenantSlug: string
  tableNumber?: string
  onClose: () => void
  onComplete: (orderNumber: number) => void
}

export function Checkout({ items, tenantSlug, tableNumber, onClose, onComplete }: Props) {
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [payment, setPayment] = useState<'PIX' | 'CASH' | 'CARD'>('PIX')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Nome é obrigatório'); return }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
          customerName: name.trim(),
          notes: notes.trim() || null,
          channel: tableNumber ? 'QR_CODE' : 'WHATSAPP',
          type: tableNumber ? 'DINE_IN' : 'DELIVERY',
          tenantSlug,
        }),
      })
      const data = await res.json()
      if (data.success) {
        onComplete(data.data.orderNumber)
      } else {
        setError(data.error ?? 'Erro ao criar pedido')
      }
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/50 sm:items-center sm:justify-center">
      <div className="w-full max-w-md rounded-t-2xl bg-background p-6 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Finalizar Pedido</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome *</label>
            <input
              type="text" required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Observações</label>
            <textarea
              value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Alguma observação?"
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Pagamento</label>
            <div className="grid grid-cols-3 gap-2">
              {([['PIX', '💳', 'PIX'], ['CASH', '💵', 'Dinheiro'], ['CARD', '💳', 'Cartão']] as const).map(([value, icon, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPayment(value)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-4 text-sm font-medium transition-all duration-200 ${
                    payment === value
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 shadow-sm'
                      : 'border-input bg-card text-muted-foreground hover:border-muted-foreground/30 hover:bg-muted/50'
                  }`}
                >
                  <span className="text-xl">{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>

          {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Confirmar Pedido'}
          </button>
        </form>
      </div>
    </div>
  )
}
