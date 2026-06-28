'use client'

import Link from 'next/link'
import {
  Inbox, AlertCircle, UserCheck, Activity, CheckCircle2,
  Clock, Zap, Users, Timer, TrendingUp, Gauge, StickyNote,
  ArrowRight, ChevronRight,
} from 'lucide-react'
import { WQ_JOBS, RECRUITERS } from './_data'
import { cn } from '@/lib/utils'

const needsAssignment = WQ_JOBS.filter(j => j.status === 'needs_assignment').length
const overdue         = WQ_JOBS.filter(j => j.status === 'overdue').length
const urgent          = WQ_JOBS.filter(j => j.priority === 'Urgent').length
const inProgress      = WQ_JOBS.filter(j => j.status === 'in_progress').length
const completed       = WQ_JOBS.filter(j => j.status === 'completed').length
const assigned        = WQ_JOBS.filter(j => j.status === 'assigned').length
const noActivity      = WQ_JOBS.filter(j => j.status === 'no_activity').length
const atCapacity      = RECRUITERS.filter(r => r.availability === 'at_capacity').length

const KPI = [
  { label: 'Incoming Today',         value: WQ_JOBS.length, sub: '+8 from yesterday',    icon: Inbox,       color: 'text-foreground',   bg: 'bg-muted/50' },
  { label: 'Needs Assignment',       value: needsAssignment,sub: 'Waiting for recruiter', icon: AlertCircle, color: 'text-amber-600',    bg: 'bg-amber-50' },
  { label: 'Assigned',               value: assigned,       sub: 'Pending first activity',icon: UserCheck,   color: 'text-blue-600',     bg: 'bg-blue-50' },
  { label: 'In Progress',            value: inProgress,     sub: 'Actively being worked', icon: Activity,    color: 'text-violet-600',   bg: 'bg-violet-50' },
  { label: 'Completed Today',        value: completed,      sub: '5 submissions sent',    icon: CheckCircle2,color: 'text-emerald-600',  bg: 'bg-emerald-50' },
  { label: 'Overdue',                value: overdue,        sub: 'Missed SLA',            icon: Clock,       color: 'text-red-600',      bg: 'bg-red-50' },
  { label: 'Urgent Jobs',            value: urgent,         sub: 'Immediate attention',   icon: Zap,         color: 'text-orange-600',   bg: 'bg-orange-50' },
  { label: 'Waiting Capacity',       value: atCapacity,     sub: 'Recruiters at limit',   icon: Users,       color: 'text-rose-600',     bg: 'bg-rose-50' },
  { label: 'No Activity',            value: noActivity,     sub: 'Assigned but idle',     icon: Timer,       color: 'text-slate-600',    bg: 'bg-slate-50' },
  { label: 'Avg Submit Time',        value: '4.1h',         sub: '↓ 0.3h from last week', icon: TrendingUp,  color: 'text-emerald-600',  bg: 'bg-muted/50' },
  { label: 'Recruiter Utilization',  value: '74%',          sub: '6 recruiters active',   icon: Gauge,       color: 'text-foreground',   bg: 'bg-muted/50' },
  { label: 'Manager Notes',          value: '3',            sub: 'Unread',                icon: StickyNote,  color: 'text-amber-600',    bg: 'bg-muted/50' },
]

const RECENT = [
  { time: '10:42 AM', text: 'ICU RN @ Houston Methodist — assigned to Lisa Chen',       type: 'assign' },
  { time: '10:15 AM', text: 'ER Nurse @ Memorial Hermann — marked Urgent',              type: 'urgent' },
  { time: '09:55 AM', text: 'OR Nurse @ St. Luke\'s — 2 candidates submitted',         type: 'submit' },
  { time: '09:30 AM', text: 'Java Architect @ JPMorgan — SLA breached, now Overdue',   type: 'overdue' },
  { time: '08:50 AM', text: '3 new jobs received from Beeline VMS',                    type: 'incoming' },
  { time: '08:00 AM', text: 'AI Auto-Assignment ran — 4 jobs distributed',             type: 'ai' },
]

const DOT: Record<string, string> = {
  assign:   'bg-blue-500',
  urgent:   'bg-orange-500',
  submit:   'bg-emerald-500',
  overdue:  'bg-red-500',
  incoming: 'bg-violet-500',
  ai:       'bg-purple-400',
}

