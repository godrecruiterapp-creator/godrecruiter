'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getPlatformOwnerContext } from '@/lib/platform/owner'
import { provisionTenant } from '@/lib/tenant/provision'
import { createTenantSchema } from '@god-recruiter/validators'
import { revalidatePath } from 'next/cache'

export type TenantRow = {
  id: string
  name: string
  slug: string
  region: string
  status: string
  plan_id: string
  created_at: string
}

async function requireOwner() {
  const ctx = await getPlatformOwnerContext()
  if (!ctx) return { ok: false as const, error: 'Not authorized.' }
  return { ok: true as const, ctx }
}

export async function getTenantsAction(): Promise<{ error: string } | { tenants: TenantRow[] }> {
  const gate = await requireOwner()
  if (!gate.ok) return { error: gate.error }

  const { data, error } = await createAdminClient()
    .from('tenants')
    .select('id, name, slug, region, status, plan_id, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (error) return { error: error.message }

  return { tenants: data ?? [] }
}

export async function createTenantAction(input: { name: string; slug: string; region: string; ownerEmail: string; ownerName: string }) {
  const gate = await requireOwner()
  if (!gate.ok) return { error: gate.error }

  const parsed = createTenantSchema.safeParse({ name: input.name, slug: input.slug, region: input.region })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }

  const ownerEmail = input.ownerEmail.trim().toLowerCase()
  const ownerName = input.ownerName.trim()
  if (!ownerEmail || !ownerEmail.includes('@')) return { error: 'A valid owner email is required.' }
  if (!ownerName) return { error: "The owner's name is required." }

  const admin = createAdminClient()

  const { data: existingSlug } = await admin.from('tenants').select('id').eq('slug', parsed.data.slug).single()
  if (existingSlug) return { error: 'That URL slug is already taken.' }

  const { data: existingUser } = await admin.from('platform_users').select('id').eq('email', ownerEmail).single()

  let ownerUserId: string
  if (existingUser) {
    ownerUserId = existingUser.id
  } else {
    const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(ownerEmail, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/accept-invite`,
    })
    if (inviteErr || !invited.user) return { error: inviteErr?.message ?? 'Could not send invite.' }
    ownerUserId = invited.user.id
  }

  try {
    await provisionTenant(parsed.data, ownerUserId, ownerEmail, ownerName)
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to create tenant.' }
  }

  revalidatePath('/platform')
  return { success: true as const }
}

export async function setTenantStatusAction(tenantId: string, status: 'active' | 'suspended') {
  const gate = await requireOwner()
  if (!gate.ok) return { error: gate.error }

  const { error } = await createAdminClient().from('tenants').update({ status }).eq('id', tenantId)
  if (error) return { error: error.message }

  revalidatePath('/platform')
  return { success: true as const }
}
