'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search, X, CheckCircle2, AlertCircle, Clock, Mail, Bell, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'

type HistoryEvent = {
  time: string
  label: string
  detail?: string
  type: 'trigger' | 'action' | 'check' | 'error' | 'skip'
}

type HistoryRun = {
  id: string
  automation: string
  date: string
  candidate?: string
  events: HistoryEvent[]
}

const HISTORY: HistoryRun[] = [
  {
    id: '1',
    automation: 'Auto Welcome Candidate',
    date: 'Today, 10:42 AM',
    candidate: 'Maria Lopez',
    events: [
      { time: '10:42:00', label: 'Candidate Applied',   type: 'trigger' },
      { time: '10:42:05', label: 'Only if: Job is Healthcare', detail: 'Passed — job is ICU RN',  type: 'check' },
      { time: '10:42:06', label: 'Send Email',          detail: 'Welcome email sent to maria@email.com', type: 'action' },
      { time: '10:42:07', label: 'Create Task',         detail: 'Follow-up task created for Arun Kumar', type: 'action' },
      { time: '10:42:07', label: 'Notify Recruiter',    detail: 'Arun Kumar notified via Teams', type: 'action' },
    ],
  },
  {
    id: '2',
    automation: 'Interview Reminder',
    date: 'Today, 09:15 AM',
    candidate: 'James Wilson',
    events: [
      { time: '09:15:00', label: 'Interview Scheduled', type: 'trigger' },
      { time: '09:15:02', label: 'Wait 1 day',          type: 'action' },
      { time: '09:15:03', label: 'Send Email',          detail: 'Reminder sent to james@email.com', type: 'action' },
      { time: '09:15:04', label: 'Send SMS',            detail: 'Failed — phone number missing', type: 'error' },
    ],
  },
  {
    id: '3',
    automation: 'Placement Ending Soon',
    date: 'Yesterday, 04:00 PM',
    candidate: 'Sarah Chen',
    events: [
      { time: '16:00:00', label: 'Placement End Date Near', type: 'trigger' },
      { time: '16:00:01', label: 'Notify Recruiter',    detail: 'Arun Kumar notified', type: 'action' },
      { time: '16:00:02', label: 'Create Task',         detail: 'Redeployment task created', type: 'action' },
      { time: '16:00:03', label: 'Send Email',          detail: 'Re-engagement email sent to sarah@email.com', type: 'action' },
    ],
  },
]

const EVENT_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  trigger: Clock,
  action:  CheckCircle2,
  check:   CheckCircle2,
  error:   AlertCircle,
  skip:    AlertCircle,
}

const EVENT_COLOR: Record<string, string> = {
  trigger: 'text-foreground bg-foreground',
  action:  'text-emerald-600 bg-emerald-500',
  check:   'text-blue-600 bg-blue-500',
  error:   'text-red-600 bg-red-500',
  skip:    'text-amber-600 bg-amber-400',
}

export default function HistoryPage() {
  const [search, setSearch] = useState('')

  const filtered = HISTORY.filter(h =>
    !search ||
    h.automation.toLowerCase().includes(search.toLowerCase()) ||
    (h.candidate?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto">
      <div className="flex items-center justify-between pb-4 shrink-0 flex-wrap gap-3">
        <div>
          <h1 className="text-base font-semibold">History</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Step-by-step timeline of every automation run.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search history…" className="h-8 w-52 pl-8 pr-7 text-xs" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {filtered.map(run => (
          <div key={run.id} className="border border-border rounded-xl overflow-hidden">
            {/* Run header */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border">
              <div>
                <p className="text-sm font-semibold">{run.automation}</p>
                {run.candidate && <p className="text-xs text-muted-foreground mt-0.5">Candidate: {run.candidate}</p>}
              </div>
              <span className="text-xs text-muted-foreground">{run.date}</span>
            </div>

            {/* Timeline */}
            <div className="px-6 py-4">
              {run.events.map((ev, i) => {
                const Icon = EVENT_ICON[ev.type] ?? CheckCircle2
                const colorCls = EVENT_COLOR[ev.type] ?? 'text-foreground bg-foreground'
                const [textCls, dotCls] = colorCls.split(' ')
                return (
                  <div key={i} className="flex gap-3">
                    {/* Dot + line */}
                    <div className="flex flex-col items-center">
                      <div className={cn('size-5 rounded-full flex items-center justify-center shrink-0 mt-0.5', dotCls)}>
                        <Icon className="size-3 text-white" strokeWidth={2.5} />
                      </div>
                      {i < run.events.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                    </div>
                    {/* Content */}
                    <div className={cn('pb-3', i === run.events.length - 1 ? '' : '')}>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium">{ev.label}</span>
                        <span className="text-[10px] text-muted-foreground tabular-nums">{ev.time}</span>
                      </div>
                      {ev.detail && (
                        <p className={cn('text-xs mt-0.5', ev.type === 'error' ? 'text-red-600' : 'text-muted-foreground')}>
                          {ev.detail}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
