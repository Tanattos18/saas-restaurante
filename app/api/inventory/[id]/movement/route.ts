import { NextResponse } from 'next/server'
import { inventoryService } from '@/services/inventory.service'
import { getAuthContext } from '@/lib/auth'

type Props = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Props) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    const { id } = await params
    const body = await request.json()
    if (!body.type || !['IN', 'OUT', 'ADJUST'].includes(body.type)) {
      return NextResponse.json({ success: false, error: 'Tipo inválido' }, { status: 400 })
    }
    if (!body.quantity || body.quantity <= 0) {
      return NextResponse.json({ success: false, error: 'Quantidade deve ser maior que zero' }, { status: 400 })
    }
    if (!body.reason?.trim()) {
      return NextResponse.json({ success: false, error: 'Motivo é obrigatório' }, { status: 400 })
    }

    const service = inventoryService(auth.tenantId)
    const data = await service.addMovement(id, body)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('POST inventory movement error:', error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Erro interno' }, { status: 400 })
  }
}
