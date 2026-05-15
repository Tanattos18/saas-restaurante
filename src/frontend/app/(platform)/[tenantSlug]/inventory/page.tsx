'use client'

import { useState } from 'react'
import { IconSearch, IconPlus } from '@/components/ui/Icons'

export default function InventoryPage() {
  const [search, setSearch] = useState('')

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estoque</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle de ingredientes e insumos</p>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-all shadow-sm">
          <IconPlus className="w-4 h-4" />
          Novo Item
        </button>
      </div>

      <div className="relative w-full sm:max-w-xs">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar no estoque..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-xl border bg-card p-12 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center">
          <svg className="w-16 h-16 text-muted-foreground/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-lg font-semibold text-foreground mb-1">Módulo em Desenvolvimento</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            O controle de estoque estará disponível em breve. Você poderá gerenciar ingredientes, fornecedores e movimentações.
          </p>
        </div>
      </div>
    </div>
  )
}
