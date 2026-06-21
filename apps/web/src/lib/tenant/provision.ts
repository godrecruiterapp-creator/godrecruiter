import { createAdminClient } from '@/lib/supabase/admin'
import type { CreateTenantInput } from '@god-recruiter/validators'
import type { Tenant } from '@god-recruiter/types'

// Generates a ULID in the application layer (ADR R2)
import { ulid } from 'ulid'

export async function provisionTenant(
  input: CreateTenantInput,
  ownerUserId: string,
  ownerEmail: string,
  ownerName: string
): Promise<Tenant> {
  const supabase = createAdminClient()
  const tenantId = ulid()

  // ── Step 1: Claim a pre-warmed schema from the pool (ADR R1) ─────────────
  const { data: poolEntry, error: poolError } = await supabase
    .from('pool_schemas')
    .select('id, schema_name')
    .eq('is_available', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  let schemaName: string

  if (poolError || !poolEntry) {
    // Pool is empty — provision on-demand (slower path, ~3-5s)
    console.warn('Schema pool empty — provisioning on-demand for tenant:', tenantId)
    schemaName = `tenant_${tenantId.toLowerCase()}`
    await provisionSchemaOnDemand(supabase, schemaName)
  } else {
    // Fast path — claim pool schema and rename it
    schemaName = `tenant_${tenantId.toLowerCase()}`
    await renameSchema(supabase, poolEntry.schema_name, schemaName)

    // Mark pool entry as assigned
    await supabase
      .from('pool_schemas')
      .update({ is_available: false, assigned_at: new Date().toISOString(), assigned_to: tenantId })
      .eq('id', poolEntry.id)
  }

  // ── Step 2: Create tenant record ─────────────────────────────────────────
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .insert({
      id: tenantId,
      name: input.name,
      slug: input.slug,
      schema_name: schemaName,
      region: input.region,
      status: 'trial',
      plan_id: 'trial',
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single()

  if (tenantError || !tenant) {
    throw new Error(`Failed to create tenant: ${tenantError?.message}`)
  }

  // ── Step 3: Create platform user if not exists ───────────────────────────
  const { error: puError } = await supabase
    .from('platform_users')
    .upsert({ id: ownerUserId, email: ownerEmail, full_name: ownerName }, { onConflict: 'id' })

  if (puError) throw new Error(`Failed to create platform user: ${puError.message}`)

  // ── Step 4: Link user to tenant as owner ─────────────────────────────────
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

  // ── Step 5: Create user record in tenant schema ───────────────────────────
  const { error: userError } = await supabase.schema(schemaName).from('users').insert({
    id: ulid(),
    platform_user_id: ownerUserId,
    email: ownerEmail,
    full_name: ownerName,
    role: 'tenant_owner',
    is_active: true,
    joined_at: new Date().toISOString(),
  })

  if (userError) throw new Error(`Failed to create tenant user: ${userError.message}`)

  // ── Step 6: Track usage event ─────────────────────────────────────────────
  await supabase.from('usage_events').insert({
    id: ulid(),
    tenant_id: tenantId,
    event_type: 'tenant_created',
    quantity: 1,
    metadata: { plan: 'trial', region: input.region },
  })

  return tenant as Tenant
}

async function renameSchema(
  supabase: ReturnType<typeof import('@/lib/supabase/admin').createAdminClient>,
  fromName: string,
  toName: string
): Promise<void> {
  const { error } = await supabase.rpc('rename_schema', {
    old_name: fromName,
    new_name: toName,
  })
  if (error) throw new Error(`Failed to rename schema: ${error.message}`)
}

async function provisionSchemaOnDemand(
  supabase: ReturnType<typeof import('@/lib/supabase/admin').createAdminClient>,
  schemaName: string
): Promise<void> {
  const { error } = await supabase.functions.invoke('provision-tenant-schema', {
    body: { schema_name: schemaName, mode: 'on_demand' },
  })
  if (error) throw new Error(`Failed to provision schema on-demand: ${error.message}`)
}
