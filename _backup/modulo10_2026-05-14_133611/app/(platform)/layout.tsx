import { getAuthContext } from '@/lib/auth'
import { Sidebar } from '@/components/platform/Sidebar'
import { Header } from '@/components/platform/Header'

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthContext()

  return (
    <div className="min-h-screen bg-background">
      {auth && <Sidebar tenantSlug={auth.tenantSlug} />}
      <div className="lg:pl-64">
        {auth && <Header tenantName="" plan="" tenantSlug={auth.tenantSlug} />}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}