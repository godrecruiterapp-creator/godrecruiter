import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      // Ensure platform_users record exists (may not exist if email confirmation was required)
      const { createAdminClient } = await import('@/lib/supabase/admin')
      const admin = createAdminClient()
      const fullName =
        data.user.user_metadata?.full_name ??
        data.user.user_metadata?.name ??
        data.user.email?.split('@')[0] ??
        'User'
      await admin.from('platform_users').upsert({
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
      }, { onConflict: 'id' })

      return NextResponse.redirect(`${origin}/select-workspace`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
}
