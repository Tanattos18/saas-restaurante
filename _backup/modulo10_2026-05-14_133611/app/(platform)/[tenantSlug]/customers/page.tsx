import { getAuthContext } from '@/lib/auth'
import { customerService } from '@/services/customer.service'
import Link from 'next/link'

export default async function CustomersPage() {
  const auth = await getAuthContext()
  if (!auth) return null

  const svc = customerService(auth.tenantId)
  const customers = await svc.list()

  const levelColors: Record<string, string> = {
    BRONZE: 'bg-amber-100 text-amber-800', SILVER: 'bg-gray-200 text-gray-800',
    GOLD: 'bg-yellow-100 text-yellow-800', PLATINUM: 'bg-purple-100 text-purple-800',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Clientes</h1>
        <p className="text-sm text-muted-foreground">Gerencie seus clientes</p>
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Nome</th>
              <th className="px-4 py-3 text-left font-medium">Telefone</th>
              <th className="px-4 py-3 text-right font-medium">Pedidos</th>
              <th className="px-4 py-3 text-right font-medium">Gasto Total</th>
              <th className="px-4 py-3 text-right font-medium">Pontos</th>
              <th className="px-4 py-3 text-center font-medium">Nível</th>
              <th className="px-4 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                <td className="px-4 py-3 text-right">{c.totalOrders}</td>
                <td className="px-4 py-3 text-right">R$ {Number(c.totalSpent).toFixed(2)}</td>
                <td className="px-4 py-3 text-right">{c.loyaltyPoints}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${levelColors[c.loyaltyLevel] ?? ''}`}>{c.loyaltyLevel}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/${auth.tenantSlug}/customers/${c.id}`} className="text-primary hover:underline text-sm">Detalhes</Link>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Nenhum cliente encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}