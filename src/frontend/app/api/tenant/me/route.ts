import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth'
import { createTenantPrisma } from '@/lib/tenant-prisma'

export async function GET() {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })

    const db = createTenantPrisma(auth.tenantId)
    const tenant = await db.tenant.findUnique({
      where: { id: auth.tenantId },
      select: { name: true, plan: true, slug: true },
    })

    if (!tenant) return NextResponse.json({ success: false, error: 'Tenant não encontrado' }, { status: 404 })

    return NextResponse.json({ success: true, data: tenant })
  } catch (error) {
    console.error('GET tenant/me error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}