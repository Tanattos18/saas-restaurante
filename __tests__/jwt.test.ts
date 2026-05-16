process.env.JWT_ACCESS_SECRET = 'test-access-secret-mock'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-mock'

import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '@/backend/lib/jwt'

describe('JWT', () => {
  const payload = { userId: 'user-1', tenantId: 'tenant-1', role: 'OWNER', tenantSlug: 'teste' }

  it('deve criar e verificar access token', async () => {
    const token = await signAccessToken(payload)
    expect(token).toBeTruthy()
    const decoded = await verifyAccessToken(token)
    expect(decoded?.userId).toBe('user-1')
    expect(decoded?.tenantId).toBe('tenant-1')
    expect(decoded?.role).toBe('OWNER')
  })

  it('deve criar e verificar refresh token', async () => {
    const token = await signRefreshToken(payload)
    expect(token).toBeTruthy()
    const decoded = await verifyRefreshToken(token)
    expect(decoded?.userId).toBe('user-1')
  })

  it('deve retornar null para token inválido', async () => {
    const result = await verifyAccessToken('invalid-token')
    expect(result).toBeNull()
  })

  it('deve decodificar access token com verifyAccessToken', async () => {
    const token = await signAccessToken(payload)
    const decoded = await verifyAccessToken(token)
    expect(decoded?.userId).toBe('user-1')
  })

  it('deve decodificar refresh token com verifyRefreshToken', async () => {
    const token = await signRefreshToken(payload)
    const decoded = await verifyRefreshToken(token)
    expect(decoded?.userId).toBe('user-1')
  })
})
