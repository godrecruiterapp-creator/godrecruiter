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

// ── Notes ──────────────────────────────────────────────────────────────────────

async function getUserContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const [{ data: membership }, { data: profile }] = await Promise.all([
    admin.from('platform_user_tenants').select('tenant_id').eq('platform_user_id', user.id).eq('is_active', true).single(),
    admin.from('platform_users').select('full_name').eq('id', user.id).single(),
  ])
  if (!membership) return null
  return { user, tenant_id: membership.tenant_id, name: profile?.full_name || user.email || 'Unknown' }
}

export async function addJobNoteAction(jobId: string, text: string) {
  const ctx = await getUserContext()
  if (!ctx) return { error: 'Not authenticated.' }
  const admin = createAdminClient()
  const id = ulid()
  const created_at = new Date().toISOString()
  const { error } = await admin.from('job_notes').insert({
    id, job_id: jobId, tenant_id: ctx.tenant_id,
    author_id: ctx.user.id, author_name: ctx.name, text,
  })
  if (error) return { error: error.message }
  await admin.from('job_activity').insert({
    id: ulid(), job_id: jobId, tenant_id: ctx.tenant_id,
    actor_id: ctx.user.id, actor_name: ctx.name, action: 'Added a note',
  })
  return { success: true as const, id, author_name: ctx.name, created_at }
}

export async function deleteJobNoteAction(noteId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }
  await createAdminClient().from('job_notes').delete().eq('id', noteId)
  return { success: true }
}

// ── Documents ──────────────────────────────────────────────────────────────────

export async function uploadJobDocumentAction(jobId: string, formData: FormData) {
  const ctx = await getUserContext()
  if (!ctx) return { error: 'Not authenticated.' }
  const file = formData.get('file') as File
  if (!file) return { error: 'No file.' }
  const admin = createAdminClient()
  const fileId = ulid()
  const ext = file.name.split('.').pop()
  const path = `${ctx.tenant_id}/${jobId}/${fileId}.${ext}`
  const { error: upErr } = await admin.storage.from('job-documents').upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type })
  if (upErr) return { error: upErr.message }
  const created_at = new Date().toISOString()
  const { error: dbErr } = await admin.from('job_documents').insert({
    id: fileId, job_id: jobId, tenant_id: ctx.tenant_id,
    name: file.name, size: file.size, file_type: file.type,
    storage_path: path, uploader_id: ctx.user.id, uploader_name: ctx.name,
  })
  if (dbErr) return { error: dbErr.message }
  await admin.from('job_activity').insert({
    id: ulid(), job_id: jobId, tenant_id: ctx.tenant_id,
    actor_id: ctx.user.id, actor_name: ctx.name, action: `Uploaded document: ${file.name}`,
  })
  return { success: true as const, id: fileId, name: file.name, size: file.size, file_type: file.type, uploader_name: ctx.name, created_at }
}

export async function deleteJobDocumentAction(docId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }
  const admin = createAdminClient()
  const { data: doc } = await admin.from('job_documents').select('storage_path').eq('id', docId).single()
  if (doc?.storage_path) await admin.storage.from('job-documents').remove([doc.storage_path])
  await admin.from('job_documents').delete().eq('id', docId)
  return { success: true }
}
