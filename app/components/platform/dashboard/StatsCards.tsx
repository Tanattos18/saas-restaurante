import { IconOrders, IconFinancial, IconMenu, IconKitchen } from '@/components/ui/Icons'

interface Props {
  totalOrders: number
  totalRevenue: number
  avgTicket: number
  pendingOrders: number
}

export function StatsCards({ totalOrders, totalRevenue, avgTicket, pendingOrders }: Props) {
  const cards = [
    { label: 'Pedidos Hoje', value: totalOrders, icon: IconOrders, bg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { label: 'Receita', value: `R$ ${totalRevenue.toFixed(2)}`, icon: IconFinancial, bg: 'bg-green-50', iconColor: 'text-green-600' },
    { label: 'Ticket Médio', value: `R$ ${avgTicket.toFixed(2)}`, icon: IconMenu, bg: 'bg-purple-50', iconColor: 'text-purple-600' },
    { label: 'Pendentes', value: pendingOrders, icon: IconKitchen, bg: 'bg-orange-50', iconColor: 'text-orange-600' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const IconComponent = card.icon
        return (
          <div key={card.label} className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <IconComponent className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
                <p className="text-xl font-bold text-foreground">{card.value}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
