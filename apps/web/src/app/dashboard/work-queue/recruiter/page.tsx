'use client'

import { useState } from 'react'
import { Clock, Zap, Play, ChevronRight, CheckCircle2, Send, Eye, MessageSquare, Star } from 'lucide-react'
import { WQ_JOBS, RECRUITERS, type WQJob } from '../_data'
import { cn } from '@/lib/utils'

const SECTIONS = [
  { id: 'today',    label: "Today's Queue",        filter: (j: WQJob) => j.assignedTo !== null && j.slaHoursLeft <= 12 && j.slaHoursLeft > 0 },
  { id: 'urgent',   label: 'High Priority',         filter: (j: WQJob) => j.priority === 'Urgent' && j.assignedTo !== null },
  { id: 'continue', label: 'Continue Working',      filter: (j: WQJob) => j.status === 'in_progress' },
  { id: 'recent',   label: 'Recently Assigned',     filter: (j: WQJob) => j.status === 'assigned' && j.receivedAt.includes('ago') },
  { id: 'submit',   label: 'Awaiting Submission',   filter: (j: WQJob) => j.status === 'in_progress' && j.submitted === 0 },
  { id: 'completed',label: 'Completed',             filter: (j: WQJob) => j.status === 'completed' },
]

// Simulate "current recruiter" = Arun Kumar
const ME = RECRUITERS.find(r => r.name === 'Arun Kumar') ?? RECRUITERS[0]!

const PRIORITY_DOT: Record<string, string> = {
  Urgent: 'bg-red-500', High: 'bg-orange-500', Medium: 'bg-blue-500', Low: 'bg-slate-400',
}

function slaColor(h: number) {
  if (h <= 0) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
  if (h <= 4) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800'
  return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800'
}

function JobCard({ job }: { job: WQJob }) {
  const [started, setStarted] = useState(job.status === 'in_progress')

  return (
    <div className={cn(
      'rounded-xl border bg-background p-4 hover:shadow-sm transition-shadow',
      job.priority === 'Urgent' ? 'border-orange-200' : 'border-border'
    )}>
      <div className="flex items-start gap-3">
        <div className={cn('size-2 rounded-full shrink-0 mt-1.5', PRIORITY_DOT[job.priority] ?? 'bg-slate-400')} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold leading-tight">{job.title}</h4>
              <p className="text-sm text-muted-foreground mt-0.5">{job.client} · {job.location}</p>
            </div>
            {job.priority === 'Urgent' && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-400 px-1.5 py-0.5 rounded font-medium shrink-0">
                <Zap className="size-2.5" />Urgent
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mt-3">
            <div>
              <p className="text-[10px] text-muted-foreground">Bill Rate</p>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{job.billRate}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Reviewed</p>
              <p className="text-sm font-semibold">{job.candidatesReviewed} candidates</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Submitted</p>
              <p className="text-sm font-semibold">{job.submitted}</p>
            </div>
          </div>

          {/* SLA */}
          <div className={cn('mt-3 inline-flex items-center gap-1.5 rounded px-2 py-1 border text-[11px] font-medium', slaColor(job.slaHoursLeft))}>
            <Clock className="size-3" />
            {job.slaHoursLeft <= 0
              ? 'SLA Breached — Act Now'
              : `SLA: ${job.slaHoursLeft}h remaining (${job.slaDue})`}
          </div>

          {/* AI score */}
          {job.aiScore >= 85 && (
            <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
              <Star className="size-3 fill-amber-500" />
              AI Score {job.aiScore} — High fill probability
            </div>
          )}

          {/* actions */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            {!started ? (
              <button
                onClick={() => setStarted(true)}
                className="h-7 px-3 rounded-md bg-foreground text-background text-sm flex items-center gap-1.5 hover:bg-foreground/90 transition-colors"
              >
                <Play className="size-3" />Start Working
              </button>
            ) : (
              <button className="h-7 px-3 rounded-md bg-violet-600 text-white text-sm flex items-center gap-1.5 hover:bg-violet-700 transition-colors">
                <ChevronRight className="size-3" />Continue
              </button>
            )}
            <button className="h-7 px-3 rounded-md border border-border text-sm flex items-center gap-1.5 hover:bg-muted/60 transition-colors">
              <Send className="size-3" />Submit Candidate
            </button>
            <button className="h-7 px-3 rounded-md border border-border text-sm flex items-center gap-1.5 hover:bg-muted/60 transition-colors">
              <Eye className="size-3" />View Candidates
            </button>
            <button className="h-7 px-2 rounded-md border border-border text-sm flex items-center gap-1 hover:bg-muted/60 transition-colors text-muted-foreground">
              <MessageSquare className="size-3" />Note
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RecruiterViewPage() {
  const [activeSection, setActiveSection] = useState('today')

  const myJobs = WQ_JOBS.filter(j => j.assignedTo === ME?.name)
  const capacityPct = ME ? Math.round((ME.currentJobs / ME.maxJobs) * 100) : 0

  const sectionJobs = SECTIONS.find(s => s.id === activeSection)?.filter
  const displayed = sectionJobs ? WQ_JOBS.filter(sectionJobs) : myJobs

  return (
    <div className="h-full overflow-hidden flex flex-col">
      {/* recruiter header */}
      <div className="px-6 py-4 border-b shrink-0 bg-muted/20">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="size-10 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-sm font-bold text-violet-700 dark:text-violet-400">
            {ME?.initials}
          </div>
          <div>
            <h3 className="text-sm font-semibold">{ME?.name} — My Queue</h3>
            <p className="text-sm text-muted-foreground">{ME?.avgSubmitTime} avg submit time · {ME?.fillRate}% fill rate</p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Capacity</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-24 h-1.5 rounded-full bg-border overflow-hidden">
                  <div className={cn('h-1.5 rounded-full', capacityPct >= 90 ? 'bg-red-500' : capacityPct >= 75 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${capacityPct}%` }} />
                </div>
                <span className="text-sm font-semibold tabular-nums">{ME?.currentJobs}/{ME?.maxJobs}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">My Jobs</p>
              <p className="text-lg font-bold tabular-nums">{myJobs.length}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Submitted</p>
              <p className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{myJobs.reduce((s,j)=>s+j.submitted,0)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* section nav */}
        <div className="w-48 shrink-0 border-r py-2 overflow-y-auto">
          {SECTIONS.map(s => {
            const count = WQ_JOBS.filter(s.filter).length
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-sm transition-colors',
                  activeSection === s.id ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}>
                <span>{s.label}</span>
                {count > 0 && <span className="text-[10px] bg-muted text-muted-foreground px-1.5 rounded-full">{count}</span>}
              </button>
            )
          })}
        </div>

        {/* job cards */}
        <div className="flex-1 overflow-y-auto p-4">
          {displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
              <CheckCircle2 className="size-8 opacity-30" />
              <p className="text-sm">All clear in this section</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {displayed.map(job => <JobCard key={job.id} job={job} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
