'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const menuItems = [
  { href: 'dashboard', label: 'Dashboard', icon: '📊' },
  { href: 'orders', label: 'Pedidos', icon: '📋' },
  { href: 'kds', label: 'Cozinha (KDS)', icon: '👨‍🍳' },
  { href: 'menu', label: 'Cardápio', icon: '🍽️' },
  { href: 'categories', label: 'Categorias', icon: '📂' },
  { href: 'customers', label: 'Clientes', icon: '👥' },
  { href: 'loyalty', label: 'Fidelidade', icon: '⭐' },
  { href: 'inventory', label: 'Estoque', icon: '📦' },
  { href: 'financial', label: 'Financeiro', icon: '💰' },
  { href: 'qr-code', label: 'QR Codes', icon: '📱' },
  { href: 'settings', label: 'Configurações', icon: '⚙️' },
]

interface Props {
  tenantSlug: string
  pendingOrdersCount?: number
}

export function Sidebar({ tenantSlug, pendingOrdersCount = 0 }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const basePath = `/${tenantSlug}`

  return (
    <>
      <button onClick={() => setOpen(!open)} className="fixed top-4 left-4 z-50 rounded-md bg-background p-2 shadow lg:hidden">
        <span className="text-xl">{open ? '✕' : '☰'}</span>
      </button>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-card transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b">
          <Link href={basePath} className="text-lg font-bold">SaaS Restaurante</Link>
        </div>

        <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-64px)]">
          {menuItems.map((item) => {
            const isActive = pathname === `${basePath}/${item.href}` || pathname.startsWith(`${basePath}/${item.href}/`)
            const isPending = item.href === 'orders' && pendingOrdersCount > 0

            return (
              <Link
                key={item.href}
                href={`${basePath}/${item.href}`}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <span>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {isPending && (
                  <span className="rounded-full bg-destructive px-2 py-0.5 text-xs text-destructive-foreground">
                    {pendingOrdersCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  )
}
