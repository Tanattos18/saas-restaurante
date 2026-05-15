import { NextResponse } from 'next/server'
import { financialService } from '@/services/financial.service'
import { getAuthContext } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') ?? 'today'
    const page = Number(searchParams.get('page') ?? '1')
    const type = searchParams.get('type') ?? 'summary'

    const service = financialService(auth.tenantId)

    if (type === 'transactions') {
      const data = await service.getTransactions(period, page)
      return NextResponse.json({ success: true, data })
    }
    if (type === 'daily') {
      const days = Number(searchParams.get('days') ?? '7')
      const data = await service.getDailyRevenue(days)
      return NextResponse.json({ success: true, data })
    }

    const data = await service.getSummary(period)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET financial error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
