import { createTenantPrisma } from '@/lib/tenant-prisma'
import { Prisma } from '@prisma/client'
import type { ProductInput, StockUpdateInput } from '@/lib/validations/product.schema'

export function productService(tenantId: string) {
  const db = createTenantPrisma(tenantId)

  return {
    async list(filters?: { categoryId?: string; active?: boolean; search?: string }) {
      return db.product.findMany({
        where: {
          ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
          ...(filters?.active !== undefined ? { active: filters.active } : {}),
          ...(filters?.search
            ? { name: { contains: filters.search, mode: 'insensitive' } }
            : {}),
        },
        include: { category: { select: { name: true, icon: true } } },
        orderBy: { position: 'asc' },
      })
    },

    async getById(id: string) {
      return db.product.findUnique({
        where: { id },
        include: { category: true },
      })
    },

    async create(data: ProductInput) {
      if (data.promoPrice && data.promoPrice >= data.price) {
        throw new Error('Preço promocional deve ser menor que o preço normal')
      }
      return db.product.create({ data: { tenantId, ...data } })
    },

    async update(id: string, data: Partial<ProductInput>) {
      const existing = await db.product.findUnique({ where: { id } })
      if (!existing) throw new Error('Produto não encontrado')

      const finalPrice = data.price ?? existing.price
      const finalPromo = data.promoPrice ?? existing.promoPrice
      if (finalPromo && finalPromo >= finalPrice) {
        throw new Error('Preço promocional deve ser menor que o preço normal')
      }

      return db.product.update({ where: { id }, data })
    },

    async delete(id: string) {
      const existing = await db.product.findUnique({ where: { id } })
      if (!existing) throw new Error('Produto não encontrado')
      return db.product.delete({ where: { id } })
    },

    async toggleActive(id: string) {
      const existing = await db.product.findUnique({ where: { id } })
      if (!existing) throw new Error('Produto não encontrado')
      return db.product.update({ where: { id }, data: { active: !existing.active } })
    },

    async updateStock(id: string, input: StockUpdateInput) {
      const existing = await db.product.findUnique({ where: { id } })
      if (!existing) throw new Error('Produto não encontrado')
      if (existing.stock === null) throw new Error('Produto com estoque ilimitado')

      const newStock = existing.stock + input.quantity
      if (newStock < 0) throw new Error('Estoque não pode ficar negativo')

      // Registrar mudança em log
      await db.inventoryLog.create({
        data: {
          tenantId,
          inventoryItemId: id, // Será o próprio produto como item de inventário
          productId: id,
          type: input.quantity > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(input.quantity),
          previousStock: new Prisma.Decimal(existing.stock),
          newStock: new Prisma.Decimal(newStock),
          reason: input.reason ?? 'Ajuste manual',
        },
      })

      return db.product.update({ where: { id }, data: { stock: newStock } })
    },

    async getOutOfStock() {
      const allProducts = await db.product.findMany({
        where: { active: true },
        include: { category: { select: { name: true } } },
      })
      
      return allProducts.filter(p => p.stock !== null && p.stock <= p.minStock)
        .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
    },
  }
}
