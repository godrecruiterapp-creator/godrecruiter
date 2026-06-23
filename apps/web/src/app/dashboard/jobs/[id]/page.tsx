import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { JobDetailClient } from './job-detail-client'

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const { data: job } = await admin
    .from('jobs')
    .select('id, display_id, title, client, city, state, employment_type, work_mode, client_type, status, priority, recruiter_name, openings, department, description, requirements, salary_min, salary_max, created_at, updated_at')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!job) notFound()

  return <JobDetailClient job={job} />
}
