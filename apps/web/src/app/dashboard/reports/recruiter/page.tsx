'use client'

import { BarChart3, Sparkles, TrendingUp, AlertTriangle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

const REPORT_CARDS = [
  { name: 'Recruiter Activity', desc: 'Daily and weekly activity by recruiter' },
  { name: 'Recruiter Performance', desc: 'Overall performance metrics per recruiter' },
  { name: 'Calls Made', desc: 'Outbound call tracking by recruiter' },
  { name: 'Emails Sent', desc: 'Email volume and open rates' },
  { name: 'SMS Sent', desc: 'Text message activity report' },
  { name: 'Candidates Added', desc: 'New candidates sourced by recruiter' },
  { name: 'Candidates Submitted', desc: 'Submission counts and rates' },
  { name: 'Interviews Scheduled', desc: 'Interview scheduling efficiency' },
  { name: 'Offers', desc: 'Offer extension tracking' },
  { name: 'Placements', desc: 'Placement counts and revenue attributed' },
  { name: 'Time to Submit', desc: 'Speed from order to first submission' },
  { name: 'Average Response Time', desc: 'Candidate response time tracking' },
  { name: 'Recruiter Scorecard', desc: 'Composite scorecard per recruiter' },
  { name: 'Recruiter Leaderboard', desc: 'Ranked view of all recruiters' },
]

const LEADERBOARD = [
  { rank: 1, name: 'Sarah Mitchell', calls: 142, emails: 318, submissions: 38, interviews: 14, placements: 4, score: 94 },
  { rank: 2, name: 'James Patel', calls: 128, emails: 274, submissions: 31, interviews: 11, placements: 3, score: 88 },
  { rank: 3, name: 'Linda Choi', calls: 115, emails: 241, submissions: 27, interviews: 9, placements: 2, score: 79 },
  { rank: 4, name: 'Marcus Webb', calls: 104, emails: 198, submissions: 24, interviews: 8, placements: 2, score: 74 },
  { rank: 5, name: 'Priya Nair', calls: 89, emails: 163, submissions: 18, interviews: 6, placements: 1, score: 63 },
  { rank: 6, name: 'Tyler Brooks', calls: 76, emails: 142, submissions: 14, interviews: 4, placements: 1, score: 57 },
  { rank: 7, name: 'Aisha Johnson', calls: 61, emails: 118, submissions: 11, interviews: 3, placements: 0, score: 44 },
  { rank: 8, name: 'Kevin Tran', calls: 44, emails: 87, submissions: 8, interviews: 2, placements: 0, score: 31 },
]

const INSIGHTS = [
  'Sarah Mitchell leads with 38 submissions — 23% above team average.',
  '3 recruiters have not made any submissions in the last 5 days.',
  'Call-to-submission ratio improved by 12% this month across the team.',
  'Recruiter response times average 4.2 hours — within target range.',
]

export default function RecruiterReports() {
  return (
    <div className="flex flex-col h-full p-6 gap-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Recruiter Reports</h1>
          <p className="text-sm text-muted-foreground">Track recruiter activity, performance, and productivity</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-8 text-xs border rounded-md px-2 bg-background">
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>Last 90 Days</option>
          </select>
          <select className="h-8 text-xs border rounded-md px-2 bg-background">
            <option>All Recruiters</option>
            <option>Sarah Mitchell</option>
            <option>James Patel</option>
          </select>
          <select className="h-8 text-xs border rounded-md px-2 bg-background">
            <option>All Departments</option>
            <option>Healthcare</option>
            <option>IT</option>
          </select>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Download className="size-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Report Cards Grid */}
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

      {/* Leaderboard Table */}
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm font-semibold mb-3">Recruiter Leaderboard</p>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground border-b">
              <th className="pb-2 text-left font-medium">Rank</th>
              <th className="pb-2 text-left font-medium">Recruiter</th>
              <th className="pb-2 text-right font-medium">Calls</th>
              <th className="pb-2 text-right font-medium">Emails</th>
              <th className="pb-2 text-right font-medium">Submissions</th>
              <th className="pb-2 text-right font-medium">Interviews</th>
              <th className="pb-2 text-right font-medium">Placements</th>
              <th className="pb-2 text-right font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {LEADERBOARD.map((r) => (
              <tr key={r.rank} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-2 text-muted-foreground">#{r.rank}</td>
                <td className="py-2 font-medium">{r.name}</td>
                <td className="py-2 text-right">{r.calls}</td>
                <td className="py-2 text-right">{r.emails}</td>
                <td className="py-2 text-right">{r.submissions}</td>
                <td className="py-2 text-right">{r.interviews}</td>
                <td className="py-2 text-right">{r.placements}</td>
                <td className="py-2 text-right font-medium text-emerald-600">{r.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Insights */}
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
