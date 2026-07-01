'use client'

import { BarChart3, Sparkles, TrendingUp, AlertTriangle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

const REPORT_CARDS = [
  { name: 'New Candidates', desc: 'Candidates added in selected period' },
  { name: 'Active Candidates', desc: 'Currently active in pipeline' },
  { name: 'Inactive Candidates', desc: 'Candidates with no recent activity' },
  { name: 'Candidate Source', desc: 'Where candidates are coming from' },
  { name: 'Candidate Location', desc: 'Geographic distribution' },
  { name: 'Candidate Skills', desc: 'Top skills across the database' },
  { name: 'Visa Distribution', desc: 'Work authorization breakdown' },
  { name: 'Availability', desc: 'When candidates are available to start' },
  { name: 'Candidate Pipeline', desc: 'Stage distribution across all jobs' },
  { name: 'Candidate Stage Report', desc: 'Time spent in each stage' },
  { name: 'Duplicate Candidates', desc: 'Potential duplicates needing review' },
]

const SOURCES = [
  { label: 'LinkedIn', count: 119, pct: 42 },
  { label: 'Job Boards', count: 79, pct: 28 },
  { label: 'Referral', count: 51, pct: 18 },
  { label: 'Direct', count: 34, pct: 12 },
  { label: 'Dice', count: 28, pct: 10 },
  { label: 'Monster', count: 19, pct: 7 },
  { label: 'Indeed', count: 15, pct: 5 },
  { label: 'Career Site', count: 9, pct: 3 },
]

const INSIGHTS = [
  'LinkedIn sourcing increased 24% this month — highest in Q2.',
  '31 candidates have been inactive for over 60 days and may need re-engagement.',
  'Healthcare candidates average 2.3 days from add to first submission.',
  'Referral candidates have a 3x higher placement rate than job board candidates.',
]

export default function CandidateReports() {
  return (
    <div className="flex flex-col h-full p-6 gap-4 overflow-y-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Candidate Reports</h1>
          <p className="text-sm text-muted-foreground">Understand your candidate pool, sources, and pipeline health</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-8 text-sm border rounded-md px-2 bg-background"><option>Last 30 Days</option></select>
          <Button size="sm" variant="outline" className="gap-1.5"><Download className="size-3.5" />Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {REPORT_CARDS.map((r) => (
          <div key={r.name} className="rounded-lg border bg-card p-4 hover:shadow-md hover:border-brand/30 cursor-pointer transition-all">
            <div className="flex items-start gap-3">
              <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                <BarChart3 className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{r.name}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{r.desc}</p>
                <p className="text-sm text-brand mt-2">View Report →</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm font-semibold mb-4">Candidate Source Performance</p>
        <div className="flex flex-col gap-3">
          {SOURCES.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-sm w-24 shrink-0">{s.label}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.pct}%` }} />
              </div>
              <span className="text-sm text-muted-foreground w-10 text-right">{s.count}</span>
              <span className="text-sm text-muted-foreground w-8 text-right">{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-brand/20 bg-brand-muted/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="size-4 text-brand" />
          <span className="text-sm font-semibold">AI Insights</span>
          <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Powered by Claude</span>
        </div>
        <ul className="space-y-2">
          {INSIGHTS.map((insight, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              {i === 1 ? <AlertTriangle className="size-3.5 mt-0.5 shrink-0 text-amber-600" /> : <TrendingUp className="size-3.5 mt-0.5 shrink-0 text-emerald-600" />}
              {insight}
            </li>
          ))}
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
