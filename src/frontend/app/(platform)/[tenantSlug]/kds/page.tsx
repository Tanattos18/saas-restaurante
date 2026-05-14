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
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">👨‍🍳 Tela da Cozinha</h1>
        <p className="text-gray-400 mb-6">Registre este dispositivo para receber pedidos</p>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <button
          onClick={registerDevice}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Registrando...' : 'Registrar Dispositivo'}
        </button>
      </div>
    </div>
  )
}