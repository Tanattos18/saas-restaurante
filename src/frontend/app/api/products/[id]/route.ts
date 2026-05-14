import { NextResponse } from 'next/server'
import { productService } from '@/services/product.service'
import { productSchema } from '@/lib/validations/product.schema'
import { getAuthContext } from '@/lib/auth'

type Props = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Props) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    const { id } = await params
    const service = productService(auth.tenantId)
    const product = await service.getById(id)
    if (!product) return NextResponse.json({ success: false, error: 'Produto não encontrado' }, { status: 404 })
    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error('GET product error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    const { id } = await params
    const body = await request.json()
    const parsed = productSchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message ?? 'Dados inválidos' }, { status: 400 })
    }
    const service = productService(auth.tenantId)
    const product = await service.update(id, parsed.data)
    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    const { id } = await params
    const service = productService(auth.tenantId)
    await service.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}