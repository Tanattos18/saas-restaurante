'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { IconDashboard, IconOrders, IconKitchen, IconMenu, IconCategory, IconCustomers, IconLoyalty, IconInventory, IconFinancial, IconQRCode, IconSettings, IconMenuBurger, IconX } from '@/components/ui/Icons'

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
      <button 
        onClick={() => setOpen(!open)} 
        className="fixed top-4 left-4 z-50 rounded-lg bg-card border p-2 shadow-md hover:bg-muted transition-colors lg:hidden"
      >
        {open ? <IconX className="w-5 h-5" /> : <IconMenuBurger className="w-5 h-5" />}
      </button>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-card transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <Link href={basePath} className="text-lg font-bold text-foreground hover:text-primary transition-colors">
            SaaS Restaurante
          </Link>
        </div>

        <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-64px)]">
          {menuItems.map((item) => {
            const isActive = pathname === `${basePath}/${item.href}` || pathname.startsWith(`${basePath}/${item.href}/`)
            const isPending = item.href === 'orders' && pendingOrdersCount > 0
            const IconComponent = item.icon

            return (
              <Link
                key={item.href}
                href={`${basePath}/${item.href}`}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <IconComponent className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                <span className="flex-1">{item.label}</span>
                {isPending && (
                  <span className="rounded-full bg-destructive px-2 py-0.5 text-xs text-destructive-foreground font-medium">
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