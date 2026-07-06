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
  // No redirectTo / link: a clickable link and the code share the same underlying
  // token, so an email scanner auto-visiting the link burns the code too. Code-only
  // avoids that — nothing for a bot to click.
  const { error } = await supabase.auth.resetPasswordForEmail(email)

  if (error) return { error: 'Could not send reset email. Please try again.' }

  return { success: 'Check your inbox for a 6-digit code.' }
}

// Email links get silently pre-fetched and burned by some inboxes (Gmail link-scanning,
// Outlook Safe Links) before the user ever clicks them. The 6-digit code sent in the same
// email sidesteps that entirely — nothing can "click" a code the user types in by hand.
export async function verifyResetCodeAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email    = formData.get('email')    as string
  const code     = formData.get('code')     as string
  const password = formData.get('password') as string
  const confirm  = formData.get('confirm')  as string

  if (!email || !code) return { error: 'Email and code are required.' }
  if (!password || !confirm) return { error: 'Both password fields are required.' }
  if (password !== confirm) return { error: 'Passwords do not match.' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' }

  const supabase = await createClient()
  const { error: otpError } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: 'recovery' })
  if (otpError) return { error: 'That code is incorrect or has expired. Request a new one.' }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: 'Could not update your password. Please try again.' }

  redirect('/auth/login?reset=success')
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
