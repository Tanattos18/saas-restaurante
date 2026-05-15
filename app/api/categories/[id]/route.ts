import { NextResponse } from 'next/server'
import { categoryService } from '@/services/category.service'
import { categorySchema } from '@/lib/validations/product.schema'
import { getAuthContext } from '@/lib/auth'

type Props = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Props) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    const { id } = await params
    const service = categoryService(auth.tenantId)
    const category = await service.getById(id)
    if (!category) return NextResponse.json({ success: false, error: 'Categoria não encontrada' }, { status: 404 })
    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('GET category error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    const { id } = await params
    const body = await request.json()

    if (body.action === 'toggle') {
      const service = categoryService(auth.tenantId)
      const existing = await service.getById(id)
      if (!existing) return NextResponse.json({ success: false, error: 'Categoria não encontrada' }, { status: 404 })
      const category = await service.update(id, { active: !existing.active })
      return NextResponse.json({ success: true, data: category })
    }

    const parsed = categorySchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message ?? 'Dados inválidos' }, { status: 400 })
    }
    const service = categoryService(auth.tenantId)
    const category = await service.update(id, parsed.data)
    return NextResponse.json({ success: true, data: category })
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
    const service = categoryService(auth.tenantId)
    await service.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}