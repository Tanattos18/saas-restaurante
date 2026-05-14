import { NextResponse } from 'next/server'
import { orderService } from '@/services/order.service'
import { getAuthContext } from '@/lib/auth'

type Props = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Props) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    const { id } = await params
    const body = await request.json()
    const { status, notes } = body
    if (!status) return NextResponse.json({ success: false, error: 'Status é obrigatório' }, { status: 400 })
    const service = orderService(auth.tenantId)
    const order = await service.updateStatus(id, status, notes)
    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    console.error('Update order status error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}