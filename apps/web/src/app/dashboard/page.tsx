'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Star, Briefcase, CalendarCheck, AlertTriangle, CheckCircle2,
  Sparkles, UserPlus, Video, Upload, Activity, FileText,
  Mail, Phone, Target, X, Plus, Search, UserCheck,
  Send, ListTodo, CalendarDays, Users, Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type Urgency = 'high' | 'medium' | 'low'
type Icon    = React.ComponentType<{ className?: string }>

// ─── Mock data ────────────────────────────────────────────────────────────────

const PRIORITIES: Array<{
  id: number; urgency: Urgency; icon: Icon; color: string
  title: string; sub: string; time: string; action: string
}> = [
  { id:1, urgency:'high',   icon:Users,         color:'bg-red-50 text-red-600',      title:'Review 8 new applicants',         sub:'Java Developer · Dell Technologies',       time:'Due 2 PM',      action:'Review'  },
  { id:2, urgency:'high',   icon:Send,           color:'bg-amber-50 text-amber-600',  title:'Submit 3 candidates',             sub:'Travel RN (ICU) · Houston Methodist',      time:'Client waiting',action:'Submit'  },
  { id:3, urgency:'medium', icon:Phone,          color:'bg-blue-50 text-blue-600',    title:'Follow-up — Maria Gonzalez',      sub:'Re: start date confirmation',              time:'Due noon',      action:'Call'    },
  { id:4, urgency:'high',   icon:Video,          color:'bg-violet-50 text-violet-600',title:'Interview in 45 min',             sub:'Tom Kowalski · Chevron DevOps',            time:'10:45 AM',      action:'Join'    },
  { id:5, urgency:'medium', icon:CheckCircle2,   color:'bg-emerald-50 text-emerald-600',title:'Offer approval pending',       sub:'Angela White · QA Engineer · AT&T',        time:'Awaiting you',  action:'Approve' },
  { id:6, urgency:'high',   icon:AlertTriangle,  color:'bg-red-50 text-red-600',      title:'License expiring — Lisa Chen',   sub:'RN License expires Jul 15',                time:'16 days',       action:'Fix'     },
]

const PIPELINE = [
  { label:'Applicants', count:127 },
  { label:'Reviewed',   count:43  },
  { label:'Submitted',  count:18  },
  { label:'Interview',  count:8   },
  { label:'Offer',      count:3   },
  { label:'Placed',     count:1   },
]

const CALENDAR_EVENTS = [
  { id:1, time:'10:45 AM', title:'Interview: Tom K. — Chevron DevOps',      type:'interview' as const, soon:true  },
  { id:2, time:'11:30 AM', title:'Client call — Houston Methodist',           type:'call'      as const, soon:false },
  { id:3, time:'2:00 PM',  title:'Team standup',                              type:'meeting'   as const, soon:false },
  { id:4, time:'3:30 PM',  title:'Review applicants — Java Developer',        type:'task'      as const, soon:false },
  { id:5, time:'5:00 PM',  title:'Placement starts — Maria Gonzalez',        type:'placement' as const, soon:false },
]

const ATTENTION: Array<{
  id: number; severity: 'high' | 'medium'; name: string; issue: string; action: string
}> = [
  { id:1, severity:'high',   name:'Lisa Chen',      issue:'RN License expires Jul 15',   action:'Renew'     },
  { id:2, severity:'high',   name:'Marcus Johnson', issue:'Missing W-2 / payroll form',  action:'Upload'    },
  { id:3, severity:'medium', name:'Tom Kowalski',   issue:'Background check pending',     action:'Follow Up' },
  { id:4, severity:'medium', name:'Emily Thompson', issue:'ACLS certification missing',   action:'Request'   },
]

const AI_SUGGESTIONS = [
  { id:1, text:'5 candidates match your open Java Developer req. at Dell. None reviewed yet.',          action:'Screen Now'     },
  { id:2, text:"David Park's contract ends in 14 days — extension likely. Client not contacted yet.",   action:'Generate Email' },
  { id:3, text:'Best job to prioritize today: Travel RN (ICU) at Houston Methodist. 3 AI matches.',    action:'Open Job'       },
  { id:4, text:'Angela White offer sent. AT&T usually responds within 2 hours — good time to follow up.', action:'Follow Up'   },
]

