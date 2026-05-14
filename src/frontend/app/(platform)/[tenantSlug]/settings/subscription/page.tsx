'use client'

import { useState, useEffect } from 'react'
import { PLANS, type PlanId } from '@/lib/stripe'

interface TenantData {
  plan: PlanId
  subscriptionStatus: string
  stripeCustomerId: string | null
  trialEndsAt: string | null
}

export default function SubscriptionPage() {
  const [tenant, setTenant] = useState<TenantData | null>(null)
  const [loading, setLoading] = useState('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => { if (d.success) setTenant(d.data.tenant) })
  }, [])

  async function subscribe(plan: PlanId) {
    setLoading(plan)
    const res = await fetch('/api/payment/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const data = await res.json()
    if (data.success && data.data.url) window.location.href = data.data.url
    setLoading('')
  }

  async function openPortal() {
    setLoading('portal')
    const res = await fetch('/api/payment/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.success && data.data.url) window.location.href = data.data.url
    setLoading('')
  }

  if (!tenant) return <p className="text-sm text-muted-foreground">Carregando...</p>

  const currentPlan = PLANS[tenant.plan]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assinatura</h1>
        <p className="text-sm text-muted-foreground">Gerencie seu plano</p>
      </div>

      {tenant.subscriptionStatus === 'PAST_DUE' && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          ⚠️ Sua assinatura está com pagamento pendente. Acesse o portal para regularizar.
        </div>
      )}

      <div className="rounded-lg border bg-card p-4">
        <h2 className="font-bold mb-1">Plano Atual: {currentPlan.name}</h2>
        <p className="text-sm text-muted-foreground mb-1">Status: {tenant.subscriptionStatus}</p>
        {tenant.trialEndsAt && (
          <p className="text-sm text-muted-foreground">Trial até: {new Date(tenant.trialEndsAt).toLocaleDateString('pt-BR')}</p>
        )}
        {tenant.stripeCustomerId && (
          <button onClick={openPortal} disabled={loading === 'portal'} className="mt-3 text-sm text-primary hover:underline disabled:opacity-50">
            {loading === 'portal' ? 'Abrindo...' : 'Gerenciar no Stripe'}
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {(Object.entries(PLANS) as [PlanId, typeof currentPlan][]).map(([id, plan]) => (
          <div key={id} className={`rounded-lg border p-6 ${tenant.plan === id ? 'border-primary ring-1 ring-primary' : ''}`}>
            <h3 className="text-lg font-bold">{plan.name}</h3>
            <p className="mt-2 text-3xl font-bold">R$ {plan.price}<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
            <ul className="mt-4 space-y-2 text-sm">
              {plan.features.map((f, i) => <li key={i} className="flex items-center gap-2">✅ {f}</li>)}
            </ul>
            {id !== 'FREE' && tenant.plan !== id && (
              <button
                onClick={() => subscribe(id)}
                disabled={loading === id}
                className="mt-6 w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {loading === id ? 'Redirecionando...' : 'Assinar'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}