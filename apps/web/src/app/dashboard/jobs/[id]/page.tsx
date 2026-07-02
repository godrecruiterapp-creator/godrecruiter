import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { JobDetailClient } from './job-detail-client'
import { BreadcrumbTitle } from '@/components/app/breadcrumb-provider'
import { toInitials, relTime, formatSize } from '@/lib/format'
import {
  computeJobReadiness, computeJobHealth, computeFillProbability,
  computeRecruiterMatches, computeCandidateCategories, computeNextBestActions,
  matchScore,
  type TenantJobRow, type TenantJobCandidateRow, type TenantCandidateRow, type RecruiterRow, type ActivityRow,
} from '@/lib/job-intelligence'

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const { data: job } = await admin.from('jobs')
    .select('id, tenant_id, display_id, title, client, city, state, employment_type, work_mode, client_type, status, priority, recruiter_id, recruiter_name, openings, department, description, requirements, salary_min, salary_max, created_at, updated_at')
    .eq('id', id).is('deleted_at', null).single()

  if (!job) notFound()

  const [
    { data: rawNotes },
    { data: rawDocs },
    { data: rawActivity },
    { data: rawJobCandidates },
    { data: rawRecruiters },
    { data: rawTenantJobs },
    { data: rawTenantJobCandidates },
    { data: rawTenantCandidates },
    { data: rawTenantActivity },
  ] = await Promise.all([
    admin.from('job_notes')
      .select('id, author_name, text, created_at')
      .eq('job_id', id).order('created_at', { ascending: false }),
    admin.from('job_documents')
      .select('id, name, size, file_type, storage_path, uploader_name, created_at')
      .eq('job_id', id).order('created_at', { ascending: false }),
    admin.from('job_activity')
      .select('id, actor_name, action, created_at')
      .eq('job_id', id).order('created_at', { ascending: false }).limit(50),
    admin.from('job_candidates')
      .select('id, stage, created_at, candidate_id, candidates(id, first_name, last_name, current_title, current_company, location, candidate_type, resume_url, created_at, updated_at)')
      .eq('job_id', id),
    admin.from('platform_user_tenants')
      .select('platform_user_id, platform_users(id, full_name)')
      .eq('tenant_id', job.tenant_id).eq('is_active', true)
      .in('role', ['senior_recruiter', 'recruiter', 'sourcer']),
    admin.from('jobs')
      .select('id, client, employment_type, department, status, recruiter_id, created_at')
      .eq('tenant_id', job.tenant_id).is('deleted_at', null),
    admin.from('job_candidates')
      .select('job_id, candidate_id, stage, created_at')
      .eq('tenant_id', job.tenant_id),
    admin.from('candidates')
      .select('id, first_name, last_name, current_title, current_company, location, candidate_type, created_at, updated_at')
      .eq('tenant_id', job.tenant_id).is('deleted_at', null),
    admin.from('job_activity')
      .select('actor_id, created_at')
      .eq('tenant_id', job.tenant_id).order('created_at', { ascending: false }).limit(300),
  ])

  const initialNotes = (rawNotes ?? []).map(n => ({
    id: n.id,
    author: n.author_name,
    initials: toInitials(n.author_name),
    text: n.text,
    time: relTime(n.created_at),
  }))

  const initialDocs = (rawDocs ?? []).map(d => ({
    id: d.id,
    name: d.name,
    size: d.size ? formatSize(d.size) : '—',
    type: d.name.split('.').pop() ?? 'file',
    uploadedAt: new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  }))

  const initialActivity = (rawActivity ?? []).map(a => ({
    id: a.id,
    actor: a.actor_name,
    action: a.action,
    time: relTime(a.created_at),
  }))

  // ── Job intelligence inputs ──────────────────────────────────────────────
  type JobCandidateJoined = { id: string; stage: string; created_at: string; candidate_id: string; candidates: TenantCandidateRow | TenantCandidateRow[] | null }
  const jobCandidateRows = (rawJobCandidates ?? []) as unknown as JobCandidateJoined[]

  const thisJobCandidates = jobCandidateRows
    .map(jc => ({ ...jc, candidate: Array.isArray(jc.candidates) ? jc.candidates[0] : jc.candidates }))
    .filter((jc): jc is typeof jc & { candidate: TenantCandidateRow } => !!jc.candidate)

  const recruiters: RecruiterRow[] = (rawRecruiters ?? [])
    .map(r => Array.isArray(r.platform_users) ? r.platform_users[0] : r.platform_users)
    .filter((u): u is RecruiterRow => !!u)

  const tenantJobs = (rawTenantJobs ?? []) as TenantJobRow[]
  const tenantJobCandidates = (rawTenantJobCandidates ?? []) as TenantJobCandidateRow[]
  const tenantCandidates = (rawTenantCandidates ?? []) as TenantCandidateRow[]
  const tenantActivity = (rawTenantActivity ?? []) as ActivityRow[]

  const candidateCount = thisJobCandidates.length
  const lastActivityAt = rawActivity?.[0]?.created_at ?? null

  const readiness = computeJobReadiness(job, candidateCount)
  const health = computeJobHealth(job, candidateCount, lastActivityAt)
  const fillProbability = computeFillProbability(job, candidateCount, tenantJobs)
  const recruiterMatches = computeRecruiterMatches(recruiters, tenantJobs, tenantJobCandidates, tenantActivity)
  const candidateCategories = computeCandidateCategories(job, thisJobCandidates, tenantCandidates, tenantJobCandidates, tenantJobs)
  const nextBestActions = computeNextBestActions(job, candidateCount, readiness, health, candidateCategories)

  const initialCandidates = thisJobCandidates.map(jc => {
    const c = jc.candidate
    const { score } = matchScore({ title: job.title, department: job.department, requirements: job.requirements }, c)
    return {
      id: jc.id,
      candidateId: c.id,
      name: `${c.first_name} ${c.last_name}`,
      initials: toInitials(`${c.first_name} ${c.last_name}`),
      exp: '—',
      expYears: 0,
      location: c.location ?? '—',
      visa: '—',
      score,
      stage: jc.stage,
    }
  })

  return (
    <>
    <BreadcrumbTitle title={`${job.display_id} · ${job.title}`} />
    <JobDetailClient
      job={job}
      initialNotes={initialNotes}
      initialDocs={initialDocs}
      initialActivity={initialActivity}
      initialCandidates={initialCandidates}
      intelligence={{ readiness, health, fillProbability, recruiterMatches, candidateCategories, nextBestActions }}
      aiEnabled={!!process.env.OPENAI_API_KEY}
    />
    </>
  )
}
