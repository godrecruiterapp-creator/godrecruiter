'use client'

import { useState, useMemo } from 'react'
import {
  Search, Filter, CheckSquare, Square, Zap, Clock, AlertTriangle,
  ChevronRight, MoreHorizontal, User, Star, ArrowUpDown, X,
  UserPlus, RefreshCw, Eye, Sparkles, Flag, Archive, Send,
  TrendingUp, TrendingDown,
} from 'lucide-react'
import { WQ_JOBS, RECRUITERS, QUEUE_DEFS, type WQJob, type WQRecruiter } from '../_data'
import { cn } from '@/lib/utils'

// ── helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_DOT: Record<string, string> = {
  Urgent: 'bg-red-500',
  High:   'bg-orange-500',
  Medium: 'bg-blue-500',
  Low:    'bg-slate-400',
}

const STATUS_BADGE: Record<string, string> = {
  needs_assignment: 'bg-amber-100 text-amber-700',
  assigned:         'bg-blue-100 text-blue-700',
  in_progress:      'bg-violet-100 text-violet-700',
  no_activity:      'bg-orange-100 text-orange-700',
  completed:        'bg-emerald-100 text-emerald-700',
  overdue:          'bg-red-100 text-red-700',
}

const STATUS_LABEL: Record<string, string> = {
  needs_assignment: 'Needs Assignment',
  assigned:         'Assigned',
  in_progress:      'In Progress',
  no_activity:      'No Activity',
  completed:        'Completed',
  overdue:          'Overdue',
}

function slaColor(h: number) {
  if (h <= 0) return 'text-red-600'
  if (h <= 2) return 'text-red-500'
  if (h <= 8) return 'text-amber-600'
  return 'text-emerald-600'
}

function slaBg(h: number) {
  if (h <= 0) return 'bg-red-50 border-red-200'
  if (h <= 2) return 'bg-red-50 border-red-200'
  if (h <= 8) return 'bg-amber-50 border-amber-200'
  return 'bg-emerald-50 border-emerald-200'
}

function scoreColor(s: number) {
  if (s >= 85) return 'text-emerald-600'
  if (s >= 65) return 'text-amber-600'
  return 'text-red-500'
}

function getRecommendedRecruiters(job: WQJob): (WQRecruiter & { match: number; reasons: string[] })[] {
  return RECRUITERS
    .filter(r => r.availability !== 'at_capacity' && r.availability !== 'on_leave')
    .map(r => {
      const skillMatch = job.title.split(' ').some(w => r.skills.some(s => s.toLowerCase().includes(w.toLowerCase())))
      const capacityPct = 1 - r.currentJobs / r.maxJobs
      const reasons: string[] = []
      let score = 50 + Math.round(capacityPct * 20) + Math.round(r.fillRate * 0.2)
      if (skillMatch) { score += 15; reasons.push('Skill match') }
      if (r.fillRate >= 80) reasons.push(`${r.fillRate}% fill rate`)
      if (r.currentJobs <= r.maxJobs * 0.6) reasons.push('Good capacity')
      if (parseFloat(r.avgSubmitTime) <= 4) reasons.push('Fast submissions')
      reasons.push(`${r.maxJobs - r.currentJobs} slots open`)
      return { ...r, match: Math.min(99, score), reasons: reasons.slice(0, 4) }
    })
    .sort((a, b) => b.match - a.match)
    .slice(0, 3)
}

// ── components ───────────────────────────────────────────────────────────────

