'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getOpenAIClient, OPENAI_MODEL, friendlyOpenAIError } from '@/lib/openai'
import { notifyUser } from '@/lib/notifications'
import { ulid } from 'ulid'
import { redirect } from 'next/navigation'

function parseJobFormData(formData: FormData) {
  const title           = formData.get('title') as string
  const client          = formData.get('client') as string
  const client_job_id   = formData.get('client_job_id') as string
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

  const validStatuses = ['open', 'on_hold', 'closed', 'filled']
  const safeStatus = validStatuses.includes(status) ? status : 'open'

  return {
    title, client, client_job_id, city, state_val, department, employment_type,
    work_mode, description, requirements, salary_min, salary_max, openings,
    safeStatus, priority, recruiter_name, client_type,
  }
}

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

  const f = parseJobFormData(formData)
  if (!f.title) return { error: 'Job title is required.' }

  const { data: job, error } = await admin.from('jobs').insert({
    id: ulid(),
    tenant_id: membership.tenant_id,
    title: f.title,
    client: f.client || null,
    client_job_id: f.client_job_id || null,
    city: f.city || null,
    state: f.state_val || null,
    department: f.department || null,
    employment_type: f.employment_type || null,
    work_mode: f.work_mode || 'onsite',
    description: f.description || null,
    requirements: f.requirements || null,
    salary_min: f.salary_min,
    salary_max: f.salary_max,
    openings: f.openings,
    status: f.safeStatus,
    priority: f.priority || 'medium',
    recruiter_name: f.recruiter_name || null,
    client_type: f.client_type || null,
    created_by: user.id,
    published_at: f.safeStatus === 'open' ? new Date().toISOString() : null,
  }).select().single()

  if (error) return { error: `Failed to create job: ${error.message}` }

  redirect(`/dashboard/jobs/${job.id}?created=1`)
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

  const f = parseJobFormData(formData)
  if (!f.title) return { error: 'Job title is required.' }

  const admin = createAdminClient()
  const { error } = await admin.from('jobs').update({
    title: f.title,
    client: f.client || null,
    client_job_id: f.client_job_id || null,
    city: f.city || null,
    state: f.state_val || null,
    department: f.department || null,
    employment_type: f.employment_type || null,
    work_mode: f.work_mode || 'onsite',
    description: f.description || null,
    requirements: f.requirements || null,
    salary_min: f.salary_min,
    salary_max: f.salary_max,
    openings: f.openings,
    status: f.safeStatus,
    priority: f.priority || 'medium',
    recruiter_name: f.recruiter_name || null,
    client_type: f.client_type || null,
  }).eq('id', jobId)

  if (error) return { error: `Failed to update job: ${error.message}` }

  redirect(`/dashboard/jobs/${jobId}?updated=1`)
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

// ── Job picker for "Copy Existing Job" on the New Job page ──────────────────────

export type JobCopyRow = {
  id: string; title: string; client: string | null; city: string | null; state: string | null
  department: string | null; employment_type: string | null; work_mode: string | null
  client_type: string | null; openings: number | null; recruiter_name: string | null
  priority: string | null; description: string | null; requirements: string | null
  salary_min: number | null; salary_max: number | null
}

