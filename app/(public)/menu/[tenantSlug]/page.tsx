import { qrCodeService } from '@/services/qr-code.service'
import { MenuViewer } from '@/components/public/MenuViewer'
import type { Metadata } from 'next'

type Props = { params: Promise<{ tenantSlug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug } = await params
  const tenant = await qrCodeService.getTenantBySlug(tenantSlug)
  return {
    title: `${tenant?.name ?? 'Cardápio'} — Cardápio Digital`,
    description: `Veja o cardápio digital de ${tenant?.name ?? 'nosso restaurante'}. Faça seu pedido online!`,
  }
}

export default async function PublicMenuPage({ params }: Props) {
  const { tenantSlug } = await params
  const tenant = await qrCodeService.getTenantBySlug(tenantSlug)

  if (!tenant || tenant.status !== 'ACTIVE') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-muted-foreground">Restaurante não encontrado ou temporariamente indisponível.</p>
      </div>
    )
  }

  const categories = await qrCodeService.getMenuData(tenant.id)

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">{tenant.name}</h1>
      </div>
      <MenuViewer categories={categories as never} onAddToCart={() => {}} />
    </div>
  )
}