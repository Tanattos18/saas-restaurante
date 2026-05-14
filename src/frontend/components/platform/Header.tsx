'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  tenantName: string
  plan: string
  tenantSlug: string
}

export function Header({ tenantName, plan, tenantSlug }: Props) {
  const router = useRouter()
  const [userName, setUserName] = useState('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => { if (d.success) setUserName(d.data.name) })
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-background">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="hidden lg:block">
          <h1 className="font-bold">{tenantName}</h1>
          <p className="text-xs text-muted-foreground uppercase">{plan}</p>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <span className="text-sm text-muted-foreground hidden sm:block">{userName}</span>
          <button
            onClick={handleLogout}
            className="rounded-md border border-input px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}
