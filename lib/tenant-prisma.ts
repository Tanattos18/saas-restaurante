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
        async count({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
        async updateMany({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
        async deleteMany({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
        async create({ args, query }) {
          if (typeof args.data === 'object' && !Array.isArray(args.data)) {
            args.data = { ...args.data, tenantId }
          }
          return query(args)
        },
      },
    },
  })
}
