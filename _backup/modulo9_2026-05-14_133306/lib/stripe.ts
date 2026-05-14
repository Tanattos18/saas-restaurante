import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-02-24' as never,
  typescript: true,
})

export type PlanId = 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE'

export interface PlanConfig {
  name: string
  priceId: string
  price: number
  maxOrders: number
  features: string[]
}

export const PLANS: Record<PlanId, PlanConfig> = {
  FREE: {
    name: 'Grátis',
    priceId: '',
    price: 0,
    maxOrders: 50,
    features: ['Até 50 pedidos/mês', 'Cardápio digital', 'WhatsApp'],
  },
  BASIC: {
    name: 'Básico',
    priceId: process.env.STRIPE_PRICE_BASIC ?? '',
    price: 97,
    maxOrders: 200,
    features: ['Até 200 pedidos/mês', 'Cardápio digital', 'WhatsApp', 'KDS'],
  },
  PRO: {
    name: 'Profissional',
    priceId: process.env.STRIPE_PRICE_PRO ?? '',
    price: 197,
    maxOrders: -1,
    features: ['Pedidos ilimitados', 'Cardápio digital', 'WhatsApp', 'KDS', 'CRM', 'Relatórios'],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_PRICE_ENTERPRISE ?? '',
    price: 497,
    maxOrders: -1,
    features: ['Pedidos ilimitados', 'Multi-lojas', 'Tudo do Pro + Prioridade'],
  },
}
