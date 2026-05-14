import { NextResponse } from 'next/server'
import { productService } from '@/services/product.service'
import { stockUpdateSchema } from '@/lib/validations/product.schema'
import { getAuthContext } from '@/lib/auth'

type Props = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Props) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    const { id } = await params
    const body = await request.json()
    const parsed = stockUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message ?? 'Dados inválidos' }, { status: 400 })
    }
    const service = productService(auth.tenantId)
    const product = await service.updateStock(id, parsed.data)
    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}