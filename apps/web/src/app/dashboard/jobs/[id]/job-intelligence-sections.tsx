'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sparkles, Check, X, ArrowRight, Loader2 } from 'lucide-react'
import { assignRecruiterAction, generateBooleanSearchAction } from '../actions'
import type {
  computeJobReadiness, computeJobHealth, computeFillProbability,
  computeRecruiterMatches, computeNextBestActions,
} from '@/lib/job-intelligence'

type Readiness = ReturnType<typeof computeJobReadiness>
type Health = ReturnType<typeof computeJobHealth>
type FillProbability = ReturnType<typeof computeFillProbability>
type RecruiterMatches = ReturnType<typeof computeRecruiterMatches>
type NextBestActions = ReturnType<typeof computeNextBestActions>

const HEALTH_DOT: Record<Health['status'], string> = {
  Healthy: 'bg-emerald-500', 'Needs Attention': 'bg-amber-500', 'At Risk': 'bg-orange-500', Critical: 'bg-red-500',
}
const HEALTH_TEXT: Record<Health['status'], string> = {
  Healthy: 'text-emerald-600 dark:text-emerald-400', 'Needs Attention': 'text-amber-600 dark:text-amber-400',
  'At Risk': 'text-orange-600 dark:text-orange-400', Critical: 'text-red-600 dark:text-red-400',
}

