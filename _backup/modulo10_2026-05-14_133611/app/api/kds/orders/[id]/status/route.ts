import { NextResponse } from 'next/server'
import { kdsService } from '@/services/kds.service'
import { getAuthContext } from '@/lib/auth'
import prisma from '@/lib/prisma'

type Props = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Props) {
  try {
    const { id: orderId } = await params
    const body = await request.json()
    const { status, deviceCode } = body

    if (!status) {
      return NextResponse.json({ success: false, error: 'Status é obrigatório' }, { status: 400 })
    }

    let tenantId: string | null = null

    const auth = await getAuthContext()
    if (auth) {
      tenantId = auth.tenantId
    } else if (deviceCode) {
      const device = await prisma.kitchenDevice.findUnique({ where: { deviceCode } })
      if (device) tenantId = device.tenantId
    }

    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    }

    const service = kdsService(tenantId)
    const order = await service.updateOrderStatus(orderId, status)

    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    console.error('KDS status error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}