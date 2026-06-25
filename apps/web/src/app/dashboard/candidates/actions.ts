'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ulid } from 'ulid'
import { redirect } from 'next/navigation'

async function getTenantId(userId: string) {
  const admin = createAdminClient()
  const { data } = await admin
    .from('platform_user_tenants')
    .select('tenant_id')
    .eq('platform_user_id', userId)
    .eq('is_active', true)
    .single()
  return data?.tenant_id ?? null
}

export async function createCandidateAction(formData: FormData): Promise<{ error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const tenantId = await getTenantId(user.id)
  if (!tenantId) return { error: 'No workspace found.' }

  const first_name       = formData.get('first_name') as string
  const last_name        = formData.get('last_name') as string
  const email            = formData.get('email') as string
  const phone            = formData.get('phone') as string
  const current_title    = formData.get('current_title') as string
  const current_company  = formData.get('current_company') as string
  const location         = formData.get('location') as string
  const linkedin_url     = formData.get('linkedin_url') as string
  const candidate_type   = formData.get('candidate_type') as string
  const notice_period    = formData.get('notice_period') as string
  const source           = formData.get('source') as string
  const notes            = formData.get('notes') as string
  const current_ctc_raw  = formData.get('current_ctc') as string
  const expected_ctc_raw = formData.get('expected_ctc') as string

  if (!first_name || !last_name) return { error: 'First and last name are required.' }
  if (!email) return { error: 'Email is required.' }

  const admin = createAdminClient()
  const { data: candidate, error } = await admin.from('candidates').insert({
    id: ulid(),
    tenant_id: tenantId,
    first_name,
    last_name,
    email,
    phone: phone || null,
    current_title: current_title || null,
    current_company: current_company || null,
    location: location || null,
    linkedin_url: linkedin_url || null,
    candidate_type: candidate_type || 'unknown',
    notice_period: notice_period || null,
    source: source || null,
    notes: notes || null,
    current_ctc: current_ctc_raw ? parseInt(current_ctc_raw) : null,
    expected_ctc: expected_ctc_raw ? parseInt(expected_ctc_raw) : null,
    created_by: user.id,
  }).select('id').single()

  if (error) {
    if (error.code === '23505') return { error: 'A candidate with this email already exists.' }
    return { error: `Failed to add candidate: ${error.message}` }
  }

  redirect(`/dashboard/candidates/${candidate.id}`)
}

export async function deleteCandidateAction(candidateId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const admin = createAdminClient()
  await admin.from('candidates').update({ deleted_at: new Date().toISOString() }).eq('id', candidateId)

  redirect('/dashboard/candidates')
}

// ── Preview data ───────────────────────────────────────────────────────────────

