'use client'

import { useEffect, useState } from 'react'

interface Props {
  totalOrders: number
  totalRevenue: number
  avgTicket: number
  pendingOrders: number
}

function AnimatedValue({ value, prefix = '' }: { value: number | string; prefix?: string }) {
  const [display, setDisplay] = useState(0)
  const numeric = typeof value === 'number' ? value : 0
  const isString = typeof value === 'string'

  useEffect(() => {
    if (isString) { setDisplay(0); return }
    const duration = 600
    const steps = 20
    const increment = numeric / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= numeric) {
        setDisplay(numeric)
        clearInterval(timer)
      } else {
        setDisplay(current)
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [numeric, isString])

  if (isString) return <>{value}</>
  return <>{prefix}{display.toFixed(2)}</>
}

export function StatsCards({ totalOrders, totalRevenue, avgTicket, pendingOrders }: Props) {
  const cards = [
    {
      label: 'Pedidos Hoje',
      value: totalOrders,
      prefix: '',
      accent: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
    },
    {
      label: 'Receita',
      value: totalRevenue,
      prefix: 'R$ ',
      accent: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Ticket Médio',
      value: avgTicket,
      prefix: 'R$ ',
      accent: 'from-violet-500 to-violet-600',
      bg: 'bg-violet-50 dark:bg-violet-950/40',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
        </svg>
      ),
    },
    {
      label: 'Pendentes',
      value: pendingOrders,
      prefix: '',
      accent: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:gap-5 lg:grid-cols-4">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={`relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 stagger-${i + 1}`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
              <p className={`text-2xl font-bold tracking-tight ${pendingOrders > 0 && card.label === 'Pendentes' ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                {card.prefix}
                {typeof card.value === 'number' ? (
                  <AnimatedValue value={card.value} prefix="" />
                ) : (
                  <AnimatedValue value={card.value} />
                )}
              </p>
            </div>
            <div className={`rounded-lg ${card.bg} p-2.5`}>
              {card.icon}
            </div>
          </div>
          <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.accent} opacity-60`} />
          {card.label === 'Pendentes' && pendingOrders > 0 && (
            <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
