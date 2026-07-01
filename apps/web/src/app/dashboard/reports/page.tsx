'use client'

import { useState } from 'react'
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, Info, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

const KPIS = [
  { label: 'Active Jobs', value: '47', delta: '+3 this week', positive: true },
  { label: 'Candidates Added', value: '284', delta: '+22 today', positive: true },
  { label: 'Submissions', value: '138', delta: '+8 today', positive: true },
  { label: 'Interviews', value: '43', delta: '+5 this week', positive: true },
  { label: 'Offers', value: '12', delta: '+2 this week', positive: true },
  { label: 'Placements', value: '8', delta: '+1 today', positive: true },
  { label: 'Revenue', value: '$148K', delta: '+$12K this week', positive: true },
  { label: 'Time to Fill', value: '18d', delta: '-2d vs last month', positive: true },
  { label: 'Fill Rate', value: '68%', delta: '+4% vs last month', positive: true },
  { label: 'Open Jobs', value: '34', delta: '—', positive: null },
]

const FUNNEL = [
  { label: 'Sourced', count: 284, color: 'bg-blue-500', pct: 100 },
  { label: 'Submitted', count: 138, color: 'bg-violet-500', pct: 49 },
  { label: 'Interview', count: 43, color: 'bg-amber-500', pct: 30 },
  { label: 'Offer', count: 12, color: 'bg-orange-500', pct: 18 },
  { label: 'Placed', count: 8, color: 'bg-emerald-500', pct: 10 },
]

const LEADERBOARD = [
  { rank: 1, name: 'Sarah Mitchell', submissions: 38, placements: 4, score: 94 },
  { rank: 2, name: 'James Patel', submissions: 31, placements: 3, score: 88 },
  { rank: 3, name: 'Linda Choi', submissions: 27, placements: 2, score: 79 },
  { rank: 4, name: 'Marcus Webb', submissions: 24, placements: 2, score: 74 },
  { rank: 5, name: 'Priya Nair', submissions: 18, placements: 1, score: 63 },
]

const SOURCES = [
  { label: 'LinkedIn', pct: 42 },
  { label: 'Job Boards', pct: 28 },
  { label: 'Referral', pct: 18 },
  { label: 'Direct', pct: 12 },
]

const INSIGHTS = [
  'Submission rate increased by 18% compared to last week — driven by 3 recruiters.',
  'Texas generated the highest number of placements this month (32% of total).',
  'Healthcare jobs remain open 32% longer than IT jobs on average.',
  '3 recruiters have not submitted candidates in the past 5 days — action recommended.',
]

const INSIGHT_ICONS = [TrendingUp, AlertTriangle, CheckCircle, Info]
const INSIGHT_COLORS = ['text-emerald-600', 'text-amber-600', 'text-emerald-600', 'text-blue-600']

const DATE_RANGES = ['Last 7d', 'Last 30d', 'Last 90d', 'Custom']

export default function ReportsDashboard() {
  const [range, setRange] = useState('Last 30d')

  return (
    <div className="flex flex-col h-full p-6 gap-5 overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Reports</h1>
          <p className="text-sm text-muted-foreground">Your recruiting performance at a glance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md overflow-hidden">
            {DATE_RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`h-8 px-3 text-sm transition-colors ${range === r ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-muted'}`}
              >
                {r}
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Download className="size-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-5 gap-4">
        {KPIS.slice(0, 5).map((k) => (
          <div key={k.label} className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">{k.label}</p>
            <p className="text-2xl font-bold mt-1">{k.value}</p>
            <p className={`text-sm mt-0.5 ${k.positive === true ? 'text-emerald-600' : k.positive === false ? 'text-red-600' : 'text-muted-foreground'}`}>{k.delta}</p>
          </div>
        ))}
      </div>

      {/* KPI Cards Row 2 */}
      <div className="grid grid-cols-5 gap-4">
        {KPIS.slice(5, 10).map((k) => (
          <div key={k.label} className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">{k.label}</p>
            <p className="text-2xl font-bold mt-1">{k.value}</p>
            <p className={`text-sm mt-0.5 ${k.positive === true ? 'text-emerald-600' : k.positive === false ? 'text-red-600' : 'text-muted-foreground'}`}>{k.delta}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-3 gap-4">
        {/* Activity Overview */}
        <div className="col-span-2 rounded-lg border bg-card p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Activity Overview</p>
            <div className="flex items-center gap-1">
              {['Line', 'Bar'].map((t) => (
                <button key={t} className="h-6 px-2.5 text-sm border rounded hover:bg-muted transition-colors">{t}</button>
              ))}
            </div>
          </div>
          <div className="h-56 bg-muted/40 rounded-lg flex items-center justify-center text-sm text-muted-foreground text-center px-4">
            Daily submissions, interviews and placements — chart visualization coming soon
          </div>
        </div>

        {/* Submission Funnel */}
        <div className="rounded-lg border bg-card p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold">Submission Funnel</p>
          <div className="flex flex-col items-center gap-1.5 flex-1 justify-center">
            {FUNNEL.map((f) => (
              <div key={f.label} className="w-full flex flex-col items-center gap-0.5">
                <div
                  className={`${f.color} rounded h-7 flex items-center justify-center text-sm font-medium text-white`}
                  style={{ width: `${f.pct}%` }}
                >
                  {f.count}
                </div>
                <span className="text-[10px] text-muted-foreground">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard + Source Performance */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 rounded-lg border bg-card p-4">
          <p className="text-sm font-semibold mb-3">Recruiter Leaderboard</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b">
                <th className="pb-2 text-left font-medium">Rank</th>
                <th className="pb-2 text-left font-medium">Recruiter</th>
                <th className="pb-2 text-right font-medium">Submissions</th>
                <th className="pb-2 text-right font-medium">Placements</th>
                <th className="pb-2 text-right font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {LEADERBOARD.map((r) => (
                <tr key={r.rank} className="border-b last:border-0">
                  <td className="py-2 text-muted-foreground">#{r.rank}</td>
                  <td className="py-2 font-medium">{r.name}</td>
                  <td className="py-2 text-right">{r.submissions}</td>
                  <td className="py-2 text-right">{r.placements}</td>
                  <td className="py-2 text-right font-medium text-emerald-600">{r.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-semibold mb-3">Source Performance</p>
          <div className="flex flex-col gap-3">
            {SOURCES.map((s) => (
              <div key={s.label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{s.label}</span>
                  <span className="text-muted-foreground">{s.pct}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="rounded-lg border border-brand/20 bg-brand-muted/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="size-4 text-brand" />
          <span className="text-sm font-semibold">AI Insights</span>
          <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Powered by Claude</span>
        </div>
        <ul className="space-y-2">
          {INSIGHTS.map((insight, i) => {
            const Icon = INSIGHT_ICONS[i] ?? TrendingUp
            return (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Icon className={`size-3.5 mt-0.5 shrink-0 ${INSIGHT_COLORS[i]}`} />
                {insight}
              </li>
            )
          })}
        </ul>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {['Summarize', 'Explain Trends', 'Detect Anomalies', 'Forecast', 'Recommend Actions'].map((a) => (
            <button key={a} className="h-7 px-3 text-sm border border-border rounded-md hover:bg-muted transition-colors">{a}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
