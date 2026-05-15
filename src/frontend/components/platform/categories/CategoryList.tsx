'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  description: string | null
  icon: string | null
  active: boolean
  position: number
  _count: { products: number }
}

interface Props {
  tenantSlug: string
}

function getIconBg(icon: string | null) {
  return 'bg-muted text-muted-foreground'
}

export function CategoryList({ tenantSlug }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (data.success) setCategories(data.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  async function toggleCategory(id: string, currentActive: boolean) {
    await fetch(`/api/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle' }),
    })
    fetchCategories()
  }

  async function deleteCategory(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      fetchCategories()
    } else {
      alert(data.error || 'Erro ao excluir categoria')
    }
  }

  return (
    <div className="space-y-6">
      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Buscar categorias..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link
          href={`/${tenantSlug}/categories/new`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-all shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path d="M12 4v16m8-8H4" />
          </svg>
          Nova Categoria
        </Link>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-7 h-7 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg className="w-12 h-12 text-muted-foreground/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1">
            <path d="M9 4.5V4a2 2 0 012-2h2a2 2 0 012 2v.5" />
            <path d="M3 8h18" />
            <path d="M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
          </svg>
          <p className="text-sm font-medium text-foreground">
            {searchTerm ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria cadastrada'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {searchTerm ? 'Tente buscar por outro termo' : 'Crie sua primeira categoria para organizar o cardápio'}
          </p>
        </div>
      ) : (
        /* Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map((category, i) => (
            <div
              key={category.id}
              className={`relative rounded-xl border-2 bg-card transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                category.active ? 'border-border' : 'border-border/50 opacity-70'
              } ${i < 4 ? 'animate-fade-in-up' : ''}`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="p-4">
                {/* Header: Icon + Toggle */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${getIconBg(category.icon)}`}>
                    {category.icon || '📁'}
                  </div>
                  <button
                    onClick={() => toggleCategory(category.id, category.active)}
                    className={`relative inline-flex h-5.5 w-9 items-center rounded-full transition-colors duration-200 ${
                      category.active ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        category.active ? 'translate-x-[18px]' : 'translate-x-[3px]'
                      }`}
                    />
                  </button>
                </div>

                {/* Name */}
                <h3 className={`font-semibold text-foreground text-sm mb-1 ${!category.active && 'line-through text-muted-foreground'}`}>
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{category.description}</p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{category._count.products}</span>
                    {' '}produto{category._count.products !== 1 && 's'}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <Link
                      href={`/${tenantSlug}/categories/${category.id}`}
                      className="p-1.5 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Inactive badge */}
              {!category.active && (
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[11px] font-medium rounded-full">Inativa</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}