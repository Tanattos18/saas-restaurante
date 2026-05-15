import { NextResponse } from 'next/server'
import { userService } from '@/services/user.service'
import { getAuthContext } from '@/lib/auth'

export async function GET() {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    if (auth.role !== 'OWNER' && auth.role !== 'MANAGER') {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }
    const service = userService(auth.tenantId)
    const data = await service.list()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET team error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    if (auth.role !== 'OWNER') {
      return NextResponse.json({ success: false, error: 'Apenas o proprietário pode convocar membros' }, { status: 403 })
    }
    const body = await request.json()
    if (!body.name?.trim()) return NextResponse.json({ success: false, error: 'Nome é obrigatório' }, { status: 400 })
    if (!body.email?.trim()) return NextResponse.json({ success: false, error: 'Email é obrigatório' }, { status: 400 })
    if (!body.password?.trim() || body.password.length < 6) {
      return NextResponse.json({ success: false, error: 'Senha deve ter no mínimo 6 caracteres' }, { status: 400 })
    }
    if (!['MANAGER', 'STAFF', 'CASHIER', 'KITCHEN'].includes(body.role)) {
      return NextResponse.json({ success: false, error: 'Cargo inválido' }, { status: 400 })
    }

    const service = userService(auth.tenantId)
    const data = await service.create(body)
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
