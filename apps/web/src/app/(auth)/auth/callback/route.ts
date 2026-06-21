import { NextResponse, type NextRequest } from 'next/server'
import { createClient }     from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ulid } from 'ulid'

// Handles OAuth and email magic-link callbacks from Supabase Auth
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')
  const next  = searchParams.get('next') ?? '/select-workspace'

  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error)}`)
  }

  if (code) {
    const supabase = await createClient()
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError && data.user) {
      // Ensure platform_users record exists (first OAuth login creates it)
      const admin = createAdminClient()
      const fullName =
        data.user.user_metadata?.full_name ??
        data.user.user_metadata?.name ??
        data.user.email?.split('@')[0] ??
        'Unknown'

      await admin.from('platform_users').upsert(
        {
          id:        data.user.id,
          email:     data.user.email!,
          full_name: fullName,
          avatar_url: data.user.user_metadata?.avatar_url ?? null,
        },
        { onConflict: 'id', ignoreDuplicates: false }
      )

      // Check if this user has any tenant memberships
      const { count } = await admin
        .from('platform_user_tenants')
        .select('*', { count: 'exact', head: true })
        .eq('platform_user_id', data.user.id)
        .eq('is_active', true)

      if (!count || count === 0) {
        // New user — send to onboarding to create their first workspace
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
}
