import prisma from '@/lib/prisma'
import { stripe, PLANS, type PlanId } from '@/lib/stripe'

export class StripeService {
  async createCustomer(tenantId: string): Promise<string> {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
    if (!tenant) throw new Error('Tenant não encontrado')

    if (tenant.stripeCustomerId) return tenant.stripeCustomerId

    const customer = await stripe.customers.create({
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      metadata: { tenantId: tenant.id, slug: tenant.slug },
    })

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { stripeCustomerId: customer.id },
    })

    return customer.id
  }

  async createSubscription(tenantId: string, plan: PlanId, successUrl: string, cancelUrl: string) {
    const planConfig = PLANS[plan]
    if (!planConfig?.priceId) throw new Error('Plano não configurado no Stripe')

    const customerId = await this.createCustomer(tenantId)

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { tenantId, plan },
      subscription_data: {
        metadata: { tenantId, plan },
        trial_period_days: 14,
      },
    })

    return { url: session.url }
  }

  async getPortalUrl(tenantId: string, returnUrl: string) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
    if (!tenant?.stripeCustomerId) throw new Error('Sem cadastro no Stripe')

    const session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: returnUrl,
    })

    return { url: session.url }
  }

  async cancelSubscription(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
    if (!tenant?.stripeSubscriptionId) throw new Error('Sem assinatura ativa')

    await stripe.subscriptions.cancel(tenant.stripeSubscriptionId)
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { subscriptionStatus: 'CANCELED' },
    })
  }

  async handleWebhook(payload: string, signature: string) {
    const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET ?? '')

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const tenantId = session.metadata?.tenantId
        const plan = session.metadata?.plan as PlanId
        const subscriptionId = session.subscription as string

        if (tenantId && subscriptionId) {
          await prisma.tenant.update({
            where: { id: tenantId },
            data: {
              stripeSubscriptionId: subscriptionId,
              plan,
              subscriptionStatus: 'ACTIVE',
              status: 'ACTIVE',
            },
          })
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const subscriptionId = event.data.object.subscription as string
        if (subscriptionId) {
          const tenant = await prisma.tenant.findFirst({ where: { stripeSubscriptionId: subscriptionId } })
          if (tenant) {
            await prisma.tenant.update({
              where: { id: tenant.id },
              data: { subscriptionStatus: 'ACTIVE' },
            })
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const subscriptionId = event.data.object.subscription as string
        if (subscriptionId) {
          const tenant = await prisma.tenant.findFirst({ where: { stripeSubscriptionId: subscriptionId } })
          if (tenant) {
            await prisma.tenant.update({
              where: { id: tenant.id },
              data: { subscriptionStatus: 'PAST_DUE' },
            })
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const tenantId = subscription.metadata?.tenantId
        if (tenantId) {
          await prisma.tenant.update({
            where: { id: tenantId },
            data: { subscriptionStatus: 'CANCELED', status: 'SUSPENDED' },
          })
        }
        break
      }
    }
  }
}

export const stripeService = new StripeService()
