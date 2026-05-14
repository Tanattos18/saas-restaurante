import { NextResponse } from 'next/server'
import { stripeService } from '@/services/stripe.service'

export async function POST(request: Request) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('stripe-signature') ?? ''

    await stripeService.handleWebhook(payload, signature)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}
