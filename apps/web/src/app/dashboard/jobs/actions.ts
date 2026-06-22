'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ulid } from 'ulid'
import { redirect } from 'next/navigation'

export async function createJobAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const admin = createAdminClient()

  const { data: membership } = await admin
    .from('platform_user_tenants')
    .select('tenant_id')
    .eq('platform_user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!membership) return { error: 'No workspace found.' }

  const title       = formData.get('title') as string
  const department  = formData.get('department') as string
  const location    = formData.get('location') as string
  const work_mode   = formData.get('work_mode') as string
  const job_type    = formData.get('job_type') as string
  const description = formData.get('description') as string
  const requirements = formData.get('requirements') as string
  const salary_min  = formData.get('salary_min') ? parseInt(formData.get('salary_min') as string) * 100 : null
  const salary_max  = formData.get('salary_max') ? parseInt(formData.get('salary_max') as string) * 100 : null
  const openings    = parseInt(formData.get('openings') as string) || 1
  const status      = formData.get('status') as string

  if (!title) return { error: 'Job title is required.' }

  const { data: job, error } = await admin.from('jobs').insert({
    id: ulid(),
    tenant_id: membership.tenant_id,
    title,
    department: department || null,
    location: location || null,
    work_mode: work_mode || 'onsite',
    job_type: job_type || 'full_time',
    description: description || null,
    requirements: requirements || null,
    salary_min,
    salary_max,
    openings,
    status: status || 'draft',
    created_by: user.id,
    published_at: status === 'published' ? new Date().toISOString() : null,
  }).select().single()

  if (error) return { error: `Failed to create job: ${error.message}` }

  redirect(`/dashboard/jobs/${job.id}`)
}

export async function updateJobStatusAction(jobId: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('jobs')
    .update({
      status,
      published_at: status === 'published' ? new Date().toISOString() : undefined,
    })
    .eq('id', jobId)

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteJobAction(jobId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const admin = createAdminClient()
  await admin.from('jobs').update({ deleted_at: new Date().toISOString() }).eq('id', jobId)

  redirect('/dashboard/jobs')
}
