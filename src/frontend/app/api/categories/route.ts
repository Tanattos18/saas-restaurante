import { NextResponse } from 'next/server'
import { categoryService } from '@/services/category.service'
import { categorySchema } from '@/lib/validations/product.schema'
import { getAuthContext } from '@/lib/auth'

export async function GET() {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })

    const service = categoryService(auth.tenantId)
    const categories = await service.list(true)
    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error('GET categories error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })

    const body = await request.json()
    const parsed = categorySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }, { status: 400 })
    }

    const service = categoryService(auth.tenantId)
    const category = await service.create(parsed.data)
    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch (error) {
    console.error('POST categories error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
