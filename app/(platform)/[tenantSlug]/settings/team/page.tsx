'use client'

import Link from 'next/link'

export default function TeamPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link href="../settings" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Voltar para Configurações
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Equipe</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie os usuários e permissões do restaurante</p>
      </div>

      <div className="rounded-xl border bg-card p-12 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center">
          <svg className="w-16 h-16 text-muted-foreground/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1">
            <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-foreground mb-1">Gestão de Equipe</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Adicione e gerencie usuários da sua equipe com diferentes níveis de permissão.
          </p>
        </div>
      </div>
    </div>
  )
}
