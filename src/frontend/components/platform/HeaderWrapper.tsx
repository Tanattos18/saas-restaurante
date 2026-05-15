'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { IconLogout2, IconChevronDown } from '@/components/ui/Icons'

interface TenantData {
  name: string
  plan: string
  slug: string
}

export function HeaderWrapper({ tenantSlug: _tenantSlug }: { tenantSlug: string }) {
  const router = useRouter()
  const [tenant, setTenant] = useState<TenantData | null>(null)
  const [userName, setUserName] = useState('Admin')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const planConfig: Record<string, { label: string; bg: string }> = {
    FREE: { label: 'Gratuito', bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
    BASIC: { label: 'Básico', bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' },
    PRO: { label: 'Profissional', bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' },
    ENTERPRISE: { label: 'Empresarial', bg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400' },
  }

  const planKey = tenant?.plan ?? 'FREE'

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 py-3.5 lg:px-6">
          <div className="pl-12 lg:pl-0 space-y-1.5">
            <div className="h-4 w-40 bg-muted rounded animate-pulse" />
            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
          </div>
          <div className="w-9 h-9 bg-muted rounded-full animate-pulse" />
        </div>
      </header>
    )
  }

  const currentPlan = planConfig[planKey]!

  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-lg">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3 pl-12 lg:pl-0">
          <div className="hidden lg:block">
            <h1 className="text-base font-semibold text-foreground tracking-tight">{tenant?.name || 'Meu Restaurante'}</h1>
            <span className={`inline-flex items-center gap-1 mt-0.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${currentPlan.bg}`}>
              {currentPlan.label}
            </span>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-muted transition-colors duration-200"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs">{getInitials(userName)}</span>
            </div>
            <span className="hidden sm:block text-sm font-medium text-foreground">{userName}</span>
            <IconChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-lg border border-border overflow-hidden animate-scale-in origin-top-right">
              <div className="p-4 border-b border-border">
                <p className="text-sm font-semibold text-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{tenant?.name || 'Restaurante'}</p>
              </div>
              <div className="p-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <IconLogout2 className="w-4 h-4" />
                  Sair da conta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}