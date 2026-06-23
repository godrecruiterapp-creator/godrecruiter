import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'godrecruiter.com'

const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/callback',
  '/auth/sso',
  '/auth/logout',
  '/api/auth/',
]

const PORTAL_PATH_PREFIXES = ['/careers/', '/portal/']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') ?? ''

  // ── 1. Pass through static assets ────────────────────────────────────────
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  if (PORTAL_PATH_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // ── 2. Refresh Supabase session (required on every request) ──────────────
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  // ── 3. Public paths — no auth required ───────────────────────────────────
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  // ── 4. Auth guard ─────────────────────────────────────────────────────────
  if (!user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── 5. Skip tenant lookup on main domain (Vercel URL / app.*) ────────────
  const hostname = host.split(':')[0] ?? ''
  const isMainDomain = !hostname.endsWith(`.${APP_DOMAIN}`) || hostname === `app.${APP_DOMAIN}`
  if (isMainDomain) {
    return supabaseResponse
  }

  // ── 6. Tenant subdomain — resolve + verify membership ────────────────────
  const { resolveTenant } = await import('@/lib/tenant/resolve')
  const tenantContext = await resolveTenant(host, APP_DOMAIN)

  if (!tenantContext) {
    if (!pathname.startsWith('/select-workspace')) {
      return NextResponse.redirect(new URL('/select-workspace', request.url))
    }
    return supabaseResponse
  }

  const { data: membership } = await supabase
    .schema('public')
    .from('platform_user_tenants')
    .select('role, is_active')
    .eq('platform_user_id', user.id)
    .eq('tenant_id', tenantContext.tenant_id)
    .single()

  if (!membership || !membership.is_active) {
    return NextResponse.redirect(new URL('/auth/unauthorized', request.url))
  }

  supabaseResponse.headers.set('x-tenant-id', tenantContext.tenant_id)
  supabaseResponse.headers.set('x-tenant-schema', tenantContext.schema_name)
  supabaseResponse.headers.set('x-tenant-slug', tenantContext.slug)
  supabaseResponse.headers.set('x-tenant-region', tenantContext.region)
  supabaseResponse.headers.set('x-user-role', membership.role)

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
