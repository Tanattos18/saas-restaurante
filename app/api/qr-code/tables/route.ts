import { NextResponse } from 'next/server'
import { qrCodeService } from '@/services/qr-code.service'
import { getAuthContext } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const tablesParam = searchParams.get('tables')

    const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? 'localhost:3000'
    const proto = request.headers.get('x-forwarded-proto') ?? 'http'
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `${proto}://${host}`

    if (!tablesParam) {
      return NextResponse.json({ success: false, error: 'Parâmetro tables é obrigatório (ex: tables=1,2,3)' }, { status: 400 })
    }

    const tables = tablesParam.split(',').map(Number).filter((n) => !isNaN(n) && n > 0)

    if (tables.length === 0) {
      return NextResponse.json({ success: false, error: 'Números de mesa inválidos' }, { status: 400 })
    }

    const result = await qrCodeService.generateTables(auth.tenantId, auth.tenantSlug, tables, baseUrl)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('QR Code error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}