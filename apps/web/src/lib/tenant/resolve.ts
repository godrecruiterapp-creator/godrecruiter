import type { TenantContext } from '@god-recruiter/types'

const TENANT_CACHE = new Map<string, { context: TenantContext; expiresAt: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

// Resolves a subdomain or custom domain to a TenantContext
// In production this hits Upstash Redis first, then falls back to DB
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
  // Strip port for local dev
  const hostname = host.split(':')[0]!

  // app.godrecruiter.com → no tenant (marketing/auth)
  if (hostname === appDomain || hostname === `app.${appDomain}`) return null

  // {slug}.godrecruiter.com → slug
  if (hostname.endsWith(`.${appDomain}`)) {
    return hostname.replace(`.${appDomain}`, '')
  }

  // Custom domain — look up by full hostname
  return `custom:${hostname}`
}

async function fetchTenantContext(
  slugOrCustom: string,
  _host: string
): Promise<TenantContext | null> {
  // This function is called server-side only.
  // We import the admin client dynamically to avoid bundling it client-side.
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const supabase = createAdminClient()

  let query = supabase
    .schema('public')
    .from('tenants')
    .select('id, slug, schema_name, region, plan_id, status')
    .eq('deleted_at' as never, null)
    .single()

  if (slugOrCustom.startsWith('custom:')) {
    const domain = slugOrCustom.replace('custom:', '')
    query = query.eq('custom_domain', domain)
  } else {
    query = query.eq('slug', slugOrCustom)
  }

  const { data, error } = await query

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
