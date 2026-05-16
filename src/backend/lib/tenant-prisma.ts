import prisma from './prisma'

export function createTenantPrisma(tenantId: string) {
  if (!tenantId) throw new Error('tenantId é obrigatório')

  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
        async findUnique({ args, query }) {
          if (args.where) {
            args.where = { ...args.where, tenantId }
          }
          return query(args)
        },
        async findFirstOrThrow({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
        async findUniqueOrThrow({ args, query }) {
          if (args.where) {
            args.where = { ...args.where, tenantId }
          }
          return query(args)
        },
        async count({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
        async create({ args, query }) {
          if (typeof args.data === 'object' && !Array.isArray(args.data)) {
            ;(args.data as Record<string, unknown>).tenantId = tenantId
          }
          return query(args)
        },
        async createMany({ args, query }) {
          if (Array.isArray(args.data) && args.data.length > 0) {
            const data = args.data as Record<string, unknown>[]
            for (const item of data) {
              item.tenantId = tenantId
            }
          }
          return query(args)
        },
        async update({ args, query }) {
          if (typeof args.where === 'object' && args.where !== null) {
            args.where = { ...args.where, tenantId }
          }
          return query(args)
        },
        async updateMany({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
        async delete({ args, query }) {
          if (typeof args.where === 'object' && args.where !== null) {
            args.where = { ...args.where, tenantId }
          }
          return query(args)
        },
        async deleteMany({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
        async upsert({ args, query }) {
          args.where = { ...args.where, tenantId }
          if (typeof args.create === 'object' && !Array.isArray(args.create)) {
            ;(args.create as Record<string, unknown>).tenantId = tenantId
          }
          if (typeof args.update === 'object' && !Array.isArray(args.update)) {
            ;(args.update as Record<string, unknown>).tenantId = tenantId
          }
          return query(args)
        },
      },
    },
  })
}
