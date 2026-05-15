import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthContext } from '@/lib/auth'

export async function GET() {
  try {
    const auth = await getAuthContext()

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        lastLoginAt: true,
        tenantId: true,
        tenant: {
          select: {
            id: true,
            slug: true,
            name: true,
            plan: true,
            status: true,
            subscriptionStatus: true,
            settings: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