export async function getJobsForCopyAction(): Promise<JobCopyRow[]> {
  const ctx = await getUserContext()
  if (!ctx) return []
  const admin = createAdminClient()
  const { data } = await admin
    .from('jobs')
    .select('id, title, client, city, state, department, employment_type, work_mode, client_type, openings, recruiter_name, priority, description, requirements, salary_min, salary_max')
    .eq('tenant_id', ctx.tenant_id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)
  return data ?? []
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

  const { data: job } = await admin.from('jobs').select('title, recruiter_id').eq('id', jobId).single()
  if (job) {
    await notifyUser({
      tenantId: ctx.tenant_id, recipientId: job.recruiter_id, actorId: ctx.user.id, actorName: ctx.name,
      type: 'job_note', title: `${ctx.name} added a note on ${job.title}`, body: text.slice(0, 140),
      link: `/dashboard/jobs/${jobId}`,
    })
  }

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

// ── Recruiter assignment ─────────────────────────────────────────────────────

export async function assignRecruiterAction(jobId: string, recruiterId: string) {
  const ctx = await getUserContext()
  if (!ctx) return { error: 'Not authenticated.' }
  const admin = createAdminClient()

  const { data: recruiter } = await admin.from('platform_users').select('full_name').eq('id', recruiterId).single()
  if (!recruiter) return { error: 'Recruiter not found.' }

  const { data: job, error } = await admin.from('jobs')
    .update({ recruiter_id: recruiterId, recruiter_name: recruiter.full_name })
    .eq('id', jobId)
    .select('title')
    .single()
  if (error) return { error: error.message }

  await admin.from('job_activity').insert({
    id: ulid(), job_id: jobId, tenant_id: ctx.tenant_id,
    actor_id: ctx.user.id, actor_name: ctx.name, action: `Assigned ${recruiter.full_name} as recruiter`,
  })

  await notifyUser({
    tenantId: ctx.tenant_id, recipientId: recruiterId, actorId: ctx.user.id, actorName: ctx.name,
    type: 'job_assigned', title: `${ctx.name} assigned you to ${job?.title ?? 'a job'}`,
    link: `/dashboard/jobs/${jobId}`,
  })

  return { success: true as const }
}

// ── AI generative text (outreach / sourcing) — never used for scoring ────────

export async function generateOutreachEmailAction(jobId: string, candidateId: string) {
  const ctx = await getUserContext()
  if (!ctx) return { error: 'Not authenticated.' }
  const client = getOpenAIClient()
  if (!client) return { error: 'AI features are not configured.' }

  const admin = createAdminClient()
  const [{ data: job }, { data: candidate }] = await Promise.all([
    admin.from('jobs').select('title, client, city, state, requirements').eq('id', jobId).single(),
    admin.from('candidates').select('first_name, last_name, current_title, current_company').eq('id', candidateId).single(),
  ])
  if (!job || !candidate) return { error: 'Job or candidate not found.' }

  let completion
  try {
    completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Write a short, friendly recruiter outreach email to a candidate about a job opening. Plain text, no subject line, no placeholders.

Candidate: ${candidate.first_name} ${candidate.last_name}, currently ${candidate.current_title ?? 'unknown title'} at ${candidate.current_company ?? 'unknown company'}.
Job: ${job.title} at ${job.client ?? 'our client'}${job.city ? ` in ${job.city}${job.state ? `, ${job.state}` : ''}` : ''}.
Requirements: ${job.requirements ?? 'not specified'}.`,
      }],
    })
  } catch (err) {
    console.error('[generateOutreachEmailAction] OpenAI request failed:', err)
    return { error: friendlyOpenAIError(err) }
  }
  const text = completion.choices[0]?.message.content ?? ''
  return { success: true as const, text }
}

export async function generateBooleanSearchAction(jobId: string) {
  const ctx = await getUserContext()
  if (!ctx) return { error: 'Not authenticated.' }
  const client = getOpenAIClient()
  if (!client) return { error: 'AI features are not configured.' }

  const admin = createAdminClient()
  const { data: job } = await admin.from('jobs').select('title, department, requirements, city, state').eq('id', jobId).single()
  if (!job) return { error: 'Job not found.' }

  let completion
  try {
    completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Write a single LinkedIn/Google X-ray boolean search string for sourcing candidates for this job. Return only the boolean string, no explanation.

Title: ${job.title}
Department: ${job.department ?? 'not specified'}
Requirements: ${job.requirements ?? 'not specified'}
Location: ${[job.city, job.state].filter(Boolean).join(', ') || 'not specified'}`,
      }],
    })
  } catch (err) {
    console.error('[generateBooleanSearchAction] OpenAI request failed:', err)
    return { error: friendlyOpenAIError(err) }
  }
  const text = completion.choices[0]?.message.content ?? ''
  return { success: true as const, text }
}
