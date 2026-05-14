import { getAuthContext } from '@/lib/auth'
import { customerService } from '@/services/customer.service'
import { loyaltyService } from '@/services/loyalty.service'

type Props = { params: Promise<{ id: string }> }

export default async function CustomerDetailPage({ params }: Props) {
  const auth = await getAuthContext()
  if (!auth) return null
  const { id } = await params

  const cSvc = customerService(auth.tenantId)
  const lSvc = loyaltyService(auth.tenantId)
  const customer = await cSvc.getById(id)
  if (!customer) return <p className="text-muted-foreground">Cliente não encontrado.</p>

  const balance = await lSvc.getBalance(id)
  const { transactions } = await lSvc.getHistory(id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{customer.name}</h1>
        <p className="text-sm text-muted-foreground">{customer.phone} · {customer.address || 'Sem endereço'}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pedidos</p>
          <p className="text-2xl font-bold">{customer.totalOrders}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Gasto Total</p>
          <p className="text-2xl font-bold">R$ {Number(customer.totalSpent).toFixed(2)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Nível</p>
          <p className="text-2xl font-bold">{balance.level}</p>
          <p className="text-xs text-muted-foreground">{balance.current} pts · {balance.lifetime} vitalícios</p>
          {balance.nextLevel && <p className="text-xs text-muted-foreground mt-1">Faltam {balance.nextLevel.pointsToNext} pts para {balance.nextLevel.level}</p>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="font-bold mb-4">Últimos Pedidos</h2>
          {customer.orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum pedido.</p>
          ) : (
            <div className="space-y-2">
              {customer.orders.map((o) => (
                <div key={o.id} className="rounded border p-3 text-sm">
                  <div className="flex justify-between font-medium">
                    <span>#{o.orderNumber}</span>
                    <span className="text-muted-foreground">{new Date(o.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <p className="text-muted-foreground mt-1">
                    {o.items.map((i) => `${i.quantity}x ${i.product.name}`).join(', ')}
                  </p>
                  <p className="font-medium mt-1">R$ {Number(o.total).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h2 className="font-bold mb-4">Extrato de Pontos</h2>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma transação.</p>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 20).map((t) => (
                <div key={t.id} className="flex justify-between text-sm">
                  <div>
                    <span className={t.points > 0 ? 'text-green-600' : 'text-red-600'}>
                      {t.points > 0 ? '+' : ''}{t.points} pts
                    </span>
                    <span className="text-muted-foreground ml-2">{t.description}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}