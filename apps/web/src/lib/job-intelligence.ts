import { daysAgo } from './format'

// ── Tunable constants (no per-tenant SLA config exists — named constants, not magic numbers) ──
const TYPICAL_POOL_SIZE = 8          // candidates in pipeline considered "well-stocked"
const TYPICAL_TIME_TO_FILL_DAYS = 30 // rough staffing-industry baseline
const MIN_CLIENT_SAMPLE = 3          // below this, fall back to tenant-wide fill rate

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'you', 'are', 'our', 'this', 'that', 'will',
  'have', 'from', 'your', 'job', 'role', 'work', 'team', 'experience', 'years',
])

// ── Shared row shapes (subset of DB columns actually used here) ─────────────

export type JobForIntelligence = {
  id: string
  client: string | null
  department: string | null
  employment_type: string | null
  description: string | null
  requirements: string | null
  salary_min: number | null
  salary_max: number | null
  city: string | null
  state: string | null
  priority: string | null
  recruiter_id: string | null
  status: string
  created_at: string
}

export type TenantJobRow = {
  id: string
  client: string | null
  employment_type: string | null
  department: string | null
  status: string
  recruiter_id: string | null
  created_at: string
}

export type TenantJobCandidateRow = {
  job_id: string
  candidate_id: string
  stage: string
  created_at: string
}

export type TenantCandidateRow = {
  id: string
  first_name: string
  last_name: string
  current_title: string | null
  current_company: string | null
  location: string | null
  candidate_type: string
  created_at: string
  updated_at: string
}

export type RecruiterRow = { id: string; full_name: string }
export type ActivityRow = { actor_id: string | null; created_at: string }

function tokenize(text: string | null | undefined): Set<string> {
  if (!text) return new Set()
  return new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOPWORDS.has(w))
  )
}

/** Deterministic keyword-overlap match score — no ML, no embeddings. Every point traces to a matched word. */
export function matchScore(
  job: Pick<JobForIntelligence, 'department' | 'requirements'> & { title: string },
  candidate: Pick<TenantCandidateRow, 'current_title' | 'current_company'>
): { score: number; matchedTerms: string[] } {
  const jobTerms = new Set([...tokenize(job.title), ...tokenize(job.department), ...tokenize(job.requirements)])
  const candTerms = new Set([...tokenize(candidate.current_title), ...tokenize(candidate.current_company)])
  if (jobTerms.size === 0 || candTerms.size === 0) return { score: 0, matchedTerms: [] }
  const matched = [...candTerms].filter(t => jobTerms.has(t))
  const score = Math.min(Math.round((matched.length / jobTerms.size) * 100), 100)
  return { score, matchedTerms: matched }
}

// ── Job readiness ────────────────────────────────────────────────────────────

export function computeJobReadiness(job: JobForIntelligence, candidateCount: number) {
  const checks = [
    { label: 'Job description',   met: !!job.description },
    { label: 'Requirements',      met: !!job.requirements },
    { label: 'Rate information',  met: job.salary_min != null && job.salary_max != null },
    { label: 'Client information',met: !!job.client },
    { label: 'Location',          met: !!job.city },
    { label: 'Priority set',      met: !!job.priority },
    { label: 'Recruiter assigned',met: !!job.recruiter_id },
    { label: 'Department',        met: !!job.department },
    { label: 'Candidate pool',    met: candidateCount > 0 },
  ]
  const met = checks.filter(c => c.met).length
  const pct = Math.round((met / checks.length) * 100)
  return { pct, checks, unmet: checks.filter(c => !c.met).map(c => c.label) }
}

// ── Job health ────────────────────────────────────────────────────────────────

export type JobHealthStatus = 'Healthy' | 'Needs Attention' | 'At Risk' | 'Critical'

