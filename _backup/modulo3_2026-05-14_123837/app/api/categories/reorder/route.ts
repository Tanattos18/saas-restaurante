import { NextResponse } from 'next/server'
import { categoryService } from '@/services/category.service'
import { reorderSchema } from '@/lib/validations/product.schema'
import { getAuthContext } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })

    const body = await request.json()
    const parsed = reorderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message ?? 'Dados inválidos' }, { status: 400 })
    }

    const service = categoryService(auth.tenantId)
    const categories = await service.reorder(parsed.data.orderedIds)
    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error('Reorder error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