const WORK_QUEUE = [
  { id:1, title:'Senior Java Developer', client:'JPMorgan Chase',    priority:'high'   as Urgency, reviewed:8, submitted:3, aiMatch:5 },
  { id:2, title:'Travel RN — ICU',       client:'Houston Methodist', priority:'high'   as Urgency, reviewed:2, submitted:0, aiMatch:3 },
  { id:3, title:'Cloud Architect',        client:'Shell',            priority:'medium' as Urgency, reviewed:5, submitted:1, aiMatch:2 },
]

const ACTIVITY = [
  { id:1, type:'submission' as const, text:'Sarah M. submitted James R. for Cloud Architect at Shell',    time:'5m ago'  },
  { id:2, type:'interview'  as const, text:'Interview confirmed — Tom K. with Chevron (10:45 AM today)',  time:'20m ago' },
  { id:3, type:'placement'  as const, text:'Placement started — Maria Gonzalez at Houston Methodist',     time:'1h ago'  },
  { id:4, type:'ai'         as const, text:'AI found 5 matching candidates for Java Developer at Dell',   time:'1h ago'  },
  { id:5, type:'email'      as const, text:'Offer letter sent — Angela White for QA role at AT&T',        time:'2h ago'  },
  { id:6, type:'email'      as const, text:'Follow-up email sent to Marcus J. re: missing W-2 form',      time:'3h ago'  },
]

const PERF = {
  submissions: { done:3, goal:5 },
  calls:       { done:4, goal:6 },
  interviews:  { done:2, goal:3 },
  responseTime:'1.2h',
}

const PLACEMENT_WATCH: Array<{
  id: number; status: 'today' | 'ending' | 'action'; name: string; detail: string
}> = [
  { id:1, status:'today',  name:'Maria Gonzalez',  detail:'Houston Methodist · Starting today'    },
  { id:2, status:'ending', name:'David Park',       detail:'Dell Technologies · Ends Jul 13'      },
  { id:3, status:'ending', name:'Sandra Kim',       detail:"Children's Medical · Ends Aug 30"     },
  { id:4, status:'action', name:'Tom Kowalski',     detail:'HCA Houston · Background check pending'},
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function greet(h: number) {
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })
}
function fmtTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' })
}

const URGENCY_DOT: Record<Urgency, string> = {
  high:  'bg-red-500',
  medium:'bg-amber-400',
  low:   'bg-slate-300',
}

const ACT_META: Record<string, { color: string; icon: Icon }> = {
  submission:{ color:'bg-blue-50    text-blue-600',    icon:Send          },
  interview: { color:'bg-violet-50  text-violet-600',  icon:CalendarCheck },
  placement: { color:'bg-emerald-50 text-emerald-600', icon:UserCheck     },
  ai:        { color:'bg-violet-50  text-violet-600',  icon:Sparkles      },
  email:     { color:'bg-slate-50   text-slate-500',   icon:Mail          },
  note:      { color:'bg-slate-50   text-slate-500',   icon:FileText      },
}

const CAL_COLOR: Record<string, { bg: string; text: string }> = {
  interview:{ bg:'bg-violet-50 border-violet-200',  text:'text-violet-700'  },
  call:     { bg:'bg-sky-50    border-sky-200',      text:'text-sky-700'     },
  meeting:  { bg:'bg-slate-50  border-slate-200',    text:'text-slate-600'   },
  task:     { bg:'bg-amber-50  border-amber-200',    text:'text-amber-700'   },
  placement:{ bg:'bg-emerald-50 border-emerald-200', text:'text-emerald-700' },
}

const WATCH_STYLE: Record<string, { dot:string; badge:string; label:string }> = {
  today:  { dot:'bg-emerald-500', badge:'bg-emerald-50 text-emerald-700 border-emerald-200', label:'Starts Today'   },
  ending: { dot:'bg-amber-400',   badge:'bg-amber-50   text-amber-700   border-amber-200',   label:'Ending Soon'    },
  action: { dot:'bg-red-500',     badge:'bg-red-50     text-red-700     border-red-200',      label:'Action Needed'  },
}

