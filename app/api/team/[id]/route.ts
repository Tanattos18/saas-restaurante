import { NextResponse } from 'next/server'
import { userService } from '@/services/user.service'
import { getAuthContext } from '@/lib/auth'

type Props = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Props) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    if (auth.role !== 'OWNER') {
      return NextResponse.json({ success: false, error: 'Apenas o proprietário pode alterar membros' }, { status: 403 })
    }
    const { id } = await params
    const body = await request.json()
    const service = userService(auth.tenantId)
    const data = body.toggleStatus
      ? await service.toggleStatus(id)
      : await service.update(id, body)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Erro interno' }, { status: 400 })
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    if (auth.role !== 'OWNER') {
      return NextResponse.json({ success: false, error: 'Apenas o proprietário pode remover membros' }, { status: 403 })
    }
    const { id } = await params
    const service = userService(auth.tenantId)
    await service.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Erro interno' }, { status: 400 })
  }
}
