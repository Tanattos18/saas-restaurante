import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { signAccessToken, signRefreshToken } from '@/lib/jwt'
import { registerSchema } from '@/lib/validations/auth.schema'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message ?? 'Dados inválidos' },
        { status: 400 }
      )
    }

    const { tenantName, tenantSlug, ownerEmail, ownerPassword, ownerName } = parsed.data

    const existingTenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } })
    if (existingTenant) {
      return NextResponse.json(
        { success: false, error: 'Este slug já está em uso' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(ownerPassword, 10)

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          slug: tenantSlug,
          name: tenantName,
          email: ownerEmail,
          phone: '',
          address: '',
          city: '',
          state: '',
          plan: 'FREE',
          status: 'ACTIVE',
          subscriptionStatus: 'TRIAL',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      })

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: ownerEmail,
          password: hashedPassword,
          name: ownerName,
          role: 'OWNER',
        },
      })

      return { tenant, user }
    })

    const jwtPayload = {
      userId: result.user.id,
      tenantId: result.tenant.id,
      role: result.user.role,
      tenantSlug: result.tenant.slug,
    }

    const accessToken = await signAccessToken(jwtPayload)
    const refreshToken = await signRefreshToken(jwtPayload)

    const response = NextResponse.json({
      success: true,
      data: {
        user: { id: result.user.id, name: result.user.name, email: result.user.email, role: result.user.role },
        tenant: { id: result.tenant.id, slug: result.tenant.slug, name: result.tenant.name },
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
    console.error('Register error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
