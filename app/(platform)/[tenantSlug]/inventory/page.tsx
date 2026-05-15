'use client'

import { useState, useEffect, useCallback } from 'react'
import { IconSearch, IconPlus, IconX } from '@/components/ui/Icons'

interface InventoryItem {
  id: string
  name: string
  unit: string
  currentStock: number
  minStock: number
  maxStock: number
  cost: number
  supplier: string | null
  lastPurchaseAt: string | null
  product: { name: string } | null
}

interface MovementLog {
  id: string
  type: string
  quantity: number
  previousStock: number
  newStock: number
  reason: string
  notes: string | null
  createdAt: string
}

interface FormData {
  name: string
  unit: string
  currentStock: number
  minStock: number
  maxStock: number
  cost: number
  supplier: string
}

interface MovementForm {
  type: 'IN' | 'OUT' | 'ADJUST'
  quantity: number
  reason: string
  notes: string
}

const emptyForm: FormData = { name: '', unit: 'un', currentStock: 0, minStock: 0, maxStock: 0, cost: 0, supplier: '' }

function InventoryForm({ onSubmit, onClose, initial }: { onSubmit: (d: FormData) => Promise<void>; onClose: () => void; initial?: FormData }) {
  const [form, setForm] = useState<FormData>(initial ?? emptyForm)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.unit.trim()) return
    setLoading(true)
    await onSubmit(form)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{initial ? 'Editar Item' : 'Novo Item'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><IconX className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Nome *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unidade *</label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                <option value="un">Unidade (un)</option>
                <option value="kg">Quilograma (kg)</option>
                <option value="g">Grama (g)</option>
                <option value="lt">Litro (lt)</option>
                <option value="ml">Mililitro (ml)</option>
                <option value="pct">Pacote (pct)</option>
                <option value="cx">Caixa (cx)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fornecedor</label>
              <input type="text" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estoque Inicial</label>
              <input type="number" min="0" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: Number(e.target.value) })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Custo (R$)</label>
              <input type="number" min="0" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estoque Mínimo</label>
              <input type="number" min="0" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estoque Máximo</label>
              <input type="number" min="0" value={form.maxStock} onChange={(e) => setForm({ ...form, maxStock: Number(e.target.value) })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-input px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-all disabled:opacity-50">
              {loading ? 'Salvando...' : initial ? 'Atualizar' : 'Criar Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MovementModal({ itemId, itemName, onClose, onDone }: { itemId: string; itemName: string; onClose: () => void; onDone: () => void }) {
  const [form, setForm] = useState<MovementForm>({ type: 'IN', quantity: 1, reason: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.reason.trim()) { setError('Motivo é obrigatório'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/inventory/${itemId}/movement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) { onDone(); onClose() }
      else setError(data.error ?? 'Erro ao registrar')
    } catch { setError('Erro de conexão') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Movimentar: {itemName}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><IconX className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            {([['IN', 'Entrada'], ['OUT', 'Saída'], ['ADJUST', 'Ajuste']] as const).map(([value, label]) => (
              <button key={value} type="button" onClick={() => setForm({ ...form, type: value })}
                className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
                  form.type === value ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700' : 'border-input text-muted-foreground hover:border-muted-foreground/30'
                }`}>{label}</button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantidade *</label>
            <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Motivo *</label>
            <input type="text" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Ex: Compra, Venda, Perda" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Observações</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
          {error && <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-all disabled:opacity-50">
            {loading ? 'Registrando...' : 'Registrar Movimentação'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)
  const [movementItem, setMovementItem] = useState<InventoryItem | null>(null)
  const [logs, setLogs] = useState<MovementLog[]>([])
  const [showLogs, setShowLogs] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      const res = await fetch(`/api/inventory?${params}`)
      const data = await res.json()
      if (data.success) setItems(data.data)
    } finally { setLoading(false) }
  }, [search])

  useEffect(() => { fetchItems() }, [fetchItems])

  async function loadLogs(id: string) {
    const res = await fetch(`/api/inventory/${id}`)
    const data = await res.json()
    if (data.success) { setLogs(data.data.logs || []); setShowLogs(id) }
  }

  async function handleCreate(form: FormData) {
    const res = await fetch('/api/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    if (data.success) fetchItems()
  }

  async function handleUpdate(form: FormData) {
    if (!editItem) return
    const res = await fetch(`/api/inventory/${editItem.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    if (data.success) { setEditItem(null); fetchItems() }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este item do estoque?')) return
    await fetch(`/api/inventory/${id}`, { method: 'DELETE' })
    fetchItems()
  }

  const lowStockItems = items.filter((i) => Number(i.currentStock) <= Number(i.minStock))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estoque</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie ingredientes e insumos</p>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-all shadow-sm">
          <IconPlus className="w-4 h-4" /> Novo Item
        </button>
      </div>

      {lowStockItems.length > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-amber-100 dark:bg-amber-900/40 p-2 shrink-0">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{lowStockItems.length} item(ns) abaixo do estoque mínimo</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {lowStockItems.map((i) => (
                  <span key={i.id} className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-400">
                    {i.name} ({Number(i.currentStock)}/{Number(i.minStock)} {i.unit})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative w-full sm:max-w-xs">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Buscar no estoque..." className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="w-7 h-7 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg className="w-12 h-12 text-muted-foreground/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          <p className="text-sm text-muted-foreground">{search ? 'Nenhum item encontrado' : 'Nenhum item cadastrado'}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3.5 text-left font-semibold">Item</th>
                  <th className="px-4 py-3.5 text-left font-semibold">Unid.</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Estoque</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Min</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Custo</th>
                  <th className="px-4 py-3.5 text-left font-semibold">Fornecedor</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const isLow = Number(item.currentStock) <= Number(item.minStock)
                  return (
                    <tr key={item.id} className={`border-b last:border-0 transition-colors hover:bg-muted/30 ${i < 3 ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: `${i * 30}ms` }}>
                      <td className="px-4 py-3.5">
                        <span className="font-medium">{item.name}</span>
                        {item.product && <span className="ml-2 text-xs text-muted-foreground">({item.product.name})</span>}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">{item.unit}</td>
                      <td className={`px-4 py-3.5 text-right font-medium ${isLow ? 'text-red-600 dark:text-red-400' : ''}`}>{Number(item.currentStock).toFixed(1)} {isLow && '⚠️'}</td>
                      <td className="px-4 py-3.5 text-right text-muted-foreground">{Number(item.minStock).toFixed(1)}</td>
                      <td className="px-4 py-3.5 text-right">R$ {Number(item.cost).toFixed(2)}</td>
                      <td className="px-4 py-3.5 text-muted-foreground">{item.supplier || '-'}</td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setMovementItem(item) }} className="p-1.5 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors" title="Movimentar">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" /></svg>
                          </button>
                          <button onClick={() => loadLogs(item.id)} className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors" title="Histórico">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </button>
                          <button onClick={() => { setEditItem(item); setShowForm(true) }} className="p-1.5 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors" title="Editar">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors" title="Excluir">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showLogs && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowLogs(null)}>
          <div className="w-full max-w-lg rounded-xl bg-card p-6 shadow-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Histórico de Movimentações</h2>
              <button onClick={() => setShowLogs(null)} className="text-muted-foreground hover:text-foreground"><IconX className="w-5 h-5" /></button>
            </div>
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma movimentação registrada</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="rounded-lg border p-3 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium ${log.type === 'IN' ? 'text-emerald-600' : log.type === 'OUT' ? 'text-red-600' : 'text-blue-600'}`}>
                        {log.type === 'IN' ? '➕ Entrada' : log.type === 'OUT' ? '➖ Saída' : '🔄 Ajuste'}
                      </span>
                      <span className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString('pt-BR')}</span>
                    </div>
                    <p className="text-muted-foreground">Qtd: {log.quantity} | Saldo: {Number(log.previousStock).toFixed(1)} → {Number(log.newStock).toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Motivo: {log.reason}{log.notes ? ` — ${log.notes}` : ''}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && <InventoryForm onSubmit={editItem ? handleUpdate : handleCreate} onClose={() => { setShowForm(false); setEditItem(null) }} initial={editItem ? { name: editItem.name, unit: editItem.unit, currentStock: Number(editItem.currentStock), minStock: Number(editItem.minStock), maxStock: Number(editItem.maxStock), cost: Number(editItem.cost), supplier: editItem.supplier || '' } : undefined} />}

      {movementItem && <MovementModal itemId={movementItem.id} itemName={movementItem.name} onClose={() => setMovementItem(null)} onDone={fetchItems} />}
    </div>
  )
}
