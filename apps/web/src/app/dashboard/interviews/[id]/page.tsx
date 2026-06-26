'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft, Sparkles, PenLine, Bell, RefreshCw, XCircle,
  Mail, CheckCircle, Eye, ExternalLink, TrendingUp, AlertTriangle,
  FileText, User, ClipboardList, Calendar,
} from 'lucide-react'

// Mock data for INT-0001 / Sarah Johnson
const INTERVIEW = {
  id: '1',
  interview_id: 'INT-0001',
  candidate: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  phone: '+1 (555) 234-5678',
  job: 'Senior Java Developer',
  client: 'TechCorp Inc',
  type: 'Technical Interview',
  round: 'Round 2',
  date: 'June 28, 2026',
  time: '10:00 AM',
  duration: '60 min',
  mode: 'Zoom',
  meetingLink: 'https://zoom.us/j/123456789',
  timezone: 'EST',
  status: 'scheduled',
  createdBy: 'Arun Kumar',
  createdAt: 'June 25, 2026',
  stage: 'Interview Stage',
}

const PARTICIPANTS = [
  { name: 'Arun Kumar', role: 'Recruiter', initials: 'AK' },
  { name: 'Mike Chen',  role: 'Interviewer', initials: 'MC' },
  { name: 'Sarah Johnson', role: 'Candidate', initials: 'SJ' },
]

const NOTES = [
  { author: 'Arun Kumar', time: 'Jun 25, 2026 · 10:30 AM', text: 'Candidate has strong Java background. Focus on system design for this round.' },
  { author: 'Mike Chen', time: 'Jun 26, 2026 · 2:15 PM', text: 'Will cover microservices and AWS. Please ensure candidate has IDE access.' },
]

const COMM_HISTORY = [
  { icon: Mail,        label: 'Invitation Sent',     time: 'Jun 25, 2026 · 9:00 AM',   color: 'text-blue-600' },
  { icon: Eye,         label: 'Email Opened',         time: 'Jun 25, 2026 · 9:28 AM',   color: 'text-emerald-600' },
  { icon: CheckCircle, label: 'Interview Confirmed',  time: 'Jun 26, 2026 · 10:00 AM',  color: 'text-emerald-600' },
  { icon: Bell,        label: 'Reminder Sent',        time: 'Jun 27, 2026 · 9:00 AM',   color: 'text-amber-600' },
]

const ACTIVITY_LOG = [
  { text: 'Interview scheduled by Arun Kumar',       time: 'Jun 25, 2026 · 9:00 AM' },
  { text: 'Invitation email sent to Sarah Johnson',  time: 'Jun 25, 2026 · 9:01 AM' },
  { text: 'Email opened by candidate',               time: 'Jun 25, 2026 · 9:28 AM' },
  { text: 'Candidate confirmed attendance',          time: 'Jun 26, 2026 · 10:00 AM' },
  { text: '24-hour reminder sent',                   time: 'Jun 27, 2026 · 9:00 AM' },
]

const AI_INSIGHTS = [
  { icon: TrendingUp,    text: 'Candidate has 94% match score for this role', color: 'text-emerald-600' },
  { icon: CheckCircle,   text: 'Sarah opened the invitation within 30 minutes — high engagement', color: 'text-emerald-600' },
  { icon: AlertTriangle, text: 'Similar profiles have 78% offer acceptance rate', color: 'text-amber-600' },
  { icon: Sparkles,      text: 'Recommend focusing on AWS experience during technical round', color: 'text-brand' },
]

const STATUS_BADGE: Record<string, string> = {
  scheduled:   'bg-blue-50 text-blue-700 border-blue-200',
  confirmed:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed:   'bg-slate-100 text-slate-600 border-slate-200',
  cancelled:   'bg-red-50 text-red-700 border-red-200',
  rescheduled: 'bg-amber-50 text-amber-700 border-amber-200',
}

