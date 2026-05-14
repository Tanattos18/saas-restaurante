import { cookies } from 'next/headers'
import { verifyToken, type JwtPayload } from './jwt'

export interface AuthContext {
  userId: string
  tenantId: string
  role: string
  tenantSlug: string
}

export async function getTokenFromRequest(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('access_token')?.value ?? null
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const token = await getTokenFromRequest()
  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload?.userId || !payload?.tenantId) return null

  return {
    userId: payload.userId as string,
    tenantId: payload.tenantId as string,
    role: payload.role as string,
    tenantSlug: payload.tenantSlug as string,
  }
}
