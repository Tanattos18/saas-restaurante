import { ProductList } from '@/components/platform/menu/ProductList'
import { StockAlert } from '@/components/platform/menu/StockAlert'

type Props = { params: Promise<{ tenantSlug: string }> }

export default async function MenuPage({ params }: Props) {
  const { tenantSlug } = await params
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cardápio</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie os produtos do seu restaurante</p>
      </div>
      <StockAlert />
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <ProductList tenantSlug={tenantSlug} />
      </div>
    </div>
  )
}