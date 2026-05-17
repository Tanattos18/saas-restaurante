'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function WhatsAppSettingsPage() {
  const [status, setStatus] = useState<{ connected: boolean; message: string } | null>(null)
  const [qrcode, setQrcode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function checkStatus() {
    setLoading(true)
    const res = await fetch('/api/whatsapp-config?action=check')
    const d = await res.json()
    if (d.success) setStatus(d.data)
    setLoading(false)
  }

  async function loadQR() {
    const res = await fetch('/api/whatsapp-config?action=qrcode')
    const d = await res.json()
    if (d.success) setQrcode(d.data.qrcode)
  }

  async function handleLogout() {
    if (!confirm('Desconectar WhatsApp do restaurante?')) return
    const res = await fetch('/api/whatsapp-config?action=logout')
    const d = await res.json()
    if (d.success) { setStatus({ connected: false, message: 'Desconectado' }); setQrcode(null) }
  }

  useEffect(() => { checkStatus() }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link href="../settings" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          Voltar para Configurações
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">WhatsApp</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure a integração com o WhatsApp do restaurante</p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className={`rounded-xl p-3 ${status?.connected ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-amber-50 dark:bg-amber-950/30'}`}>
            {status?.connected ? (
              <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">
              {loading ? 'Verificando...' : status?.connected ? 'WhatsApp Conectado' : 'WhatsApp Desconectado'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{status?.message || 'Verificando conexão...'}</p>
            <div className="flex gap-2 mt-4">
              <button onClick={checkStatus} disabled={loading} className="rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50">
                {loading ? 'Verificando...' : 'Verificar Status'}
              </button>
              {!status?.connected && (
                <button onClick={loadQR} className="rounded-lg bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all shadow-sm">
                  Gerar QR Code
                </button>
              )}
              {status?.connected && (
                <button onClick={handleLogout} className="rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30 px-4 py-2 text-sm font-medium transition-colors">
                  Desconectar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {qrcode && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold mb-2">Escaneie o QR Code</h3>
          <p className="text-xs text-muted-foreground mb-4">Abra o WhatsApp no seu celular e escaneie o código abaixo</p>
          <div className="flex justify-center">
            {qrcode.startsWith('data:') ? (
              <img src={qrcode} alt="QR Code WhatsApp" className="w-56 h-56 rounded-lg border" />
            ) : (
              <div className="w-56 h-56 rounded-lg border bg-muted flex items-center justify-center text-center p-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">QR Code</p>
                  <p className="text-xs text-muted-foreground break-all">{qrcode}</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <button onClick={loadQR} className="rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">Atualizar QR Code</button>
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-semibold mb-4">Configuração</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">API Evolution</span>
            <span className="font-medium text-foreground">Configurado no .env</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Instância</span>
            <span className="font-medium text-foreground">Configurado no .env</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Status</span>
            <span className={`font-medium ${status?.connected ? 'text-emerald-600' : 'text-amber-600'}`}>
              {status?.connected ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-muted p-4">
          <p className="text-xs text-muted-foreground">
            Configure as variáveis <code className="bg-background px-1 rounded">EVOLUTION_API_URL</code>, <code className="bg-background px-1 rounded">EVOLUTION_API_KEY</code> e <code className="bg-background px-1 rounded">EVOLUTION_INSTANCE_NAME</code> no arquivo <code className="bg-background px-1 rounded">.env</code>.
          </p>
        </div>
      </div>
    </div>
  )
}
