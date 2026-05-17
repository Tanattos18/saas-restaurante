import { NextResponse } from 'next/server'
import { analyticsService } from '@/services/analytics.service'
import { getAuthContext } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const period = (searchParams.get('period') ?? 'week') as 'today' | 'week' | 'month'

    const analytics = analyticsService(auth.tenantId)
    const data = await analytics.getMetrics(period)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET reports error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
