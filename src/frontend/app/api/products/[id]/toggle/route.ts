import { NextResponse } from 'next/server'
import { productService } from '@/services/product.service'
import { getAuthContext } from '@/lib/auth'

type Props = { params: Promise<{ id: string }> }

export async function POST(_request: Request, { params }: Props) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    const { id } = await params
    const service = productService(auth.tenantId)
    const product = await service.toggleActive(id)
    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}