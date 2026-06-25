'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const full_name = (formData.get('full_name') as string).trim()
  if (!full_name) return { error: 'Name is required.' }

  const admin = createAdminClient()
  const [authRes, dbRes] = await Promise.all([
    supabase.auth.updateUser({ data: { full_name } }),
    admin.from('platform_users').update({ full_name }).eq('id', user.id),
  ])

  if (authRes.error) return { error: authRes.error.message }
  if (dbRes.error)   return { error: dbRes.error.message }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

export async function updatePasswordAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const current  = formData.get('current_password') as string
  const next     = formData.get('new_password') as string
  const confirm  = formData.get('confirm_password') as string

  if (!current || !next || !confirm) return { error: 'All password fields are required.' }
  if (next !== confirm) return { error: 'New passwords do not match.' }
  if (next.length < 8)  return { error: 'Password must be at least 8 characters.' }

  // Verify current password by re-signing in
  const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user.email!, password: current })
  if (signInErr) return { error: 'Current password is incorrect.' }

  const { error } = await supabase.auth.updateUser({ password: next })
  if (error) return { error: error.message }

  return { success: true }
}
