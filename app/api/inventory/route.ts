import { NextResponse } from 'next/server'
import { inventoryService } from '@/services/inventory.service'
import { getAuthContext } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') ?? undefined

    const service = inventoryService(auth.tenantId)
    const data = await service.list(search)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET inventory error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })

    const body = await request.json()
    if (!body.name?.trim()) return NextResponse.json({ success: false, error: 'Nome é obrigatório' }, { status: 400 })
    if (!body.unit?.trim()) return NextResponse.json({ success: false, error: 'Unidade é obrigatória' }, { status: 400 })

    const service = inventoryService(auth.tenantId)
    const data = await service.create(body)
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('POST inventory error:', error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Erro interno' }, { status: 400 })
  }
}