export default function WorkQueueOverviewPage() {
  const utilization = RECRUITERS.map(r => ({
    ...r,
    pct: Math.round((r.currentJobs / r.maxJobs) * 100),
  }))

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* KPI grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {KPI.map(k => {
            const Icon = k.icon
            return (
              <div key={k.label} className={cn('rounded-xl border border-border p-4', k.bg)}>
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[11px] text-muted-foreground leading-tight">{k.label}</p>
                  <Icon className={cn('size-3.5 shrink-0', k.color)} />
                </div>
                <p className={cn('text-2xl font-bold tabular-nums', k.color)}>{k.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</p>
              </div>
            )
          })}
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/work-queue/queue?filter=needs_assignment"
            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-md bg-amber-600 text-white hover:bg-amber-700 transition-colors">
            <AlertCircle className="size-3.5" />Assign {needsAssignment} Unassigned Jobs
          </Link>
          <Link href="/dashboard/work-queue/queue?filter=overdue"
            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors">
            <Clock className="size-3.5" />Review {overdue} Overdue Jobs
          </Link>
          <Link href="/dashboard/work-queue/queue?filter=urgent"
            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-md bg-orange-600 text-white hover:bg-orange-700 transition-colors">
            <Zap className="size-3.5" />Triage {urgent} Urgent Jobs
          </Link>
          <Link href="/dashboard/work-queue/analytics"
            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors">
            <TrendingUp className="size-3.5" />View Analytics <ChevronRight className="size-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Recruiter utilization */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-background p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Recruiter Capacity</h3>
              <Link href="/dashboard/work-queue/analytics" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors">
                Full analytics <ArrowRight className="size-3" />
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {utilization.map(r => {
                const barColor = r.pct >= 90 ? 'bg-red-500' : r.pct >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                const availBadge = r.availability === 'available' ? 'text-emerald-600' : r.availability === 'at_capacity' ? 'text-red-600' : r.availability === 'busy' ? 'text-amber-600' : 'text-muted-foreground'
                return (
                  <div key={r.id} className="flex items-center gap-3">
                    <div className="size-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">
                      {r.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{r.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={cn('text-[10px] font-medium', availBadge)}>
                            {r.availability === 'at_capacity' ? 'At Capacity' : r.availability === 'available' ? 'Available' : r.availability === 'busy' ? 'Busy' : 'On Leave'}
                          </span>
                          <span className="text-[10px] text-muted-foreground tabular-nums">{r.currentJobs}/{r.maxJobs}</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={cn('h-1.5 rounded-full transition-all', barColor)} style={{ width: `${r.pct}%` }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-muted-foreground">{r.fillRate}% fill</p>
                      <p className="text-[10px] text-muted-foreground">{r.avgSubmitTime} avg</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent activity */}
          <div className="rounded-xl border border-border bg-background p-5">
            <h3 className="text-sm font-semibold mb-4">Today&apos;s Activity</h3>
            <div className="flex flex-col gap-0">
              {RECENT.map((ev, i) => (
                <div key={i} className="flex gap-2.5">
                  <div className="flex flex-col items-center">
                    <div className={cn('size-2 rounded-full shrink-0 mt-1.5', DOT[ev.type] ?? 'bg-muted')} />
                    {i < RECENT.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                  </div>
                  <div className="pb-3 min-w-0">
                    <p className="text-xs text-foreground leading-snug">{ev.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{ev.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Manager answers */}
        <div className="rounded-xl border border-border bg-background p-5">
          <h3 className="text-sm font-semibold mb-4">Manager Snapshot — Answer These Instantly</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { q: 'New jobs today',          a: String(WQ_JOBS.length),    color: 'text-foreground' },
              { q: 'Recruiters with capacity',a: String(RECRUITERS.filter(r=>r.availability==='available').length), color: 'text-emerald-600' },
              { q: 'Overloaded recruiters',   a: String(atCapacity),        color: 'text-red-600' },
              { q: 'Untouched jobs',          a: String(needsAssignment + noActivity), color: 'text-amber-600' },
              { q: 'Close to SLA breach',     a: String(WQ_JOBS.filter(j=>j.slaHoursLeft > 0 && j.slaHoursLeft <= 4).length), color: 'text-orange-600' },
            ].map(item => (
              <div key={item.q} className="rounded-lg bg-muted/40 p-3">
                <p className="text-[10px] text-muted-foreground">{item.q}</p>
                <p className={cn('text-2xl font-bold tabular-nums mt-1', item.color)}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
