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

  const title           = formData.get('title') as string
  const client          = formData.get('client') as string
  const city            = formData.get('city') as string
  const state_val       = formData.get('state') as string
  const department      = formData.get('department') as string
  const employment_type = formData.get('employment_type') as string
  const work_mode       = formData.get('work_mode') as string
  const description     = formData.get('description') as string
  const requirements    = formData.get('requirements') as string
  const salary_min      = formData.get('salary_min') ? parseInt(formData.get('salary_min') as string) * 100 : null
  const salary_max      = formData.get('salary_max') ? parseInt(formData.get('salary_max') as string) * 100 : null
  const openings        = parseInt(formData.get('openings') as string) || 1
  const status          = formData.get('status') as string
  const priority        = formData.get('priority') as string
  const recruiter_name  = formData.get('recruiter_name') as string
  const client_type     = formData.get('client_type') as string

  if (!title) return { error: 'Job title is required.' }

  const validStatuses = ['open', 'on_hold', 'closed', 'filled']
  const safeStatus = validStatuses.includes(status) ? status : 'open'

  const { data: job, error } = await admin.from('jobs').insert({
    id: ulid(),
    tenant_id: membership.tenant_id,
    title,
    client: client || null,
    city: city || null,
    state: state_val || null,
    department: department || null,
    employment_type: employment_type || null,
    work_mode: work_mode || 'onsite',
    description: description || null,
    requirements: requirements || null,
    salary_min,
    salary_max,
    openings,
    status: safeStatus,
    priority: priority || 'medium',
    recruiter_name: recruiter_name || null,
    client_type: client_type || null,
    created_by: user.id,
    published_at: safeStatus === 'open' ? new Date().toISOString() : null,
  }).select().single()

  if (error) return { error: `Failed to create job: ${error.message}` }

  redirect(`/dashboard/jobs/${job.id}`)
}

export async function updateJobStatusAction(jobId: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const validStatuses = ['open', 'on_hold', 'closed', 'filled']
  if (!validStatuses.includes(status)) return { error: 'Invalid status.' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('jobs')
    .update({ status })
    .eq('id', jobId)

  if (error) return { error: error.message }
  return { success: true }
}

export async function updateJobAction(jobId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const title           = formData.get('title') as string
  const client          = formData.get('client') as string
  const city            = formData.get('city') as string
  const state_val       = formData.get('state') as string
  const department      = formData.get('department') as string
  const employment_type = formData.get('employment_type') as string
  const work_mode       = formData.get('work_mode') as string
  const description     = formData.get('description') as string
  const requirements    = formData.get('requirements') as string
  const salary_min      = formData.get('salary_min') ? parseInt(formData.get('salary_min') as string) * 100 : null
  const salary_max      = formData.get('salary_max') ? parseInt(formData.get('salary_max') as string) * 100 : null
  const openings        = parseInt(formData.get('openings') as string) || 1
  const status          = formData.get('status') as string
  const priority        = formData.get('priority') as string
  const recruiter_name  = formData.get('recruiter_name') as string
  const client_type     = formData.get('client_type') as string

  if (!title) return { error: 'Job title is required.' }

  const validStatuses = ['open', 'on_hold', 'closed', 'filled']
  const safeStatus = validStatuses.includes(status) ? status : 'open'

  const admin = createAdminClient()
  const { error } = await admin.from('jobs').update({
    title,
    client: client || null,
    city: city || null,
    state: state_val || null,
    department: department || null,
    employment_type: employment_type || null,
    work_mode: work_mode || 'onsite',
    description: description || null,
    requirements: requirements || null,
    salary_min,
    salary_max,
    openings,
    status: safeStatus,
    priority: priority || 'medium',
    recruiter_name: recruiter_name || null,
    client_type: client_type || null,
  }).eq('id', jobId)

  if (error) return { error: `Failed to update job: ${error.message}` }

  redirect(`/dashboard/jobs/${jobId}`)
}

export async function bulkUpdateJobsAction(jobIds: string[], updates: { status?: string; priority?: string; recruiter_name?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('jobs')
    .update(updates)
    .in('id', jobIds)

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

export async function bulkDeleteJobsAction(jobIds: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const admin = createAdminClient()
  await admin.from('jobs')
    .update({ deleted_at: new Date().toISOString() })
    .in('id', jobIds)

  return { success: true }
}
