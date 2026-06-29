import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CandidateDetailClient } from './candidate-detail-client'
import { BreadcrumbTitle } from '@/components/app/breadcrumb-provider'
import type { CandidateDetailData, NoteRow, DocRow, ActivityRow, JobRow } from './candidate-detail-client'

function relTime(iso: string) {
  const d = Date.now() - new Date(iso).getTime()
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h ago`
  if (d < 7 * 86_400_000) return `${Math.floor(d / 86_400_000)}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
}

export default async function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const { data: candidate } = await admin
    .from('candidates')
    .select('id, candidate_number, first_name, last_name, email, phone, location, linkedin_url, source, current_title, current_company, candidate_type, notice_period, current_ctc, expected_ctc, notes, resume_url, created_at, updated_at')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!candidate) notFound()

  const [notesRes, docsRes, activityRes, jobsRes] = await Promise.all([
    admin.from('candidate_notes')
      .select('id, author_name, text, created_at')
      .eq('candidate_id', id)
      .order('created_at', { ascending: false }),
    admin.from('candidate_documents')
      .select('id, name, size, file_type, doc_type, uploader_name, storage_path, created_at')
      .eq('candidate_id', id)
      .order('created_at', { ascending: false }),
    admin.from('candidate_activity')
      .select('id, actor_name, action, created_at')
      .eq('candidate_id', id)
      .order('created_at', { ascending: false }),
    admin.from('job_candidates')
      .select('id, stage, created_at, jobs(id, title, client, status, city, state)')
      .eq('candidate_id', id)
      .order('created_at', { ascending: false }),
  ])

  const notes: NoteRow[] = (notesRes.data ?? []).map(n => ({
    id: n.id,
    author: n.author_name,
    initials: n.author_name.split(' ').map((w: string) => w[0] ?? '').join('').toUpperCase().slice(0, 2) || 'ME',
    text: n.text,
    time: relTime(n.created_at),
  }))

  const docs: DocRow[] = (docsRes.data ?? []).map(d => ({
    id: d.id,
    name: d.name,
    size: d.size ? (d.size > 1024 * 1024 ? `${(d.size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(d.size / 1024)} KB`) : '—',
    type: (d.file_type?.split('/')[1] ?? d.name.split('.').pop() ?? 'file'),
    docType: d.doc_type,
    uploadedAt: new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    storagePath: d.storage_path,
  }))

  const activity: ActivityRow[] = (activityRes.data ?? []).map(a => ({
    id: a.id,
    actor: a.actor_name,
    action: a.action,
    time: relTime(a.created_at),
  }))

  const jobs: JobRow[] = (jobsRes.data ?? []).map((jc: any) => ({
    submissionId: jc.id,
    stage: jc.stage,
    submittedAt: new Date(jc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    jobId: jc.jobs?.id ?? '',
    title: jc.jobs?.title ?? '—',
    client: jc.jobs?.client ?? null,
    status: jc.jobs?.status ?? '—',
    location: [jc.jobs?.city, jc.jobs?.state].filter(Boolean).join(', ') || null,
  }))

  return (
    <>
      <BreadcrumbTitle title={`${candidate.first_name} ${candidate.last_name}`} />
      <CandidateDetailClient
        candidate={candidate as CandidateDetailData}
        initialNotes={notes}
        initialDocs={docs}
        initialActivity={activity}
        initialJobs={jobs}
      />
    </>
  )
}
