'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    tenantName: '',
    tenantSlug: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error ?? 'Erro ao cadastrar')
        return
      }

      router.push(`/${form.tenantSlug}/dashboard`)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border bg-card p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Criar Conta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre seu restaurante no SaaS
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tenantName" className="block text-sm font-medium mb-1">
            Nome do Restaurante
          </label>
          <input
            id="tenantName"
            type="text"
            placeholder="Restaurante do João"
            required
            minLength={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.tenantName}
            onChange={(e) => setForm({ ...form, tenantName: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="tenantSlug" className="block text-sm font-medium mb-1">
            Slug (subdomínio)
          </label>
          <input
            id="tenantSlug"
            type="text"
            placeholder="restaurante-do-joao"
            required
            minLength={3}
            pattern="[a-z0-9-]+"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.tenantSlug}
            onChange={(e) => setForm({ ...form, tenantSlug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Apenas letras minúsculas, números e hífens
          </p>
        </div>

        <hr className="border-border" />

        <div>
          <label htmlFor="ownerName" className="block text-sm font-medium mb-1">
            Seu Nome
          </label>
          <input
            id="ownerName"
            type="text"
            placeholder="João Silva"
            required
            minLength={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.ownerName}
            onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="ownerEmail" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="ownerEmail"
            type="email"
            placeholder="joao@email.com"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.ownerEmail}
            onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="ownerPassword" className="block text-sm font-medium mb-1">
            Senha
          </label>
          <input
            id="ownerPassword"
            type="password"
            placeholder="Mínimo 8 caracteres"
            required
            minLength={8}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.ownerPassword}
            onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })}
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
          {loading ? 'Cadastrando...' : 'Criar Conta'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Já tem conta?{' '}
        <Link href="/login" className="hover:text-primary">
          Fazer login
        </Link>
      </div>
    </div>
  )
}
