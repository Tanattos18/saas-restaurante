'use client'

import { useState, useEffect, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import Link from 'next/link'

interface Transaction {
  id: string
  orderNumber: number
  customerName: string
  status: string
  total: number
  deliveryFee: number
  discount: number
  paymentMethod: string | null
  paymentStatus: string | null
  createdAt: string
  channel: string
  items: Array<{ product: { name: string }; quantity: number }>
}

const periodLabels: Record<string, string> = { today: 'Hoje', week: 'Esta Semana', month: 'Este Mês' }
const channelLabels: Record<string, string> = { WHATSAPP: '💬 WhatsApp', QR_CODE: '📱 QR Code', COUNTER: '🏪 Balcão', PHONE: '📞 Telefone', IFOOD: '🟢 iFood' }

export default function FinancialPage() {
  const [period, setPeriod] = useState('today')
  const [summary, setSummary] = useState<{ totalRevenue: number; totalOrders: number; avgTicket: number; totalFees: number; byPaymentMethod: Record<string, number> } | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [dailyData, setDailyData] = useState<Array<{ date: string; revenue: number }>>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [sRes, tRes, dRes] = await Promise.all([
        fetch(`/api/financial?period=${period}`),
        fetch(`/api/financial?period=${period}&type=transactions&page=${page}`),
        fetch(`/api/financial?type=daily&days=7`),
      ])
      const s = await sRes.json()
      const t = await tRes.json()
      const d = await dRes.json()
      if (s.success) setSummary(s.data)
      if (t.success) { setTransactions(t.data.orders); setTotalPages(t.data.totalPages) }
      if (d.success) setDailyData(d.data)
    } finally { setLoading(false) }
  }, [period, page])

  useEffect(() => { fetchData() }, [fetchData])

  const formatCurrency = (v: number) => `R$ ${v.toFixed(2)}`

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-1">Fluxo de caixa e movimentações</p>
        </div>
        <Link href="financial/reports" className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background hover:bg-accent px-4 py-2.5 text-sm font-medium transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
          Relatórios
        </Link>
      </div>

      {/* Period Filter */}
      <div className="flex gap-1.5">
        {['today', 'week', 'month'].map((p) => (
          <button key={p} onClick={() => { setPeriod(p); setPage(1) }}
            className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
              period === p ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800' : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}>{periodLabels[p]}</button>
        ))}
      </div>

      {/* Summary Cards */}
      {loading && !summary ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => <div key={i} className="rounded-xl border bg-card p-5 animate-pulse"><div className="h-4 w-20 bg-muted rounded mb-3" /><div className="h-7 w-24 bg-muted rounded" /></div>)}
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border bg-card p-5 shadow-sm stagger-1">
              <p className="text-sm font-medium text-muted-foreground">Receita</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(summary.totalRevenue)}</p>
            </div>
            <div className="rounded-xl border bg-card p-5 shadow-sm stagger-2">
              <p className="text-sm font-medium text-muted-foreground">Pedidos</p>
              <p className="text-2xl font-bold mt-1">{summary.totalOrders}</p>
            </div>
            <div className="rounded-xl border bg-card p-5 shadow-sm stagger-3">
              <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
              <p className="text-2xl font-bold text-violet-600 dark:text-violet-400 mt-1">{formatCurrency(summary.avgTicket)}</p>
            </div>
            <div className="rounded-xl border bg-card p-5 shadow-sm stagger-4">
              <p className="text-sm font-medium text-muted-foreground">Taxas</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{formatCurrency(summary.totalFees)}</p>
            </div>
          </div>

          {/* Payment Methods + Daily Revenue */}
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold mb-4">Receita por Forma de Pagamento</h3>
              {Object.keys(summary.byPaymentMethod).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhuma venda no período</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(summary.byPaymentMethod).map(([method, total]) => {
                    const pct = summary.totalRevenue > 0 ? (total / summary.totalRevenue) * 100 : 0
                    return (
                      <div key={method}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{method}</span>
                          <span>{formatCurrency(total)} ({pct.toFixed(0)}%)</span>
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
              <h3 className="text-sm font-semibold mb-4">Receita Diária (7 dias)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyData}>
                  <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString('pt-BR', { weekday: 'short' })} fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis fontSize={11} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                  <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString('pt-BR')} formatter={(v: number) => [formatCurrency(v), 'Receita']} />
                  <Bar dataKey="revenue" fill="#059669" radius={[4,4,0,0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold mb-4">Transações</h3>
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhuma transação no período</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-3 py-3 text-left font-semibold">#</th>
                      <th className="px-3 py-3 text-left font-semibold">Cliente</th>
                      <th className="px-3 py-3 text-left font-semibold">Canal</th>
                      <th className="px-3 py-3 text-right font-semibold">Valor</th>
                      <th className="px-3 py-3 text-center font-semibold">Pagamento</th>
                      <th className="px-3 py-3 text-right font-semibold">Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-3 font-medium">#{t.orderNumber}</td>
                        <td className="px-3 py-3 text-muted-foreground">{t.customerName}</td>
                        <td className="px-3 py-3 text-xs">{channelLabels[t.channel] || t.channel}</td>
                        <td className="px-3 py-3 text-right font-medium">R$ {Number(t.total).toFixed(2)}</td>
                        <td className="px-3 py-3 text-center">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            t.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            t.paymentStatus === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-muted text-muted-foreground'
                          }`}>{t.paymentStatus || '-'}</span>
                        </td>
                        <td className="px-3 py-3 text-right text-muted-foreground">
                          {new Date(t.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-muted">Anterior</button>
                <span className="text-sm text-muted-foreground">{page} de {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-muted">Próxima</button>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
