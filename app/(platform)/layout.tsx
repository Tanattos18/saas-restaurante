import { getAuthContext } from '@/lib/auth'
import { Sidebar } from '@/components/platform/Sidebar'
import { HeaderWrapper } from '@/components/platform/HeaderWrapper'
import { UpdateNotification } from '@/components/platform/UpdateNotification'

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthContext()

  return (
    <div className="min-h-screen bg-background">
      {auth && <Sidebar tenantSlug={auth.tenantSlug} />}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        {auth && <HeaderWrapper tenantSlug={auth.tenantSlug} />}
        <main className="flex-1 p-4 lg:p-6 xl:p-8">{children}</main>
      </div>
      <UpdateNotification />
    </div>
  )
}
