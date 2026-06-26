'use client'

import { BarChart3, Sparkles, TrendingUp, AlertTriangle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

const REPORT_CARDS = [
  { name: 'Daily Submissions', desc: 'Submission counts per day' },
  { name: 'Weekly Submissions', desc: 'Week-over-week submission trends' },
  { name: 'Monthly Submissions', desc: 'Monthly rollup and comparison' },
  { name: 'Submission by Recruiter', desc: 'Who is submitting the most' },
  { name: 'Submission by Client', desc: 'Submissions grouped by client' },
  { name: 'Submission by Job', desc: 'Submissions per job order' },
  { name: 'Submission to Interview Ratio', desc: 'Conversion from submit to interview' },
  { name: 'Submission to Offer Ratio', desc: 'Offer rate from submissions' },
  { name: 'Submission Quality', desc: 'Quality score based on progression' },
  { name: 'Rejected Submissions', desc: 'Rejection reasons and patterns' },
]

const FUNNEL = [
  { label: 'Sourced', count: 284, color: 'bg-blue-500', pct: 100 },
  { label: 'Submitted', count: 138, color: 'bg-violet-500', pct: 49 },
  { label: 'Interview', count: 43, color: 'bg-amber-500', pct: 30 },
  { label: 'Offer', count: 12, color: 'bg-orange-500', pct: 18 },
  { label: 'Placed', count: 8, color: 'bg-emerald-500', pct: 10 },
]

const TABLE = [
  { date: 'Jun 25, 2026', agent: 'Sarah Mitchell', job: 'RN – ICU', candidate: 'Maria Lopez', status: 'Active', stage: 'Interview' },
  { date: 'Jun 25, 2026', agent: 'James Patel', job: 'LPN – Med/Surg', candidate: 'Thomas Reed', status: 'Active', stage: 'Submitted' },
  { date: 'Jun 24, 2026', agent: 'Linda Choi', job: 'Software Engineer', candidate: 'Priya Singh', status: 'Active', stage: 'Offer' },
  { date: 'Jun 24, 2026', agent: 'Marcus Webb', job: 'CNA – Night', candidate: 'James Carter', status: 'Rejected', stage: 'Rejected' },
  { date: 'Jun 23, 2026', agent: 'Priya Nair', job: 'Data Analyst', candidate: 'Susan Kim', status: 'Active', stage: 'Submitted' },
  { date: 'Jun 23, 2026', agent: 'Sarah Mitchell', job: 'OR Technician', candidate: 'Brian Hall', status: 'Active', stage: 'Interview' },
  { date: 'Jun 22, 2026', agent: 'Tyler Brooks', job: 'Phlebotomist', candidate: 'Amy Chen', status: 'Active', stage: 'Placed' },
  { date: 'Jun 22, 2026', agent: 'Aisha Johnson', job: 'Project Manager', candidate: 'David Ross', status: 'Withdrawn', stage: 'Withdrawn' },
]

const INSIGHTS = [
  'Submission-to-interview ratio improved to 31% — up from 24% last month.',
  'Rejection rate for CNA submissions is 28% higher than other roles.',
  'Sarah Mitchell has the highest submission quality score at 87/100.',
  'Average time from submission to client response is 3.4 days.',
]

function stageColor(stage: string) {
  if (stage === 'Placed') return 'bg-emerald-100 text-emerald-700'
  if (stage === 'Offer') return 'bg-orange-100 text-orange-700'
  if (stage === 'Interview') return 'bg-blue-100 text-blue-700'
  if (stage === 'Rejected' || stage === 'Withdrawn') return 'bg-red-100 text-red-700'
  return 'bg-muted text-muted-foreground'
}

export default function SubmissionReports() {
  return (
    <div className="flex flex-col h-full p-6 gap-4 overflow-y-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Submission Reports</h1>
          <p className="text-sm text-muted-foreground">Track submission volume, quality, and conversion rates</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-8 text-xs border rounded-md px-2 bg-background"><option>Last 30 Days</option></select>
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
                <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                <p className="text-xs text-brand mt-2">View Report →</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Funnel */}
        <div className="rounded-lg border bg-card p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold">Submission Funnel</p>
          <div className="flex flex-col items-center gap-1.5 flex-1 justify-center">
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

        {/* Table */}
        <div className="col-span-2 rounded-lg border bg-card p-4">
          <p className="text-sm font-semibold mb-3">Recent Submissions</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground border-b">
                <th className="pb-2 text-left font-medium">Date</th>
                <th className="pb-2 text-left font-medium">Recruiter</th>
                <th className="pb-2 text-left font-medium">Job</th>
                <th className="pb-2 text-left font-medium">Candidate</th>
                <th className="pb-2 text-left font-medium">Stage</th>
              </tr>
            </thead>
            <tbody>
              {TABLE.map((r, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="py-2 text-muted-foreground">{r.date}</td>
                  <td className="py-2">{r.agent}</td>
                  <td className="py-2 font-medium">{r.job}</td>
                  <td className="py-2">{r.candidate}</td>
                  <td className="py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] ${stageColor(r.stage)}`}>{r.stage}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
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
            <button key={a} className="h-7 px-3 text-xs border border-border rounded-md hover:bg-muted transition-colors">{a}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
