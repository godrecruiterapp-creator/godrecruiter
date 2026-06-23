export const revalidate = 0

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Jobs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard/jobs/new">
            <Plus className="size-3.5 mr-1.5" />
            Post a job
          </Link>
        </Button>
      </div>

      <JobsTableClient jobs={jobs} />
    </div>
  )
}
