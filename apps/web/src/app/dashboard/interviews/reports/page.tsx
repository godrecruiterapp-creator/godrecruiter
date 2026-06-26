'use client'

import { useState } from 'react'
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, Info, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const REPORT_CARDS = [
  { title: 'Interviews by Recruiter',      desc: 'Volume and completion rate per recruiter' },
  { title: 'Interviews by Client',         desc: 'Interview activity per client account' },
  { title: 'Interviews by Job',            desc: 'Interview funnel per open job' },
  { title: 'Interviews by Candidate',      desc: 'All interviews for each candidate' },
  { title: 'Interview Success Rate',       desc: 'Completion and offer conversion rates' },
  { title: 'Offer Conversion Rate',        desc: 'Interviews that resulted in offers' },
  { title: 'No Show Report',               desc: 'Candidates who missed interviews' },
  { title: 'Feedback Pending',             desc: 'Overdue and pending feedback by interviewer' },
  { title: 'Average Time to Schedule',     desc: 'Days from submission to interview scheduled' },
  { title: 'Interview-to-Offer Ratio',     desc: 'How many interviews lead to an offer' },
  { title: 'Recruiter Leaderboard',        desc: 'Top recruiters by interview volume and success' },
  { title: 'Hiring Manager Activity',      desc: 'Interviewer participation and feedback rates' },
]

const PERF_ROWS = [
  { name: 'Arun Kumar',    scheduled: 23, completed: 18, noShows: 2, feedbackRate: '78%', successRate: '84%' },
  { name: 'Sarah Mitchell',scheduled: 19, completed: 15, noShows: 1, feedbackRate: '82%', successRate: '79%' },
  { name: 'James Patel',   scheduled: 14, completed: 12, noShows: 0, feedbackRate: '91%', successRate: '86%' },
  { name: 'Linda Choi',    scheduled: 11, completed: 9,  noShows: 1, feedbackRate: '67%', successRate: '72%' },
  { name: 'Marcus Webb',   scheduled: 8,  completed: 7,  noShows: 0, feedbackRate: '88%', successRate: '88%' },
]

const INSIGHTS = [
  'Interview-to-offer ratio improved to 3.2:1 this month, down from 4.1:1 last month.',
  '2 recruiters have pending feedback older than 5 days — reminders recommended.',
  'Healthcare interviews have 18% higher no-show rate than IT interviews.',
  'Tuesday and Wednesday have the highest interview completion rates.',
]

const INSIGHT_ICONS = [TrendingUp, AlertTriangle, CheckCircle, Info]
const INSIGHT_COLORS = ['text-emerald-600', 'text-amber-600', 'text-emerald-600', 'text-blue-600']

const DATE_RANGES = ['Last 7d', 'Last 30d', 'Last 90d', 'Custom']

export default function InterviewReportsPage() {
  const [range, setRange] = useState('Last 30d')

  return (
    <div className="flex flex-col h-full p-6 gap-5 overflow-y-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Interview Reports</h1>
          <p className="text-sm text-muted-foreground">Analytics and insights for your interview pipeline</p>
        </div>
        <div className="flex items-center border rounded-md overflow-hidden">
          {DATE_RANGES.map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`h-8 px-3 text-xs transition-colors ${range === r ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-muted'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {REPORT_CARDS.map(c => (
          <div key={c.title} className="rounded-lg border bg-card p-4 flex items-start gap-3 hover:shadow-sm transition-shadow cursor-pointer">
            <div className="size-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0 mt-0.5">
              <BarChart3 className="size-4 text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{c.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm font-semibold mb-3">Interview Performance</p>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground border-b">
              <th className="pb-2 text-left font-medium">Recruiter</th>
              <th className="pb-2 text-right font-medium">Scheduled</th>
              <th className="pb-2 text-right font-medium">Completed</th>
              <th className="pb-2 text-right font-medium">No Shows</th>
              <th className="pb-2 text-right font-medium">Feedback Rate</th>
              <th className="pb-2 text-right font-medium">Success Rate</th>
            </tr>
          </thead>
          <tbody>
            {PERF_ROWS.map(r => (
              <tr key={r.name} className="border-b last:border-0">
                <td className="py-2 font-medium">{r.name}</td>
                <td className="py-2 text-right">{r.scheduled}</td>
                <td className="py-2 text-right">{r.completed}</td>
                <td className="py-2 text-right text-red-600">{r.noShows}</td>
                <td className="py-2 text-right">{r.feedbackRate}</td>
                <td className="py-2 text-right font-medium text-emerald-600">{r.successRate}</td>
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
          {INSIGHTS.map((insight, i) => {
            const Icon = INSIGHT_ICONS[i] ?? TrendingUp
            return (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Icon className={`size-3.5 mt-0.5 shrink-0 ${INSIGHT_COLORS[i] ?? 'text-brand'}`} />
                {insight}
              </li>
            )
          })}
        </ul>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {['Summarize','Explain Trends','Detect Anomalies','Forecast','Recommend Actions'].map(a => (
            <button key={a} className="h-7 px-3 text-xs border border-border rounded-md hover:bg-muted transition-colors">{a}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
