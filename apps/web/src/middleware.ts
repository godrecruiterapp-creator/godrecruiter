import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { resolveTenant } from '@/lib/tenant/resolve'

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'godrecruiter.com'

// Routes that never require authentication
const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/callback',
  '/auth/sso',
]

// Routes that serve external users (no tenant auth required)
const PORTAL_PATH_PREFIXES = ['/careers/', '/portal/']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') ?? ''

  // ── 1. Pass through Next.js internals and static assets ──────────────────
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // ── 2. Pass through public portals (no auth needed) ───────────────────────
  if (PORTAL_PATH_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // ── 3. Supabase auth — refresh session cookie ────────────────────────────
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // ── 4. Allow public auth paths ────────────────────────────────────────────
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    // Redirect already-authed users away from login/signup
    if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  // ── 5. Require authentication for all other routes ────────────────────────
  if (!user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── 6. Resolve tenant from hostname ──────────────────────────────────────
  const tenantContext = await resolveTenant(host, APP_DOMAIN)

  if (!tenantContext) {
    // On the main app domain (Vercel URL or app.godrecruiter.com), allow
    // /dashboard, /select-workspace, /onboarding without a tenant in the URL.
    const isMainDomain =
      !host.includes(`.${APP_DOMAIN}`) ||
      host.startsWith('app.')
    const isSharedRoute =
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/select-workspace') ||
      pathname.startsWith('/onboarding')

    if (isMainDomain && isSharedRoute) {
      return response
    }

    if (!pathname.startsWith('/select-workspace')) {
      return NextResponse.redirect(new URL('/select-workspace', request.url))
    }
    return response
  }

  // ── 7. Verify this user belongs to this tenant ───────────────────────────
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

  // ── 8. Stamp tenant context onto request headers ──────────────────────────
  // These headers are read by Server Components and Route Handlers.
  // They are set by trusted middleware — never trust client-provided headers.
  response.headers.set('x-tenant-id', tenantContext.tenant_id)
  response.headers.set('x-tenant-schema', tenantContext.schema_name)
  response.headers.set('x-tenant-slug', tenantContext.slug)
  response.headers.set('x-tenant-region', tenantContext.region)
  response.headers.set('x-user-role', membership.role)

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
