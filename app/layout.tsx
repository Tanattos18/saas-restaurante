import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SaaS Restaurante',
  description: 'Sistema de gestão para restaurantes com WhatsApp, KDS e cardápio digital',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#22c55e" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}