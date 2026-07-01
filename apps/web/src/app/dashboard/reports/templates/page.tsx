'use client'

import { BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const TEMPLATES = [
  { name: 'Recruiter Performance', category: 'Recruiter', desc: 'Comprehensive recruiter activity and performance metrics with leaderboard.' },
  { name: 'Recruiter Scorecard', category: 'Recruiter', desc: 'Individual scorecard with KPIs, targets, and achievement rates.' },
  { name: 'Candidate Pipeline', category: 'Candidate', desc: 'Visual pipeline showing candidate stages from sourced to placed.' },
  { name: 'Submission Dashboard', category: 'Submission', desc: 'Daily/weekly submission tracking with funnel and conversion ratios.' },
  { name: 'Job Aging', category: 'Job', desc: 'Jobs ranked by days open with color-coded urgency indicators.' },
  { name: 'Revenue Dashboard', category: 'Financial', desc: 'Revenue, margin, bill rates, and spread trends by month.' },
  { name: 'Healthcare Compliance', category: 'Compliance', desc: 'License expiration tracker for clinical staff with alert thresholds.' },
  { name: 'Executive Dashboard', category: 'Executive', desc: 'Top-line KPIs, growth trends, and pipeline forecast for leadership.' },
  { name: 'Client Scorecard', category: 'Client', desc: 'Per-client metrics: jobs, submissions, placements, revenue, and response time.' },
  { name: 'Source Performance', category: 'Candidate', desc: 'ROI by candidate source: LinkedIn, job boards, referral, direct, and more.' },
]

const CATEGORY_COLORS: Record<string, string> = {
  Recruiter: 'bg-blue-100 text-blue-700',
  Candidate: 'bg-orange-100 text-orange-700',
  Submission: 'bg-violet-100 text-violet-700',
  Job: 'bg-amber-100 text-amber-700',
  Financial: 'bg-emerald-100 text-emerald-700',
  Compliance: 'bg-red-100 text-red-700',
  Executive: 'bg-purple-100 text-purple-700',
  Client: 'bg-cyan-100 text-cyan-700',
}

export default function ReportTemplates() {
  return (
    <div className="flex flex-col h-full p-6 gap-4 overflow-y-auto">
      <div>
        <h1 className="text-xl font-semibold">Report Templates</h1>
        <p className="text-sm text-muted-foreground">Pre-built templates to get started quickly — click "Use Template" to create a copy</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {TEMPLATES.map((t) => (
          <div key={t.name} className="rounded-lg border bg-card p-4 flex flex-col gap-3 hover:shadow-md hover:border-brand/30 transition-all">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                <BarChart3 className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{t.name}</p>
                <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] ${CATEGORY_COLORS[t.category] ?? 'bg-muted text-muted-foreground'}`}>{t.category}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{t.desc}</p>
            <Button size="sm" variant="outline" className="w-full text-sm h-7 mt-auto">Use Template</Button>
          </div>
        ))}
      </div>
    </div>
  )
}
