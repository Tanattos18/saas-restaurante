import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwt'

const publicPaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/menu',
  '/table',
  '/api/health',
]

const publicApiPrefixes = [
  '/api/auth',
  '/api/webhooks',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicPath = publicPaths.some(p => pathname.startsWith(p))
  const isPublicApi = publicApiPrefixes.some(p => pathname.startsWith(p))
  const isStaticFile = pathname.startsWith('/_next') || pathname.startsWith('/images') || pathname.startsWith('/icons')

  if (isPublicPath || isPublicApi || isStaticFile) {
    return NextResponse.next()
  }

  const token = request.cookies.get('access_token')?.value

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    }
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const payload = await verifyToken(token)

  if (!payload?.userId || !payload?.tenantId) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Token inválido' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant-id', payload.tenantId as string)
  requestHeaders.set('x-user-id', payload.userId as string)
  requestHeaders.set('x-user-role', payload.role as string)
  requestHeaders.set('x-tenant-slug', payload.tenantSlug as string)
  requestHeaders.set('x-tenant-plan', payload.plan as string ?? 'FREE')

  const role = payload.role as string
  const allowedRoles = ['KITCHEN', 'OWNER', 'MANAGER']

  if (pathname.includes('/kds') && !allowedRoles.includes(role)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (pathname.includes('/financial') && role !== 'OWNER' && role !== 'MANAGER') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (pathname.includes('/settings/team') && role !== 'OWNER') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }
    return NextResponse.redirect(new URL('/settings', request.url))
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
