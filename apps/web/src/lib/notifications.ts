import { createAdminClient } from '@/lib/supabase/admin'
import { ulid } from 'ulid'

export type NotificationType =
  | 'job_assigned' | 'job_note' | 'candidate_submitted' | 'interview_scheduled' | 'client_note'

// Fire-and-forget notification insert — called from other server actions right
// after the triggering write succeeds. Never notifies the actor about their
// own action.
export async function notifyUser(params: {
  tenantId: string
  recipientId: string | null | undefined
  actorId?: string | null
  actorName?: string | null
  type: NotificationType
  title: string
  body?: string | null
  link?: string | null
}) {
  const { tenantId, recipientId, actorId, actorName, type, title, body, link } = params
  if (!recipientId || recipientId === actorId) return

  const admin = createAdminClient()
  await admin.from('notifications').insert({
    id: ulid(),
    tenant_id: tenantId,
    recipient_id: recipientId,
    actor_id: actorId ?? null,
    actor_name: actorName ?? null,
    type,
    title,
    body: body ?? null,
    link: link ?? null,
  })
}

// Client "assigned recruiters" etc. are stored as free-text full names
// (multi-select against tenant users), not platform_user ids — resolve them
// back to ids within the same tenant so we know who to notify.
export async function resolveUserIdsByNames(tenantId: string, names: string[]): Promise<string[]> {
  const unique = [...new Set(names.filter(Boolean))]
  if (!unique.length) return []

  const admin = createAdminClient()
  const { data } = await admin
    .from('platform_user_tenants')
    .select('platform_users!platform_user_tenants_platform_user_id_fkey(id, full_name)')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)

  const users = (data ?? [])
    .map((r: any) => Array.isArray(r.platform_users) ? r.platform_users[0] : r.platform_users)
    .filter(Boolean)

  return users.filter((u: any) => unique.includes(u.full_name)).map((u: any) => u.id)
}
