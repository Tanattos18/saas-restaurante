import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { signAccessToken, verifyToken } from '@/lib/jwt'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'Refresh token não encontrado' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(refreshToken)

    if (!payload?.userId || !payload?.tenantId) {
      return NextResponse.json(
        { success: false, error: 'Refresh token inválido' },
        { status: 401 }
      )
    }

    const accessToken = await signAccessToken({
      userId: payload.userId as string,
      tenantId: payload.tenantId as string,
      role: payload.role as string,
      tenantSlug: payload.tenantSlug as string,
    })

    const response = NextResponse.json({ success: true })

    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Refresh error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao renovar token' },
      { status: 500 }
    )
  }
}