function ConfidenceBadge({ score }: { score: number }) {
  const cls = score >= 80
    ? 'bg-brand-muted text-brand border-brand/25'
    : score >= 60
    ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
  return <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${cls}`}>{score}%</span>
}

// ── Executive summary ────────────────────────────────────────────────────────

export function ExecutiveSummaryCard({ health, readiness, fillProbability }: {
  health: Health; readiness: Readiness; fillProbability: FillProbability
}) {
  const metrics = [
    { label: 'Fill probability', value: `${fillProbability.pct}%`, cls: 'text-foreground' },
    { label: 'Job health', value: health.status, cls: HEALTH_TEXT[health.status], small: true },
    { label: 'Job readiness', value: `${readiness.pct}%`, cls: 'text-foreground' },
  ]
  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <p className="text-lg font-semibold text-foreground mb-4">Executive summary</p>
      <div className="grid grid-cols-3 gap-4">
        {metrics.map(m => (
          <div key={m.label} className="rounded-xl border border-border bg-muted/20 p-6">
            <p className={`font-bold tabular-nums leading-none mb-2 ${m.cls} ${m.small ? 'text-2xl' : 'text-[40px]'}`}>
              {m.value}
            </p>
            <p className="text-sm font-medium text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Job intelligence (AI insights) ───────────────────────────────────────────

export function JobIntelligenceCard({ jobId, fillProbability, health, aiEnabled }: {
  jobId: string; fillProbability: FillProbability; health: Health; aiEnabled: boolean
}) {
  const reasons = [...fillProbability.reasons, ...health.reasons]
  const [pending, startTransition] = useTransition()
  const [booleanSearch, setBooleanSearch] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function generate() {
    setError(null)
    startTransition(async () => {
      const res = await generateBooleanSearchAction(jobId)
      if ('error' in res) setError(res.error)
      else setBooleanSearch(res.text)
    })
  }

  return (
    <div className="rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/40 dark:bg-purple-950/20 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="size-4 text-purple-600 dark:text-purple-400" />
        <p className="text-lg font-semibold text-purple-700 dark:text-purple-400">AI insights</p>
      </div>
      <ul className="space-y-2.5 mb-5">
        {reasons.map((r, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-foreground leading-relaxed">
            <span className="size-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
            {r}
          </li>
        ))}
      </ul>

      <Button
        size="sm"
        variant="outline"
        disabled={!aiEnabled || pending}
        title={aiEnabled ? undefined : 'AI features not configured'}
        onClick={generate}
        className="h-9 gap-2 text-sm border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950 disabled:opacity-50"
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
        Generate boolean search
      </Button>
      {error && <p className="text-sm text-destructive mt-3">{error}</p>}
      {booleanSearch && (
        <pre className="mt-3 text-sm text-foreground bg-background border border-border rounded-lg p-3 whitespace-pre-wrap break-words">{booleanSearch}</pre>
      )}
    </div>
  )
}

// ── Recommended recruiter ────────────────────────────────────────────────────

export function RecommendedRecruiterCard({ jobId, matches, currentRecruiterId }: {
  jobId: string; matches: RecruiterMatches; currentRecruiterId: string | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function assign(recruiterId: string) {
    startTransition(async () => { await assignRecruiterAction(jobId, recruiterId); router.refresh() })
  }

  if (matches.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-background p-6">
        <p className="text-lg font-semibold text-foreground mb-2">Recommended recruiter</p>
        <p className="text-sm text-muted-foreground">No recruiters found on this workspace yet.</p>
      </div>
    )
  }

  const top = matches[0]!
  const alternatives = matches.slice(1)

  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <p className="text-lg font-semibold text-foreground mb-4">Recommended recruiter</p>

      <div className="rounded-xl border border-brand/25 bg-brand-muted/40 p-5 mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 shrink-0">
              <AvatarFallback className="text-sm font-bold bg-brand-muted text-brand">
                {top.recruiter.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-base font-medium text-foreground">{top.recruiter.full_name}</p>
              {top.recruiter.id === currentRecruiterId && (
                <p className="text-xs font-medium text-brand">Currently assigned</p>
              )}
            </div>
          </div>
          <ConfidenceBadge score={top.score} />
        </div>
        <ul className="space-y-1.5 mb-4">
          {top.reasons.map((r, i) => (
            <li key={i} className="text-sm text-foreground flex items-start gap-2">
              <Check className="size-3.5 text-brand shrink-0 mt-0.5" />{r}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {top.notAvailable.map(field => (
            <span key={field} className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {field}: Not available
            </span>
          ))}
        </div>
        {top.recruiter.id !== currentRecruiterId && (
          <Button
            size="sm"
            disabled={pending}
            onClick={() => assign(top.recruiter.id)}
            className="h-9 text-sm bg-brand hover:bg-brand/90 text-white border-0 disabled:opacity-50"
          >
            Auto assign
          </Button>
        )}
      </div>

      {alternatives.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Alternative recruiters</p>
          <div className="space-y-2">
            {alternatives.slice(0, 3).map(m => (
              <div key={m.recruiter.id} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-border">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="text-xs font-bold bg-muted text-muted-foreground">
                      {m.recruiter.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground truncate">{m.recruiter.full_name}</span>
                  <ConfidenceBadge score={m.score} />
                </div>
                {m.recruiter.id !== currentRecruiterId && (
                  <button
                    disabled={pending}
                    onClick={() => assign(m.recruiter.id)}
                    className="text-sm text-foreground border border-border px-3 py-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    Assign
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Next best actions ────────────────────────────────────────────────────────

const PRIORITY_DOT: Record<NextBestActions[number]['priority'], string> = {
  high: 'bg-red-500', medium: 'bg-amber-500', low: 'bg-zinc-400',
}

export function NextBestActionsCard({ actions }: { actions: NextBestActions }) {
  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <p className="text-lg font-semibold text-foreground mb-4">Next best actions</p>
      <div className="space-y-3">
        {actions.map((a, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-lg border border-border">
            <span className={`size-2 rounded-full mt-1.5 shrink-0 ${PRIORITY_DOT[a.priority]}`} />
            <div className="min-w-0 flex-1">
              <p className="text-base font-medium text-foreground flex items-center gap-1.5">
                {a.action} <ArrowRight className="size-3.5 text-muted-foreground" />
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">{a.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Job readiness ─────────────────────────────────────────────────────────────

export function JobReadinessCard({ readiness }: { readiness: Readiness }) {
  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-lg font-semibold text-foreground">Job readiness</p>
        <span className="text-2xl font-bold tabular-nums text-foreground">{readiness.pct}%</span>
      </div>
      <Progress value={readiness.pct} className="h-2 mb-4" />
      <div className="grid grid-cols-2 gap-2.5">
        {readiness.checks.map(c => (
          <div key={c.label} className="flex items-center gap-2 text-sm">
            {c.met
              ? <Check className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              : <X className="size-3.5 text-muted-foreground shrink-0" />}
            <span className={c.met ? 'text-foreground' : 'text-muted-foreground'}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
