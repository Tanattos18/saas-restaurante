'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  name: string
  icon: string | null
}

interface ProductFormData {
  name: string
  description: string
  price: string
  promoPrice: string
  categoryId: string
  preparationTime: string
  calories: string
  isVegan: boolean
  isGlutenFree: boolean
  stock: string
  minStock: string
  showInQRCode: boolean
}

interface Props {
  tenantSlug: string
  productId?: string
}

const emptyForm: ProductFormData = {
  name: '', description: '', price: '', promoPrice: '', categoryId: '',
  preparationTime: '0', calories: '', isVegan: false, isGlutenFree: false,
  stock: '', minStock: '5', showInQRCode: true,
}

export function ProductForm({ tenantSlug, productId }: Props) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState<ProductFormData>(emptyForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => { if (d.success) setCategories(d.data) })
  }, [])

  useEffect(() => {
    if (!productId) return
    fetch(`/api/products/${productId}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) return
        const p = d.data
        setForm({
          name: p.name, description: p.description ?? '', price: String(p.price),
          promoPrice: p.promoPrice ? String(p.promoPrice) : '', categoryId: p.categoryId,
          preparationTime: String(p.preparationTime), calories: p.calories ? String(p.calories) : '',
          isVegan: p.isVegan, isGlutenFree: p.isGlutenFree,
          stock: p.stock !== null ? String(p.stock) : '', minStock: String(p.minStock),
          showInQRCode: p.showInQRCode,
        })
      })
  }, [productId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const body = {
      name: form.name,
      description: form.description || null,
      price: Number(form.price),
      promoPrice: form.promoPrice ? Number(form.promoPrice) : null,
      categoryId: form.categoryId,
      preparationTime: Number(form.preparationTime),
      calories: form.calories ? Number(form.calories) : null,
      isVegan: form.isVegan,
      isGlutenFree: form.isGlutenFree,
      stock: form.stock ? Number(form.stock) : null,
      minStock: Number(form.minStock),
      showInQRCode: form.showInQRCode,
    }

    if (body.promoPrice && body.promoPrice >= body.price) {
      setError('Preço promocional deve ser menor que o preço normal')
      setLoading(false)
      return
    }

    try {
      const url = productId ? `/api/products/${productId}` : '/api/products'
      const method = productId ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!data.success) { setError(data.error ?? 'Erro ao salvar'); return }
      router.push(`/${tenantSlug}/menu`)
    } catch { setError('Erro de conexão') }
    finally { setLoading(false) }
  }

  function updateField<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Nome *</label>
          <input type="text" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.name} onChange={(e) => updateField('name', e.target.value)} />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={3} value={form.description} onChange={(e) => updateField('description', e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Categoria *</label>
          <select required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.categoryId} onChange={(e) => updateField('categoryId', e.target.value)}>
            <option value="">Selecione...</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tempo de Preparo (min)</label>
          <input type="number" min="0" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.preparationTime} onChange={(e) => updateField('preparationTime', e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Preço (R$) *</label>
          <input type="number" step="0.01" min="0.01" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.price} onChange={(e) => updateField('price', e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Preço Promocional (R$)</label>
          <input type="number" step="0.01" min="0.01" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.promoPrice} onChange={(e) => updateField('promoPrice', e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Calorias</label>
          <input type="number" min="0" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.calories} onChange={(e) => updateField('calories', e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Estoque</label>
          <input type="number" min="0" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.stock} onChange={(e) => updateField('stock', e.target.value)} placeholder="Deixe vazio para ilimitado" />
        </div>

        <div className="flex items-center gap-6 pt-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isVegan} onChange={(e) => updateField('isVegan', e.target.checked)} className="rounded" />
            Vegano
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isGlutenFree} onChange={(e) => updateField('isGlutenFree', e.target.checked)} className="rounded" />
            Sem Glúten
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.showInQRCode} onChange={(e) => updateField('showInQRCode', e.target.checked)} className="rounded" />
            Exibir no QR Code
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
          {loading ? 'Salvando...' : productId ? 'Atualizar' : 'Criar Produto'}
        </button>
        <button type="button" onClick={() => router.back()} className="rounded-md border border-input px-6 py-2 text-sm font-medium hover:bg-muted">
          Cancelar
        </button>
      </div>
    </form>
  )
}
