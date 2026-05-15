import { NextResponse } from 'next/server'
import { inventoryService } from '@/services/inventory.service'
import { getAuthContext } from '@/lib/auth'

type Props = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Props) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    const { id } = await params
    const service = inventoryService(auth.tenantId)
    const data = await service.getById(id)
    if (!data) return NextResponse.json({ success: false, error: 'Item não encontrado' }, { status: 404 })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET inventory item error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    const { id } = await params
    const body = await request.json()
    const service = inventoryService(auth.tenantId)
    const data = await service.update(id, body)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('PATCH inventory error:', error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Erro interno' }, { status: 400 })
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    const { id } = await params
    const service = inventoryService(auth.tenantId)
    await service.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE inventory error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
