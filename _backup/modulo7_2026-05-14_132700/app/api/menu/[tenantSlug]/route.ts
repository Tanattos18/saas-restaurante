import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Props = { params: Promise<{ tenantSlug: string }> }

export async function GET(_request: Request, { params }: Props) {
  try {
    const { tenantSlug } = await params
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { id: true, name: true, status: true },
    })
    if (!tenant || tenant.status !== 'ACTIVE') {
      return NextResponse.json({ success: false, error: 'Restaurante não encontrado' }, { status: 404 })
    }
    const categories = await prisma.category.findMany({
      where: { tenantId: tenant.id, active: true, showInQRCode: true },
      include: { products: { where: { active: true, showInQRCode: true }, orderBy: { position: 'asc' } } },
      orderBy: { position: 'asc' },
    })
    return NextResponse.json({ success: true, data: { tenantName: tenant.name, categories } })
  } catch (error) {
    console.error('Menu API error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}