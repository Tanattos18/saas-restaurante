'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

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

export function SalesChart({ ordersByHour, ordersByChannel }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium mb-4">Pedidos por Hora</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={ordersByHour}>
            <XAxis dataKey="hour" tickFormatter={(h) => `${h}h`} fontSize={12} />
            <YAxis fontSize={12} allowDecimals={false} />
            <Tooltip labelFormatter={(h) => `${h}h`} formatter={(value) => [value, 'Pedidos']} />
            <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium mb-4">Pedidos por Canal</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={ordersByChannel} layout="vertical">
            <XAxis type="number" fontSize={12} allowDecimals={false} />
            <YAxis type="category" dataKey="channel" fontSize={12} width={80} />
            <Tooltip formatter={(value) => [value, 'Pedidos']} />
            <Bar dataKey="count" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