export function computeJobHealth(
  job: JobForIntelligence,
  candidateCount: number,
  lastActivityAt: string | null
) {
  const ageDays = daysAgo(job.created_at)
  const sinceActivity = lastActivityAt ? daysAgo(lastActivityAt) : null
  const reasons: string[] = []
  const severities: JobHealthStatus[] = []

  if (candidateCount === 0 && ageDays > 14) {
    severities.push('Critical')
    reasons.push(`No candidates in the pipeline after ${ageDays} days open`)
  } else if (candidateCount === 0 && ageDays > 7) {
    severities.push('At Risk')
    reasons.push(`No candidates in the pipeline after ${ageDays} days open`)
  } else if (candidateCount < 3 && ageDays > 10) {
    severities.push('Needs Attention')
    reasons.push(`Only ${candidateCount} candidate${candidateCount === 1 ? '' : 's'} after ${ageDays} days open`)
  }

  if (sinceActivity !== null && sinceActivity > 10) {
    severities.push('At Risk')
    reasons.push(`No activity in ${sinceActivity} days`)
  } else if (sinceActivity !== null && sinceActivity > 5) {
    severities.push('Needs Attention')
    reasons.push(`No activity in ${sinceActivity} days`)
  }

  if (job.status === 'on_hold') {
    severities.push('Needs Attention')
    reasons.push('Job is on hold')
  }

  const order: JobHealthStatus[] = ['Critical', 'At Risk', 'Needs Attention', 'Healthy']
  const status = severities.length === 0
    ? 'Healthy'
    : order.find(s => severities.includes(s))!

  if (reasons.length === 0) reasons.push('Pipeline and activity look on track')

  return { status, reasons, ageDays, daysSinceActivity: sinceActivity }
}

// ── Fill probability ─────────────────────────────────────────────────────────

export function computeFillProbability(
  job: JobForIntelligence,
  candidateCount: number,
  tenantJobs: TenantJobRow[]
) {
  const ageDays = daysAgo(job.created_at)

  const poolScore = Math.min(candidateCount / TYPICAL_POOL_SIZE, 1) * 100

  const clientJobs = job.client
    ? tenantJobs.filter(j => j.client === job.client && j.id !== job.id)
    : []
  const clientFilled = clientJobs.filter(j => j.status === 'filled').length
  const usedClientSample = clientJobs.length >= MIN_CLIENT_SAMPLE

  const sampleJobs = usedClientSample ? clientJobs : tenantJobs.filter(j => j.id !== job.id)
  const sampleFilled = usedClientSample ? clientFilled : sampleJobs.filter(j => j.status === 'filled').length
  const fillRateScore = sampleJobs.length > 0 ? (sampleFilled / sampleJobs.length) * 100 : 50

  const ageScore = Math.max(0, 100 - (ageDays / TYPICAL_TIME_TO_FILL_DAYS) * 50)

  const pct = Math.round(poolScore * 0.4 + fillRateScore * 0.35 + ageScore * 0.25)

  const reasons: string[] = []
  reasons.push(candidateCount > 0
    ? `${candidateCount} candidate${candidateCount === 1 ? '' : 's'} in the pipeline`
    : 'No candidates in the pipeline yet')
  reasons.push(usedClientSample
    ? `${sampleFilled} of ${sampleJobs.length} prior jobs at ${job.client} were filled`
    : job.client
      ? `Fewer than ${MIN_CLIENT_SAMPLE} prior jobs at ${job.client} — using your tenant-wide fill rate (${sampleFilled} of ${sampleJobs.length}) instead`
      : `No client set — using your tenant-wide fill rate (${sampleFilled} of ${sampleJobs.length})`)
  reasons.push(`Open ${ageDays} day${ageDays === 1 ? '' : 's'}`)

  return { pct: Math.min(Math.max(pct, 0), 100), reasons, usedClientSample, sampleSize: sampleJobs.length }
}

// ── Recruiter matches ────────────────────────────────────────────────────────

