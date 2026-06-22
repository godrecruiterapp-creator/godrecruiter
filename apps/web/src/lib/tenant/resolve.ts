import type { TenantContext } from '@god-recruiter/types'

const TENANT_CACHE = new Map<string, { context: TenantContext; expiresAt: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export async function resolveTenant(
  host: string,
  appDomain: string
): Promise<TenantContext | null> {
  const slug = extractTenantSlug(host, appDomain)
  if (!slug) return null

  const cacheKey = `tenant:${slug}`
  const cached = TENANT_CACHE.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.context
  }

  try {
    const context = await fetchTenantContext(slug, host)
    if (context) {
      TENANT_CACHE.set(cacheKey, { context, expiresAt: Date.now() + CACHE_TTL_MS })
    }
    return context
  } catch {
    return null
  }
}

function extractTenantSlug(host: string, appDomain: string): string | null {
  const hostname = host.split(':')[0]!

  if (hostname === appDomain || hostname === `app.${appDomain}`) return null

  if (hostname.endsWith(`.${appDomain}`)) {
    return hostname.replace(`.${appDomain}`, '')
  }

  return `custom:${hostname}`
}

async function fetchTenantContext(
  slugOrCustom: string,
  _host: string
): Promise<TenantContext | null> {
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const supabase = createAdminClient()

  const baseQuery = supabase
    .schema('public')
    .from('tenants')
    .select('id, slug, schema_name, region, plan_id, status')
    .is('deleted_at', null)

  const { data, error } = slugOrCustom.startsWith('custom:')
    ? await baseQuery.eq('custom_domain', slugOrCustom.replace('custom:', '')).single()
    : await baseQuery.eq('slug', slugOrCustom).single()

  if (error || !data) return null
  if (data.status === 'suspended' || data.status === 'cancelled') return null

  return {
    tenant_id: data.id,
    schema_name: data.schema_name,
    slug: data.slug,
    region: data.region as TenantContext['region'],
    plan_id: data.plan_id,
  }
}

export function invalidateTenantCache(slug: string) {
  TENANT_CACHE.delete(`tenant:${slug}`)
}
