import { createTenantPrisma } from '@/lib/tenant-prisma'
import prisma from '@/lib/prisma'

export function loyaltyService(tenantId: string) {
  const db = createTenantPrisma(tenantId)

  function calcLevel(lifetimePoints: number): string {
    if (lifetimePoints >= 2500) return 'PLATINUM'
    if (lifetimePoints >= 1000) return 'GOLD'
    if (lifetimePoints >= 500) return 'SILVER'
    return 'BRONZE'
  }

  return {
    async earnPoints(customerId: string, orderId: string, orderTotal: number) {
      const points = Math.floor(orderTotal)
      const customer = await db.customer.findUnique({ where: { id: customerId } })
      if (!customer) throw new Error('Cliente não encontrado')

      const lifetimePoints = customer.totalOrders + points
      const newLevel = calcLevel(lifetimePoints)

      const transaction = await db.loyaltyTransaction.create({
        data: {
          tenantId,
          customerId,
          orderId,
          type: 'EARN',
          points,
          balanceAfter: customer.loyaltyPoints + points,
          description: `Compra #${orderId.slice(0, 8)}`,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      })

      await db.customer.update({
        where: { id: customerId },
        data: {
          loyaltyPoints: { increment: points },
          totalSpent: { increment: orderTotal },
          loyaltyLevel: newLevel as never,
          totalOrders: { increment: 1 },
        },
      })

      return transaction
    },

    async redeemPoints(customerId: string, points: number) {
      if (points < 100) throw new Error('Resgate mínimo: 100 pontos')
      if (points % 100 !== 0) throw new Error('Resgate deve ser múltiplo de 100')

      const customer = await db.customer.findUnique({ where: { id: customerId } })
      if (!customer) throw new Error('Cliente não encontrado')
      if (customer.loyaltyPoints < points) throw new Error('Pontos insuficientes')

      const discountAmount = (points / 100) * 5

      const transaction = await db.loyaltyTransaction.create({
        data: {
          tenantId,
          customerId,
          type: 'REDEEM',
          points: -points,
          balanceAfter: customer.loyaltyPoints - points,
          description: `Resgate: R$ ${discountAmount.toFixed(2)} de desconto`,
        },
      })

      await db.customer.update({
        where: { id: customerId },
        data: { loyaltyPoints: { increment: -points } },
      })

      return { discountAmount, transaction }
    },

    async getBalance(customerId: string) {
      const customer = await db.customer.findUnique({ where: { id: customerId } })
      if (!customer) throw new Error('Cliente não encontrado')

      const levelNames: Record<string, string> = { BRONZE: 'Bronze', SILVER: 'Prata', GOLD: 'Ouro', PLATINUM: 'Platina' }
      const nextLevels = [
        { level: 'SILVER', min: 500 }, { level: 'GOLD', min: 1000 }, { level: 'PLATINUM', min: 2500 },
      ]
      const nextLevel = nextLevels.find((n) => n.min > customer.totalOrders)

      return {
        current: customer.loyaltyPoints,
        lifetime: customer.totalOrders,
        level: levelNames[customer.loyaltyLevel] ?? 'Bronze',
        levelKey: customer.loyaltyLevel,
        nextLevel: nextLevel ? { level: nextLevel.level, pointsToNext: nextLevel.min - customer.totalOrders } : null,
      }
    },

    async expirePoints() {
      const expired = await db.loyaltyTransaction.findMany({
        where: { type: 'EARN', expiresAt: { lte: new Date() }, redeemed: false },
      })

      for (const tx of expired) {
        const customer = await db.customer.findUnique({ where: { id: tx.customerId } })
        if (!customer) continue

        // Calcular novo saldo após expiração
        const newBalance = Math.max(0, customer.loyaltyPoints - tx.points)

        // Marcar como expirado
        await db.loyaltyTransaction.update({
          where: { id: tx.id },
          data: { redeemed: true, redeemedAt: new Date() },
        })

        // Atualizar pontos do cliente
        await db.customer.update({
          where: { id: tx.customerId },
          data: { loyaltyPoints: newBalance },
        })

        // Criar registro de expiração
        await db.loyaltyTransaction.create({
          data: {
            tenantId,
            customerId: tx.customerId,
            type: 'EXPIRED',
            points: -tx.points,
            balanceAfter: newBalance,
            description: 'Pontos expirados (365 dias)',
          },
        })
      }

      return expired.length
    },

    async getHistory(customerId: string, page = 1) {
      const pageSize = 20
      const [transactions, total] = await Promise.all([
        db.loyaltyTransaction.findMany({
          where: { customerId },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        db.loyaltyTransaction.count({ where: { customerId } }),
      ])
      return { transactions, total, page, totalPages: Math.ceil(total / pageSize) }
    },
  }
}
