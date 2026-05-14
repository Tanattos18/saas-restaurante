import { ProductForm } from '@/components/platform/menu/ProductForm'

type Props = { params: Promise<{ tenantSlug: string }> }

export default async function NewProductPage({ params }: Props) {
  const { tenantSlug } = await params
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Novo Produto</h1>
        <p className="text-sm text-muted-foreground">Adicione um novo produto ao cardápio</p>
      </div>
      <ProductForm tenantSlug={tenantSlug} />
    </div>
  )
}