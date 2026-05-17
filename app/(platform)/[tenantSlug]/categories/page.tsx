import { CategoryList } from '@/components/platform/categories/CategoryList'

type Props = { params: Promise<{ tenantSlug: string }> }

export default async function CategoriesPage({ params }: Props) {
  const { tenantSlug } = await params
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>
        <p className="text-sm text-muted-foreground mt-1">Organize seu cardápio por categorias</p>
      </div>
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <CategoryList tenantSlug={tenantSlug} />
      </div>
    </div>
  )
}