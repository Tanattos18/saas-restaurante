'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // TODO: implementar recuperação de senha
    await new Promise((r) => setTimeout(r, 1000))
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="rounded-lg border bg-card p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Recuperar Senha</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Receba um link para redefinir sua senha
        </p>
      </div>

      {sent ? (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Se o email estiver cadastrado, você receberá um link de recuperação.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block text-sm text-primary hover:underline"
          >
            Voltar para login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar Link'}
          </button>
        </form>
      )}

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="hover:text-primary">
          Voltar para login
        </Link>
      </div>
    </div>
  )
}
