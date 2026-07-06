'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getPlatformOwnerContext } from '@/lib/platform/owner'
import { revalidatePath } from 'next/cache'

export type OwnerRow = {
  platform_user_id: string
  full_name: string
  email: string
  avatar_url: string | null
  granted_at: string
  is_self: boolean
}

async function requireOwner() {
  const ctx = await getPlatformOwnerContext()
  if (!ctx) return { ok: false as const, error: 'Not authorized.' }
  return { ok: true as const, ctx }
}

export async function getPlatformOwnersAction(): Promise<{ error: string } | { owners: OwnerRow[] }> {
  const gate = await requireOwner()
  if (!gate.ok) return { error: gate.error }

  const admin = createAdminClient()
  const { data, error } = await admin.from('platform_owners')
    .select('platform_user_id, created_at, platform_users!platform_user_id(full_name, email, avatar_url)')
    .order('created_at', { ascending: true })
  if (error) return { error: error.message }

  return {
    owners: (data ?? []).map(o => {
      const user = o.platform_users as unknown as { full_name: string; email: string; avatar_url: string | null } | null
      return {
        platform_user_id: o.platform_user_id,
        full_name: user?.full_name ?? 'Unknown',
        email: user?.email ?? '',
        avatar_url: user?.avatar_url ?? null,
        granted_at: o.created_at,
        is_self: o.platform_user_id === gate.ctx.user.id,
      }
    }),
  }
}

export async function invitePlatformOwnerAction(email: string) {
  const gate = await requireOwner()
  if (!gate.ok) return { error: gate.error }

  const trimmedEmail = email.trim().toLowerCase()
  if (!trimmedEmail || !trimmedEmail.includes('@')) return { error: 'A valid email is required.' }

  const admin = createAdminClient()
  const { data: existingUser } = await admin.from('platform_users').select('id').eq('email', trimmedEmail).single()

  if (existingUser) {
    const { data: existingOwner } = await admin.from('platform_owners')
      .select('platform_user_id').eq('platform_user_id', existingUser.id).single()
    if (existingOwner) return { error: 'This person is already a Platform Owner.' }

    const { error } = await admin.from('platform_owners')
      .insert({ platform_user_id: existingUser.id, granted_by: gate.ctx.user.id })
    if (error) return { error: error.message }

    revalidatePath('/platform')
    return { success: true as const }
  }

  const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(trimmedEmail, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/accept-invite`,
  })
  if (inviteErr || !invited.user) return { error: inviteErr?.message ?? 'Could not send invite.' }

  await admin.from('platform_users').upsert(
    { id: invited.user.id, email: trimmedEmail, full_name: trimmedEmail.split('@')[0] },
    { onConflict: 'id' },
  )

  const { error } = await admin.from('platform_owners')
    .insert({ platform_user_id: invited.user.id, granted_by: gate.ctx.user.id })
  if (error) return { error: error.message }

  revalidatePath('/platform')
  return { success: true as const }
}

export async function removePlatformOwnerAction(platformUserId: string) {
  const gate = await requireOwner()
  if (!gate.ok) return { error: gate.error }

  const admin = createAdminClient()
  const { count } = await admin.from('platform_owners').select('*', { count: 'exact', head: true })
  if ((count ?? 0) <= 1) return { error: 'This is the last Platform Owner — add another before removing this one.' }

  const { error } = await admin.from('platform_owners').delete().eq('platform_user_id', platformUserId)
  if (error) return { error: error.message }

  revalidatePath('/platform')
  return { success: true as const }
}
