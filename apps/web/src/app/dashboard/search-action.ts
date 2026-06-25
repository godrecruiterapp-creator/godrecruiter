'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type SearchResult = {
  candidates: { id: string; name: string; title: string | null; email: string }[]
  jobs:       { id: string; title: string; client: string | null; status: string }[]
}

export async function globalSearchAction(query: string): Promise<SearchResult> {
  const empty = { candidates: [], jobs: [] }
  if (!query.trim()) return empty

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return empty

  const admin = createAdminClient()
  const { data: membership } = await admin
    .from('platform_user_tenants')
    .select('tenant_id')
    .eq('platform_user_id', user.id)
    .eq('is_active', true)
    .single()
  if (!membership) return empty

  const q = query.trim()

  const [candidatesRes, jobsRes] = await Promise.all([
    admin.from('candidates')
      .select('id, first_name, last_name, email, current_title')
      .eq('tenant_id', membership.tenant_id)
      .is('deleted_at', null)
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,current_title.ilike.%${q}%`)
      .limit(6),
    admin.from('jobs')
      .select('id, title, client, status')
      .eq('tenant_id', membership.tenant_id)
      .is('deleted_at', null)
      .or(`title.ilike.%${q}%,client.ilike.%${q}%`)
      .limit(6),
  ])

  return {
    candidates: (candidatesRes.data ?? []).map(c => ({
      id: c.id,
      name: [c.first_name, c.last_name].filter(Boolean).join(' ') || c.email,
      title: c.current_title,
      email: c.email,
    })),
    jobs: (jobsRes.data ?? []).map(j => ({
      id: j.id,
      title: j.title,
      client: j.client,
      status: j.status,
    })),
  }
}
