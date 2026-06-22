import { createAdminClient } from '@/lib/supabase/admin'
import type { CreateTenantInput } from '@god-recruiter/validators'
import type { Tenant } from '@god-recruiter/types'
import { ulid } from 'ulid'

export async function provisionTenant(
  input: CreateTenantInput,
  ownerUserId: string,
  ownerEmail: string,
  ownerName: string
): Promise<Tenant> {
  const supabase = createAdminClient()
  const tenantId = ulid()
  const schemaName = `tenant_${tenantId.toLowerCase()}`

  // ── Step 1: Create tenant record ─────────────────────────────────────────
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .insert({
      id: tenantId,
      name: input.name,
      slug: input.slug,
      schema_name: schemaName,
      region: input.region ?? 'us-east-1',
      status: 'trial',
      plan_id: 'trial',
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single()

  if (tenantError || !tenant) {
    throw new Error(`Failed to create tenant: ${tenantError?.message}`)
  }

  // ── Step 2: Ensure platform_users record exists ───────────────────────────
  const { error: puError } = await supabase
    .from('platform_users')
    .upsert({ id: ownerUserId, email: ownerEmail, full_name: ownerName }, { onConflict: 'id' })

  if (puError) throw new Error(`Failed to upsert platform user: ${puError.message}`)

  // ── Step 3: Link user to tenant as owner ─────────────────────────────────
  const { error: memberError } = await supabase
    .from('platform_user_tenants')
    .insert({
      id: ulid(),
      platform_user_id: ownerUserId,
      tenant_id: tenantId,
      role: 'tenant_owner',
      is_active: true,
      joined_at: new Date().toISOString(),
    })

  if (memberError) throw new Error(`Failed to create membership: ${memberError.message}`)

  // ── Step 4: Track usage event ─────────────────────────────────────────────
  await supabase.from('usage_events').insert({
    id: ulid(),
    tenant_id: tenantId,
    event_type: 'tenant_created',
    quantity: 1,
    metadata: { plan: 'trial', region: input.region ?? 'us-east-1' },
  })

  return tenant as Tenant
}
