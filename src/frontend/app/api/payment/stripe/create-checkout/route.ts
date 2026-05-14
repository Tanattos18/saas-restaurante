import { NextResponse } from 'next/server'
import { stripeService } from '@/services/stripe.service'
import { getAuthContext } from '@/lib/auth'
import type { PlanId } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })

    const body = await request.json()
    const { plan } = body

    if (!plan) return NextResponse.json({ success: false, error: 'Plano é obrigatório' }, { status: 400 })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const successUrl = `${baseUrl}/${auth.tenantSlug}/settings/subscription?success=true`
    const cancelUrl = `${baseUrl}/${auth.tenantSlug}/settings/subscription?canceled=true`

    const result = await stripeService.createSubscription(auth.tenantId, plan as PlanId, successUrl, cancelUrl)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar checkout' }, { status: 500 })
  }
}
