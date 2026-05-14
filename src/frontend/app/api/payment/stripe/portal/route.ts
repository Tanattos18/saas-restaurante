import { NextResponse } from 'next/server'
import { stripeService } from '@/services/stripe.service'
import { getAuthContext } from '@/lib/auth'

export async function POST() {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const returnUrl = `${baseUrl}/${auth.tenantSlug}/settings/subscription`

    const result = await stripeService.getPortalUrl(auth.tenantId, returnUrl)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao acessar portal' }, { status: 500 })
  }
}
