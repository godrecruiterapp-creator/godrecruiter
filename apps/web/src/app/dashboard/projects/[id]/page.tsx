'use client'

import { useParams } from 'next/navigation'
import { Users, Briefcase, Send, CalendarCheck, Trophy, XCircle, UserCheck, Clock, CheckSquare, TrendingUp, Sparkles } from 'lucide-react'
import { BreadcrumbTitle } from '@/components/app/breadcrumb-provider'
import { Button } from '@/components/ui/button'
import { PROJECTS, PROJECT_FALLBACK } from '../_data'
import { cn } from '@/lib/utils'

const KPI = [
  { label: 'Total Candidates', value: '87',  sub: '+12 this week',   icon: Users,        color: 'text-foreground' },
  { label: 'New This Week',    value: '12',  sub: '↑ from 8 last week',icon: TrendingUp, color: 'text-emerald-600' },
  { label: 'Submitted',        value: '24',  sub: 'to clients',       icon: Send,         color: 'text-blue-600' },
  { label: 'Interviewing',     value: '9',   sub: '3 this week',      icon: CalendarCheck,color: 'text-violet-600' },
  { label: 'Placed',           value: '6',   sub: 'this quarter',     icon: Trophy,       color: 'text-amber-600' },
  { label: 'Rejected',         value: '11',  sub: 'this month',       icon: XCircle,      color: 'text-red-500' },
  { label: 'Available',        value: '34',  sub: 'ready to submit',  icon: UserCheck,    color: 'text-emerald-600' },
  { label: 'Open Tasks',       value: '8',   sub: '3 overdue',        icon: CheckSquare,  color: 'text-orange-500' },
]

const ACTIVITY = [
  { time: 'Today 10:42',    text: 'Maria Lopez moved to Submitted',      type: 'stage' },
  { time: 'Today 09:30',    text: 'Interview scheduled with James Wilson', type: 'interview' },
  { time: 'Today 08:15',    text: 'AI Summary generated for 5 candidates', type: 'ai' },
  { time: 'Yesterday 4:00', text: 'Linda Torres moved to Offer',          type: 'stage' },
  { time: 'Yesterday 2:30', text: 'Note added by Arun Kumar',             type: 'note' },
  { time: 'Jun 25',         text: 'Anna Kim added to project',            type: 'add' },
  { time: 'Jun 24',         text: 'Job #1023 ICU RN linked to project',   type: 'job' },
  { time: 'Jun 23',         text: 'Bulk email sent to 14 candidates',     type: 'email' },
]

const ACT_DOT: Record<string, string> = {
  stage:     'bg-blue-500', interview: 'bg-violet-500', ai: 'bg-purple-400',
  note:      'bg-amber-400', add: 'bg-emerald-500', job: 'bg-sky-500', email: 'bg-pink-400',
}

const UPCOMING = [
  { candidate: 'James Wilson',  role: 'Sr. Java Developer', date: 'Tomorrow 2:00 PM',  type: 'Phone Screen' },
  { candidate: 'Maria Lopez',   role: 'ICU RN',             date: 'Jun 30 10:00 AM',   type: 'Client Interview' },
  { candidate: 'Sarah Chen',    role: 'ER Nurse',           date: 'Jul 1  3:30 PM',    type: 'Technical' },
]

const AI_INSIGHTS = [
  { icon: '⚡', text: '42 candidates haven\'t been contacted in 7+ days.' },
  { icon: '🎯', text: '15 candidates are a perfect match for Job #1023.' },
  { icon: '🚀', text: '5 candidates are ready for immediate submission.' },
  { icon: '⚠️', text: '3 H1B candidates have visas expiring within 60 days.' },
  { icon: '📉', text: 'Project activity has slowed — last contact rate dropped 20%.' },
]

export default function ProjectOverviewPage() {
  const params = useParams<{ id: string }>()
  const project = PROJECTS.find(p => p.id === params.id) ?? PROJECT_FALLBACK
  const healthColor = project.healthScore >= 75 ? 'text-emerald-600' : project.healthScore >= 50 ? 'text-amber-500' : 'text-red-500'
  const healthBg = project.healthScore >= 75 ? 'bg-emerald-500' : project.healthScore >= 50 ? 'bg-amber-400' : 'bg-red-400'

  return (
    <div className="h-full overflow-y-auto p-6">
      <BreadcrumbTitle title={project.name} />
      <div className="max-w-6xl mx-auto space-y-6">

        {/* KPI grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {KPI.map(k => {
            const Icon = k.icon
            return (
              <div key={k.label} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                  <Icon className={cn('size-4', k.color)} />
                </div>
                <p className="text-2xl font-bold tabular-nums">{k.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Activity */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-background p-5">
            <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
            <div className="flex flex-col gap-0">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn('size-2 rounded-full shrink-0 mt-1.5', ACT_DOT[a.type] ?? 'bg-muted')} />
                    {i < ACTIVITY.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                  </div>
                  <div className="pb-3 min-w-0">
                    <p className="text-xs text-foreground">{a.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* AI Health */}
            <div className="rounded-xl border border-border bg-background p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">AI Project Health</h3>
                <span className={cn('text-2xl font-bold tabular-nums', healthColor)}>{project.healthScore}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
                <div className={cn('h-2 rounded-full', healthBg)} style={{ width: `${project.healthScore}%` }} />
              </div>
              <div className="space-y-2">
                {AI_INSIGHTS.map((ins, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="shrink-0">{ins.icon}</span>
                    <span>{ins.text}</span>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="outline" className="w-full mt-4 h-7 text-xs gap-1.5">
                <Sparkles className="size-3.5" />View Full AI Report
              </Button>
            </div>

            {/* Upcoming Interviews */}
            <div className="rounded-xl border border-border bg-background p-5">
              <h3 className="text-sm font-semibold mb-3">Upcoming Interviews</h3>
              <div className="flex flex-col gap-3">
                {UPCOMING.map((u, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="size-7 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-700 shrink-0">
                      {u.candidate.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{u.candidate}</p>
                      <p className="text-[10px] text-muted-foreground">{u.type}</p>
                      <p className="text-[10px] text-violet-600 font-medium">{u.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
