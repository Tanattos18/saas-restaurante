'use client'

import Link from 'next/link'

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link href="../financial" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Voltar para Financeiro
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-sm text-muted-foreground mt-1">Relatórios financeiros detalhados</p>
      </div>

      <div className="rounded-xl border bg-card p-12 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center">
          <svg className="w-16 h-16 text-muted-foreground/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1">
            <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <h3 className="text-lg font-semibold text-foreground mb-1">Relatórios em Breve</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Relatórios detalhados de vendas, desempenho e análises estarão disponíveis em breve.
          </p>
        </div>
      </div>
    </div>
  )
}
