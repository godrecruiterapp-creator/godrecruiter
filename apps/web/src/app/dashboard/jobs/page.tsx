export const revalidate = 0

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { JobsTableClient, type Job } from './jobs-table-client'

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  let jobs: Job[] = []
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
        .select('id, display_id, title, client, city, state, employment_type, work_mode, client_type, status, priority, recruiter_name, openings, created_at, updated_at')
        .eq('tenant_id', membership.tenant_id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      jobs = (data ?? []) as Job[]
    }
  } catch (err) {
    console.error('Jobs fetch error:', err)
  }

  return <JobsTableClient jobs={jobs} />
}
