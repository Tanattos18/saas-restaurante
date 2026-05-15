'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IconUser, IconLogout2 } from '@/components/ui/Icons'

interface TenantData {
  name: string
  plan: string
  slug: string
}

export function HeaderWrapper({ tenantSlug }: { tenantSlug: string }) {
  const router = useRouter()
  const [tenant, setTenant] = useState<TenantData | null>(null)
  const [userName, setUserName] = useState('Admin')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/tenant/me').then((r) => r.json()),
      fetch('/api/auth/me').then((r) => r.json()),
    ]).then(([tenantData, userData]) => {
      if (tenantData.success) setTenant(tenantData.data)
      if (userData.success) setUserName(userData.data?.name || 'Admin')
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const planColors: Record<string, string> = {
    FREE: 'bg-gray-100 text-gray-600',
    BASIC: 'bg-blue-100 text-blue-700',
    PRO: 'bg-green-100 text-green-700',
    ENTERPRISE: 'bg-purple-100 text-purple-700',
  }

  if (loading) {
    return (
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3 lg:px-6">
          <div className="pl-12 lg:pl-0">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3 pl-12 lg:pl-0">
          <div className="hidden lg:block">
            <h1 className="text-lg font-bold text-gray-800">{tenant?.name || 'Meu Restaurante'}</h1>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${planColors[tenant?.plan || 'FREE']}`}>
              {tenant?.plan || 'FREE'}
            </span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <IconUser className="w-5 h-5 text-green-600" />
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">{userName}</span>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 animate-fade-in">
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-medium text-gray-800">{userName}</p>
                <p className="text-xs text-gray-500">{tenant?.name || 'Restaurante'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <IconLogout2 className="w-4 h-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}