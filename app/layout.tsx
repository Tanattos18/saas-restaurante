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
        <meta name="theme-color" content="#059669" />
        <script src="https://cdn.tailwindcss.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      background: '#f8fafc',
                      foreground: '#0f172a',
                      card: '#ffffff',
                      muted: '#f1f5f9',
                      'muted-foreground': '#64748b',
                      border: '#e2e8f0',
                    }
                  }
                }
              }
            `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --background: #f8fafc;
                --foreground: #0f172a;
                --card: #ffffff;
                --card-foreground: #0f172a;
                --primary: #059669;
                --primary-foreground: #ffffff;
                --muted: #f1f5f9;
                --muted-foreground: #64748b;
                --accent: #ecfdf5;
                --accent-foreground: #065f46;
                --border: #e2e8f0;
                --destructive: #ef4444;
              }
              .dark {
                --background: #0f172a;
                --foreground: #f1f5f9;
                --card: #1e293b;
                --card-foreground: #f1f5f9;
                --primary: #10b981;
                --muted: #1e293b;
                --muted-foreground: #94a3b8;
                --border: #334155;
                --destructive: #7f1d1d;
              }
              @keyframes fade-in-up {
                from { opacity: 0; transform: translateY(12px); }
                to { opacity: 1; transform: translateY(0); }
              }
              @keyframes fade-in {
                from { opacity: 0; transform: translateY(4px); }
                to { opacity: 1; transform: translateY(0); }
              }
              @keyframes scale-in {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
              }
              @keyframes pulse-soft {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
              }
              @keyframes ping-soft {
                0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
                100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
              }
              .animate-fade-in { animation: fade-in 0.3s ease-out; }
              .animate-fade-in-up { animation: fade-in-up 0.4s ease-out; }
              .animate-scale-in { animation: scale-in 0.2s ease-out; }
              .animate-pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
              .animate-ping-soft { animation: ping-soft 2s infinite; }
              body {
                font-family: system-ui, -apple-system, sans-serif;
                -webkit-font-smoothing: antialiased;
              }
              ::-webkit-scrollbar { width: 6px; height: 6px; }
              ::-webkit-scrollbar-track { background: transparent; }
              ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
              .dark ::-webkit-scrollbar-thumb { background: #475569; }
            `,
          }}
        />
      </head>
      <body className="antialiased bg-[var(--background)] text-[var(--foreground)]">{children}</body>
    </html>
  )
}
