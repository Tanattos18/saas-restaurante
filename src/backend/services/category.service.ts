import { createTenantPrisma } from '@/lib/tenant-prisma'
import type { CategoryInput } from '@/lib/validations/product.schema'

export function categoryService(tenantId: string) {
  const db = createTenantPrisma(tenantId)

  return {
    async list(includeInactive = false) {
      return db.category.findMany({
        where: includeInactive ? {} : { active: true },
        include: { _count: { select: { products: true } } },
        orderBy: { position: 'asc' },
      })
    },

    async getById(id: string) {
      return db.category.findUnique({
        where: { id },
        include: { products: { orderBy: { position: 'asc' }, where: { active: true } } },
      })
    },

    async create(data: CategoryInput) {
      return db.category.create({ data: { tenantId, ...data } })
    },

    async update(id: string, data: Partial<CategoryInput>) {
      const existing = await db.category.findUnique({ where: { id } })
      if (!existing) throw new Error('Categoria não encontrada')
      return db.category.update({ where: { id }, data })
    },

    async delete(id: string) {
      const existing = await db.category.findUnique({
        where: { id },
        include: { _count: { select: { products: true } } },
      })
      if (!existing) throw new Error('Categoria não encontrada')
      if (existing._count.products > 0) {
        throw new Error(`Categoria possui ${existing._count.products} produto(s) ativo(s). Remova-os primeiro.`)
      }
      return db.category.delete({ where: { id } })
    },

    async reorder(orderedIds: string[]) {
      await db.$transaction(
        orderedIds.map((id, index) =>
          db.category.update({ where: { id }, data: { position: index } })
        )
      )
      return this.list()
    },
  }
}
