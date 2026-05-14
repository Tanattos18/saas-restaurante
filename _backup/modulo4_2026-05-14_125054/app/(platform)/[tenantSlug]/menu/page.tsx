import { ProductList } from '@/components/platform/menu/ProductList'
import { StockAlert } from '@/components/platform/menu/StockAlert'

type Props = { params: Promise<{ tenantSlug: string }> }

export default async function MenuPage({ params }: Props) {
  const { tenantSlug } = await params
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cardápio</h1>
        <p className="text-sm text-muted-foreground">Gerencie os produtos do seu restaurante</p>
      </div>
      <StockAlert />
      <ProductList tenantSlug={tenantSlug} />
    </div>
  )
}