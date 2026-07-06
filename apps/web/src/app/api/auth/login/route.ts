import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'
import { bootstrapFirstOwner, isPlatformOwner } from '@/lib/platform/owner'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  const cookiesToApply: Array<{ name: string; value: string; options: CookieOptions }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) { cookiesToApply.push(...cookiesToSet) },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

  // Password sign-in never creates the platform_users record (unlike the OAuth
  // callback) — platform_owners has an FK to it, so this must exist first.
  await createAdminClient().from('platform_users').upsert(
    {
      id: data.user.id,
      email: data.user.email!,
      full_name: data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? data.user.email!.split('@')[0],
      avatar_url: data.user.user_metadata?.avatar_url ?? null,
    },
    { onConflict: 'id', ignoreDuplicates: false },
  )

  await bootstrapFirstOwner(data.user.id)
  const redirectTo = (await isPlatformOwner(data.user.id)) ? '/platform' : null

  const response = NextResponse.json({ ok: true, redirectTo })
  cookiesToApply.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
  return response
}
