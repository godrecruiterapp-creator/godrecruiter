'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search, X, CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AutomationRun } from '../actions'

const STEP_STYLE: Record<string, { dot: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  done:    { dot: 'bg-emerald-500', text: 'text-muted-foreground', icon: CheckCircle2 },
  skipped: { dot: 'bg-amber-400',   text: 'text-amber-600',        icon: AlertCircle },
  failed:  { dot: 'bg-red-500',     text: 'text-red-600',          icon: AlertCircle },
}

const ACTION_LABELS: Record<string, string> = {
  notify_recruiter: 'Notify Recruiter', notify_manager: 'Notify Manager', send_reminder: 'Send Reminder',
  create_followup: 'Create Follow-up', create_note: 'Create Note', gen_summary: 'Generate AI Summary',
  condition: 'Conditions', timing: 'Timing',
}
const label = (id: string) => ACTION_LABELS[id] ?? id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

const RUN_BADGE: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  partial: 'bg-amber-50 text-amber-700 border-amber-200',
  skipped: 'bg-muted text-muted-foreground border-border',
  failed:  'bg-red-50 text-red-700 border-red-200',
}

export function HistoryClient({ runs }: { runs: AutomationRun[] }) {
  const [search, setSearch] = useState('')
  const filtered = runs.filter(r =>
    !search ||
    (r.automation_name?.toLowerCase().includes(search.toLowerCase())) ||
    (r.subject_label?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto">
      <div className="flex items-center justify-between pb-4 shrink-0 flex-wrap gap-3">
        <div>
          <h1 className="text-base font-semibold">History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Step-by-step timeline of every automation run.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search history…" className="h-8 w-52 pl-8 pr-7 text-sm" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {runs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Zap className="size-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No runs yet</p>
          <p className="text-sm text-muted-foreground mt-1">Turn on an automation and its runs will appear here in realtime.</p>
        </div>
      ) : (
      <div className="flex flex-col gap-6">
        {filtered.map(run => (
          <div key={run.id} className="border border-border rounded-xl overflow-hidden">
            {/* Run header */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border">
              <div>
                <p className="text-sm font-semibold">{run.automation_name ?? 'Automation'}</p>
                {run.subject_label && <p className="text-sm text-muted-foreground mt-0.5">Candidate: {run.subject_label}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide capitalize', RUN_BADGE[run.status] ?? '')}>
                  {run.status}
                </span>
                <span className="text-xs text-muted-foreground">{new Date(run.created_at).toLocaleString()}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="px-6 py-4">
              {/* Trigger row */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="size-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-foreground">
                    <Clock className="size-3 text-white" strokeWidth={2.5} />
                  </div>
                  {run.steps.length > 0 && <div className="w-px flex-1 bg-border my-1" />}
                </div>
                <div className="pb-3">
                  <span className="text-sm font-medium">Triggered</span>
                </div>
              </div>

              {run.steps.map((step, i) => {
                const style = STEP_STYLE[step.status] ?? STEP_STYLE.done!
                const Icon = style.icon
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={cn('size-5 rounded-full flex items-center justify-center shrink-0 mt-0.5', style.dot)}>
                        <Icon className="size-3 text-white" />
                      </div>
                      {i < run.steps.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                    </div>
                    <div className="pb-3">
                      <span className="text-sm font-medium">{label(step.action)}</span>
                      {step.detail && <p className={cn('text-sm mt-0.5', style.text)}>{step.detail}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  )
}
