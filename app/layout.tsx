import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SaaS Restaurante',
  description: 'Sistema de gestão para restaurantes com WhatsApp, KDS e cardápio digital',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SaaS Restaurante',
  },
  icons: {
    apple: '/icons/icon-192.svg',
    icon: '/icons/icon-192.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SaaS Restaurante" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body className="antialiased bg-[var(--background)] text-[var(--foreground)]">{children}</body>
    </html>
  )
}
