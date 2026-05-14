import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { signAccessToken, signRefreshToken } from '@/lib/jwt'
import { loginSchema } from '@/lib/validations/auth.schema'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message ?? 'Dados inválidos' },
        { status: 400 }
      )
    }

    const { email, password, tenantSlug } = parsed.data

    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } })
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'Restaurante não encontrado' },
        { status: 404 }
      )
    }

    if (tenant.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Restaurante está inativo' },
        { status: 403 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email } },
      select: { id: true, email: true, name: true, password: true, role: true, tenantId: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Email ou senha inválidos' },
        { status: 401 }
      )
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: 'Email ou senha inválidos' },
        { status: 401 }
      )
    }

    const jwtPayload = { userId: user.id, tenantId: user.tenantId, role: user.role, tenantSlug }
    const accessToken = await signAccessToken(jwtPayload)
    const refreshToken = await signRefreshToken(jwtPayload)

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const response = NextResponse.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        tenant: { id: tenant.id, slug: tenant.slug, name: tenant.name },
      },
    })

    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    })

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
