import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, customerName, notes, channel, type, tenantSlug } = body

    if (!items?.length) {
      return NextResponse.json({ success: false, error: 'Carrinho vazio' }, { status: 400 })
    }
    if (!customerName?.trim()) {
      return NextResponse.json({ success: false, error: 'Nome é obrigatório' }, { status: 400 })
    }

    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } })
    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Restaurante não encontrado' }, { status: 404 })
    }

    const lastOrder = await prisma.order.findFirst({
      where: { tenantId: tenant.id },
      orderBy: { orderNumber: 'desc' },
      select: { orderNumber: true },
    })
    const nextNumber = (lastOrder?.orderNumber ?? 0) + 1

    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } })
      if (!product) continue
      const price = Number(product.promoPrice ?? product.price)
      const qty = item.quantity ?? 1
      subtotal += price * qty
      orderItems.push({
        productId: product.id,
        quantity: qty,
        unitPrice: price,
        totalPrice: price * qty,
        notes: null,
      })
    }

    const order = await prisma.order.create({
      data: {
        tenantId: tenant.id,
        orderNumber: nextNumber,
        channel: channel ?? 'QR_CODE',
        type: type ?? 'DINE_IN',
        status: 'PENDING',
        customerName: customerName.trim(),
        customerPhone: '',
        customerAddress: null,
        subtotal,
        deliveryFee: 0,
        discount: 0,
        total: subtotal,
        notes: notes || null,
        items: { create: orderItems },
      },
    })

    return NextResponse.json({ success: true, data: { orderNumber: order.orderNumber, id: order.id } }, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
