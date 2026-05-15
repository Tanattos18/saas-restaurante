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

const CATEGORY_ICONS: Record<string, string> = {
  '🍔': 'bg-orange-100 text-orange-600',
  '🍕': 'bg-red-100 text-red-600',
  '🍟': 'bg-yellow-100 text-yellow-600',
  '🌮': 'bg-amber-100 text-amber-600',
  '🍣': 'bg-pink-100 text-pink-600',
  '🍦': 'bg-blue-100 text-blue-600',
  '☕': 'bg-brown-100 text-brown-600',
  '🍺': 'bg-amber-200 text-amber-700',
  '🥗': 'bg-green-100 text-green-600',
  '🍰': 'bg-purple-100 text-purple-600',
  '🍜': 'bg-rose-100 text-rose-600',
  '🌯': 'bg-orange-200 text-orange-700',
  'default': 'bg-gray-100 text-gray-600',
}

function getIconClass(icon: string | null) {
  if (!icon) return CATEGORY_ICONS['default']
  return CATEGORY_ICONS[icon] || CATEGORY_ICONS['default']
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
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-80">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar categorias..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link
          href={`/${tenantSlug}/categories/new`}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Categoria
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">📂</span>
          </div>
          <p className="text-gray-500 font-medium">
            {searchTerm ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria cadastrada'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {searchTerm ? 'Tente buscar por outro termo' : 'Crie sua primeira categoria para organizar o cardápio'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className={`relative bg-white rounded-xl border-2 transition-all hover:shadow-lg ${
                category.active ? 'border-gray-100' : 'border-gray-200 opacity-70'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${getIconClass(category.icon)}`}>
                    {category.icon || '📁'}
                  </div>
                  <button
                    onClick={() => toggleCategory(category.id, category.active)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      category.active ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        category.active ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
                
                <h3 className={`font-semibold text-gray-900 mb-1 ${!category.active && 'line-through text-gray-400'}`}>
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{category.description}</p>
                )}
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    <span className="font-medium text-gray-700">{category._count.products}</span> produto{category._count.products !== 1 && 's'}
                  </span>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/${tenantSlug}/categories/${category.id}`}
                      className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {!category.active && (
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">Inativa</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}