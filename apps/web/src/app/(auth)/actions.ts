'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isPlatformOwner } from '@/lib/platform/owner'

// ── FORGOT PASSWORD ───────────────────────────────────────────���──────────────
export async function forgotPasswordAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = formData.get('email') as string
  if (!email) return { error: 'Email is required.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/reset-password`,
  })

  if (error) return { error: 'Could not send reset email. Please try again.' }

  return { success: 'Password reset link sent — check your inbox.' }
}

// ── RESET PASSWORD ─��───────────────────────────���───────────────────────��──────
export async function resetPasswordAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const password = formData.get('password') as string
  const confirm  = formData.get('confirm')  as string

  if (!password || !confirm) return { error: 'Both fields are required.' }
  if (password !== confirm) return { error: 'Passwords do not match.' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: 'Could not update password. The link may have expired.' }

  redirect('/auth/login?reset=success')
}

// ── ACCEPT INVITE ──────────────────────────────────────────────────────────────
export async function acceptInviteAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const password = formData.get('password') as string
  const confirm  = formData.get('confirm')  as string

  if (!password || !confirm) return { error: 'Both fields are required.' }
  if (password !== confirm) return { error: 'Passwords do not match.' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Your invite link may have expired. Please ask for a new one.' }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: 'Could not set your password. The link may have expired.' }

  // Activate every pending invite this email holds (normally just the one just accepted).
  const admin = createAdminClient()
  await admin.from('platform_user_tenants')
    .update({ is_active: true, joined_at: new Date().toISOString() })
    .eq('platform_user_id', user.id)
    .eq('is_active', false)
    .is('joined_at', null)

  redirect((await isPlatformOwner(user.id)) ? '/platform' : '/select-workspace')
}

// ── LOGOUT ───────��────────────────────────────────��───────────────────────────
export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

// ── TYPES ───────────────���────────────────────────────���────────────────────────
export type ActionState = {
  error?: string
  success?: string
  redirectTo?: string
} | null
