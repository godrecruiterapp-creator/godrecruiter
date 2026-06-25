'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type SearchResult = {
  candidates: { id: string; name: string; title: string | null; email: string; candidateId: string }[]
  jobs:       { id: string; title: string; client: string | null; status: string; display_id: string | null }[]
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

  // Extract numeric part from queries like "CAN-42", "CAN42", or plain "42"
  const numMatch = q.replace(/^can-?/i, '')
  const num = /^\d+$/.test(numMatch) ? parseInt(numMatch, 10) : null

  const [candidatesRes, candidateByNumRes, jobsRes] = await Promise.all([
    // Text search on name/email/title
    admin.from('candidates')
      .select('id, candidate_number, first_name, last_name, email, current_title')
      .eq('tenant_id', membership.tenant_id)
      .is('deleted_at', null)
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,current_title.ilike.%${q}%`)
      .limit(6),

    // Numeric candidate_number search (only when query looks like a number or CAN-NNN)
    num !== null
      ? admin.from('candidates')
          .select('id, candidate_number, first_name, last_name, email, current_title')
          .eq('tenant_id', membership.tenant_id)
          .is('deleted_at', null)
          .eq('candidate_number', num)
          .limit(1)
      : Promise.resolve({ data: [] }),

    // Text search on title, client, display_id
    admin.from('jobs')
      .select('id, display_id, title, client, status')
      .eq('tenant_id', membership.tenant_id)
      .is('deleted_at', null)
      .or(`title.ilike.%${q}%,client.ilike.%${q}%,display_id.ilike.%${q}%`)
      .limit(6),
  ])

  // Merge candidate results, dedup by id
  const seenCandidates = new Set<string>()
  const candidateRows = [
    ...(candidateByNumRes.data ?? []),
    ...(candidatesRes.data ?? []),
  ].filter(c => { if (seenCandidates.has(c.id)) return false; seenCandidates.add(c.id); return true })
   .slice(0, 6)

  return {
    candidates: candidateRows.map(c => ({
      id: c.id,
      name: [c.first_name, c.last_name].filter(Boolean).join(' ') || c.email,
      title: c.current_title,
      email: c.email,
      candidateId: `CAN-${String(c.candidate_number).padStart(4, '0')}`,
    })),
    jobs: (jobsRes.data ?? []).map(j => ({
      id: j.id,
      title: j.title,
      client: j.client,
      status: j.status,
      display_id: j.display_id,
    })),
  }
}
