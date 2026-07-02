'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getOpenAIClient, OPENAI_MODEL, friendlyOpenAIError } from '@/lib/openai'
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

export async function updateCandidateAction(candidateId: string, formData: FormData): Promise<{ error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

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
  const { error } = await admin.from('candidates').update({
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
  }).eq('id', candidateId)

  if (error) {
    if (error.code === '23505') return { error: 'A candidate with this email already exists.' }
    return { error: `Failed to update candidate: ${error.message}` }
  }

  redirect(`/dashboard/candidates/${candidateId}`)
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
  if (!user) return { notes: [], jobs: [], interviews: [], resume_url: null }
  const admin = createAdminClient()
  const [notesRes, jobsRes, interviewsRes, candRes] = await Promise.all([
    admin.from('candidate_notes').select('id, author_name, text, created_at').eq('candidate_id', candidateId).order('created_at', { ascending: false }),
    admin.from('job_candidates').select('id, stage, created_at, jobs(id, display_id, title, client, status), platform_users(full_name)').eq('candidate_id', candidateId).order('created_at', { ascending: false }),
    admin.from('interviews')
      .select('id, interview_type, status, scheduled_at, duration_minutes, interviewer_name, location, meeting_url, notes, job_candidates!inner(candidate_id, jobs(id, title, client))')
      .eq('job_candidates.candidate_id', candidateId)
      .order('scheduled_at', { ascending: false }),
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
    jobs: (jobsRes.data ?? []).map((jc: any) => ({
      submissionId: jc.id,
      stage: jc.stage,
      jobId: jc.jobs?.id ?? '',
      jobDisplayId: jc.jobs?.display_id ?? null,
      title: jc.jobs?.title ?? '—',
      client: jc.jobs?.client ?? null,
      status: jc.jobs?.status ?? '—',
      submittedAt: jc.created_at,
      submittedAtLabel: new Date(jc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      submittedBy: jc.platform_users?.full_name ?? null,
    })),
    interviews: (interviewsRes.data ?? []).map((iv: any) => ({
      id: iv.id,
      jobId: iv.job_candidates?.jobs?.id ?? '',
      jobTitle: iv.job_candidates?.jobs?.title ?? '—',
      client: iv.job_candidates?.jobs?.client ?? null,
      type: iv.interview_type,
      status: iv.status,
      scheduledAt: iv.scheduled_at,
      scheduledLabel: new Date(iv.scheduled_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
      durationMinutes: iv.duration_minutes,
      interviewer: iv.interviewer_name,
      location: iv.location,
      meetingUrl: iv.meeting_url,
      notes: iv.notes,
    })),
  }
}

// ── Interviews ─────────────────────────────────────────────────────────────────

export async function createInterviewAction(candidateId: string, formData: FormData) {
  const ctx = await getCandidateUserContext()
  if (!ctx) return { error: 'Not authenticated.' }

  const jobCandidateId  = formData.get('job_candidate_id') as string
  const interviewType   = formData.get('interview_type') as string
  const dateStr         = formData.get('date') as string
  const timeStr         = formData.get('time') as string
  const durationRaw     = formData.get('duration_minutes') as string
  const interviewerName = formData.get('interviewer_name') as string
  const location        = formData.get('location') as string
  const meetingUrl      = formData.get('meeting_url') as string
  const notes           = formData.get('notes') as string

  if (!jobCandidateId) return { error: 'Select which job submission this interview is for.' }
  if (!dateStr || !timeStr) return { error: 'Date and time are required.' }

  const scheduledAt = new Date(`${dateStr}T${timeStr}`)
  if (isNaN(scheduledAt.getTime())) return { error: 'Invalid date or time.' }

  const admin = createAdminClient()
  const { error } = await admin.from('interviews').insert({
    id: ulid(), job_candidate_id: jobCandidateId, tenant_id: ctx.tenant_id,
    interview_type: interviewType || 'video',
    scheduled_at: scheduledAt.toISOString(),
    duration_minutes: durationRaw ? parseInt(durationRaw) : 30,
    interviewer_name: interviewerName || null,
    location: location || null,
    meeting_url: meetingUrl || null,
    notes: notes || null,
    created_by: ctx.user.id,
  })
  if (error) return { error: error.message }

  await admin.from('candidate_activity').insert({
    id: ulid(), candidate_id: candidateId, tenant_id: ctx.tenant_id,
    actor_id: ctx.user.id, actor_name: ctx.name, action: 'Scheduled an interview',
  })

  return { success: true as const }
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

// ── Submit to job ──────────────────────────────────────────────────────────────

export async function getOpenJobsForSubmitAction() {
  const ctx = await getCandidateUserContext()
  if (!ctx) return { error: 'Not authenticated.' }
  const admin = createAdminClient()
  const { data, error } = await admin.from('jobs')
    .select('id, title, client')
    .eq('tenant_id', ctx.tenant_id)
    .eq('status', 'open')
    .is('deleted_at', null)
    .order('title')
  if (error) return { error: error.message }
  return { jobs: (data ?? []).map((j: any) => ({ id: j.id, title: j.title, client: j.client ?? null })) }
}

export async function submitCandidateToJobAction(candidateId: string, jobId: string) {
  const ctx = await getCandidateUserContext()
  if (!ctx) return { error: 'Not authenticated.' }
  const admin = createAdminClient()

  const { data: job } = await admin.from('jobs').select('title').eq('id', jobId).single()

  const { error } = await admin.from('job_candidates').insert({
    id: ulid(), job_id: jobId, candidate_id: candidateId, tenant_id: ctx.tenant_id,
    stage: 'submitted', added_by: ctx.user.id,
  })
  if (error) {
    if (error.code === '23505') return { error: 'This candidate is already submitted to that job.' }
    return { error: error.message }
  }

  await admin.from('candidate_activity').insert({
    id: ulid(), candidate_id: candidateId, tenant_id: ctx.tenant_id,
    actor_id: ctx.user.id, actor_name: ctx.name, action: `Submitted to job: ${job?.title ?? 'Unknown job'}`,
  })

  return { success: true as const }
}

// ── Resume parsing (real extraction + AI structuring, never fabricated) ─────────

export type ExtractedCandidateData = {
  first_name: string; last_name: string; email: string; phone: string
  current_title: string; current_company: string; location: string
  experience: string; work_auth: string; skills: string[]
  education: string; certifications: string[]; linkedin_url: string; summary: string
}

async function extractTextFromFile(file: File): Promise<{ text: string } | { error: string }> {
  const ext = (file.name.split('.').pop() ?? '').toLowerCase()
  const buffer = Buffer.from(await file.arrayBuffer())

  if (ext === 'pdf') {
    const { PDFParse } = await import('pdf-parse')
    const parser = new PDFParse({ data: buffer })
    try {
      const result = await parser.getText()
      return { text: result.text }
    } catch (err) {
      console.error('[extractTextFromFile] PDF parse failed:', err)
      return { error: "Couldn't read this PDF. It may be scanned/image-only — try pasting the resume text instead." }
    } finally {
      await parser.destroy()
    }
  }
  if (ext === 'docx') {
    const mammoth = await import('mammoth')
    try {
      const result = await mammoth.extractRawText({ buffer })
      return { text: result.value }
    } catch {
      return { error: "Couldn't read this Word document. Try pasting the resume text instead." }
    }
  }
  if (ext === 'txt') {
    return { text: buffer.toString('utf-8') }
  }
  if (ext === 'doc') {
    return { error: "Legacy .doc files aren't supported. Save as PDF, DOCX, or plain text and try again." }
  }
  return { error: `Unsupported file type: .${ext || 'unknown'}` }
}

async function structureResumeText(text: string): Promise<{ data: ExtractedCandidateData } | { error: string }> {
  const client = getOpenAIClient()
  if (!client) return { error: 'AI features are not configured.' }

  const trimmed = text.trim()
  if (trimmed.length < 30) {
    return { error: "Couldn't find enough text to parse. Try pasting the resume text instead." }
  }

  let completion
  try {
    completion = await client.chat.completions.create({
    model: OPENAI_MODEL,
    max_tokens: 1024,
    tools: [{
      type: 'function',
      function: {
        name: 'extract_candidate',
        description: 'Extract structured candidate fields from resume or profile text',
        parameters: {
          type: 'object',
          properties: {
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            current_title: { type: 'string' },
            current_company: { type: 'string' },
            location: { type: 'string' },
            experience: { type: 'string', description: 'Total years of professional experience as a plain number string, e.g. "8". Empty string if unknown.' },
            work_auth: { type: 'string', description: 'Work authorization status if mentioned, e.g. "US Citizen", "H1B", "Green Card". Empty string if not mentioned.' },
            skills: { type: 'array', items: { type: 'string' } },
            education: { type: 'string' },
            certifications: { type: 'array', items: { type: 'string' } },
            linkedin_url: { type: 'string' },
            summary: { type: 'string', description: 'A 2-3 sentence professional summary based only on what is in the text.' },
          },
          required: ['first_name', 'last_name', 'email', 'phone', 'current_title', 'current_company', 'location', 'experience', 'work_auth', 'skills', 'education', 'certifications', 'linkedin_url', 'summary'],
        },
      },
    }],
    tool_choice: { type: 'function', function: { name: 'extract_candidate' } },
    messages: [{
      role: 'user',
      content: `Extract candidate information from the following text. Use only information present in the text — if a field isn't present, return an empty string or empty array. Never invent or guess data.\n\n${trimmed.slice(0, 15000)}`,
    }],
    })
  } catch (err) {
    console.error('[structureResumeText] OpenAI request failed:', err)
    return { error: friendlyOpenAIError(err) }
  }

  const toolCall = completion.choices[0]?.message.tool_calls?.[0]
  if (!toolCall || toolCall.type !== 'function') {
    return { error: 'AI could not extract structured data from this text. Try entering details manually.' }
  }
  try {
    return { data: JSON.parse(toolCall.function.arguments) as ExtractedCandidateData }
  } catch {
    return { error: 'AI could not extract structured data from this text. Try entering details manually.' }
  }
}

export async function parseResumeAction(formData: FormData): Promise<{ data: ExtractedCandidateData } | { error: string }> {
  const ctx = await getCandidateUserContext()
  if (!ctx) return { error: 'Not authenticated.' }

  const file = formData.get('file') as File | null
  const pastedText = formData.get('text') as string | null

  let text: string
  if (file && file.size > 0) {
    const extracted = await extractTextFromFile(file)
    if ('error' in extracted) return extracted
    text = extracted.text
  } else if (pastedText) {
    text = pastedText
  } else {
    return { error: 'No resume file or text provided.' }
  }

  return structureResumeText(text)
}

// ── Duplicate search (email / phone) ─────────────────────────────────────────────

export type CandidateContactMatch = {
  id: string; name: string; email: string; phone: string | null
  createdAt: string; createdByName: string | null
}

export async function searchCandidatesByContactAction(query: string): Promise<{ matches: CandidateContactMatch[] } | { error: string }> {
  const ctx = await getCandidateUserContext()
  if (!ctx) return { error: 'Not authenticated.' }

  // Strip characters that are syntactically significant in PostgREST's .or() filter DSL
  const q = query.trim().replace(/[,()]/g, '')
  if (q.length < 4) return { matches: [] }

  const admin = createAdminClient()
  const { data, error } = await admin.from('candidates')
    .select('id, first_name, last_name, email, phone, created_at, platform_users(full_name)')
    .eq('tenant_id', ctx.tenant_id)
    .is('deleted_at', null)
    .or(`email.ilike.%${q}%,phone.ilike.%${q}%`)
    .limit(5)

  if (error) return { error: error.message }

  return {
    matches: (data ?? []).map((c: any) => ({
      id: c.id,
      name: `${c.first_name} ${c.last_name}`,
      email: c.email,
      phone: c.phone,
      createdAt: c.created_at,
      createdByName: c.platform_users?.full_name ?? null,
    })),
  }
}
