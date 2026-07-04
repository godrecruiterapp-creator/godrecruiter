'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function getUserContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const { data: membership } = await admin
    .from('platform_user_tenants').select('tenant_id').eq('platform_user_id', user.id).eq('is_active', true).single()
  if (!membership) return null
  return { user, tenant_id: membership.tenant_id }
}

export type NotificationRow = {
  id: string; type: string; title: string; body: string | null
  link: string | null; read_at: string | null; created_at: string
  actor_name: string | null
}

export async function getNotificationsAction(): Promise<{ notifications: NotificationRow[]; unreadCount: number }> {
  const ctx = await getUserContext()
  if (!ctx) return { notifications: [], unreadCount: 0 }
  const admin = createAdminClient()

  const [{ data: rows }, { count }] = await Promise.all([
    admin.from('notifications')
      .select('id, type, title, body, link, read_at, created_at, actor_name')
      .eq('recipient_id', ctx.user.id)
      .order('created_at', { ascending: false })
      .limit(30),
    admin.from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', ctx.user.id)
      .is('read_at', null),
  ])

  return { notifications: rows ?? [], unreadCount: count ?? 0 }
}

export async function markNotificationReadAction(id: string) {
  const ctx = await getUserContext()
  if (!ctx) return { error: 'Not authenticated.' }
  const admin = createAdminClient()
  await admin.from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('recipient_id', ctx.user.id)
    .is('read_at', null)
  return { success: true as const }
}

export async function markAllNotificationsReadAction() {
  const ctx = await getUserContext()
  if (!ctx) return { error: 'Not authenticated.' }
  const admin = createAdminClient()
  await admin.from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', ctx.user.id)
    .is('read_at', null)
  return { success: true as const }
}
