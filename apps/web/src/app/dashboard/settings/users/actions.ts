'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getTenantMemberContext, hasPermission, type TenantMemberContext } from '@/lib/tenant/permissions'
import { revalidatePath } from 'next/cache'
import { ulid } from 'ulid'

export type MemberStatus = 'active' | 'invited' | 'deactivated'

export type MemberRow = {
  membership_id: string
  platform_user_id: string
  full_name: string
  email: string
  avatar_url: string | null
  role_id: string
  role_name: string
  is_system_role: boolean
  status: MemberStatus
  invited_at: string | null
  joined_at: string | null
}

export type RoleOption = { id: string; name: string; is_system: boolean }

type Gate = { ok: true; ctx: TenantMemberContext } | { ok: false; error: string }

async function requireSettingsAccess(action: 'view' | 'create' | 'edit' | 'delete'): Promise<Gate> {
  const ctx = await getTenantMemberContext()
  if (!ctx) return { ok: false, error: 'Not authenticated.' }
  if (!(await hasPermission(ctx, 'settings', action))) return { ok: false, error: 'You do not have permission to manage users.' }
  return { ok: true, ctx }
}

function statusOf(m: { is_active: boolean; joined_at: string | null }): MemberStatus {
  if (m.is_active) return 'active'
  return m.joined_at ? 'deactivated' : 'invited'
}

export async function getUsersPageDataAction(): Promise<{ error: string } | { members: MemberRow[]; roles: RoleOption[] }> {
  const gate = await requireSettingsAccess('view')
  if (!gate.ok) return { error: gate.error }

  const admin = createAdminClient()
  const [{ data: members, error: membersErr }, { data: roles, error: rolesErr }] = await Promise.all([
    admin.from('platform_user_tenants')
      .select('id, platform_user_id, role_id, is_active, invited_at, joined_at, platform_users(full_name, email, avatar_url), tenant_roles(name, is_system)')
      .eq('tenant_id', gate.ctx.tenant_id)
      .order('joined_at', { ascending: false }),
    admin.from('tenant_roles')
      .select('id, name, is_system')
      .eq('tenant_id', gate.ctx.tenant_id)
      .order('is_system', { ascending: false })
      .order('name'),
  ])
  if (membersErr) return { error: membersErr.message }
  if (rolesErr) return { error: rolesErr.message }

  return {
    roles: roles ?? [],
    members: (members ?? []).map(m => {
      const user = m.platform_users as unknown as { full_name: string; email: string; avatar_url: string | null } | null
      const role = m.tenant_roles as unknown as { name: string; is_system: boolean } | null
      return {
        membership_id: m.id,
        platform_user_id: m.platform_user_id,
        full_name: user?.full_name ?? 'Unknown',
        email: user?.email ?? '',
        avatar_url: user?.avatar_url ?? null,
        role_id: m.role_id,
        role_name: role?.name ?? '',
        is_system_role: role?.is_system ?? false,
        status: statusOf(m),
        invited_at: m.invited_at,
        joined_at: m.joined_at,
      }
    }),
  }
}

async function isLastActiveSuperAdmin(tenantId: string, membershipId: string) {
  const admin = createAdminClient()
  const { data: superAdminRole } = await admin.from('tenant_roles')
    .select('id').eq('tenant_id', tenantId).eq('is_system', true).single()
  if (!superAdminRole) return false

  const { data: membership } = await admin.from('platform_user_tenants')
    .select('role_id').eq('id', membershipId).single()
  if (!membership || membership.role_id !== superAdminRole.id) return false

  const { count } = await admin.from('platform_user_tenants')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId).eq('role_id', superAdminRole.id).eq('is_active', true)

  return (count ?? 0) <= 1
}

export async function inviteUserAction(email: string, roleId: string) {
  const gate = await requireSettingsAccess('create')
  if (!gate.ok) return { error: gate.error }

  const trimmedEmail = email.trim().toLowerCase()
  if (!trimmedEmail || !trimmedEmail.includes('@')) return { error: 'A valid email is required.' }

  const admin = createAdminClient()

  const { data: role } = await admin.from('tenant_roles').select('id, tenant_id').eq('id', roleId).single()
  if (!role || role.tenant_id !== gate.ctx.tenant_id) return { error: 'Role not found.' }

  const { data: existingUser } = await admin.from('platform_users').select('id, full_name').eq('email', trimmedEmail).single()

  if (existingUser) {
    const { data: existingMembership } = await admin.from('platform_user_tenants')
      .select('id').eq('platform_user_id', existingUser.id).eq('tenant_id', gate.ctx.tenant_id).single()
    if (existingMembership) return { error: 'This person is already a member of your company.' }

    const { error } = await admin.from('platform_user_tenants').insert({
      id: ulid(), platform_user_id: existingUser.id, tenant_id: gate.ctx.tenant_id, role_id: roleId,
      is_active: true, invited_by: gate.ctx.user.id, invited_at: new Date().toISOString(), joined_at: new Date().toISOString(),
    })
    if (error) return { error: error.message }

    revalidatePath('/dashboard/settings/users')
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

  const { error } = await admin.from('platform_user_tenants').insert({
    id: ulid(), platform_user_id: invited.user.id, tenant_id: gate.ctx.tenant_id, role_id: roleId,
    is_active: false, invited_by: gate.ctx.user.id, invited_at: new Date().toISOString(), joined_at: null,
  })
  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings/users')
  return { success: true as const }
}

export async function updateMemberRoleAction(membershipId: string, roleId: string) {
  const gate = await requireSettingsAccess('edit')
  if (!gate.ok) return { error: gate.error }

  const admin = createAdminClient()
  const { data: role } = await admin.from('tenant_roles').select('id, tenant_id').eq('id', roleId).single()
  if (!role || role.tenant_id !== gate.ctx.tenant_id) return { error: 'Role not found.' }

  if (await isLastActiveSuperAdmin(gate.ctx.tenant_id, membershipId)) {
    return { error: 'This is the last Super Admin — assign another Super Admin before changing this.' }
  }

  const { error } = await admin.from('platform_user_tenants').update({ role_id: roleId }).eq('id', membershipId).eq('tenant_id', gate.ctx.tenant_id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings/users')
  return { success: true as const }
}

export async function setMemberActiveAction(membershipId: string, isActive: boolean) {
  const gate = await requireSettingsAccess('edit')
  if (!gate.ok) return { error: gate.error }

  if (!isActive && await isLastActiveSuperAdmin(gate.ctx.tenant_id, membershipId)) {
    return { error: 'This is the last Super Admin — assign another Super Admin before deactivating this member.' }
  }

  const { error } = await createAdminClient().from('platform_user_tenants')
    .update({ is_active: isActive }).eq('id', membershipId).eq('tenant_id', gate.ctx.tenant_id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings/users')
  return { success: true as const }
}

export async function removeMemberAction(membershipId: string) {
  const gate = await requireSettingsAccess('delete')
  if (!gate.ok) return { error: gate.error }

  if (await isLastActiveSuperAdmin(gate.ctx.tenant_id, membershipId)) {
    return { error: 'This is the last Super Admin — assign another Super Admin before removing this member.' }
  }

  const { error } = await createAdminClient().from('platform_user_tenants')
    .delete().eq('id', membershipId).eq('tenant_id', gate.ctx.tenant_id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings/users')
  return { success: true as const }
}
