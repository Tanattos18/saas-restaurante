import prisma from '@/backend/lib/prisma'
import { createTenantPrisma } from '@/backend/lib/tenant-prisma'
import crypto from 'crypto'

export function kdsService(tenantId: string) {
  const db = createTenantPrisma(tenantId)

  return {
    async getActiveOrders() {
      return db.order.findMany({
        where: { status: { in: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'] } },
        include: {
          items: { include: { product: { select: { name: true } } } },
          customer: { select: { name: true, phone: true } },
        },
        orderBy: { createdAt: 'asc' },
      })
    },

    async updateOrderStatus(orderId: string, status: string) {
      const now = new Date()
      const timestamps: Record<string, { [key: string]: Date }> = {
        PREPARING: { preparingAt: now },
        READY: { readyAt: now },
        DELIVERED: { deliveredAt: now },
        CANCELED: { canceledAt: now },
      }

      return db.order.update({
        where: { id: orderId },
        data: { status: status as never, ...(timestamps[status] ?? {}) },
      })
    },

    async registerDevice(name: string, type: string) {
      const deviceCode = crypto.randomBytes(16).toString('hex')
      return db.kitchenDevice.create({
        data: { tenantId, name, type: type as never, deviceCode },
      })
    },

    async validateDevice(deviceCode: string) {
      const device = await db.kitchenDevice.findUnique({ where: { deviceCode } })
      if (!device || device.status !== 'ACTIVE') return null
      return { tenantId: device.tenantId, deviceId: device.id, name: device.name }
    },
  }
}

export async function getActiveOrdersRaw(tenantId: string) {
  return createTenantPrisma(tenantId).order.findMany({
    where: { status: { in: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'] } },
    include: {
      items: { include: { product: { select: { name: true } } } },
      customer: { select: { name: true, phone: true } },
    },
    orderBy: { createdAt: 'asc' },
  })
}
