'use client'

import { useState, useEffect, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import Link from 'next/link'

interface Metrics {
  totalOrders: number
  totalRevenue: number
  avgTicket: number
  pendingOrders: number
  cancelationRate: number
  topProducts: Array<{ name: string; quantity: number; revenue: number }>
  ordersByHour: Array<{ hour: number; count: number }>
  ordersByChannel: Array<{ channel: string; count: number }>
  revenueByDay: Array<{ date: string; revenue: number }>
}

const CHANNEL_COLORS: Record<string, string> = {
  WHATSAPP: '#059669', QR_CODE: '#7c3aed', COUNTER: '#f59e0b',
  PHONE: '#3b82f6', IFOOD: '#10b981', RAPPI: '#ef4444', UBER_EATS: '#06b6d4',
}
const channelLabels: Record<string, string> = {
  WHATSAPP: 'WhatsApp', QR_CODE: 'QR Code', COUNTER: 'Balcão', PHONE: 'Telefone', IFOOD: 'iFood',
}

const periods = [
  { key: 'week' as const, label: '7 Dias' },
  { key: 'month' as const, label: '30 Dias' },
  { key: 'today' as const, label: 'Hoje' },
]

const formatCurrency = (v: number) => `R$ ${v.toFixed(2)}`

function SummaryCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm stagger-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent}`}>{value}</p>
    </div>
  )
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week')
  const [data, setData] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reports?period=${period}`)
      const d = await res.json()
      if (d.success) setData(d.data)
    } finally { setLoading(false) }
  }, [period])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Link href="../financial" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            Voltar para Financeiro
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-sm text-muted-foreground mt-1">Análise de vendas e desempenho</p>
        </div>
        <div className="flex gap-1.5">
          {periods.map((p) => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                period === p.key ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800' : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}>{p.label}</button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map((i) => <div key={i} className="rounded-xl border bg-card p-5 animate-pulse"><div className="h-4 w-20 bg-muted rounded mb-3" /><div className="h-7 w-24 bg-muted rounded" /></div>)}</div>
          <div className="h-64 rounded-xl border bg-card animate-pulse" />
          <div className="grid grid-cols-2 gap-5">{[1,2].map((i) => <div key={i} className="h-64 rounded-xl border bg-card animate-pulse" />)}</div>
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard label="Receita Total" value={formatCurrency(data.totalRevenue)} accent="text-emerald-600 dark:text-emerald-400" />
            <SummaryCard label="Pedidos" value={String(data.totalOrders)} accent="text-foreground" />
            <SummaryCard label="Ticket Médio" value={formatCurrency(data.avgTicket)} accent="text-violet-600 dark:text-violet-400" />
            <SummaryCard label="Cancelamentos" value={`${data.cancelationRate.toFixed(1)}%`} accent="text-red-600 dark:text-red-400" />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold mb-4">Receita Diária</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.revenueByDay}>
                  <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis fontSize={11} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                  <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString('pt-BR')} formatter={(v: number) => [formatCurrency(v), 'Receita']} />
                  <Line type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} dot={{ r: 4, fill: '#059669' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold mb-4">Pedidos por Horário</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.ordersByHour}>
                  <XAxis dataKey="hour" tickFormatter={(h) => `${h}h`} fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis fontSize={11} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip labelFormatter={(h) => `${h}h`} formatter={(v) => [v, 'Pedidos']} />
                  <Bar dataKey="count" radius={[6,6,0,0]} maxBarSize={24}>
                    {data.ordersByHour.map((_, i) => (
                      <Cell key={i} fill={i >= 11 && i <= 14 || i >= 18 && i <= 21 ? '#059669' : '#d1fae5'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold mb-4">Produtos Mais Vendidos</h3>
              {data.topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum produto vendido no período</p>
              ) : (
                <div className="space-y-3">
                  {data.topProducts.map((p, i) => {
                    const maxQty = data.topProducts[0]?.quantity ?? 1
                    const pct = (p.quantity / maxQty) * 100
                    return (
                      <div key={p.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[11px] font-medium text-muted-foreground">{i + 1}</span>
                            <span className="font-medium truncate max-w-[180px]">{p.name}</span>
                          </span>
                          <span className="text-muted-foreground shrink-0">{p.quantity} vendidos · {formatCurrency(p.revenue)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold mb-4">Pedidos por Canal</h3>
              <div className="flex gap-6 items-center">
                <ResponsiveContainer width="50%" height={240}>
                  <PieChart>
                    <Pie data={data.ordersByChannel.map((c) => ({ ...c, name: channelLabels[c.channel] || c.channel }))}
                      dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} strokeWidth={0}>
                      {data.ordersByChannel.map((entry) => (
                        <Cell key={entry.channel} fill={CHANNEL_COLORS[entry.channel] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [v, 'Pedidos']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2.5">
                  {data.ordersByChannel.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum dado</p>
                  ) : (
                    data.ordersByChannel.map((entry) => {
                      const total = data.ordersByChannel.reduce((s, c) => s + c.count, 0)
                      const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0
                      return (
                        <div key={entry.channel} className="flex items-center gap-2 text-sm">
                          <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHANNEL_COLORS[entry.channel] || '#94a3b8' }} />
                          <span className="flex-1 text-muted-foreground">{channelLabels[entry.channel] || entry.channel}</span>
                          <span className="font-medium">{pct}%</span>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {data.pendingOrders > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 dark:bg-amber-900/40 p-2">
                  <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  {data.pendingOrders} pedido{data.pendingOrders > 1 ? 's' : ''} pendente{data.pendingOrders > 1 ? 's' : ''} de confirmação
                </p>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
