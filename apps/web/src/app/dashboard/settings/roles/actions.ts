'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getTenantMemberContext, hasPermission, type TenantMemberContext } from '@/lib/tenant/permissions'
import { MODULES, type ModuleKey } from '@/lib/modules'
import { revalidatePath } from 'next/cache'
import { ulid } from 'ulid'

export type RolePermissionRow = {
  module: ModuleKey
  can_view: boolean
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
}

export type RoleRow = {
  id: string
  name: string
  is_system: boolean
  member_count: number
  permissions: RolePermissionRow[]
}

type Gate = { ok: true; ctx: TenantMemberContext } | { ok: false; error: string }

async function requireSettingsAccess(action: 'view' | 'create' | 'edit' | 'delete'): Promise<Gate> {
  const ctx = await getTenantMemberContext()
  if (!ctx) return { ok: false, error: 'Not authenticated.' }
  if (!(await hasPermission(ctx, 'settings', action))) return { ok: false, error: 'You do not have permission to manage roles.' }
  return { ok: true, ctx }
}

export async function getRolesAction(): Promise<{ error: string } | { roles: RoleRow[] }> {
  const gate = await requireSettingsAccess('view')
  if (!gate.ok) return { error: gate.error }

  const admin = createAdminClient()
  const [{ data: roles, error: rolesErr }, { data: members }] = await Promise.all([
    admin.from('tenant_roles')
      .select('id, name, is_system, role_permissions(module, can_view, can_create, can_edit, can_delete)')
      .eq('tenant_id', gate.ctx.tenant_id)
      .order('is_system', { ascending: false })
      .order('name'),
    admin.from('platform_user_tenants')
      .select('role_id')
      .eq('tenant_id', gate.ctx.tenant_id),
  ])
  if (rolesErr) return { error: rolesErr.message }

  const counts = new Map<string, number>()
  for (const m of members ?? []) counts.set(m.role_id, (counts.get(m.role_id) ?? 0) + 1)

  return {
    roles: (roles ?? []).map(r => ({
      id: r.id,
      name: r.name,
      is_system: r.is_system,
      member_count: counts.get(r.id) ?? 0,
      permissions: (r.role_permissions ?? []) as RolePermissionRow[],
    })),
  }
}

export async function createRoleAction(name: string) {
  const gate = await requireSettingsAccess('create')
  if (!gate.ok) return { error: gate.error }

  const trimmed = name.trim()
  if (!trimmed) return { error: 'Role name is required.' }

  const admin = createAdminClient()
  const roleId = ulid()

  const { error: roleErr } = await admin.from('tenant_roles')
    .insert({ id: roleId, tenant_id: gate.ctx.tenant_id, name: trimmed, is_system: false })
  if (roleErr) return { error: roleErr.code === '23505' ? 'A role with that name already exists.' : roleErr.message }

  const { error: permErr } = await admin.from('role_permissions')
    .insert(MODULES.map(m => ({ role_id: roleId, module: m.key })))
  if (permErr) return { error: permErr.message }

  revalidatePath('/dashboard/settings/roles')
  return { success: true as const, roleId }
}

export async function renameRoleAction(roleId: string, name: string) {
  const gate = await requireSettingsAccess('edit')
  if (!gate.ok) return { error: gate.error }

  const trimmed = name.trim()
  if (!trimmed) return { error: 'Role name is required.' }

  const admin = createAdminClient()
  const { data: role } = await admin.from('tenant_roles').select('is_system, tenant_id').eq('id', roleId).single()
  if (!role || role.tenant_id !== gate.ctx.tenant_id) return { error: 'Role not found.' }
  if (role.is_system) return { error: 'Super Admin cannot be renamed.' }

  const { error } = await admin.from('tenant_roles').update({ name: trimmed, updated_at: new Date().toISOString() }).eq('id', roleId)
  if (error) return { error: error.code === '23505' ? 'A role with that name already exists.' : error.message }

  revalidatePath('/dashboard/settings/roles')
  return { success: true as const }
}

export async function deleteRoleAction(roleId: string) {
  const gate = await requireSettingsAccess('delete')
  if (!gate.ok) return { error: gate.error }

  const admin = createAdminClient()
  const { data: role } = await admin.from('tenant_roles').select('is_system, tenant_id').eq('id', roleId).single()
  if (!role || role.tenant_id !== gate.ctx.tenant_id) return { error: 'Role not found.' }
  if (role.is_system) return { error: 'Super Admin cannot be deleted.' }

  const { count } = await admin.from('platform_user_tenants')
    .select('id', { count: 'exact', head: true }).eq('role_id', roleId)
  if (count && count > 0) return { error: `${count} member${count === 1 ? '' : 's'} still ${count === 1 ? 'has' : 'have'} this role — reassign them first.` }

  const { error } = await admin.from('tenant_roles').delete().eq('id', roleId)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings/roles')
  return { success: true as const }
}

export async function updateRolePermissionAction(
  roleId: string, module: ModuleKey, field: 'can_view' | 'can_create' | 'can_edit' | 'can_delete', value: boolean,
) {
  const gate = await requireSettingsAccess('edit')
  if (!gate.ok) return { error: gate.error }

  const admin = createAdminClient()
  const { data: role } = await admin.from('tenant_roles').select('is_system, tenant_id').eq('id', roleId).single()
  if (!role || role.tenant_id !== gate.ctx.tenant_id) return { error: 'Role not found.' }
  if (role.is_system) return { error: 'Super Admin always has full access and cannot be changed.' }

  const { error } = await admin.from('role_permissions').update({ [field]: value }).eq('role_id', roleId).eq('module', module)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings/roles')
  return { success: true as const }
}
