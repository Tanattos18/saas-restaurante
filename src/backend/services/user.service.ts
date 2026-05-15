import { createTenantPrisma } from '@/lib/tenant-prisma'
import bcrypt from 'bcryptjs'

export function userService(tenantId: string) {
  const db = createTenantPrisma(tenantId)

  return {
    async list() {
      return db.user.findMany({
        select: { id: true, name: true, email: true, role: true, status: true, phone: true, lastLoginAt: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      })
    },

    async getById(id: string) {
      return db.user.findUnique({
        where: { id },
        select: { id: true, name: true, email: true, role: true, status: true, phone: true, lastLoginAt: true, createdAt: true },
      })
    },

    async create(data: { name: string; email: string; password: string; role: string; phone?: string }) {
      const existing = await db.user.findUnique({ where: { id: data.email } }).catch(() => null)
        .catch(() => null)
      const check = await db.user.findFirst({ where: { email: data.email } })
      if (check) throw new Error('Já existe um usuário com este email')

      const hashed = await bcrypt.hash(data.password, 10)
      return db.user.create({
        data: {
          tenantId,
          name: data.name,
          email: data.email,
          password: hashed,
          role: data.role as any,
          phone: data.phone ?? null,
        },
        select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
      })
    },

    async update(id: string, data: { name?: string; role?: string; phone?: string; status?: string }) {
      return db.user.update({
        where: { id },
        data: data as any,
        select: { id: true, name: true, email: true, role: true, status: true, phone: true },
      })
    },

    async toggleStatus(id: string) {
      const user = await db.user.findUnique({ where: { id } })
      if (!user) throw new Error('Usuário não encontrado')
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      return db.user.update({
        where: { id },
        data: { status: newStatus },
        select: { id: true, name: true, role: true, status: true },
      })
    },

    async delete(id: string) {
      const user = await db.user.findUnique({ where: { id } })
      if (!user) throw new Error('Usuário não encontrado')
      if (user.role === 'OWNER') throw new Error('Não é possível remover o proprietário')
      return db.user.delete({ where: { id } })
    },
  }
}
