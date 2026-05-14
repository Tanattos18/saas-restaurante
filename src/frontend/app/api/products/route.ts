import { NextResponse } from 'next/server'
import { productService } from '@/services/product.service'
import { productSchema } from '@/lib/validations/product.schema'
import { getAuthContext } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const filters = {
      categoryId: searchParams.get('categoryId') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      active: searchParams.has('active') ? searchParams.get('active') === 'true' : undefined,
    }

    const service = productService(auth.tenantId)
    const products = await service.list(filters)
    return NextResponse.json({ success: true, data: products })
  } catch (error) {
    console.error('GET products error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })

    const body = await request.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message ?? 'Dados inválidos' }, { status: 400 })
    }

    const service = productService(auth.tenantId)
    const product = await service.create(parsed.data)
    return NextResponse.json({ success: true, data: product }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}