const PRIORITY_BADGE: Record<Urgency, string> = {
  high:  'bg-red-50 text-red-700 border-red-200',
  medium:'bg-amber-50 text-amber-700 border-amber-200',
  low:   'bg-slate-50 text-slate-600 border-slate-200',
}

// ─── Widget wrapper ───────────────────────────────────────────────────────────

function Widget({ title, icon: Icon, action, children, className }: {
  title: string; icon?: Icon; action?: React.ReactNode
  children: React.ReactNode; className?: string
}) {
  return (
    <div className={cn('rounded-xl border border-border bg-background flex flex-col overflow-hidden', className)}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 shrink-0">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="size-3.5 text-muted-foreground" />}
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        {action && <div className="text-xs text-muted-foreground">{action}</div>}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
    </div>
  )
}

// ─── Progress ring ────────────────────────────────────────────────────────────

function ProgressRing({ value, max, size = 80 }: { value:number; max:number; size?:number }) {
  const stroke = 6
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const pct = Math.min(value / max, 1)
  return (
    <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke} className="stroke-muted/40" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke}
        strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round" className="stroke-brand" />
    </svg>
  )
}

// ─── Quick action button ──────────────────────────────────────────────────────

function QA({ label, icon: Icon, href }: { label:string; icon:Icon; href:string }) {
  return (
    <Link href={href}
      className="h-8 px-3 text-xs rounded-lg border border-border hover:bg-muted/60 transition-colors flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground whitespace-nowrap">
      <Icon className="size-3.5 shrink-0" />{label}
    </Link>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [now,       setNow]       = useState<Date | null>(null)
  const [done,      setDone]      = useState<Set<number>>(new Set())
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const h = now?.getHours() ?? 9
  const activePriorities = PRIORITIES.filter(p => !done.has(p.id))
  const activeAttention  = ATTENTION.filter(a  => !dismissed.has(a.id))

  const totalGoal = PERF.submissions.goal + PERF.calls.goal + PERF.interviews.goal
  const totalDone = PERF.submissions.done + PERF.calls.done + PERF.interviews.done
  const pct = Math.round((totalDone / totalGoal) * 100)

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-8 py-6 space-y-5 pb-10">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {greet(h)}, Arun 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {now ? `${fmtDate(now)} · ${fmtTime(now)}` : 'Loading…'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-0.5">
            <button className="h-8 px-3 text-xs rounded-lg border border-border bg-background hover:bg-muted/60 transition-colors flex items-center gap-2 text-muted-foreground">
              <Search className="size-3.5" />
              Search everything
              <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-muted font-mono leading-none">⌘K</kbd>
            </button>
            <Link href="/dashboard/jobs/new"
              className="h-8 px-3 text-xs rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors flex items-center gap-1.5 font-medium">
              <Plus className="size-3.5" />New
            </Link>
          </div>
        </div>

        {/* ── Quick actions ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap">
          <QA label="Post Job"        icon={Briefcase}    href="/dashboard/jobs/new"         />
          <QA label="Add Candidate"   icon={UserPlus}     href="/dashboard/candidates/new"   />
          <QA label="New Interview"   icon={CalendarCheck}href="/dashboard/interviews"        />
          <QA label="New Placement"   icon={UserCheck}    href="/dashboard/placements"        />
          <QA label="Import Resume"   icon={Upload}       href="/dashboard/candidates"        />
          <QA label="AI Generate"     icon={Sparkles}     href="/dashboard/agents"            />
        </div>

        {/* ── Pipeline strip ──────────────────────────────────────────────── */}
        <div className="rounded-xl border border-border bg-background overflow-hidden">
          <div className="flex divide-x divide-border">
            {PIPELINE.map((stage, i) => (
              <button key={stage.label}
                className="flex-1 flex flex-col items-center py-3.5 hover:bg-muted/30 transition-colors group">
                <span className={cn(
                  'text-lg font-bold tabular-nums leading-none',
                  i === 0 ? 'text-foreground'  :
                  i === 5 ? 'text-emerald-600' :
                            'text-foreground'
                )}>
                  {stage.count}
                </span>
                <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wide font-medium">
                  {stage.label}
                </span>
                {i < PIPELINE.length - 1 && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground/40 text-xs pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Row 1: Priorities + Calendar ────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-4">

          {/* Today's Priorities */}
          <Widget
            className="col-span-12 lg:col-span-7"
            title="Today's Priorities"
            icon={Star}
            action={
              <span className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full border',
                activePriorities.length === 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              )}>
                {activePriorities.length === 0 ? 'All done ✓' : `${activePriorities.length} remaining`}
              </span>
            }
          >
            {activePriorities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <CheckCircle2 className="size-9 text-emerald-500 mb-3" />
                <p className="text-sm font-semibold">All done for today!</p>
                <p className="text-xs text-muted-foreground mt-1">Great work, Arun.</p>
              </div>
            ) : activePriorities.map(p => {
              const Icon = p.icon
              return (
                <div key={p.id}
                  className="flex items-center gap-3 px-5 py-3.5 border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors group">
                  <div className={cn('size-8 rounded-lg flex items-center justify-center shrink-0', p.color)}>
                    <Icon className="size-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={cn('size-1.5 rounded-full shrink-0', URGENCY_DOT[p.urgency])} />
                      <p className="text-sm font-medium truncate">{p.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.sub}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap hidden sm:block">{p.time}</span>
                    <button className="h-7 px-2.5 text-xs rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors font-medium">
                      {p.action}
                    </button>
                    <button
                      onClick={() => setDone(s => { const n = new Set(s); n.add(p.id); return n })}
                      className="size-7 rounded-lg border border-border hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 transition-colors flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100"
                      title="Mark complete"
                    >
                      <CheckCircle2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </Widget>

          {/* Today's Schedule */}
          <Widget
            className="col-span-12 lg:col-span-5"
            title="Today's Schedule"
            icon={CalendarDays}
            action={
              <Link href="/dashboard/interviews" className="hover:text-foreground transition-colors">
                View all →
              </Link>
            }
          >
            <div className="p-4 space-y-2">
              {CALENDAR_EVENTS.map(ev => {
                const style = CAL_COLOR[ev.type] ?? { bg: 'bg-muted border-border', text: 'text-foreground' }
                return (
                  <div key={ev.id} className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg border text-xs transition-all',
                    style.bg, style.text,
                    ev.soon && 'ring-2 ring-violet-200 shadow-sm'
                  )}>
                    <span className="font-mono font-semibold shrink-0 tabular-nums">{ev.time}</span>
                    <span className="flex-1 font-medium truncate">{ev.title}</span>
                    {ev.soon && (
                      <button className="h-6 px-2 rounded-md bg-violet-600 text-white text-[10px] font-semibold hover:bg-violet-700 transition-colors flex items-center gap-1 shrink-0">
                        <Video className="size-3" />Join
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </Widget>
        </div>

        {/* ── Row 2: AI + Needs Attention + Work Queue ─────────────────────── */}
        <div className="grid grid-cols-12 gap-4">

          {/* AI Assistant */}
          <Widget
            className="col-span-12 lg:col-span-4"
            title="AI Assistant"
            icon={Sparkles}
            action={
              <Link href="/dashboard/agents" className="hover:text-foreground transition-colors">
                Open AI Hub →
              </Link>
            }
          >
            <div className="divide-y divide-border/40">
              {AI_SUGGESTIONS.map(s => (
                <div key={s.id} className="px-5 py-4">
                  <div className="flex items-start gap-2 mb-3">
                    <Sparkles className="size-3.5 text-violet-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground leading-relaxed">{s.text}</p>
                  </div>
                  <button className="h-7 px-2.5 text-xs rounded-lg border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors font-medium">
                    {s.action}
                  </button>
                </div>
              ))}
            </div>
          </Widget>

          {/* Needs Attention */}
          <Widget
            className="col-span-12 lg:col-span-4"
            title="Needs Attention"
            icon={AlertTriangle}
            action={
              <Link href="/dashboard/placements" className="hover:text-foreground transition-colors">
                View all →
              </Link>
            }
          >
            {activeAttention.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <CheckCircle2 className="size-9 text-emerald-500 mb-3" />
                <p className="text-sm font-semibold">All clear!</p>
                <p className="text-xs text-muted-foreground mt-1">Nothing needs attention right now.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {activeAttention.map(a => (
                  <div key={a.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/20 transition-colors group">
                    <span className={cn('size-2 rounded-full shrink-0',
                      a.severity === 'high' ? 'bg-red-500' : 'bg-amber-400'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">{a.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{a.issue}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button className="h-7 px-2.5 text-xs rounded-lg border border-border hover:bg-muted/60 transition-colors font-medium">
                        {a.action}
                      </button>
                      <button
                        onClick={() => setDismissed(s => { const n = new Set(s); n.add(a.id); return n })}
                        className="size-7 rounded-lg border border-border hover:bg-muted/60 transition-colors flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100"
                        title="Dismiss"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Widget>

          {/* Work Queue */}
          <Widget
            className="col-span-12 lg:col-span-4"
            title="My Work Queue"
            icon={ListTodo}
            action={
              <Link href="/dashboard/work-queue" className="hover:text-foreground transition-colors">
                View all →
              </Link>
            }
          >
            <div className="divide-y divide-border/40">
              {WORK_QUEUE.map(job => (
                <div key={job.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{job.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{job.client}</p>
                    </div>
                    <span className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0',
                      PRIORITY_BADGE[job.priority]
                    )}>
                      {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3">
                    <span>{job.reviewed} reviewed</span>
                    <span>·</span>
                    <span>{job.submitted} submitted</span>
                    <span>·</span>
                    <span className="text-violet-600 font-semibold">{job.aiMatch} AI matches</span>
                  </div>
                  <button className="h-7 px-2.5 text-xs rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors font-medium">
                    Continue →
                  </button>
                </div>
              ))}
            </div>
          </Widget>
        </div>

        {/* ── Row 3: Activity + Performance + Placement Watch ─────────────── */}
        <div className="grid grid-cols-12 gap-4">

          {/* Recent Activity */}
          <Widget
            className="col-span-12 lg:col-span-5"
            title="Recent Activity"
            icon={Activity}
            action={<span>Today</span>}
          >
            <div className="px-5 py-2">
              {ACTIVITY.map(item => {
                const meta = ACT_META[item.type] ?? ACT_META.email!
                const Icon = meta.icon
                return (
                  <div key={item.id} className="flex items-start gap-3 py-3 border-b border-border/30 last:border-0">
                    <div className={cn('size-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5', meta.color)}>
                      <Icon className="size-3.5" />
                    </div>
                    <p className="flex-1 text-xs leading-relaxed">{item.text}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap mt-0.5">{item.time}</span>
                  </div>
                )
              })}
            </div>
          </Widget>

          {/* Performance */}
          <Widget
            className="col-span-12 lg:col-span-3"
            title="My Performance"
            icon={Target}
            action={<span>Today</span>}
          >
            <div className="px-5 py-5 flex flex-col items-center gap-5">
              {/* Ring */}
              <div className="relative">
                <ProgressRing value={totalDone} max={totalGoal} size={80} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-base font-bold leading-none">{pct}%</span>
                  <span className="text-[9px] text-muted-foreground mt-0.5">of goal</span>
                </div>
              </div>

              {/* Bars */}
              <div className="w-full space-y-3">
                {([
                  { label:'Submissions', ...PERF.submissions },
                  { label:'Calls',       ...PERF.calls       },
                  { label:'Interviews',  ...PERF.interviews  },
                ] as Array<{ label:string; done:number; goal:number }>).map(m => (
                  <div key={m.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{m.label}</span>
                      <span className="text-xs font-semibold tabular-nums">{m.done}/{m.goal}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand transition-all"
                        style={{ width: `${Math.min(m.done / m.goal, 1) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-full border-t border-border/40 pt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Avg response</span>
                <span className="font-semibold">{PERF.responseTime}</span>
              </div>
            </div>
          </Widget>

          {/* Placement Watch */}
          <Widget
            className="col-span-12 lg:col-span-4"
            title="Placement Watch"
            icon={UserCheck}
            action={
              <Link href="/dashboard/placements" className="hover:text-foreground transition-colors">
                Open →
              </Link>
            }
          >
            <div className="divide-y divide-border/40">
              {PLACEMENT_WATCH.map(p => {
                const s = WATCH_STYLE[p.status]!
                return (
                  <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                    <span className={cn('size-2 rounded-full shrink-0', s.dot)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{p.detail}</p>
                    </div>
                    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0', s.badge)}>
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </Widget>
        </div>

      </div>
    </div>
  )
}
