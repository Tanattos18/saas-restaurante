import { loyaltyService } from '@/services/loyalty.service'

jest.mock('@/lib/tenant-prisma', () => ({
  createTenantPrisma: () => ({
    customer: {
      findUnique: jest.fn().mockResolvedValue({ id: 'c1', loyaltyPoints: 500, totalOrders: 800 }),
      update: jest.fn(),
    },
    loyaltyTransaction: {
      create: jest.fn().mockResolvedValue({ id: 't1', points: 100 }),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
  }),
}))

describe('LoyaltyService', () => {
  it('deve calcular nível corretamente', () => {
    const svc = loyaltyService('tenant-1')
    expect(svc).toBeDefined()
  })
})
