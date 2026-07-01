'use client'

import { TrendingUp, Users, Send, CalendarCheck, Trophy, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

const FUNNEL = [
  { label: 'Total Candidates', value: 87,  pct: 100, color: 'bg-slate-400' },
  { label: 'Contacted',        value: 61,  pct: 70,  color: 'bg-blue-400' },
  { label: 'Responded',        value: 38,  pct: 44,  color: 'bg-violet-400' },
  { label: 'Submitted',        value: 24,  pct: 28,  color: 'bg-amber-400' },
  { label: 'Interviewed',      value: 9,   pct: 10,  color: 'bg-purple-400' },
  { label: 'Placed',           value: 6,   pct: 7,   color: 'bg-emerald-500' },
]

const RECRUITER_PERF = [
  { name: 'Arun Kumar', submissions: 12, interviews: 5, placements: 3, responseRate: 78 },
  { name: 'Sarah M.',   submissions: 8,  interviews: 3, placements: 2, responseRate: 65 },
  { name: 'Emily T.',   submissions: 4,  interviews: 1, placements: 1, responseRate: 80 },
]

const SOURCES = [
  { source: 'Direct Search',  count: 32, pct: 37 },
  { source: 'Indeed',         count: 18, pct: 21 },
  { source: 'LinkedIn',       count: 14, pct: 16 },
  { source: 'Referral',       count: 10, pct: 11 },
  { source: 'ATS Database',   count: 9,  pct: 10 },
  { source: 'Other',          count: 4,  pct: 5 },
]

const TOP_SKILLS = [
  { skill: 'CCRN',      count: 34 }, { skill: 'ICU',       count: 41 },
  { skill: 'BLS/ACLS',  count: 55 }, { skill: 'ER',        count: 22 },
  { skill: 'OR',        count: 18 }, { skill: 'Travel OK', count: 29 },
  { skill: 'CNOR',      count: 12 }, { skill: 'Pediatrics',count: 8 },
]

const SOURCE_COLORS = ['bg-violet-500','bg-blue-500','bg-sky-400','bg-amber-400','bg-emerald-500','bg-muted-foreground']

export default function ProjectAnalyticsPage() {
  return (
    <div className="h-full overflow-y-auto p-5">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Submission Rate',  value: '27.6%', icon: Send,          color: 'text-blue-600' },
            { label: 'Interview Rate',   value: '37.5%', icon: CalendarCheck, color: 'text-violet-600' },
            { label: 'Placement Rate',   value: '66.7%', icon: Trophy,        color: 'text-emerald-600' },
            { label: 'Response Rate',    value: '62.3%', icon: MessageSquare, color: 'text-amber-600' },
          ].map(k => {
            const Icon = k.icon
            return (
              <div key={k.label} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">{k.label}</p>
                  <Icon className={cn('size-4', k.color)} />
                </div>
                <p className="text-2xl font-bold tabular-nums">{k.value}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Candidate Funnel */}
          <div className="rounded-xl border border-border bg-background p-5">
            <h3 className="text-sm font-semibold mb-4">Candidate Funnel</h3>
            <div className="space-y-2">
              {FUNNEL.map(f => (
                <div key={f.label} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-28 shrink-0">{f.label}</span>
                  <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                    <div className={cn('h-5 rounded-full transition-all', f.color)} style={{ width: `${f.pct}%` }} />
                  </div>
                  <span className="text-sm font-semibold tabular-nums w-8 text-right shrink-0">{f.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Candidate Sources */}
          <div className="rounded-xl border border-border bg-background p-5">
            <h3 className="text-sm font-semibold mb-4">Candidate Sources</h3>
            <div className="space-y-2">
              {SOURCES.map((s, i) => (
                <div key={s.source} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-28 shrink-0">{s.source}</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div className={cn('h-3 rounded-full', SOURCE_COLORS[i] ?? 'bg-muted-foreground')} style={{ width: `${s.pct}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground tabular-nums w-8 text-right shrink-0">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recruiter Performance */}
          <div className="rounded-xl border border-border bg-background p-5">
            <h3 className="text-sm font-semibold mb-4">Recruiter Performance</h3>
            <table className="w-full">
              <thead>
                <tr>
                  {['Recruiter','Submissions','Interviews','Placements','Response %'].map(h => (
                    <th key={h} className="pb-2 text-left">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECRUITER_PERF.map(r => (
                  <tr key={r.name} className="border-t border-border">
                    <td className="py-2 text-sm font-medium">{r.name}</td>
                    <td className="py-2 text-sm tabular-nums">{r.submissions}</td>
                    <td className="py-2 text-sm tabular-nums">{r.interviews}</td>
                    <td className="py-2 text-sm font-semibold tabular-nums text-emerald-600">{r.placements}</td>
                    <td className="py-2 text-sm tabular-nums">{r.responseRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top Skills */}
          <div className="rounded-xl border border-border bg-background p-5">
            <h3 className="text-sm font-semibold mb-4">Top Skills in Project</h3>
            <div className="flex flex-wrap gap-2">
              {TOP_SKILLS.sort((a, b) => b.count - a.count).map(s => (
                <div key={s.skill} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 border border-border">
                  <span className="text-sm font-medium">{s.skill}</span>
                  <span className="text-[10px] text-muted-foreground">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
