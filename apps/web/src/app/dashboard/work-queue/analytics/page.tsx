'use client'

import { Trophy, TrendingUp, Send, CalendarCheck, Clock, Gauge, AlertCircle } from 'lucide-react'
import { RECRUITERS, WQ_JOBS } from '../_data'
import { cn } from '@/lib/utils'

const jobsByRecruiter = RECRUITERS.map(r => ({
  ...r,
  assignedJobs:    WQ_JOBS.filter(j => j.assignedTo === r.name).length,
  totalSubmissions:WQ_JOBS.filter(j => j.assignedTo === r.name).reduce((s, j) => s + j.submitted, 0),
  overdueCount:    WQ_JOBS.filter(j => j.assignedTo === r.name && j.status === 'overdue').length,
  capacityPct:     Math.round((r.currentJobs / r.maxJobs) * 100),
})).sort((a, b) => b.fillRate - a.fillRate)

const METRICS = [
  { label: 'Total Jobs in System',       value: WQ_JOBS.length,                          sub: 'across all queues',          icon: Gauge },
  { label: 'Total Submissions Today',    value: WQ_JOBS.reduce((s,j) => s+j.submitted,0),sub: 'sent to clients',            icon: Send },
  { label: 'Team Avg Fill Rate',         value: `${Math.round(RECRUITERS.reduce((s,r)=>s+r.fillRate,0)/RECRUITERS.length)}%`, sub: 'across 6 recruiters', icon: TrendingUp },
  { label: 'Avg Submission Time',        value: '4.1h',                                  sub: '↓ improving vs last week',   icon: Clock },
  { label: 'Interviews Scheduled',       value: WQ_JOBS.reduce((s,j)=>s+j.interviewed,0),sub: 'from submitted candidates',  icon: CalendarCheck },
  { label: 'Overdue Jobs',               value: WQ_JOBS.filter(j=>j.status==='overdue').length, sub: 'need immediate action',icon: AlertCircle },
]

export default function AnalyticsPage() {
  const topFiller = jobsByRecruiter[0]

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* team metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {METRICS.map(m => {
            const Icon = m.icon
            return (
              <div key={m.label} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[11px] text-muted-foreground leading-tight">{m.label}</p>
                  <Icon className="size-3.5 text-muted-foreground shrink-0" />
                </div>
                <p className="text-2xl font-bold tabular-nums">{m.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{m.sub}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Leaderboard */}
          <div className="rounded-xl border border-border bg-background p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Recruiter Leaderboard</h3>
              <span className="text-[10px] text-muted-foreground">Ranked by fill rate</span>
            </div>
            <div className="flex flex-col gap-2">
              {jobsByRecruiter.map((r, i) => (
                <div key={r.id} className="flex items-center gap-3">
                  <div className={cn(
                    'size-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                    i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-muted text-muted-foreground'
                  )}>
                    {i === 0 ? <Trophy className="size-2.5" /> : i + 1}
                  </div>
                  <div className="size-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">
                    {r.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium">{r.name}</span>
                      <span className="text-xs font-bold text-emerald-600">{r.fillRate}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${r.fillRate}%` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0 text-[10px] text-muted-foreground">
                    <p>{r.totalSubmissions} sub</p>
                    <p>{r.avgSubmitTime}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workload table */}
          <div className="rounded-xl border border-border bg-background p-5">
            <h3 className="text-sm font-semibold mb-4">Workload Distribution</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-1.5 text-[10px] font-medium text-muted-foreground">Recruiter</th>
                    <th className="text-right py-1.5 text-[10px] font-medium text-muted-foreground">Jobs</th>
                    <th className="text-right py-1.5 text-[10px] font-medium text-muted-foreground">Sub</th>
                    <th className="text-right py-1.5 text-[10px] font-medium text-muted-foreground">Cap%</th>
                    <th className="text-right py-1.5 text-[10px] font-medium text-muted-foreground">Overdue</th>
                    <th className="text-right py-1.5 text-[10px] font-medium text-muted-foreground">Avail</th>
                  </tr>
                </thead>
                <tbody>
                  {jobsByRecruiter.map(r => (
                    <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="size-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold">{r.initials}</div>
                          <span className="truncate">{r.name.split(' ')[0]}</span>
                        </div>
                      </td>
                      <td className="text-right py-2 tabular-nums">{r.currentJobs}</td>
                      <td className="text-right py-2 tabular-nums">{r.totalSubmissions}</td>
                      <td className="text-right py-2">
                        <span className={cn('font-medium tabular-nums', r.capacityPct >= 90 ? 'text-red-600' : r.capacityPct >= 75 ? 'text-amber-600' : 'text-emerald-600')}>
                          {r.capacityPct}%
                        </span>
                      </td>
                      <td className="text-right py-2">
                        <span className={cn('tabular-nums', r.overdueCount > 0 ? 'text-red-600 font-medium' : 'text-muted-foreground')}>
                          {r.overdueCount}
                        </span>
                      </td>
                      <td className="text-right py-2">
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded',
                          r.availability === 'available' ? 'bg-emerald-100 text-emerald-700' :
                          r.availability === 'at_capacity' ? 'bg-red-100 text-red-700' :
                          r.availability === 'busy' ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'
                        )}>
                          {r.availability === 'at_capacity' ? 'Full' :
                           r.availability === 'available' ? '✓' : r.availability === 'busy' ? 'Busy' : 'OOO'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Job pipeline by status */}
        <div className="rounded-xl border border-border bg-background p-5">
          <h3 className="text-sm font-semibold mb-4">Pipeline Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Needs Assignment', count: WQ_JOBS.filter(j=>j.status==='needs_assignment').length, color: 'bg-amber-500' },
              { label: 'Assigned',         count: WQ_JOBS.filter(j=>j.status==='assigned').length,         color: 'bg-blue-500' },
              { label: 'In Progress',      count: WQ_JOBS.filter(j=>j.status==='in_progress').length,      color: 'bg-violet-500' },
              { label: 'No Activity',      count: WQ_JOBS.filter(j=>j.status==='no_activity').length,      color: 'bg-orange-500' },
              { label: 'Overdue',          count: WQ_JOBS.filter(j=>j.status==='overdue').length,          color: 'bg-red-500' },
              { label: 'Completed',        count: WQ_JOBS.filter(j=>j.status==='completed').length,        color: 'bg-emerald-500' },
            ].map(s => (
              <div key={s.label} className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn('size-2 rounded-full', s.color)} />
                  <span className="text-[10px] text-muted-foreground">{s.label}</span>
                </div>
                <p className="text-2xl font-bold tabular-nums">{s.count}</p>
                <div className="h-1 rounded-full bg-muted overflow-hidden mt-2">
                  <div className={cn('h-1 rounded-full', s.color)} style={{ width: `${(s.count / WQ_JOBS.length) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top performer callout */}
        {topFiller && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 flex items-center gap-4">
            <Trophy className="size-8 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Top Performer: {topFiller.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {topFiller.fillRate}% fill rate · {topFiller.avgSubmitTime} avg submission time · {topFiller.submissions} total submissions
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
