import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ModuleKey, PermissionAction } from '@/lib/modules'

export type TenantMemberContext = {
  user: { id: string; email: string | undefined }
  tenant_id: string
  name: string
  role_id: string
  role_name: string
  is_system_role: boolean
}

// Shared replacement for the getUserContext()-style helpers duplicated across
// candidates/clients/notifications actions.ts — this one also resolves role.
export async function getTenantMemberContext(): Promise<TenantMemberContext | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const [{ data: membership }, { data: profile }] = await Promise.all([
    admin.from('platform_user_tenants')
      .select('tenant_id, role_id, tenant_roles(name, is_system)')
      .eq('platform_user_id', user.id).eq('is_active', true).single(),
    admin.from('platform_users').select('full_name').eq('id', user.id).single(),
  ])
  if (!membership) return null

  const role = membership.tenant_roles as unknown as { name: string; is_system: boolean } | null

  return {
    user: { id: user.id, email: user.email },
    tenant_id: membership.tenant_id,
    name: profile?.full_name || user.email || 'Unknown',
    role_id: membership.role_id,
    role_name: role?.name ?? '',
    is_system_role: role?.is_system ?? false,
  }
}

export async function hasPermission(
  ctx: TenantMemberContext,
  module: ModuleKey,
  action: PermissionAction,
): Promise<boolean> {
  const admin = createAdminClient()
  const { data } = await admin.from('role_permissions')
    .select('can_view, can_create, can_edit, can_delete')
    .eq('role_id', ctx.role_id).eq('module', module).single()
  if (!data) return false

  return {
    view: data.can_view, create: data.can_create, edit: data.can_edit, delete: data.can_delete,
  }[action]
}
