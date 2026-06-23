'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ulid } from 'ulid'

// ── LOGIN ────────────────────────────────────────────────────────────────────
export async function loginAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email    = formData.get('email')    as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo') as string | null

  if (!email || !password) return { error: 'Email and password are required.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.includes('Invalid login')) {
      return { error: 'Incorrect email or password.' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Please verify your email before signing in.' }
    }
    return { error: 'Something went wrong. Please try again.' }
  }

  return { redirectTo: redirectTo ?? '/dashboard' }
}

// ── SIGNUP ──────────────���────────────────────────────────��───────────────────
export async function signupAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const fullName = formData.get('full_name') as string
  const email    = formData.get('email')     as string
  const password = formData.get('password')  as string

  if (!fullName || !email || !password) return { error: 'All fields are required.' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes('already registered') || error.message.includes('already been registered')) {
      return { error: 'An account with this email already exists. Try signing in.' }
    }
    return { error: `Could not create account: ${error.message}` }
  }

  if (data.user && !data.session) {
    // Email confirmation required
    return { success: 'Check your email — we sent you a confirmation link.' }
  }

  // Auto-confirmed (local dev or email confirmations disabled)
  // Create platform_users record
  if (data.user) {
    const admin = createAdminClient()
    await admin.from('platform_users').upsert({
      id: data.user.id,
      email,
      full_name: fullName,
    }, { onConflict: 'id' })
  }

  redirect('/onboarding')
}

// ── FORGOT PASSWORD ───────────────────────────────────────────���──────────────
export async function forgotPasswordAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = formData.get('email') as string
  if (!email) return { error: 'Email is required.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
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
