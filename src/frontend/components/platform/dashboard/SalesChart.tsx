'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'

interface HourlyData {
  hour: number
  count: number
}

interface ChannelData {
  channel: string
  count: number
}

interface Props {
  ordersByHour: HourlyData[]
  ordersByChannel: ChannelData[]
}

const CHANNEL_COLORS: Record<string, string> = {
  WHATSAPP: '#059669',
  QR_CODE: '#7c3aed',
  COUNTER: '#f59e0b',
  PHONE: '#3b82f6',
  IFOOD: '#10b981',
  RAPPI: '#ef4444',
  UBER_EATS: '#06b6d4',
}

const channelLabels: Record<string, string> = {
  WHATSAPP: 'WhatsApp',
  QR_CODE: 'QR Code',
  COUNTER: 'Balcão',
  PHONE: 'Telefone',
  IFOOD: 'iFood',
  RAPPI: 'Rappi',
  UBER_EATS: 'Uber Eats',
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-lg text-sm">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">{payload[0].value} pedidos</p>
    </div>
  )
}

export function SalesChart({ ordersByHour, ordersByChannel }: Props) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Pedidos por Hora */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Pedidos por Hora</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Distribuição ao longo do dia</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>Hoje</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={ordersByHour} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
            <XAxis
              dataKey="hour"
              tickFormatter={(h) => `${h}h`}
              fontSize={11}
              axisLine={false}
              tickLine={false}
              dy={8}
              color="var(--muted-foreground)"
            />
            <YAxis fontSize={11} allowDecimals={false} axisLine={false} tickLine={false} dx={-4} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.5 }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={32}>
              {ordersByHour.map((_, i) => (
                <Cell key={i} fill={i === ordersByHour.length - 1 ? '#059669' : '#d1fae5'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pedidos por Canal */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Pedidos por Canal</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Origem dos pedidos</p>
          </div>
        </div>
        <div className="flex gap-6 items-center">
          <ResponsiveContainer width="50%" height={200}>
            <PieChart>
              <Pie
                data={ordersByChannel.map((c) => ({ ...c, name: channelLabels[c.channel] || c.channel }))}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={80}
                paddingAngle={3}
                strokeWidth={0}
              >
                {ordersByChannel.map((entry) => (
                  <Cell key={entry.channel} fill={CHANNEL_COLORS[entry.channel] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-2.5">
            {ordersByChannel.map((entry, i) => {
              const total = ordersByChannel.reduce((s, c) => s + c.count, 0)
              const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0
              return (
                <div key={entry.channel} className="flex items-center gap-2 text-sm">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: CHANNEL_COLORS[entry.channel] || '#94a3b8' }}
                  />
                  <span className="flex-1 text-muted-foreground">{channelLabels[entry.channel] || entry.channel}</span>
                  <span className="font-medium">{pct}%</span>
                </div>
              )
            })}
            {ordersByChannel.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum pedido hoje</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
