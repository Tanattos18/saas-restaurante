import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = Number(searchParams.get('orderNumber'))
    const tenantSlug = searchParams.get('tenantSlug')

    if (!orderNumber || !tenantSlug) {
      return NextResponse.json({ success: false, error: 'Parâmetros obrigatórios' }, { status: 400 })
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { id: true },
    })
    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Restaurante não encontrado' }, { status: 404 })
    }

    const order = await prisma.order.findUnique({
      where: { tenantId_orderNumber: { tenantId: tenant.id, orderNumber } },
      select: { status: true, orderNumber: true },
    })
    if (!order) {
      return NextResponse.json({ success: false, error: 'Pedido não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    console.error('Check order status error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