export function computeRecruiterMatches(
  recruiters: RecruiterRow[],
  tenantJobs: TenantJobRow[],
  tenantJobCandidates: TenantJobCandidateRow[],
  tenantActivity: ActivityRow[]
) {
  const jobById = new Map(tenantJobs.map(j => [j.id, j]))

  return recruiters.map(r => {
    const ownedJobs = tenantJobs.filter(j => j.recruiter_id === r.id)
    const workload = ownedJobs.filter(j => j.status === 'open').length

    const ownedCandidateRows = tenantJobCandidates.filter(jc => jobById.get(jc.job_id)?.recruiter_id === r.id)
    const activeInterviews = ownedCandidateRows.filter(jc => jc.stage === 'interview').length
    const placements = ownedCandidateRows.filter(jc => jc.stage === 'start').length
    const placementRatio = ownedCandidateRows.length > 0 ? placements / ownedCandidateRows.length : 0

    const lastActivity = tenantActivity
      .filter(a => a.actor_id === r.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    const daysSinceActivity = lastActivity ? daysAgo(lastActivity.created_at) : null

    const workloadScore = Math.max(0, 100 - Math.min(workload, 5) * 20)
    const interviewLoadScore = Math.max(0, 100 - Math.min(activeInterviews, 10) * 10)
    const placementScore = Math.round(placementRatio * 100)
    const responseScore = daysSinceActivity === null ? 0 : Math.max(0, 100 - daysSinceActivity * 10)

    const score = Math.round((workloadScore + interviewLoadScore + placementScore + responseScore) / 4)

    const reasons: string[] = [
      workload === 0 ? 'No open jobs currently assigned' : `Currently working ${workload} open job${workload === 1 ? '' : 's'}`,
      activeInterviews > 0 ? `${activeInterviews} active interview${activeInterviews === 1 ? '' : 's'} in progress` : 'No active interviews',
      ownedCandidateRows.length > 0
        ? `Placed ${placements} of ${ownedCandidateRows.length} candidates assigned (${Math.round(placementRatio * 100)}%)`
        : 'No placement history yet',
      daysSinceActivity === null ? 'No recorded activity yet' : `Last active ${daysSinceActivity} day${daysSinceActivity === 1 ? '' : 's'} ago`,
    ]

    return {
      recruiter: r,
      workload,
      activeInterviews,
      placementCount: placements,
      placementRatio,
      daysSinceActivity,
      score,
      reasons,
      notAvailable: ['Specialty', 'Time zone', 'PTO'] as const,
    }
  }).sort((a, b) => b.score - a.score)
}

// ── Candidate categories ─────────────────────────────────────────────────────

export type CategoryCandidate = {
  candidate: TenantCandidateRow
  reason: string
  score?: number
}

export function computeCandidateCategories(
  job: JobForIntelligence,
  thisJobCandidates: { candidate_id: string; stage: string }[],
  tenantCandidates: TenantCandidateRow[],
  tenantJobCandidates: TenantJobCandidateRow[],
  tenantJobs: TenantJobRow[]
) {
  const linkedIds = new Set(thisJobCandidates.map(c => c.candidate_id))
  const jobById = new Map(tenantJobs.map(j => [j.id, j]))
  const candidateById = new Map(tenantCandidates.map(c => [c.id, c]))
  const unlinked = tenantCandidates.filter(c => !linkedIds.has(c.id))

  // Cross-job history for the same client, excluding this job.
  const clientHistoryRows = job.client
    ? tenantJobCandidates.filter(jc => {
        const j = jobById.get(jc.job_id)
        return j && j.client === job.client && j.id !== job.id
      })
    : []
  const placedAtClient = new Set(clientHistoryRows.filter(r => r.stage === 'start').map(r => r.candidate_id))
  const interviewedAtClient = new Set(
    clientHistoryRows.filter(r => (r.stage === 'interview' || r.stage === 'offer') && !placedAtClient.has(r.candidate_id)).map(r => r.candidate_id)
  )
  const submittedAtClient = new Set(
    clientHistoryRows.filter(r => r.stage === 'submitted' && !placedAtClient.has(r.candidate_id) && !interviewedAtClient.has(r.candidate_id)).map(r => r.candidate_id)
  )

  // Silver medalists: reached 'offer' on any other job, tenant-wide, never placed.
  const offeredAnywhere = new Set(
    tenantJobCandidates.filter(r => r.stage === 'offer' && r.job_id !== job.id).map(r => r.candidate_id)
  )
  const placedAnywhere = new Set(tenantJobCandidates.filter(r => r.stage === 'start').map(r => r.candidate_id))

  const claimed = new Set<string>()
  function claim(id: string) { claimed.add(id) }

  function build(ids: Set<string>, reasonFor: (id: string) => string) {
    return [...ids]
      .filter(id => !claimed.has(id) && candidateById.has(id))
      .map(id => { claim(id); return { candidate: candidateById.get(id)!, reason: reasonFor(id) } })
  }

  const previousPlacements = build(placedAtClient, () => `Previously placed at ${job.client}`)
  const previousInterviews = build(interviewedAtClient, () => `Previously interviewed at ${job.client}`)
  const submittedPreviously = build(submittedAtClient, () => `Previously submitted to ${job.client}`)
  const silverMedalists = build(
    new Set([...offeredAnywhere].filter(id => !placedAnywhere.has(id) && unlinked.some(c => c.id === id))),
    () => 'Reached offer stage on a prior job, not placed'
  )

  const scored = unlinked
    .filter(c => !claimed.has(c.id))
    .map(c => ({ candidate: c, ...matchScore({ title: job.department ?? '', department: job.department, requirements: job.requirements }, c) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)

  const strongMatches = scored.filter(r => r.score >= 70)
  strongMatches.forEach(r => claim(r.candidate.id))
  const internalMatches = scored.filter(r => r.score >= 40 && r.score < 70 && !claimed.has(r.candidate.id))
  internalMatches.forEach(r => claim(r.candidate.id))

  const recentlyActive = build(
    new Set(unlinked.filter(c => daysAgo(c.updated_at) <= 14).map(c => c.id)),
    () => 'Updated in the ATS in the last 14 days'
  )
  const passive = build(
    new Set(unlinked.filter(c => daysAgo(c.updated_at) > 90).map(c => c.id)),
    () => `No activity in over 90 days`
  )

  const rejectedPreviously: CategoryCandidate[] = [] // no rejection stage exists in the schema — see reason below

  const readyToSubmit = thisJobCandidates
    .filter(c => c.stage === 'qualified')
    .map(c => candidateById.get(c.candidate_id))
    .filter((c): c is TenantCandidateRow => !!c)
    .map(c => ({ candidate: c, reason: 'Qualified and not yet submitted' }))

  const suggestedTotal = previousPlacements.length + previousInterviews.length + strongMatches.length + internalMatches.length
  const needExternalSearchCount = Math.max(0, TYPICAL_POOL_SIZE - thisJobCandidates.length - suggestedTotal)

  return {
    readyToSubmit,
    internalMatches: internalMatches.map(r => ({ candidate: r.candidate, reason: `Keyword match: ${r.matchedTerms.slice(0, 3).join(', ') || 'partial title overlap'}`, score: r.score })),
    strongMatches: strongMatches.map(r => ({ candidate: r.candidate, reason: `Keyword match: ${r.matchedTerms.slice(0, 3).join(', ')}`, score: r.score })),
    previousPlacements,
    previousInterviews,
    silverMedalists,
    rejectedPreviously,
    submittedPreviously,
    passive,
    recentlyActive,
    needExternalSearch: {
      count: needExternalSearchCount,
      reason: needExternalSearchCount > 0
        ? `Internal pool covers ${thisJobCandidates.length + suggestedTotal} of a typical ${TYPICAL_POOL_SIZE}-candidate pipeline`
        : 'Internal pool already covers a typical pipeline size',
    },
  }
}

// ── Next best actions ────────────────────────────────────────────────────────

export type NextBestAction = { action: string; reason: string; priority: 'high' | 'medium' | 'low' }

export function computeNextBestActions(
  job: JobForIntelligence,
  candidateCount: number,
  readiness: ReturnType<typeof computeJobReadiness>,
  health: ReturnType<typeof computeJobHealth>,
  categories: ReturnType<typeof computeCandidateCategories>
): NextBestAction[] {
  const actions: NextBestAction[] = []

  if (!job.recruiter_id) {
    actions.push({ action: 'Assign a recruiter', reason: 'No recruiter is assigned to this job yet', priority: 'high' })
  }
  if (categories.readyToSubmit.length > 0) {
    actions.push({ action: 'Review candidates ready to submit', reason: `${categories.readyToSubmit.length} candidate${categories.readyToSubmit.length === 1 ? ' is' : 's are'} qualified and not yet submitted`, priority: 'high' })
  }
  if (categories.internalMatches.length > 0 || categories.strongMatches.length > 0) {
    const n = categories.internalMatches.length + categories.strongMatches.length
    actions.push({ action: 'Review internal candidates', reason: `${n} potential match${n === 1 ? '' : 'es'} found in your ATS`, priority: 'medium' })
  }
  if (candidateCount === 0 && health.ageDays > 3) {
    actions.push({ action: 'Search LinkedIn', reason: `No internal matches found after ${health.ageDays} days open`, priority: 'high' })
  }
  if (readiness.pct < 70) {
    actions.push({ action: 'Complete job details', reason: `Missing: ${readiness.unmet.slice(0, 3).join(', ')}`, priority: 'medium' })
  }
  if (health.daysSinceActivity !== null && health.daysSinceActivity > 5) {
    actions.push({ action: 'Follow up on this job', reason: `No activity in ${health.daysSinceActivity} days`, priority: 'medium' })
  }
  if (actions.length === 0) {
    actions.push({ action: 'Keep monitoring the pipeline', reason: 'Job is healthy and on track', priority: 'low' })
  }

  const order = { high: 0, medium: 1, low: 2 }
  return actions.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 4)
}
