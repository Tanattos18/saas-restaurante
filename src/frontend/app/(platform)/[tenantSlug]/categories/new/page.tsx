import { CategoryForm } from '@/components/platform/categories/CategoryForm'
import Link from 'next/link'

type Props = { params: Promise<{ tenantSlug: string }> }

export default async function NewCategoryPage({ params }: Props) {
  const { tenantSlug } = await params
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/${tenantSlug}/categories`} className="hover:text-gray-600">Categorias</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Nova Categoria</span>
      </div>
      
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Nova Categoria</h1>
        <p className="text-orange-100 text-sm mt-1">Crie uma nova categoria para organizar seu cardápio</p>
      </div>
      
      <CategoryForm tenantSlug={tenantSlug} />
    </div>
  )
}