import { headers } from 'next/headers'
import type { TenantContext } from '@god-recruiter/types'
import type { UserRole } from '@god-recruiter/types'

// Read tenant context that was stamped by middleware.
// Call this in Server Components or Route Handlers only.
export async function getTenantContext(): Promise<TenantContext> {
  const headersList = await headers()

  const tenant_id    = headersList.get('x-tenant-id')
  const schema_name  = headersList.get('x-tenant-schema')
  const slug         = headersList.get('x-tenant-slug')
  const region       = headersList.get('x-tenant-region')
  const plan_id      = headersList.get('x-tenant-plan-id')

  if (!tenant_id || !schema_name || !slug || !region) {
    throw new Error('Tenant context missing — middleware may not have run')
  }

  return {
    tenant_id,
    schema_name,
    slug,
    region: region as TenantContext['region'],
    plan_id: plan_id ?? 'trial',
  }
}

export async function getUserRole(): Promise<UserRole> {
  const headersList = await headers()
  const role = headersList.get('x-user-role')
  if (!role) throw new Error('User role missing from request headers')
  return role as UserRole
}
