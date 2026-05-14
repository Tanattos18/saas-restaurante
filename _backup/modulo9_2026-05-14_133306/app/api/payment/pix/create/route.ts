import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })

    const body = await request.json()
    const { orderId } = body

    if (!orderId) return NextResponse.json({ success: false, error: 'orderId é obrigatório' }, { status: 400 })

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order || order.tenantId !== auth.tenantId) {
      return NextResponse.json({ success: false, error: 'Pedido não encontrado' }, { status: 404 })
    }

    const pixCode = `000201010212261060014br.gov.bcb.pix0115+551199999999952040000005303986540${String(Number(order.total).toFixed(2)).replace('.', '').padStart(4, '0')}5802BR5913Restaurante6008SaoPaulo62070503***6304AD3D`

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

    await prisma.order.update({
      where: { id: orderId },
      data: { pixCode, pixExpiration: expiresAt },
    })

    return NextResponse.json({
      success: true,
      data: {
        pixCode,
        pixQrCode: `data:image/png;base64,${Buffer.from(pixCode).toString('base64')}`,
        expiresAt: expiresAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('PIX error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao gerar PIX' }, { status: 500 })
  }
}
