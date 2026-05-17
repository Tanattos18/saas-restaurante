'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '', tenantSlug: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error ?? 'Erro ao fazer login')
        return
      }

      router.push(`/${form.tenantSlug}/dashboard`)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function fillTestAccount() {
    setForm({
      tenantSlug: 'restaurante-teste',
      email: 'admin@restaurante.com',
      password: 'admin123',
    })
  }

  return (
    <div className="rounded-lg border bg-card p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">SaaS Restaurante</h1>
        <p className="mt-1 text-sm text-muted-foreground">Faça login para continuar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tenantSlug" className="block text-sm font-medium mb-1">
            Restaurante
          </label>
          <input
            id="tenantSlug"
            type="text"
            placeholder="seu-restaurante"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.tenantSlug}
            onChange={(e) => setForm({ ...form, tenantSlug: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="seu@email.com"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Senha
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <div className="mt-4 p-3 bg-muted rounded-lg">
        <button
          type="button"
          onClick={fillTestAccount}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          🎯 Usar conta de teste
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/register" className="hover:text-primary">
          Criar nova conta
        </Link>
        <span className="mx-2">·</span>
        <Link href="/forgot-password" className="hover:text-primary">
          Esqueci a senha
        </Link>
      </div>
    </div>
  )
}