export default function InterviewDetailPage() {
  const [noteText, setNoteText] = useState('')

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b shrink-0">
        <Link href="/dashboard/interviews/all"
          className="size-8 flex items-center justify-center rounded-md border hover:bg-muted transition-colors">
          <ArrowLeft className="size-4" />
        </Link>
        <span className="text-xs font-mono text-muted-foreground border rounded px-2 py-0.5">{INTERVIEW.interview_id}</span>
        <h1 className="text-base font-semibold flex-1 truncate">
          {INTERVIEW.candidate} – {INTERVIEW.job}
        </h1>
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[INTERVIEW.status] ?? ''}`}>
          {INTERVIEW.status}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5"><PenLine className="size-3.5" />Edit</Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5"><Bell className="size-3.5" />Remind</Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5"><RefreshCw className="size-3.5" />Reschedule</Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-destructive hover:text-destructive"><XCircle className="size-3.5" />Cancel</Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left column */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Interview Overview */}
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm font-semibold mb-3">Interview Overview</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
              {[
                { label: 'Interview Type', value: INTERVIEW.type },
                { label: 'Round', value: INTERVIEW.round },
                { label: 'Date & Time', value: `${INTERVIEW.date} at ${INTERVIEW.time}` },
                { label: 'Duration', value: INTERVIEW.duration },
                { label: 'Mode', value: INTERVIEW.mode },
                { label: 'Time Zone', value: INTERVIEW.timezone },
                { label: 'Created By', value: INTERVIEW.createdBy },
                { label: 'Created At', value: INTERVIEW.createdAt },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-xs text-muted-foreground">{f.label}</p>
                  {f.label === 'Date & Time' || f.label === 'Mode' || f.label === 'Meeting Link' ? (
                    <p className="text-sm font-medium mt-0.5">{f.value}</p>
                  ) : (
                    <p className="text-sm font-medium mt-0.5">{f.value}</p>
                  )}
                </div>
              ))}
              <div>
                <p className="text-xs text-muted-foreground">Meeting Link</p>
                <a href={INTERVIEW.meetingLink} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-brand hover:underline flex items-center gap-1 mt-0.5">
                  Join Meeting <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm font-semibold mb-3">Participants</p>
            <div className="flex flex-col gap-2.5">
              {PARTICIPANTS.map(p => (
                <div key={p.name} className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-brand/10 flex items-center justify-center text-brand text-xs font-semibold shrink-0">
                    {p.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <span className="text-xs text-muted-foreground">{p.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm font-semibold mb-3">Interview Notes</p>
            <div className="space-y-3 mb-3">
              {NOTES.map((n, i) => (
                <div key={i} className="bg-muted/40 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{n.author}</span>
                    <span className="text-[10px] text-muted-foreground">{n.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{n.text}</p>
                </div>
              ))}
            </div>
            <Textarea value={noteText} onChange={e => setNoteText(e.target.value)}
              placeholder="Add a note…" className="resize-none h-20 text-sm mb-2" />
            <Button size="sm" className="h-8">Add Note</Button>
          </div>

          {/* Feedback */}
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm font-semibold mb-3">Feedback</p>
            <div className="flex items-center gap-3 py-2 text-sm text-muted-foreground">
              <AlertTriangle className="size-4 text-amber-500 shrink-0" />
              Feedback pending — send a reminder to the interviewer
              <Button variant="outline" size="sm" className="h-7 text-xs ml-auto">
                <Bell className="size-3 mr-1" />Send Reminder
              </Button>
            </div>
          </div>

          {/* Communication History */}
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm font-semibold mb-3">Communication History</p>
            <div className="space-y-3">
              {COMM_HISTORY.map((c, i) => {
                const Icon = c.icon
                return (
                  <div key={i} className="flex items-center gap-3">
                    <Icon className={`size-4 shrink-0 ${c.color}`} />
                    <div className="flex-1">
                      <p className="text-sm">{c.label}</p>
                      <p className="text-[10px] text-muted-foreground">{c.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Activity Log */}
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm font-semibold mb-3">Activity Log</p>
            <div className="space-y-2">
              {ACTIVITY_LOG.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <div className="size-1.5 rounded-full bg-muted-foreground/40 mt-2 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm">{a.text}</p>
                    <p className="text-[10px] text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="w-72 shrink-0 overflow-y-auto px-4 py-5 border-l space-y-4">

          {/* Candidate Card */}
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Candidate</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-semibold shrink-0">SJ</div>
              <div>
                <p className="text-sm font-semibold">{INTERVIEW.candidate}</p>
                <p className="text-xs text-muted-foreground">Senior Java Developer</p>
              </div>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground mb-3">
              <p>{INTERVIEW.email}</p>
              <p>{INTERVIEW.phone}</p>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{INTERVIEW.stage}</span>
            </div>
            <Button variant="outline" size="sm" className="w-full h-8 text-xs">View Profile</Button>
          </div>

          {/* Job Card */}
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Job</p>
            <p className="text-sm font-semibold">{INTERVIEW.job}</p>
            <p className="text-xs text-muted-foreground mb-2">{INTERVIEW.client}</p>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Open</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">High Priority</span>
            </div>
            <Button variant="outline" size="sm" className="w-full h-8 text-xs">View Job</Button>
          </div>

          {/* AI Insights */}
          <div className="rounded-lg border border-brand/20 bg-brand-muted/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="size-4 text-brand" />
              <span className="text-sm font-semibold">AI Insights</span>
            </div>
            <ul className="space-y-2">
              {AI_INSIGHTS.map((insight, i) => {
                const Icon = insight.icon
                return (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Icon className={`size-3.5 mt-0.5 shrink-0 ${insight.color}`} />
                    {insight.text}
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</p>
            <div className="flex flex-col gap-2">
              {[
                { icon: Sparkles,      label: 'Generate Questions' },
                { icon: User,          label: 'Candidate Brief' },
                { icon: FileText,      label: 'Interview Brief' },
                { icon: Bell,          label: 'Send Reminder' },
                { icon: ClipboardList, label: 'View Resume' },
              ].map(({ icon: Icon, label }) => (
                <Button key={label} variant="outline" size="sm" className="h-8 text-xs justify-start gap-2">
                  <Icon className="size-3.5" />{label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
