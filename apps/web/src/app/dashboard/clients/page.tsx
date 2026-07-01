export const revalidate = 0

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClientsTableClient } from './clients-table-client'
import { CLIENTS } from './_data'
import { PLACEMENTS } from '../placements/_data'

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // ponytail: one aggregate query for job counts per client, avoids N+1 across the client list
  let jobCounts: Record<string, { total: number; open: number }> = {}
  try {
    const admin = createAdminClient()
    const { data: membership } = await admin
      .from('platform_user_tenants')
      .select('tenant_id')
      .eq('platform_user_id', user.id)
      .eq('is_active', true)
      .single()

    if (membership) {
      const { data } = await admin
        .from('jobs')
        .select('client, status')
        .eq('tenant_id', membership.tenant_id)
        .is('deleted_at', null)

      for (const j of data ?? []) {
        if (!j.client) continue
        const c = jobCounts[j.client] ?? { total: 0, open: 0 }
        c.total += 1
        if (j.status === 'open') c.open += 1
        jobCounts[j.client] = c
      }
    }
  } catch (err) {
    console.error('Client job counts fetch error:', err)
  }

  const placementCounts: Record<string, number> = {}
  for (const p of PLACEMENTS) {
    placementCounts[p.client] = (placementCounts[p.client] ?? 0) + 1
  }

  const rows = CLIENTS.map(c => ({
    client: c,
    totalJobs: jobCounts[c.name]?.total ?? 0,
    openJobs: jobCounts[c.name]?.open ?? 0,
    placements: placementCounts[c.name] ?? 0,
  }))

  return (
    <div className="flex flex-col h-full p-6 overflow-hidden">
      <ClientsTableClient rows={rows} />
    </div>
  )
}
