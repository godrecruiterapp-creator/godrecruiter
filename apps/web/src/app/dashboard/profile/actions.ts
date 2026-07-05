'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateAvatarAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) return { error: 'No file selected.' }
  if (!file.type.startsWith('image/')) return { error: 'Please upload an image file.' }
  if (file.size > 5 * 1024 * 1024) return { error: 'Image must be under 5MB.' }

  const admin = createAdminClient()
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${user.id}/avatar.${ext}`
  const { error: upErr } = await admin.storage.from('avatars')
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: true })
  if (upErr) return { error: upErr.message }

  const { data: { publicUrl } } = admin.storage.from('avatars').getPublicUrl(path)
  const avatar_url = `${publicUrl}?v=${Date.now()}`

  const [authRes, dbRes] = await Promise.all([
    supabase.auth.updateUser({ data: { avatar_url } }),
    admin.from('platform_users').update({ avatar_url }).eq('id', user.id),
  ])
  if (authRes.error) return { error: authRes.error.message }
  if (dbRes.error)   return { error: dbRes.error.message }

  revalidatePath('/dashboard/profile')
  return { success: true as const, avatarUrl: avatar_url }
}

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

export async function updateSidebarBehaviorAction(behavior: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { error } = await supabase.auth.updateUser({ data: { sidebar_behavior: behavior } })
  if (error) return { error: error.message }
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
