'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  CalendarCheck, TrendingUp, CheckCircle, XCircle, RefreshCw,
  MessageSquare, Award, AlertCircle, BarChart3,
  Clock, User, Briefcase, Activity,
} from 'lucide-react'
import { ScheduleWizard } from './schedule-wizard'

const DATE_RANGES = ['Today', 'This Week', 'This Month']

const KPIS = [
  { label: 'Interviews Today', value: '8', delta: '+2 from yesterday', icon: CalendarCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Upcoming', value: '23', delta: '+5 this week', icon: TrendingUp, color: 'text-brand', bg: 'bg-brand-muted' },
  { label: 'Completed', value: '147', delta: '+12 this week', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Cancelled', value: '4', delta: '-2 vs last week', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  { label: 'Rescheduled', value: '6', delta: 'Same as last week', icon: RefreshCw, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Feedback Pending', value: '11', delta: '3 overdue', icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Offer Pending', value: '3', delta: '+1 this week', icon: Award, color: 'text-violet-600', bg: 'bg-violet-50' },
  { label: 'No Shows', value: '2', delta: 'Same as last week', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  { label: 'Success Rate', value: '84%', delta: '+2% vs last month', icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50' },
]

const BARS = [
  { day: 'Mon', h: 60 }, { day: 'Tue', h: 85 }, { day: 'Wed', h: 45 },
  { day: 'Thu', h: 100 }, { day: 'Fri', h: 70 }, { day: 'Sat', h: 20 }, { day: 'Sun', h: 10 },
]

const FUNNEL = [
  { label: 'Scheduled', count: 23, pct: 100, color: 'bg-blue-500' },
  { label: 'Confirmed', count: 18, pct: 78, color: 'bg-brand' },
  { label: 'Completed', count: 14, pct: 61, color: 'bg-emerald-500' },
  { label: 'Feedback', count: 11, pct: 48, color: 'bg-amber-500' },
  { label: 'Offer', count: 3, pct: 20, color: 'bg-violet-500' },
]

const UPCOMING = [
  { candidate: 'Sarah Johnson', time: '10:00 AM', type: 'Technical Interview', status: 'scheduled' },
  { candidate: 'James Martinez', time: '2:00 PM', type: 'Client Interview', status: 'confirmed' },
  { candidate: 'Emily Chen', time: '11:00 AM', type: 'Video Interview', status: 'scheduled' },
  { candidate: 'David Park', time: '1:00 PM', type: 'Technical Interview', status: 'scheduled' },
  { candidate: 'Amy Wilson', time: '11:30 AM', type: 'Client Interview', status: 'scheduled' },
]

const FEEDBACK_PENDING = [
  { candidate: 'Robert Kim', interviewer: 'Panel', date: 'Jun 27' },
  { candidate: 'Lisa Thompson', interviewer: 'HR Team', date: 'Jun 27' },
  { candidate: 'Kevin Brown', interviewer: 'Tech Lead', date: 'Jun 25' },
  { candidate: 'Sandra Davis', interviewer: 'Nurse Manager', date: 'Jun 27' },
  { candidate: 'Maria Garcia', interviewer: 'HR Director', date: 'Jun 26' },
]

const ACTIVITY = [
  { icon: CalendarCheck, text: 'Interview scheduled for Sarah Johnson', time: '10 min ago', color: 'text-blue-600' },
  { icon: CheckCircle, text: 'Robert Kim interview marked complete', time: '1h ago', color: 'text-emerald-600' },
  { icon: MessageSquare, text: 'Feedback reminder sent to HR Team', time: '2h ago', color: 'text-amber-600' },
  { icon: RefreshCw, text: 'Sandra Davis interview rescheduled', time: '3h ago', color: 'text-amber-600' },
  { icon: XCircle, text: 'Maria Garcia interview cancelled', time: '5h ago', color: 'text-red-600' },
  { icon: Activity, text: '3 interviews confirmed for tomorrow', time: '6h ago', color: 'text-brand' },
]

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export default function InterviewsDashboard() {
  const [range, setRange] = useState('This Week')
  const [wizardOpen, setWizardOpen] = useState(false)

  return (
    <div className="flex flex-col h-full p-6 gap-5 overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Interviews</h1>
          <p className="text-sm text-muted-foreground">Interview management and scheduling</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md overflow-hidden">
            {DATE_RANGES.map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`h-8 px-3 text-sm transition-colors ${range === r ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-muted'}`}>
                {r}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => setWizardOpen(true)}>
            <CalendarCheck className="size-3.5 mr-1.5" />Schedule Interview
          </Button>
        </div>
      </div>

      {/* KPI Cards — 3 rows of 3 */}
      {[0, 3, 6].map(offset => (
        <div key={offset} className="grid grid-cols-3 gap-4">
          {KPIS.slice(offset, offset + 3).map(k => {
            const Icon = k.icon
            return (
              <div key={k.label} className="rounded-lg border bg-card p-4 flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{k.label}</p>
                  <p className="text-2xl font-bold mt-1">{k.value}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{k.delta}</p>
                </div>
                <div className={`size-8 rounded-lg flex items-center justify-center ${k.bg}`}>
                  <Icon className={`size-4 ${k.color}`} />
                </div>
              </div>
            )
          })}
        </div>
      ))}

      {/* Charts */}
      <div className="grid grid-cols-3 gap-4">
        {/* Activity bar chart */}
        <div className="col-span-2 rounded-lg border bg-card p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold">Interview Activity</p>
          <div className="flex items-end gap-2 h-40 pt-4">
            {BARS.map(b => (
              <div key={b.day} className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full bg-brand rounded-t transition-all" style={{ height: `${b.h}%` }} />
                <span className="text-[10px] text-muted-foreground">{b.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Funnel */}
        <div className="rounded-lg border bg-card p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold">Interview Funnel</p>
          <div className="flex flex-col items-center gap-1.5 flex-1 justify-center">
            {FUNNEL.map(f => (
              <div key={f.label} className="w-full flex flex-col items-center gap-0.5">
                <div className={`${f.color} rounded h-7 flex items-center justify-center text-sm font-medium text-white`}
                  style={{ width: `${f.pct}%` }}>
                  {f.count}
                </div>
                <span className="text-[10px] text-muted-foreground">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom 3 columns */}
      <div className="grid grid-cols-3 gap-4">
        {/* Upcoming */}
        <div className="rounded-lg border bg-card p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold">Upcoming Interviews</p>
          <div className="flex flex-col gap-2">
            {UPCOMING.map((u, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 border-b last:border-0">
                <div className="size-7 rounded-full bg-brand/10 flex items-center justify-center text-brand text-xs font-semibold shrink-0">
                  {u.candidate[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.candidate}</p>
                  <p className="text-[10px] text-muted-foreground">{u.time} · {u.type}</p>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${STATUS_COLORS[u.status] ?? ''}`}>
                  {u.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback */}
        <div className="rounded-lg border bg-card p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold">Pending Feedback</p>
          <div className="flex flex-col gap-2">
            {FEEDBACK_PENDING.map((f, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 border-b last:border-0">
                <div className="size-7 rounded-full bg-amber-50 flex items-center justify-center text-amber-700 text-xs font-semibold shrink-0">
                  {f.candidate[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{f.candidate}</p>
                  <p className="text-[10px] text-muted-foreground">{f.interviewer} · {f.date}</p>
                </div>
                <button className="text-[10px] px-2 py-1 rounded border border-border hover:bg-muted transition-colors shrink-0">
                  Remind
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="rounded-lg border bg-card p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold">Recent Activity</p>
          <div className="flex flex-col gap-2">
            {ACTIVITY.map((a, i) => {
              const Icon = a.icon
              return (
                <div key={i} className="flex items-start gap-2 py-1.5 border-b last:border-0">
                  <Icon className={`size-3.5 mt-0.5 shrink-0 ${a.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{a.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <ScheduleWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  )
}
