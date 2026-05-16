'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  IconDashboard, IconOrders, IconKitchen, IconMenu, IconCategory,
  IconCustomers, IconLoyalty, IconInventory, IconFinancial, IconQRCode,
  IconSettings, IconMenuBurger, IconX,
} from '@/components/ui/Icons'

const menuItems = [
  { href: 'dashboard', label: 'Dashboard', icon: IconDashboard },
  { href: 'orders', label: 'Pedidos', icon: IconOrders },
  { href: 'kds', label: 'Cozinha (KDS)', icon: IconKitchen },
  { href: 'menu', label: 'Cardápio', icon: IconMenu },
  { href: 'categories', label: 'Categorias', icon: IconCategory },
  { href: 'customers', label: 'Clientes', icon: IconCustomers },
  { href: 'loyalty', label: 'Fidelidade', icon: IconLoyalty },
  { href: 'inventory', label: 'Estoque', icon: IconInventory },
  { href: 'financial', label: 'Financeiro', icon: IconFinancial },
  { href: 'qr-code', label: 'QR Codes', icon: IconQRCode },
  { href: 'settings', label: 'Configurações', icon: IconSettings },
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
      {/* Mobile Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2.5 rounded-xl bg-card shadow-md border hover:bg-accent transition-all duration-200"
        aria-label="Toggle menu"
      >
        {open ? <IconX className="w-5 h-5" /> : <IconMenuBurger className="w-5 h-5" />}
      </button>

      {/* Backdrop mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64
          bg-card border-r border-border
          transition-transform duration-300 ease-out
          lg:translate-x-0
          ${open ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-border">
          <Link href={basePath} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <span className="text-base font-bold text-foreground tracking-tight">SaaS Restaurante</span>
              <span className="block text-[10px] text-muted-foreground leading-none mt-0.5">Painel de controle</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-10rem)]">
          {menuItems.map((item) => {
            const isActive = pathname === `${basePath}/${item.href}` || pathname.startsWith(`${basePath}/${item.href}/`)
            const isPending = item.href === 'orders' && pendingOrdersCount > 0
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={`${basePath}/${item.href}`}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200 relative
                  ${isActive
                    ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-violet-600 dark:text-violet-400' : ''}`} />
                <span className="flex-1">{item.label}</span>
                {isPending && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 bg-red-500 text-white text-[11px] font-bold px-1.5 rounded-full shadow-sm animate-scale-in">
                    {pendingOrdersCount}
                  </span>
                )}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-violet-500" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border bg-card">
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs font-semibold text-foreground">Plano PRO</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Restaurante Teste</p>
          </div>
        </div>
      </aside>
    </>
  )
}
