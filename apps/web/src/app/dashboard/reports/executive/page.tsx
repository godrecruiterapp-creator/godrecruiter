'use client'

import { BarChart3, Sparkles, TrendingUp, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

const REPORT_CARDS = [
  { name: 'Business Overview', desc: 'High-level business performance summary' },
  { name: 'Growth Trend', desc: 'Month-over-month and YoY growth' },
  { name: 'Placements', desc: 'Total placements and fill rate trends' },
  { name: 'Revenue', desc: 'Revenue and margin executive summary' },
  { name: 'Recruiter Performance', desc: 'Team performance overview' },
  { name: 'Department Performance', desc: 'Metrics by department or specialty' },
  { name: 'Source ROI', desc: 'Return on investment per candidate source' },
  { name: 'Client Growth', desc: 'Client acquisition and retention' },
  { name: 'Forecast', desc: 'Revenue and placement forecast' },
  { name: 'Pipeline Forecast', desc: 'Expected placements from current pipeline' },
]

const KPIS = [
  { label: 'Total Placements', value: '847', delta: '+12% YoY' },
  { label: 'Total Revenue', value: '$2.8M', delta: '+18% YoY' },
  { label: 'Fill Rate', value: '68%', delta: '+4% vs Q1' },
  { label: 'Time to Fill', value: '18d', delta: '-2d vs Q1' },
  { label: 'Client Retention', value: '94%', delta: 'Industry avg: 86%' },
]

const FUNNEL = [
  { label: 'Sourced', count: 284, color: 'bg-blue-500', pct: 100 },
  { label: 'Submitted', count: 138, color: 'bg-violet-500', pct: 49 },
  { label: 'Interview', count: 43, color: 'bg-amber-500', pct: 30 },
  { label: 'Offer', count: 12, color: 'bg-orange-500', pct: 18 },
  { label: 'Placed', count: 8, color: 'bg-emerald-500', pct: 10 },
]

const INSIGHTS = [
  'Revenue pacing 18% ahead of the same period last year — on track for $3.2M annual target.',
  'Fill rate improvement driven by healthcare specialties — IT fill rate still lagging at 51%.',
  'Client retention at 94% confirms strong relationship management across the team.',
  'Pipeline forecast projects 22 additional placements in the next 45 days.',
]

export default function ExecutiveReports() {
  return (
    <div className="flex flex-col h-full p-6 gap-4 overflow-y-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Executive Reports</h1>
          <p className="text-sm text-muted-foreground">Top-line performance, growth trends, and strategic metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-8 text-xs border rounded-md px-2 bg-background"><option>YTD 2026</option><option>Last Quarter</option></select>
          <Button size="sm" variant="outline" className="gap-1.5"><Download className="size-3.5" />Export</Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-5 gap-4">
        {KPIS.map((k) => (
          <div key={k.label} className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="text-2xl font-bold mt-1">{k.value}</p>
            <p className="text-xs text-emerald-600 mt-0.5">{k.delta}</p>
          </div>
        ))}
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
                <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                <p className="text-xs text-brand mt-2">View Report →</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Growth Trend */}
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-semibold mb-3">Business Growth Trend</p>
          <div className="h-48 bg-muted/40 rounded-lg flex items-center justify-center text-xs text-muted-foreground text-center px-4">
            Monthly revenue and placement trend — chart visualization coming soon
          </div>
        </div>

        {/* Pipeline Forecast Funnel */}
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-semibold mb-3">Pipeline Forecast</p>
          <div className="flex flex-col items-center gap-1.5">
            {FUNNEL.map((f) => (
              <div key={f.label} className="w-full flex flex-col items-center gap-0.5">
                <div className={`${f.color} rounded h-7 flex items-center justify-center text-xs font-medium text-white`} style={{ width: `${f.pct}%` }}>
                  {f.count}
                </div>
                <span className="text-[10px] text-muted-foreground">{f.label}</span>
              </div>
            ))}
          </div>
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
              <TrendingUp className="size-3.5 mt-0.5 shrink-0 text-emerald-600" />
              {insight}
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {['Summarize', 'Explain Trends', 'Detect Anomalies', 'Forecast', 'Recommend Actions'].map((a) => (
            <button key={a} className="h-7 px-3 text-xs border border-border rounded-md hover:bg-muted transition-colors">{a}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
