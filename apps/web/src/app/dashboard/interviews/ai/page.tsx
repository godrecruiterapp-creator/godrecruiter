'use client'

import { Button } from '@/components/ui/button'
import {
  Sparkles, User, FileText, MessageSquare, Brain,
  Mail, AlertTriangle, Clock, TrendingUp, ArrowRight,
  Copy, Eye,
} from 'lucide-react'

const AI_FEATURES = [
  { icon: Sparkles,      title: 'AI Interview Questions',    desc: 'Generate tailored questions from job description and candidate resume' },
  { icon: User,          title: 'AI Candidate Summary',      desc: 'One-page pre-interview candidate brief for interviewers' },
  { icon: FileText,      title: 'AI Interview Brief',        desc: 'Full interview briefing pack for hiring managers and interviewers' },
  { icon: MessageSquare, title: 'AI Feedback Summary',       desc: 'Consolidate multi-interviewer feedback into a single coherent summary' },
  { icon: Brain,         title: 'AI Hiring Recommendation',  desc: 'Analyze all feedback and recommend hire / reject with reasoning' },
  { icon: Mail,          title: 'AI Email Generator',        desc: 'Generate invitation, reminder, reschedule, and cancellation emails' },
  { icon: AlertTriangle, title: 'AI No-Show Prediction',     desc: 'Predict likely no-shows from candidate engagement and response data' },
  { icon: Clock,         title: 'AI Best Interview Time',    desc: 'Recommend optimal scheduling windows based on historical data' },
  { icon: TrendingUp,    title: 'AI Sentiment Analysis',     desc: 'Analyze candidate email replies and feedback tone' },
  { icon: ArrowRight,    title: 'AI Follow-up Suggestions',  desc: 'Recommend next best action post-interview based on outcome' },
]

const RECENT = [
  { type: 'AI Interview Questions', candidate: 'Sarah Johnson',  generatedAt: '2026-06-27 09:15 AM' },
  { type: 'AI Candidate Summary',   candidate: 'James Martinez', generatedAt: '2026-06-27 08:30 AM' },
  { type: 'AI Feedback Summary',    candidate: 'Robert Kim',     generatedAt: '2026-06-26 05:00 PM' },
  { type: 'AI Email Generator',     candidate: 'Emily Chen',     generatedAt: '2026-06-26 03:45 PM' },
  { type: 'AI Interview Brief',     candidate: 'David Park',     generatedAt: '2026-06-25 11:00 AM' },
]

export default function AiInsightsPage() {
  return (
    <div className="flex flex-col h-full p-6 gap-5 overflow-y-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">AI Interview Assistant</h1>
          <p className="text-sm text-muted-foreground">Powered by Claude — AI tools for every stage of the interview process</p>
        </div>
        <span className="text-[10px] text-muted-foreground bg-muted px-3 py-1.5 rounded-full border">Powered by Claude</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {AI_FEATURES.map(f => {
          const Icon = f.icon
          return (
            <div key={f.title} className="rounded-lg border bg-card p-4 flex items-start gap-4 hover:shadow-sm transition-shadow">
              <div className="size-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                <Icon className="size-5 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{f.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5 mb-3">{f.desc}</p>
                <Button size="sm" className="h-7 text-sm">Generate</Button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm font-semibold mb-3">Recent AI Generations</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b">
              <th className="pb-2 text-left font-medium">Type</th>
              <th className="pb-2 text-left font-medium">Candidate</th>
              <th className="pb-2 text-left font-medium">Generated At</th>
              <th className="pb-2 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {RECENT.map((r, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-2 font-medium">{r.type}</td>
                <td className="py-2 text-muted-foreground">{r.candidate}</td>
                <td className="py-2 text-muted-foreground">{r.generatedAt}</td>
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 text-brand hover:underline">
                      <Eye className="size-3" />View
                    </button>
                    <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                      <Copy className="size-3" />Copy
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