export async function getCandidatePreviewAction(candidateId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { notes: [], jobs: [], resume_url: null }
  const admin = createAdminClient()
  const [notesRes, jobsRes, candRes] = await Promise.all([
    admin.from('candidate_notes').select('id, author_name, text, created_at').eq('candidate_id', candidateId).order('created_at', { ascending: false }),
    admin.from('job_candidates').select('id, stage, jobs(id, title, client, status)').eq('candidate_id', candidateId).order('created_at', { ascending: false }),
    admin.from('candidates').select('resume_url').eq('id', candidateId).single(),
  ])
  function rel(iso: string) {
    const d = Date.now() - new Date(iso).getTime()
    if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`
    if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h ago`
    if (d < 7 * 86_400_000) return `${Math.floor(d / 86_400_000)}d ago`
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  return {
    resume_url: (candRes.data as any)?.resume_url ?? null,
    notes: (notesRes.data ?? []).map((n: any) => ({ id: n.id, author: n.author_name, text: n.text, time: rel(n.created_at) })),
    jobs: (jobsRes.data ?? []).map((jc: any) => ({ submissionId: jc.id, stage: jc.stage, jobId: jc.jobs?.id ?? '', title: jc.jobs?.title ?? '—', client: jc.jobs?.client ?? null, status: jc.jobs?.status ?? '—' })),
  }
}

// ── Shared context ─────────────────────────────────────────────────────────────

async function getCandidateUserContext() {
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

// ── Notes ──────────────────────────────────────────────────────────────────────

export async function addCandidateNoteAction(candidateId: string, text: string) {
  const ctx = await getCandidateUserContext()
  if (!ctx) return { error: 'Not authenticated.' }
  const admin = createAdminClient()
  const id = ulid()
  const created_at = new Date().toISOString()
  const { error } = await admin.from('candidate_notes').insert({
    id, candidate_id: candidateId, tenant_id: ctx.tenant_id,
    author_id: ctx.user.id, author_name: ctx.name, text,
  })
  if (error) return { error: error.message }
  await admin.from('candidate_activity').insert({
    id: ulid(), candidate_id: candidateId, tenant_id: ctx.tenant_id,
    actor_id: ctx.user.id, actor_name: ctx.name, action: 'Added a note',
  })
  return { success: true as const, id, author_name: ctx.name, created_at }
}

export async function deleteCandidateNoteAction(noteId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }
  await createAdminClient().from('candidate_notes').delete().eq('id', noteId)
  return { success: true }
}

// ── Documents ──────────────────────────────────────────────────────────────────

export async function uploadCandidateDocumentAction(candidateId: string, formData: FormData, docType = 'other') {
  const ctx = await getCandidateUserContext()
  if (!ctx) return { error: 'Not authenticated.' }
  const file = formData.get('file') as File
  if (!file) return { error: 'No file.' }
  const admin = createAdminClient()
  const fileId = ulid()
  const ext = file.name.split('.').pop()
  const path = `${ctx.tenant_id}/${candidateId}/${fileId}.${ext}`
  const { error: upErr } = await admin.storage.from('candidate-documents').upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type })
  if (upErr) return { error: upErr.message }
  const created_at = new Date().toISOString()
  const { error: dbErr } = await admin.from('candidate_documents').insert({
    id: fileId, candidate_id: candidateId, tenant_id: ctx.tenant_id,
    name: file.name, size: file.size, file_type: file.type,
    storage_path: path, doc_type: docType,
    uploader_id: ctx.user.id, uploader_name: ctx.name,
  })
  if (dbErr) return { error: dbErr.message }
  await admin.from('candidate_activity').insert({
    id: ulid(), candidate_id: candidateId, tenant_id: ctx.tenant_id,
    actor_id: ctx.user.id, actor_name: ctx.name, action: `Uploaded document: ${file.name}`,
  })
  return { success: true as const, id: fileId, name: file.name, size: file.size, file_type: file.type, uploader_name: ctx.name, created_at }
}

export async function deleteCandidateDocumentAction(docId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }
  const admin = createAdminClient()
  const { data: doc } = await admin.from('candidate_documents').select('storage_path').eq('id', docId).single()
  if (doc?.storage_path) await admin.storage.from('candidate-documents').remove([doc.storage_path])
  await admin.from('candidate_documents').delete().eq('id', docId)
  return { success: true }
}

// ── Resume ─────────────────────────────────────────────────────────────────────

export async function uploadCandidateResumeAction(candidateId: string, formData: FormData) {
  const ctx = await getCandidateUserContext()
  if (!ctx) return { error: 'Not authenticated.' }
  const file = formData.get('file') as File
  if (!file) return { error: 'No file.' }
  const admin = createAdminClient()
  const fileId = ulid()
  const ext = file.name.split('.').pop()
  const path = `${ctx.tenant_id}/${candidateId}/${fileId}.${ext}`
  const { error: upErr } = await admin.storage.from('candidate-resumes').upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type })
  if (upErr) return { error: upErr.message }
  const { data: { publicUrl } } = admin.storage.from('candidate-resumes').getPublicUrl(path)
  const { error: dbErr } = await admin.from('candidates').update({ resume_url: publicUrl }).eq('id', candidateId)
  if (dbErr) return { error: dbErr.message }
  // Insert into candidate_documents too so it shows in Documents tab
  await admin.from('candidate_documents').insert({
    id: fileId, candidate_id: candidateId, tenant_id: ctx.tenant_id,
    name: file.name, size: file.size, file_type: file.type,
    storage_path: path, doc_type: 'resume',
    uploader_id: ctx.user.id, uploader_name: ctx.name,
  })
  await admin.from('candidate_activity').insert({
    id: ulid(), candidate_id: candidateId, tenant_id: ctx.tenant_id,
    actor_id: ctx.user.id, actor_name: ctx.name, action: `Uploaded resume: ${file.name}`,
  })
  return { success: true as const, resumeUrl: publicUrl, resumeName: file.name }
}
