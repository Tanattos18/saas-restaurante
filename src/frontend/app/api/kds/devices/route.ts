import { NextResponse } from 'next/server'
import { kdsService } from '@/services/kds.service'
import { getAuthContext } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    const body = await request.json()
    const { name, type } = body
    const service = kdsService(auth.tenantId)
    const device = await service.registerDevice(name ?? 'Tela Cozinha', type ?? 'DISPLAY')
    return NextResponse.json({ success: true, data: device }, { status: 201 })
  } catch (error) {
    console.error('Register device error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}