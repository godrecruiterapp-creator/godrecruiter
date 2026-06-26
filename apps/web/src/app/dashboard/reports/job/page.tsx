'use client'

import { BarChart3, Sparkles, TrendingUp, AlertTriangle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

const REPORT_CARDS = [
  { name: 'Open Jobs', desc: 'All currently open job orders' },
  { name: 'Closed Jobs', desc: 'Jobs closed in selected period' },
  { name: 'Filled Jobs', desc: 'Jobs successfully filled with placements' },
  { name: 'Jobs by Client', desc: 'Job distribution across clients' },
  { name: 'Jobs by Recruiter', desc: 'Assignments per recruiter' },
  { name: 'Jobs by Priority', desc: 'Priority tier breakdown' },
  { name: 'Job Aging', desc: 'Days open for each active job' },
  { name: 'Job Pipeline', desc: 'Pipeline stage view for all jobs' },
  { name: 'Time to Fill', desc: 'Average days from open to placement' },
  { name: 'Jobs Without Submissions', desc: 'Jobs with no candidate activity' },
  { name: 'Jobs Without Activity', desc: 'Stale jobs needing attention' },
  { name: 'Hot Jobs', desc: 'High-priority or fast-moving roles' },
]

const AGING = [
  { id: 'JO-1042', title: 'RN – ICU', client: 'Memorial Health', days: 47, status: 'Open', priority: 'High', recruiter: 'Sarah Mitchell' },
  { id: 'JO-1038', title: 'LPN – Med/Surg', client: 'City General', days: 34, status: 'Open', priority: 'High', recruiter: 'James Patel' },
  { id: 'JO-1051', title: 'Software Engineer', client: 'TechCorp Inc.', days: 28, status: 'Open', priority: 'Medium', recruiter: 'Linda Choi' },
  { id: 'JO-1029', title: 'CNA – Night Shift', client: 'Sunrise Care', days: 22, status: 'Open', priority: 'Medium', recruiter: 'Marcus Webb' },
  { id: 'JO-1056', title: 'Data Analyst', client: 'FinServ LLC', days: 18, status: 'Open', priority: 'Low', recruiter: 'Priya Nair' },
  { id: 'JO-1061', title: 'OR Technician', client: 'Regional Hosp.', days: 14, status: 'Open', priority: 'High', recruiter: 'Sarah Mitchell' },
  { id: 'JO-1067', title: 'Phlebotomist', client: 'Lab Partners', days: 9, status: 'Open', priority: 'Low', recruiter: 'Tyler Brooks' },
  { id: 'JO-1072', title: 'Project Manager', client: 'BuildRight Co.', days: 5, status: 'Open', priority: 'Medium', recruiter: 'Linda Choi' },
]

const INSIGHTS = [
  'Job JO-1042 (RN – ICU) has been open 47 days — escalation recommended.',
  '4 jobs have had no submissions in the past 10 days.',
  'Healthcare roles fill 28% slower than IT roles on average this quarter.',
  'Time to Fill improved by 2 days compared to last month.',
]

function agingColor(days: number) {
  if (days >= 30) return 'text-red-600 font-semibold'
  if (days >= 15) return 'text-amber-600 font-semibold'
  return 'text-muted-foreground'
}

export default function JobReports() {
  return (
    <div className="flex flex-col h-full p-6 gap-4 overflow-y-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Job Reports</h1>
          <p className="text-sm text-muted-foreground">Analyze job orders, aging, pipeline, and fill rates</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-8 text-xs border rounded-md px-2 bg-background"><option>Last 30 Days</option><option>Last 7 Days</option></select>
          <select className="h-8 text-xs border rounded-md px-2 bg-background"><option>All Clients</option></select>
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

      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm font-semibold mb-3">Job Aging Report</p>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground border-b">
              <th className="pb-2 text-left font-medium">Job ID</th>
              <th className="pb-2 text-left font-medium">Job Title</th>
              <th className="pb-2 text-left font-medium">Client</th>
              <th className="pb-2 text-right font-medium">Days Open</th>
              <th className="pb-2 text-left font-medium">Status</th>
              <th className="pb-2 text-left font-medium">Priority</th>
              <th className="pb-2 text-left font-medium">Recruiter</th>
            </tr>
          </thead>
          <tbody>
            {AGING.map((r) => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-2 text-muted-foreground font-mono">{r.id}</td>
                <td className="py-2 font-medium">{r.title}</td>
                <td className="py-2 text-muted-foreground">{r.client}</td>
                <td className={`py-2 text-right ${agingColor(r.days)}`}>{r.days}d</td>
                <td className="py-2"><span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700">{r.status}</span></td>
                <td className="py-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${r.priority === 'High' ? 'bg-red-100 text-red-700' : r.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'}`}>{r.priority}</span>
                </td>
                <td className="py-2 text-muted-foreground">{r.recruiter}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
              {i % 2 === 1 ? <AlertTriangle className="size-3.5 mt-0.5 shrink-0 text-amber-600" /> : <TrendingUp className="size-3.5 mt-0.5 shrink-0 text-emerald-600" />}
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
