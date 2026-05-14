import { getAuthContext } from '@/lib/auth'
import { customerService } from '@/services/customer.service'

export default async function LoyaltyPage() {
  const auth = await getAuthContext()
  if (!auth) return null

  const cSvc = customerService(auth.tenantId)
  const topCustomers = await cSvc.getTopCustomers(5)
  const churnRisk = await cSvc.getChurnRisk()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Programa de Fidelidade</h1>
        <p className="text-sm text-muted-foreground">Gerencie o programa de pontos do seu restaurante</p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="font-bold mb-4">Regras</h2>
        <ul className="space-y-2 text-sm">
          <li>✅ 1 ponto para cada R$ 1 gasto (arredondado para baixo)</li>
          <li>✅ Resgate mínimo: 100 pontos = R$ 5 de desconto</li>
          <li>✅ Resgate deve ser múltiplo de 100 pontos</li>
          <li>✅ Pontos expiram em 365 dias</li>
          <li>✅ Níveis baseados no total histórico de pontos</li>
        </ul>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {[
            { level: 'Bronze', range: '0-499 pts', color: 'bg-amber-100 text-amber-800' },
            { level: 'Prata', range: '500-999 pts', color: 'bg-gray-200 text-gray-800' },
            { level: 'Ouro', range: '1000-2499 pts', color: 'bg-yellow-100 text-yellow-800' },
            { level: 'Platina', range: '2500+ pts', color: 'bg-purple-100 text-purple-800' },
          ].map((l) => (
            <div key={l.level} className={`rounded-lg p-3 text-center ${l.color}`}>
              <p className="font-bold">{l.level}</p>
              <p className="text-xs">{l.range}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="font-bold mb-4">🏆 Top Clientes</h2>
          {topCustomers.map((c, i) => (
            <div key={c.id} className="flex justify-between text-sm py-2 border-b last:border-0">
              <span><span className="text-muted-foreground mr-2">#{i + 1}</span>{c.name}</span>
              <span>R$ {Number(c.totalSpent).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h2 className="font-bold mb-4">⚠️ Risco de Churn</h2>
          {churnRisk.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum cliente em risco.</p>
          ) : (
            churnRisk.map((c) => (
              <div key={c.id} className="flex justify-between text-sm py-2 border-b last:border-0">
                <span>{c.name}</span>
                <span className="text-muted-foreground">{c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString('pt-BR') : 'Nunca'}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}