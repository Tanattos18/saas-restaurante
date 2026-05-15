'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { IconBell, IconLogout, IconUser, IconSettings } from '@/components/ui/Icons'

interface Props {
  tenantName: string
  plan: string
  tenantSlug: string
}

export function Header({ tenantName, plan, tenantSlug }: Props) {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [userInitials, setUserInitials] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => { 
        if (d.success) {
          setUserName(d.data.name)
          const initials = d.data.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
          setUserInitials(initials)
        }
      })
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="hidden lg:block">
          <h1 className="font-bold text-foreground">{tenantName || 'Meu Restaurante'}</h1>
          <p className="text-xs text-muted-foreground uppercase font-medium">{plan || 'Plano Free'}</p>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
            <IconBell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-medium text-primary-foreground">{userInitials || 'U'}</span>
              </div>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-card shadow-lg overflow-hidden">
                <div className="p-3 border-b">
                  <p className="text-sm font-medium">{userName || 'Usuário'}</p>
                  <p className="text-xs text-muted-foreground">{tenantSlug}@restaurant.com</p>
                </div>
                <div className="p-1">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted text-left">
                    <IconUser className="w-4 h-4" />
                    Perfil
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted text-left">
                    <IconSettings className="w-4 h-4" />
                    Configurações
                  </button>
                </div>
                <div className="p-1 border-t">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted text-left text-destructive"
                  >
                    <IconLogout className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
