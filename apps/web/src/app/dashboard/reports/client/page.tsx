'use client'

import { BarChart3, Sparkles, TrendingUp, AlertTriangle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

const REPORT_CARDS = [
  { name: 'Client Activity', desc: 'Recent orders and engagement by client' },
  { name: 'Jobs by Client', desc: 'Total job orders per client' },
  { name: 'Revenue by Client', desc: 'Revenue attributed to each client' },
  { name: 'Client Response Time', desc: 'Avg days to respond to submissions' },
  { name: 'Placements by Client', desc: 'Total placements per client' },
  { name: 'Client Pipeline', desc: 'Active pipeline stages per client' },
  { name: 'Client Satisfaction', desc: 'NPS and satisfaction scores' },
  { name: 'Top Clients', desc: 'Ranked by revenue and placements' },
  { name: 'Inactive Clients', desc: 'Clients with no recent activity' },
]

const TOP_CLIENTS = [
  { client: 'Memorial Health', jobs: 14, submissions: 42, placements: 6, revenue: '$84K', status: 'Active' },
  { client: 'TechCorp Inc.', jobs: 9, submissions: 28, placements: 4, revenue: '$62K', status: 'Active' },
  { client: 'City General Hosp.', jobs: 8, submissions: 24, placements: 3, revenue: '$48K', status: 'Active' },
  { client: 'FinServ LLC', jobs: 6, submissions: 18, placements: 2, revenue: '$31K', status: 'Active' },
  { client: 'Sunrise Care', jobs: 5, submissions: 14, placements: 2, revenue: '$28K', status: 'Active' },
  { client: 'BuildRight Co.', jobs: 3, submissions: 9, placements: 1, revenue: '$14K', status: 'Inactive' },
]

const INSIGHTS = [
  'Memorial Health accounts for 32% of total revenue — highest client concentration.',
  'BuildRight Co. has had no new orders in 45 days — at-risk account.',
  'Average client response time improved to 3.1 days this month.',
  'Client retention rate is 94% — above industry average of 86%.',
]

export default function ClientReports() {
  return (
    <div className="flex flex-col h-full p-6 gap-4 overflow-y-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Client Reports</h1>
          <p className="text-sm text-muted-foreground">Monitor client activity, revenue, and relationship health</p>
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
        <p className="text-sm font-semibold mb-3">Top Clients</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b">
              <th className="pb-2 text-left font-medium">Client</th>
              <th className="pb-2 text-right font-medium">Active Jobs</th>
              <th className="pb-2 text-right font-medium">Submissions</th>
              <th className="pb-2 text-right font-medium">Placements</th>
              <th className="pb-2 text-right font-medium">Revenue</th>
              <th className="pb-2 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {TOP_CLIENTS.map((r) => (
              <tr key={r.client} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-2 font-medium">{r.client}</td>
                <td className="py-2 text-right">{r.jobs}</td>
                <td className="py-2 text-right">{r.submissions}</td>
                <td className="py-2 text-right">{r.placements}</td>
                <td className="py-2 text-right font-medium text-emerald-600">{r.revenue}</td>
                <td className="py-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${r.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>{r.status}</span>
                </td>
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
