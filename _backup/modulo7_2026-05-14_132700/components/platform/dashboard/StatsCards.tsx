interface Props {
  totalOrders: number
  totalRevenue: number
  avgTicket: number
  pendingOrders: number
}

export function StatsCards({ totalOrders, totalRevenue, avgTicket, pendingOrders }: Props) {
  const cards = [
    { label: 'Pedidos Hoje', value: totalOrders, color: 'text-blue-600' },
    { label: 'Receita', value: `R$ ${totalRevenue.toFixed(2)}`, color: 'text-green-600' },
    { label: 'Ticket Médio', value: `R$ ${avgTicket.toFixed(2)}`, color: 'text-purple-600' },
    { label: 'Pendentes', value: pendingOrders, color: 'text-yellow-600' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">{card.label}</p>
          <p className={`mt-1 text-2xl font-bold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  )
}
