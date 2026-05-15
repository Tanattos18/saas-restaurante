'use client'

import Link from 'next/link'

export default function WhatsAppSettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link href="../settings" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Voltar para Configurações
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">WhatsApp</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure a integração com o WhatsApp do restaurante</p>
      </div>

      <div className="rounded-xl border bg-card p-12 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center">
          <svg className="w-16 h-16 text-muted-foreground/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1">
            <path d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
          </svg>
          <h3 className="text-lg font-semibold text-foreground mb-1">Integração WhatsApp</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Configure a conexão com a Evolution API para o bot de atendimento automático.
          </p>
        </div>
      </div>
    </div>
  )
}
