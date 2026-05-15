'use client'

import Link from 'next/link'

export default function FinancialPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-1">Fluxo de caixa e relatórios financeiros</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="financial/reports"
            className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background hover:bg-accent px-4 py-2.5 text-sm font-medium transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Relatórios
          </Link>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-12 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center">
          <svg className="w-16 h-16 text-muted-foreground/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1">
            <path d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-foreground mb-1">Módulo em Desenvolvimento</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            O módulo financeiro estará disponível em breve com fluxo de caixa, relatórios e conciliação.
          </p>
        </div>
      </div>
    </div>
  )
}
