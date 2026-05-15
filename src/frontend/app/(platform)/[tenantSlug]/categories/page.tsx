import { CategoryList } from '@/components/platform/categories/CategoryList'

type Props = { params: Promise<{ tenantSlug: string }> }

export default async function CategoriesPage({ params }: Props) {
  const { tenantSlug } = await params
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🏷️</span>
          <div>
            <h1 className="text-2xl font-bold">Categorias</h1>
            <p className="text-orange-100 text-sm">Organize seu cardápio por categorias</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border p-4 sm:p-6">
        <CategoryList tenantSlug={tenantSlug} />
      </div>
    </div>
  )
}