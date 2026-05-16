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
  if (!secret) throw new Error('JWT_ACCESS_SECRET não configurada')
  return new TextEncoder().encode(secret)
}

const getRefreshSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET
  if (!secret) throw new Error('JWT_REFRESH_SECRET não configurada')
  return new TextEncoder().encode(secret)
}

export async function signAccessToken(payload: Omit<JwtPayload, keyof JWTPayload>): Promise<string> {
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m'
  return new SignJWT({ ...payload } as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getAccessSecret())
}

export async function signRefreshToken(payload: Omit<JwtPayload, keyof JWTPayload>): Promise<string> {
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  return new SignJWT({ ...payload } as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getRefreshSecret())
}

export async function verifyAccessToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret())
    return payload as JwtPayload
  } catch {
    return null
  }
}

export async function verifyRefreshToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret())
    return payload as JwtPayload
  } catch {
    return null
  }
}
