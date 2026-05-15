'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface CategoryFormData {
  name: string
  description: string
  icon: string
}

interface Props {
  tenantSlug: string
  categoryId?: string
}

const EMOJI_OPTIONS = ['🍔', '🍕', '🍟', '🌮', '🍣', '🍦', '☕', '🍺', '🥗', '🍰', '🍜', '🌯', '🥘', '🍳', '🥪', '🍩']

export function CategoryForm({ tenantSlug, categoryId }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<CategoryFormData>({ name: '', description: '', icon: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!categoryId) return
    fetch(`/api/categories/${categoryId}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) return
        setForm({ name: d.data.name, description: d.data.description ?? '', icon: d.data.icon ?? '' })
      })
  }, [categoryId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const body = {
      name: form.name,
      description: form.description || null,
      icon: form.icon || null,
    }

    try {
      const url = categoryId ? `/api/categories/${categoryId}` : '/api/categories'
      const method = categoryId ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!data.success) { setError(data.error ?? 'Erro ao salvar'); return }
      router.push(`/${tenantSlug}/categories`)
    } catch { setError('Erro de conexão') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-4">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Categoria *</label>
          <input
            type="text"
            required
            placeholder="Ex: Lanches, Bebidas, Sobremesas..."
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Descrição (opcional)</label>
          <textarea
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows={3}
            placeholder="Breve descrição da categoria..."
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Ícone</label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setForm((p) => ({ ...p, icon: emoji }))}
                className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                  form.icon === emoji
                    ? 'bg-orange-100 ring-2 ring-orange-500 ring-offset-2'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Salvando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {categoryId ? 'Atualizar' : 'Criar Categoria'}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/${tenantSlug}/categories`)}
          className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}