function JobRow({
  job,
  selected,
  checked,
  onSelect,
  onCheck,
}: {
  job: WQJob
  selected: boolean
  checked: boolean
  onSelect: () => void
  onCheck: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 border-b border-border/50 cursor-pointer transition-colors group',
        selected ? 'bg-accent' : 'hover:bg-muted/40',
      )}
    >
      {/* checkbox */}
      <button
        onClick={e => { e.stopPropagation(); onCheck() }}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        {checked ? <CheckSquare className="size-3.5 text-foreground" /> : <Square className="size-3.5" />}
      </button>

      {/* priority dot */}
      <div className={cn('size-2 rounded-full shrink-0', PRIORITY_DOT[job.priority] ?? 'bg-slate-400')} />

      {/* title + client */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium truncate">{job.title}</span>
          <span className="text-[10px] text-muted-foreground">@</span>
          <span className="text-[10px] text-muted-foreground truncate">{job.client}</span>
          {job.tags.map(t => (
            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
          <span>{job.location}</span>
          <span>·</span>
          <span>{job.type}</span>
          <span>·</span>
          <span>{job.billRate}</span>
          <span>·</span>
          <span className="text-[10px]">{job.vmsSource}</span>
        </div>
      </div>

      {/* SLA */}
      <div className={cn('hidden md:flex items-center gap-1 shrink-0 rounded px-1.5 py-0.5 border text-[10px] font-medium', slaBg(job.slaHoursLeft), slaColor(job.slaHoursLeft))}>
        <Clock className="size-2.5" />
        {job.slaHoursLeft <= 0 ? 'Overdue' : `${job.slaHoursLeft}h left`}
      </div>

      {/* assignee */}
      <div className="hidden lg:flex items-center gap-1.5 shrink-0 w-28">
        {job.assignedTo ? (
          <>
            <div className="size-5 rounded-full bg-violet-100 flex items-center justify-center text-[9px] font-bold text-violet-700 shrink-0">
              {job.assignedTo.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <span className="text-[10px] text-muted-foreground truncate">{job.assignedTo.split(' ')[0]}</span>
          </>
        ) : (
          <span className="text-[10px] text-amber-600 font-medium">Unassigned</span>
        )}
      </div>

      {/* stats */}
      <div className="hidden xl:flex items-center gap-3 shrink-0 text-[10px] text-muted-foreground">
        <span className="w-8 text-right">{job.candidatesReviewed} rev</span>
        <span className="w-6 text-right">{job.submitted} sub</span>
      </div>

      {/* ai score */}
      <div className={cn('hidden sm:block text-xs font-bold tabular-nums shrink-0 w-8 text-right', scoreColor(job.aiScore))}>
        {job.aiScore}
      </div>

      {/* status badge */}
      <span className={cn('hidden md:inline-flex text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0', STATUS_BADGE[job.status])}>
        {STATUS_LABEL[job.status]}
      </span>

      {/* quick actions (hover) */}
      <div className="hidden group-hover:flex items-center gap-1 shrink-0 ml-1">
        <button onClick={e => e.stopPropagation()} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Quick assign">
          <UserPlus className="size-3" />
        </button>
        <button onClick={e => e.stopPropagation()} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Mark urgent">
          <Flag className="size-3" />
        </button>
        <button onClick={e => e.stopPropagation()} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="More">
          <MoreHorizontal className="size-3" />
        </button>
      </div>
    </div>
  )
}

function RightPanel({ job, onClose, onAssign }: { job: WQJob; onClose: () => void; onAssign: (recruiter: string) => void }) {
  const recommendations = useMemo(() => getRecommendedRecruiters(job), [job])
  const [assignedLocal, setAssignedLocal] = useState(job.assignedTo)

  function handleAssign(name: string) {
    setAssignedLocal(name)
    onAssign(name)
  }

  return (
    <div className="w-80 shrink-0 border-l bg-background flex flex-col overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="text-xs font-semibold">Job Details</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="size-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* job header */}
        <div className="p-4 border-b">
          <div className="flex items-start gap-2 mb-2">
            <div className={cn('size-2 rounded-full shrink-0 mt-1.5', PRIORITY_DOT[job.priority] ?? 'bg-slate-400')} />
            <div>
              <h3 className="text-sm font-semibold leading-tight">{job.title}</h3>
              <p className="text-xs text-muted-foreground">{job.client}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-y-1.5 mt-3 text-[11px]">
            <span className="text-muted-foreground">Location</span><span className="font-medium">{job.location}</span>
            <span className="text-muted-foreground">Type</span><span className="font-medium">{job.type}</span>
            <span className="text-muted-foreground">Bill Rate</span><span className="font-medium text-emerald-600">{job.billRate}</span>
            <span className="text-muted-foreground">VMS</span><span className="font-medium">{job.vmsSource}</span>
            <span className="text-muted-foreground">Received</span><span className="font-medium">{job.receivedAt}</span>
          </div>
          {job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {job.tags.map(t => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* SLA + AI score */}
        <div className="grid grid-cols-2 gap-3 p-4 border-b">
          <div className={cn('rounded-lg border p-3 text-center', slaBg(job.slaHoursLeft))}>
            <Clock className={cn('size-4 mx-auto mb-1', slaColor(job.slaHoursLeft))} />
            <p className={cn('text-lg font-bold tabular-nums', slaColor(job.slaHoursLeft))}>
              {job.slaHoursLeft <= 0 ? 'OVERDUE' : `${job.slaHoursLeft}h`}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">SLA Remaining</p>
            <p className="text-[9px] text-muted-foreground">{job.slaDue}</p>
          </div>
          <div className="rounded-lg border p-3 text-center bg-muted/30">
            <Sparkles className={cn('size-4 mx-auto mb-1', scoreColor(job.aiScore))} />
            <p className={cn('text-lg font-bold tabular-nums', scoreColor(job.aiScore))}>{job.aiScore}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">AI Job Score</p>
            <p className={cn('text-[10px] font-medium', job.aiScore >= 80 ? 'text-emerald-600' : job.aiScore >= 60 ? 'text-amber-600' : 'text-red-500')}>
              {job.aiScore >= 80 ? 'High Fill Prob.' : job.aiScore >= 60 ? 'Moderate' : 'Hard to Fill'}
            </p>
          </div>
        </div>

        {/* AI score breakdown */}
        <div className="p-4 border-b">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">AI Insights</p>
          <div className="space-y-1.5">
            {job.aiScore >= 80 ? (
              <>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700"><TrendingUp className="size-3 shrink-0" />Strong existing talent pool</div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700"><TrendingUp className="size-3 shrink-0" />Preferred client relationship</div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700"><TrendingUp className="size-3 shrink-0" />High bill rate, competitive offer</div>
                {job.priority === 'Urgent' && <div className="flex items-center gap-1.5 text-[11px] text-orange-600"><Zap className="size-3 shrink-0" />Urgent requirement — act fast</div>}
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 text-[11px] text-red-600"><TrendingDown className="size-3 shrink-0" />Rare skill set required</div>
                <div className="flex items-center gap-1.5 text-[11px] text-red-600"><TrendingDown className="size-3 shrink-0" />Restrictive client requirements</div>
                {job.billRate < '$80' && <div className="flex items-center gap-1.5 text-[11px] text-amber-600"><AlertTriangle className="size-3 shrink-0" />Below-market bill rate</div>}
              </>
            )}
          </div>
        </div>

        {/* Current assignment */}
        {assignedLocal && (
          <div className="p-4 border-b">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Currently Assigned</p>
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-700">
                {assignedLocal.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <span className="text-xs font-medium">{assignedLocal}</span>
              <button className="ml-auto text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors">
                <RefreshCw className="size-2.5" />Reassign
              </button>
            </div>
          </div>
        )}

        {/* Recruiter recommendations */}
        <div className="p-4">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {assignedLocal ? 'Reassign To' : 'Recommended Recruiters'}
          </p>
          <div className="flex flex-col gap-2">
            {recommendations.map((r, i) => (
              <div key={r.id} className="rounded-lg border border-border p-3 hover:border-foreground/30 transition-colors">
                <div className="flex items-start gap-2.5">
                  <div className="relative shrink-0">
                    <div className="size-8 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold">
                      {r.initials}
                    </div>
                    {i === 0 && <Star className="size-2.5 text-amber-500 absolute -top-0.5 -right-0.5 fill-amber-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{r.name}</span>
                      <span className="text-[11px] font-bold text-emerald-600">{r.match}%</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {r.reasons.map(reason => (
                        <span key={reason} className="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground">{reason}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                      <span>{r.currentJobs}/{r.maxJobs} jobs</span>
                      <span>·</span>
                      <span>{r.fillRate}% fill</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleAssign(r.name)}
                  className={cn(
                    'mt-2.5 w-full h-7 rounded-md text-xs font-medium transition-colors',
                    assignedLocal === r.name
                      ? 'bg-emerald-600 text-white'
                      : i === 0
                        ? 'bg-foreground text-background hover:bg-foreground/90'
                        : 'border border-border hover:bg-muted/60'
                  )}
                >
                  {assignedLocal === r.name ? '✓ Assigned' : 'Assign'}
                </button>
              </div>
            ))}
          </div>

          {/* Other actions */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button className="h-7 rounded-md border border-border text-xs hover:bg-muted/60 transition-colors flex items-center justify-center gap-1">
              <Eye className="size-3" />Open Job
            </button>
            <button className="h-7 rounded-md border border-border text-xs hover:bg-muted/60 transition-colors flex items-center justify-center gap-1">
              <Send className="size-3" />View Candidates
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function QueuePage() {
  const [activeQueue, setActiveQueue] = useState('all')
  const [selectedJob, setSelectedJob] = useState<WQJob | null>(null)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [assignments, setAssignments] = useState<Record<string, string>>({})

  const queueDef = QUEUE_DEFS.find(q => q.id === activeQueue) ?? QUEUE_DEFS[0]!

  const jobs = useMemo(() => {
    const filtered = WQ_JOBS.filter(j => {
      if (!queueDef.filter(j)) return false
      if (!search) return true
      const term = search.toLowerCase()
      return j.title.toLowerCase().includes(term) ||
        j.client.toLowerCase().includes(term) ||
        j.location.toLowerCase().includes(term) ||
        (j.assignedTo ?? '').toLowerCase().includes(term)
    })
    return filtered
  }, [activeQueue, search, queueDef])

  function toggleCheck(id: string) {
    setCheckedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (checkedIds.size === jobs.length) {
      setCheckedIds(new Set())
    } else {
      setCheckedIds(new Set(jobs.map(j => j.id)))
    }
  }

  function handleAssign(recruiter: string) {
    if (!selectedJob) return
    setAssignments(prev => ({ ...prev, [selectedJob.id]: recruiter }))
  }

  const queueCounts = useMemo(() =>
    Object.fromEntries(QUEUE_DEFS.map(q => [q.id, WQ_JOBS.filter(q.filter).length])),
    []
  )

  return (
    <div className="flex h-full overflow-hidden">

      {/* LEFT — queue list */}
      <div className="w-52 shrink-0 border-r overflow-y-auto py-2">
        <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Queues</p>
        {QUEUE_DEFS.map(q => {
          const count = queueCounts[q.id] ?? 0
          const isUrgent = q.id === 'urgent' || q.id === 'overdue'
          const active = activeQueue === q.id
          return (
            <button key={q.id} onClick={() => setActiveQueue(q.id)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 text-xs transition-colors',
                active ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}>
              <span>{q.label}</span>
              {count > 0 && (
                <span className={cn('text-[10px] px-1.5 rounded-full font-medium', isUrgent && count > 0 ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground')}>
                  {count}
                </span>
              )}
            </button>
          )
        })}

        <div className="mt-2 px-3 py-1.5">
          <div className="border-t pt-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Saved Views</p>
            <button className="text-[10px] text-muted-foreground hover:text-foreground transition-colors py-1">+ Create View</button>
          </div>
        </div>
      </div>

      {/* CENTER — job list */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* toolbar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b shrink-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search jobs, clients, recruiters…"
              className="w-full h-8 pl-8 pr-3 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <button className="h-8 px-2.5 flex items-center gap-1.5 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors">
            <Filter className="size-3.5" />Filters
          </button>
          <button className="h-8 px-2.5 flex items-center gap-1.5 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors">
            <ArrowUpDown className="size-3.5" />Sort
          </button>
          <span className="text-xs text-muted-foreground ml-auto tabular-nums">{jobs.length} jobs</span>
        </div>

        {/* bulk action bar */}
        {checkedIds.size > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-foreground text-background shrink-0">
            <span className="text-xs font-medium">{checkedIds.size} selected</span>
            <div className="flex items-center gap-1.5 ml-auto">
              {[
                { label: 'Assign by AI', icon: Sparkles },
                { label: 'Assign to Team', icon: User },
                { label: 'Mark Urgent', icon: Zap },
                { label: 'Archive', icon: Archive },
              ].map(a => (
                <button key={a.label} className="h-7 px-2.5 flex items-center gap-1 text-xs rounded-md bg-background/10 hover:bg-background/20 transition-colors">
                  <a.icon className="size-3" />{a.label}
                </button>
              ))}
              <button onClick={() => setCheckedIds(new Set())} className="h-7 px-2 rounded-md hover:bg-background/20 transition-colors">
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* column header */}
        <div className="flex items-center gap-3 px-4 py-1.5 border-b bg-muted/30 shrink-0 text-[10px] text-muted-foreground">
          <button onClick={toggleAll} className="shrink-0">
            {checkedIds.size === jobs.length && jobs.length > 0
              ? <CheckSquare className="size-3.5 text-foreground" />
              : <Square className="size-3.5" />}
          </button>
          <div className="w-2 shrink-0" />
          <span className="flex-1">Job / Client</span>
          <span className="hidden md:block w-20 shrink-0">SLA</span>
          <span className="hidden lg:block w-28 shrink-0">Assignee</span>
          <span className="hidden xl:block w-20 shrink-0 text-right">Activity</span>
          <span className="hidden sm:block w-8 shrink-0 text-right">Score</span>
          <span className="hidden md:block w-28 shrink-0 text-center">Status</span>
          <div className="w-16 shrink-0" />
        </div>

        {/* job rows */}
        <div className="flex-1 overflow-y-auto">
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
              <Search className="size-8 opacity-30" />
              <p className="text-sm">No jobs in this queue</p>
            </div>
          ) : (
            jobs.map(job => (
              <JobRow
                key={job.id}
                job={{ ...job, assignedTo: assignments[job.id] ?? job.assignedTo }}
                selected={selectedJob?.id === job.id}
                checked={checkedIds.has(job.id)}
                onSelect={() => setSelectedJob(prev => prev?.id === job.id ? null : job)}
                onCheck={() => toggleCheck(job.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* RIGHT — assignment panel */}
      {selectedJob && (
        <RightPanel
          job={{ ...selectedJob, assignedTo: assignments[selectedJob.id] ?? selectedJob.assignedTo }}
          onClose={() => setSelectedJob(null)}
          onAssign={handleAssign}
        />
      )}
    </div>
  )
}
