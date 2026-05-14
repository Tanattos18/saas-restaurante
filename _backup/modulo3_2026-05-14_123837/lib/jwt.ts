import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

export interface JwtPayload extends JWTPayload {
  userId: string
  tenantId: string
  role: string
  tenantSlug: string
}

const getAccessSecret = () => new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET ?? 'fallback-access-secret-nao- use-em-producao'
)

const getRefreshSecret = () => new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET ?? 'fallback-refresh-secret-nao- use-em-producao'
)

export async function signAccessToken(payload: Omit<JwtPayload, keyof JWTPayload>): Promise<string> {
  return new SignJWT({ ...payload } as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getAccessSecret())
}

export async function signRefreshToken(payload: Omit<JwtPayload, keyof JWTPayload>): Promise<string> {
  return new SignJWT({ ...payload } as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getRefreshSecret())
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret())
    return payload as JwtPayload
  } catch {
    try {
      const { payload } = await jwtVerify(token, getRefreshSecret())
      return payload as JwtPayload
    } catch {
      return null
    }
  }
}
