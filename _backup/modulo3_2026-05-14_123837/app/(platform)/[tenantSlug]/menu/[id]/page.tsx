import { ProductForm } from '@/components/platform/menu/ProductForm'

type Props = { params: Promise<{ tenantSlug: string; id: string }> }

export default async function EditProductPage({ params }: Props) {
  const { tenantSlug, id } = await params
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Editar Produto</h1>
        <p className="text-sm text-muted-foreground">Altere as informações do produto</p>
      </div>
      <ProductForm tenantSlug={tenantSlug} productId={id} />
    </div>
  )
}