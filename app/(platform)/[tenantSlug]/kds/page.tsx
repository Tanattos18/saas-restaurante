'use client'

import { useState, useEffect } from 'react'
import { KitchenBoard } from '@/components/platform/kds/KitchenBoard'

type Props = { params: Promise<{ tenantSlug: string }> }

export default function KDSPage({ params }: Props) {
  const [deviceCode, setDeviceCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('kds_device_code')
    if (stored) setDeviceCode(stored)
  }, [])

  async function registerDevice() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/kds/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Tela Cozinha', type: 'DISPLAY' }),
      })
      const data = await res.json()
      if (data.success) {
        localStorage.setItem('kds_device_code', data.data.deviceCode)
        setDeviceCode(data.data.deviceCode)
      } else {
        setError(data.error ?? 'Erro ao registrar')
      }
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  if (deviceCode) {
    return <KitchenBoard deviceCode={deviceCode} />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Tela da Cozinha</h1>
        <p className="text-slate-400 text-sm mb-8">Registre este dispositivo para começar a receber pedidos em tempo real</p>
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
            {error}
          </div>
        )}
        <button
          onClick={registerDevice}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-6 py-3 text-white font-semibold transition-all duration-200 disabled:opacity-50 shadow-lg shadow-emerald-500/25"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Registrando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Registrar Dispositivo
            </>
          )}
        </button>
      </div>
    </div>
  )
}
