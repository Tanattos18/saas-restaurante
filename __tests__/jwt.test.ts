import { signAccessToken, signRefreshToken, verifyToken } from '@/backend/lib/jwt'

describe('JWT', () => {
  const payload = { userId: 'user-1', tenantId: 'tenant-1', role: 'OWNER', tenantSlug: 'teste' }

  it('deve criar e verificar access token', async () => {
    const token = await signAccessToken(payload)
    expect(token).toBeTruthy()
    const decoded = await verifyToken(token)
    expect(decoded?.userId).toBe('user-1')
    expect(decoded?.tenantId).toBe('tenant-1')
    expect(decoded?.role).toBe('OWNER')
  })

  it('deve criar e verificar refresh token', async () => {
    const token = await signRefreshToken(payload)
    expect(token).toBeTruthy()
    const decoded = await verifyToken(token)
    expect(decoded?.userId).toBe('user-1')
  })

  it('deve retornar null para token inválido', async () => {
    const result = await verifyToken('invalid-token')
    expect(result).toBeNull()
  })
})
