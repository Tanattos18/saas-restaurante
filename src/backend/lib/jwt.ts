import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

export interface JwtPayload extends JWTPayload {
  userId: string
  tenantId: string
  role: string
  tenantSlug: string
  plan?: string
}

const getAccessSecret = () => {
  const secret = process.env.JWT_ACCESS_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_ACCESS_SECRET não configurado em produção')
    }
    console.warn('⚠️ JWT_ACCESS_SECRET não definido, usando fallback para desenvolvimento')
  }
  return new TextEncoder().encode(secret ?? 'fallback-access-secret-development-only')
}

const getRefreshSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_REFRESH_SECRET não configurado em produção')
    }
    console.warn('⚠️ JWT_REFRESH_SECRET não definido, usando fallback para desenvolvimento')
  }
  return new TextEncoder().encode(secret ?? 'fallback-refresh-secret-development-only')
}

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
