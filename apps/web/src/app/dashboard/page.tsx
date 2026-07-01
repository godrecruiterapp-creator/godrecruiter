'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  CheckCircle2, AlertTriangle, Sparkles, UserPlus, Video,
  Upload, Mail, Phone, X, Plus, UserCheck,
  Send, ListTodo, CalendarDays, Users, Clock,
  ArrowUp, ArrowDown, RefreshCw, Eye, Building2,
  Activity, Award, ChevronRight, Briefcase,
  Bot, DollarSign, CalendarCheck, Zap, Star,
  FileText, Shield, MessageSquare, Bell, Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDashboardStore } from '@/lib/stores/dashboard-store'
import { NewButtonModal } from './_components/new-button-modal'

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority  = 'high' | 'medium' | 'low'
type TaskType  = 'review' | 'submit' | 'call' | 'email' | 'schedule' | 'approve' | 'fix'
type FeedTab   = 'mine' | 'team' | 'ai' | 'automation'
type TaskTab   = 'all' | 'review' | 'submit' | 'followup' | 'schedule'

interface Task {
  id: number; type: TaskType; priority: Priority
  candidate: string; initials: string; job: string; client: string
  due: string; actions: string[]; note?: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const FOCUS = {
  newApplicants: 14, readyToSubmit: 5, followUps: 8,
  interviews: 3, potentialPlacements: 2,
  estimatedHours: 5, progressPct: 91,
}

const PIPELINE = [
  { label:'Applicants', count:127, yesterday:114 },
  { label:'Reviewed',   count:43,  yesterday:40  },
  { label:'Submitted',  count:18,  yesterday:15  },
  { label:'Interview',  count:8,   yesterday:8   },
  { label:'Offer',      count:3,   yesterday:2   },
  { label:'Placed',     count:1,   yesterday:0   },
]

const TASKS: Task[] = [
  { id:1, type:'schedule', priority:'high',   candidate:'Tom Kowalski',    initials:'TK', job:'DevOps Engineer',  client:'Chevron',           due:'10:45 AM · In 45 min', actions:['Join','Candidate','Notes'], note:'Interview starting soon' },
  { id:2, type:'review',   priority:'high',   candidate:'8 new applicants',initials:'8+', job:'Java Developer',   client:'Dell Technologies', due:'Due 2 PM',              actions:['Review'],                  note:'Waiting since 9 AM' },
  { id:3, type:'submit',   priority:'high',   candidate:'3 candidates',    initials:'3+', job:'Travel RN (ICU)',  client:'Houston Methodist', due:'Client waiting',        actions:['Submit'],                  note:'Ready to send' },
  { id:4, type:'fix',      priority:'high',   candidate:'Lisa Chen',       initials:'LC', job:'RN',               client:'Memorial Hermann',  due:'16 days left',          actions:['Renew'],                   note:'License expires Jul 15' },
  { id:5, type:'call',     priority:'medium', candidate:'Maria Gonzalez',  initials:'MG', job:'Staff RN',         client:'UT Southwestern',   due:'Due noon',              actions:['Call','Email'],             note:'Re: start date' },
  { id:6, type:'approve',  priority:'medium', candidate:'Angela White',    initials:'AW', job:'QA Engineer',      client:'AT&T',              due:'Awaiting you',          actions:['Approve'],                 note:'Offer pending approval' },
  { id:7, type:'review',   priority:'medium', candidate:'5 applicants',    initials:'5+', job:'Cloud Architect',  client:'Shell',             due:'Tomorrow',              actions:['Review'],                  note:'AI ranked top 2' },
  { id:8, type:'email',    priority:'low',    candidate:'Marcus Johnson',  initials:'MJ', job:'Warehouse Coord.', client:'Amazon Logistics',  due:'Today',                 actions:['Email'],                   note:'Missing W-2 form' },
]

const SCHEDULE = [
  { id:1, time:'10:45 AM', remaining:'In 45 min',  candidate:'Tom Kowalski', role:'Chevron · DevOps',         type:'interview' as const, isNext:true  },
  { id:2, time:'11:30 AM', remaining:'In 1h 30m',  candidate:'Client Call',  role:'Houston Methodist',         type:'call'      as const, isNext:false },
  { id:3, time:'2:00 PM',  remaining:'In 3h 15m',  candidate:'Team Standup', role:'Internal',                  type:'meeting'   as const, isNext:false },
  { id:4, time:'3:30 PM',  remaining:'In 4h 45m',  candidate:'8 applicants', role:'Java Dev · Dell',           type:'task'      as const, isNext:false },
  { id:5, time:'5:00 PM',  remaining:'In 6h 15m',  candidate:'Maria Gonzalez',role:'Starts · Houston Meth.',  type:'placement' as const, isNext:false },
]

const AI_HINTS = [
  { id:1, icon:Users,         text:'8 candidates match Java Developer at Dell — none screened yet.',              action:'Review',         color:'violet' },
  { id:2, icon:AlertTriangle, text:'Travel RN (ICU) may be hard to fill. Only 2 qualified in pipeline.',         action:'Find Candidates', color:'amber'  },
  { id:3, icon:Award,         text:'Maria Gonzalez is very likely to accept. Best time to call: before noon.',   action:'Call Now',        color:'emerald'},
  { id:4, icon:Mail,          text:'3 candidates not contacted in 7+ days — at risk of losing interest.',        action:'Send Emails',     color:'blue'   },
]

const MY_JOBS = [
  { id:1, title:'Senior Java Developer', client:'JPMorgan Chase',    daysOpen:12, applicants:31, toReview:8, toSubmit:3, priority:'high'   as Priority, nextStep:'Review 8 new applicants'    },
  { id:2, title:'Travel RN — ICU',        client:'Houston Methodist', daysOpen:5,  applicants:14, toReview:2, toSubmit:3, priority:'high'   as Priority, nextStep:'Submit 3 ready candidates'  },
  { id:3, title:'Cloud Architect',         client:'Shell',            daysOpen:21, applicants:22, toReview:5, toSubmit:1, priority:'medium' as Priority, nextStep:'Review remaining applicants' },
  { id:4, title:'DevOps Engineer',         client:'Chevron',          daysOpen:8,  applicants:19, toReview:0, toSubmit:1, priority:'medium' as Priority, nextStep:'Schedule client interviews'  },
]

const ATTENTION_GROUPS: Record<string, Array<{ id:number; severity:'high'|'medium'; name:string; issue:string; action:string }>> = {
  'Compliance': [
    { id:1, severity:'high',   name:'Lisa Chen',      issue:'RN License expires Jul 15',    action:'Renew'    },
    { id:4, severity:'medium', name:'Emily Thompson', issue:'ACLS certification missing',    action:'Request'  },
  ],
  'Documents': [
    { id:2, severity:'high',   name:'Marcus Johnson', issue:'Missing W-2 / payroll form',   action:'Upload'   },
    { id:3, severity:'medium', name:'Tom Kowalski',   issue:'Background check pending',      action:'Follow Up'},
  ],
}

const PROGRESS = [
  { label:'Calls',       done:4,  goal:6,  icon:Phone      },
  { label:'Emails',      done:11, goal:15, icon:Mail       },
  { label:'Submissions', done:3,  goal:5,  icon:Send       },
  { label:'Interviews',  done:2,  goal:3,  icon:Video      },
  { label:'Follow-ups',  done:5,  goal:8,  icon:RefreshCw  },
  { label:'Placements',  done:1,  goal:2,  icon:UserCheck  },
]

const PLACEMENTS = [
  { id:1, status:'today'  as const, name:'Maria Gonzalez', company:'Houston Methodist',  detail:'Starting today',   action:'Send Welcome' },
  { id:2, status:'ending' as const, name:'David Park',      company:'Dell Technologies', detail:'Ends in 14 days',  action:'Discuss Ext.' },
  { id:3, status:'ending' as const, name:'Sandra Kim',      company:"Children's Medical",detail:'Ends Aug 30',      action:'Track'        },
  { id:4, status:'action' as const, name:'Tom Kowalski',    company:'HCA Houston',       detail:'BG check pending', action:'Follow Up'    },
]

const ACTIVITY = [
  { id:1, feed:'mine'       as FeedTab, icon:UserCheck, color:'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950', text:'Maria Gonzalez started at Houston Methodist',       time:'1h ago'  },
  { id:2, feed:'mine'       as FeedTab, icon:Send,      color:'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950',     text:'You submitted James R. for Cloud Architect · Shell', time:'2h ago'  },
  { id:3, feed:'mine'       as FeedTab, icon:CalendarCheck, color:'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950', text:'Interview confirmed — Tom K. with Chevron 10:45 AM', time:'3h ago'  },
  { id:4, feed:'team'       as FeedTab, icon:Send,      color:'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950',     text:'Sarah M. submitted James R. for Cloud Architect',   time:'5m ago'  },
  { id:5, feed:'team'       as FeedTab, icon:UserCheck, color:'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950', text:'Priya closed a placement — Frontend Dev at Tesla',  time:'45m ago' },
  { id:6, feed:'ai'         as FeedTab, icon:Sparkles,  color:'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950',     text:'AI found 8 matches for Java Developer at Dell',     time:'1h ago'  },
  { id:7, feed:'ai'         as FeedTab, icon:Sparkles,  color:'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950',     text:'AI drafted follow-up email for Marcus Johnson',     time:'2h ago'  },
  { id:8, feed:'automation' as FeedTab, icon:Zap,       color:'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950',         text:'Sequence sent to 12 candidates (Java Dev)',         time:'6h ago'  },
  { id:9, feed:'automation' as FeedTab, icon:Zap,       color:'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950',         text:'Job alerts sent to 47 matched candidates',          time:'8h ago'  },
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

const PRIORITY_DOT: Record<Priority, string> = {
  high:   'bg-red-500',
  medium: 'bg-amber-400',
  low:    'bg-slate-300 dark:bg-slate-600',
}

const TASK_META: Record<TaskType, { icon: React.ComponentType<{className?:string}>; color:string; label:string }> = {
  review:   { icon:Eye,           color:'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400',         label:'Review'   },
  submit:   { icon:Send,          color:'bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400', label:'Submit'   },
  call:     { icon:Phone,         color:'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400', label:'Call' },
  email:    { icon:Mail,          color:'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400',             label:'Email'    },
  schedule: { icon:CalendarCheck, color:'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400', label:'Schedule' },
  approve:  { icon:CheckCircle2,  color:'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400',     label:'Approve'  },
  fix:      { icon:AlertTriangle, color:'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400',             label:'Fix'      },
}

const CAL_STYLE: Record<string, { accent:string; badge:string }> = {
  interview:{ accent:'border-l-violet-400', badge:'bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300' },
  call:     { accent:'border-l-sky-400',    badge:'bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300'     },
  meeting:  { accent:'border-l-slate-300',  badge:'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400' },
  task:     { accent:'border-l-amber-400',  badge:'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300' },
  placement:{ accent:'border-l-emerald-400',badge:'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' },
}

const WATCH_STYLE: Record<string, { dot:string; badge:string; label:string }> = {
  today:  { dot:'bg-emerald-500', badge:'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', label:'Starts Today'  },
  ending: { dot:'bg-amber-400',   badge:'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',             label:'Ending Soon'   },
  action: { dot:'bg-red-500',     badge:'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',                         label:'Action Needed' },
}

const AI_COLOR: Record<string, string> = {
  violet:  'bg-violet-50 dark:bg-violet-950 border-violet-100 dark:border-violet-900',
  amber:   'bg-amber-50 dark:bg-amber-950 border-amber-100 dark:border-amber-900',
  emerald: 'bg-emerald-50 dark:bg-emerald-950 border-emerald-100 dark:border-emerald-900',
  blue:    'bg-blue-50 dark:bg-blue-950 border-blue-100 dark:border-blue-900',
}
const AI_ICON_COLOR: Record<string, string> = {
  violet: 'text-violet-500', amber: 'text-amber-500', emerald: 'text-emerald-500', blue: 'text-blue-500',
}
const AI_BTN_COLOR: Record<string, string> = {
  violet:  'border-violet-200 dark:border-violet-800 bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-800',
  amber:   'border-amber-200 dark:border-amber-800 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800',
  emerald: 'border-emerald-200 dark:border-emerald-800 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800',
  blue:    'border-blue-200 dark:border-blue-800 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800',
}

// ─── Widget shell ─────────────────────────────────────────────────────────────

function Widget({ title, icon: Icon, action, children, className, id }: {
  title:string; icon?: React.ComponentType<{className?:string}>; action?: React.ReactNode
  children: React.ReactNode; className?: string; id?: string
}) {
  return (
    <section id={id} className={cn(
      'rounded-2xl bg-background border border-border/60 shadow-sm flex flex-col overflow-hidden',
      'transition-all duration-200 hover:shadow-md',
      className
    )}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="size-3.5 text-muted-foreground" />}
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        </div>
        {action && <div className="text-sm text-muted-foreground">{action}</div>}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
    </section>
  )
}

// ─── Tiny components ──────────────────────────────────────────────────────────

function Initials({ text, className }: { text:string; className?:string }) {
  return (
    <div className={cn(
      'size-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 select-none',
      'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
      className
    )}>{text}</div>
  )
}

function Btn({ label, variant = 'ghost', onClick, className }: {
  label:string; variant?: 'ghost'|'solid'|'danger'|'green'
  onClick?: () => void; className?: string
}) {
  const s = {
    ghost:  'border border-border bg-background hover:bg-muted/60 text-foreground',
    solid:  'bg-foreground text-background hover:bg-foreground/85',
    danger: 'border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900',
    green:  'border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900',
  }[variant]
  return (
    <button onClick={onClick} className={cn('h-7 px-3 text-sm rounded-lg font-medium transition-colors whitespace-nowrap', s, className)}>
      {label}
    </button>
  )
}

// ─── Progress ring ────────────────────────────────────────────────────────────

function Ring({ value, max, size = 72, label, sub, color = 'stroke-[#dd7456]' }: {
  value:number; max:number; size?:number; label:string; sub:string; color?:string
}) {
  const stroke = 5
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const pct = Math.min(value / max, 1)
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width:size, height:size }}>
        <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke} className="stroke-muted/50" />
          <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke}
            strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round" className={color}
            style={{ transition:'stroke-dasharray 0.6s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-base font-bold leading-none">{label}</span>
          <span className="text-[9px] text-muted-foreground mt-0.5">{sub}</span>
        </div>
      </div>
    </div>
  )
}

// ─── SECTION: Today's Focus ───────────────────────────────────────────────────

function TodayFocus({ greetStr, firstName, date, onStart }: { greetStr:string; firstName:string; date:string; onStart:()=>void }) {
  return (
    <div className={cn(
      'rounded-2xl border border-[#dd7456]/20 overflow-hidden',
      'bg-gradient-to-br from-[#fdf0ec] to-background dark:from-[#2a1a15] dark:to-background',
    )}>
      <div className="px-7 py-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

        {/* Left: greeting + bullets */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">{greetStr}, {firstName} 👋</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-5">{date}</p>

          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Today you have</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8">
            {[
              { n:FOCUS.newApplicants,       label:'applicants waiting for review', dot:'bg-red-500'     },
              { n:FOCUS.readyToSubmit,        label:'candidates ready to submit',   dot:'bg-[#dd7456]'   },
              { n:FOCUS.followUps,            label:'follow-ups to complete',       dot:'bg-amber-400'   },
              { n:FOCUS.interviews,           label:'interviews scheduled',         dot:'bg-purple-500'  },
              { n:FOCUS.potentialPlacements,  label:'potential placements',         dot:'bg-emerald-500' },
            ].map(({ n, label, dot }) => (
              <div key={label} className="flex items-center gap-2.5 text-sm">
                <span className={cn('size-2 rounded-full shrink-0', dot)} />
                <span className="font-semibold tabular-nums">{n}</span>
                <span className="text-muted-foreground truncate">{label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onStart}
            className={cn(
              'mt-6 h-9 px-5 rounded-xl text-sm font-semibold transition-all duration-200',
              'bg-[#dd7456] text-white hover:bg-[#c45e3e] shadow-sm hover:shadow-md active:scale-95',
              'flex items-center gap-2'
            )}
          >
            Start My Day <ChevronRight className="size-3.5" />
          </button>
        </div>

        {/* Right: workload + progress rings */}
        <div className="flex items-center gap-8 sm:shrink-0 sm:pt-2">
          <Ring value={FOCUS.estimatedHours} max={8} size={80} label={`${FOCUS.estimatedHours}h`} sub="workload" color="stroke-[#dd7456]" />
          <Ring value={FOCUS.progressPct}   max={100} size={80} label={`${FOCUS.progressPct}%`} sub="complete" color="stroke-emerald-500" />
        </div>
      </div>
    </div>
  )
}

// ─── SECTION: Pipeline Funnel ─────────────────────────────────────────────────

function PipelineFunnel() {
  const max = PIPELINE[0]!.count
  return (
    <div className="rounded-2xl bg-background border border-border/60 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Activity className="size-3.5 text-muted-foreground" />
          <h3 className="text-sm font-semibold tracking-tight">Hiring Pipeline</h3>
        </div>
        <Link href="/dashboard/candidates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          View all →
        </Link>
      </div>
      <div className="flex divide-x divide-border/40">
        {PIPELINE.map((stage, i) => {
          const delta = stage.count - stage.yesterday
          const barH  = Math.max(4, Math.round((stage.count / max) * 48))
          const isPlaced = i === PIPELINE.length - 1
          const isBottleneck = i === 3 && stage.count === stage.yesterday

          return (
            <button key={stage.label}
              className="flex-1 flex flex-col items-center gap-2 py-4 hover:bg-muted/20 transition-colors group relative">

              {/* Visual bar */}
              <div className="h-12 flex items-end">
                <div
                  className={cn(
                    'w-6 rounded-t-sm transition-all duration-500',
                    isPlaced    ? 'bg-emerald-400 dark:bg-emerald-500' :
                    isBottleneck? 'bg-amber-400 dark:bg-amber-500' :
                    i === 0     ? 'bg-[#dd7456]' : 'bg-slate-200 dark:bg-slate-700 group-hover:bg-[#dd7456]/60'
                  )}
                  style={{ height: barH }}
                />
              </div>

              {/* Count */}
              <span className={cn(
                'text-xl font-bold tabular-nums leading-none',
                isPlaced ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
              )}>{stage.count}</span>

              {/* Label */}
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                {stage.label}
              </span>

              {/* Delta */}
              <div className={cn(
                'flex items-center gap-0.5 text-[10px] font-semibold',
                delta > 0 ? 'text-emerald-600 dark:text-emerald-400' :
                delta < 0 ? 'text-red-500' : 'text-muted-foreground'
              )}>
                {delta > 0 ? <ArrowUp className="size-2.5" /> : delta < 0 ? <ArrowDown className="size-2.5" /> : null}
                {delta === 0 ? '—' : `${delta > 0 ? '+' : ''}${delta}`}
              </div>

              {/* Bottleneck indicator */}
              {isBottleneck && (
                <span className="absolute -top-px left-1/2 -translate-x-1/2 text-[9px] font-bold px-1.5 py-0.5 bg-amber-400 text-white rounded-b-md">
                  STUCK
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── SECTION: Things To Do (main workspace) ───────────────────────────────────

const TASK_TAB_FILTERS: Record<TaskTab, (t:Task) => boolean> = {
  all:      ()             => true,
  review:   t => t.type === 'review',
  submit:   t => t.type === 'submit',
  followup: t => t.type === 'call' || t.type === 'email',
  schedule: t => t.type === 'schedule' || t.type === 'approve' || t.type === 'fix',
}

const TASK_TAB_LABELS: Record<TaskTab, string> = {
  all:'All', review:'Review', submit:'Submit', followup:'Follow-up', schedule:'Other',
}

function ThingsToDo({ refEl }: { refEl: React.RefObject<HTMLElement | null> }) {
  const [tab, setTab]   = useState<TaskTab>('all')
  const [done, setDone] = useState<Set<number>>(new Set())
  const [flash, setFlash] = useState(false)

  // ponytail: flash triggered by parent via data attr change
  useEffect(() => {
    const el = refEl.current
    if (!el) return
    const obs = new MutationObserver(() => {
      if (el.getAttribute('data-flash') === 'true') {
        setFlash(true)
        el.removeAttribute('data-flash')
        setTimeout(() => setFlash(false), 1400)
      }
    })
    obs.observe(el, { attributes:true })
    return () => obs.disconnect()
  }, [refEl])

  const visible = TASKS.filter(TASK_TAB_FILTERS[tab]).filter(t => !done.has(t.id))
  const counts  = Object.fromEntries(
    (Object.entries(TASK_TAB_FILTERS) as [TaskTab, (t:Task)=>boolean][])
      .map(([k, fn]) => [k, TASKS.filter(fn).filter(t => !done.has(t.id)).length])
  ) as Record<TaskTab, number>

  return (
    <section
      id="things-to-do"
      ref={refEl as React.RefObject<HTMLElement>}
      className={cn(
        'rounded-2xl bg-background border shadow-sm flex flex-col overflow-hidden',
        'transition-all duration-500',
        flash ? 'border-[#dd7456] shadow-[0_0_0_3px_#dd745620]' : 'border-border/60 hover:shadow-md'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-2">
          <Star className="size-3.5 text-[#dd7456]" />
          <h3 className="text-sm font-semibold tracking-tight">Things To Do</h3>
          {counts.all > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#dd7456] text-white leading-none">
              {counts.all}
            </span>
          )}
        </div>
        {counts.all === 0 && (
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">All done ✓</span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border/40 bg-muted/20 shrink-0 overflow-x-auto">
        {(Object.keys(TASK_TAB_LABELS) as TaskTab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5',
              tab === t
                ? 'border-b-2 border-[#dd7456] text-[#dd7456] bg-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            )}>
            {TASK_TAB_LABELS[t]}
            {counts[t] > 0 && (
              <span className={cn(
                'text-[10px] font-bold px-1 py-0 rounded leading-snug',
                tab === t ? 'text-[#dd7456]' : 'text-muted-foreground'
              )}>
                {counts[t]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-border/30">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CheckCircle2 className="size-9 text-emerald-500 mb-3" />
            <p className="text-sm font-semibold">All clear here!</p>
            <p className="text-sm text-muted-foreground mt-1">Switch to another tab or take a break.</p>
          </div>
        ) : visible.map(task => {
          const meta   = TASK_META[task.type]
          const Icon   = meta.icon
          const isUrgent = task.priority === 'high'

          return (
            <div key={task.id}
              className={cn(
                'flex items-center gap-3 px-5 py-3.5 group transition-colors',
                'hover:bg-muted/20',
                isUrgent && 'border-l-2 border-[#dd7456]'
              )}>

              {/* Priority dot */}
              <span className={cn('size-2 rounded-full shrink-0', PRIORITY_DOT[task.priority])} />

              {/* Type icon */}
              <div className={cn('size-8 rounded-lg flex items-center justify-center shrink-0', meta.color)}>
                <Icon className="size-3.5" />
              </div>

              {/* Candidate avatar */}
              <Initials text={task.initials} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-sm font-medium truncate">{task.candidate}</p>
                  {task.note && (
                    <span className="text-[10px] text-muted-foreground truncate hidden lg:block">— {task.note}</span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {task.job} · {task.client}
                </p>
              </div>

              {/* Due time */}
              <span className="text-[11px] text-muted-foreground whitespace-nowrap hidden md:block shrink-0">
                {task.due}
              </span>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {task.actions.map((a, i) => (
                  <Btn key={a} label={a} variant={i === 0 ? 'solid' : 'ghost'} />
                ))}
                {/* Complete */}
                <button
                  onClick={() => setDone(s => { const n = new Set(s); n.add(task.id); return n })}
                  title="Mark complete"
                  className={cn(
                    'size-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground',
                    'opacity-0 group-hover:opacity-100 transition-all',
                    'hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-600 dark:hover:text-emerald-400'
                  )}
                >
                  <CheckCircle2 className="size-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ─── SECTION: Today's Schedule ────────────────────────────────────────────────

function TodaySchedule() {
  return (
    <Widget title="Today's Schedule" icon={CalendarDays}
      action={<Link href="/dashboard/interviews" className="hover:text-foreground transition-colors">View all →</Link>}
    >
      <div className="px-4 py-3 space-y-2">
        {SCHEDULE.map(ev => {
          const s = CAL_STYLE[ev.type] ?? CAL_STYLE['meeting']!
          return (
            <div key={ev.id}
              className={cn(
                'rounded-xl border-l-2 px-3 py-2.5 transition-all',
                s.accent,
                'bg-muted/20 hover:bg-muted/40',
                ev.isNext && 'ring-1 ring-[#dd7456]/30 bg-[#fdf0ec] dark:bg-[#2a1a15]/60'
              )}>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{ev.candidate}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{ev.role}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-mono font-semibold text-foreground">{ev.time}</p>
                  <p className={cn(
                    'text-[10px] font-semibold',
                    ev.isNext ? 'text-[#dd7456]' : 'text-muted-foreground'
                  )}>{ev.remaining}</p>
                </div>
              </div>
              {ev.isNext && (
                <div className="flex items-center gap-1.5 mt-2">
                  <button className="h-6 px-2 text-[10px] font-semibold rounded-md bg-[#dd7456] text-white hover:bg-[#c45e3e] transition-colors flex items-center gap-1">
                    <Video className="size-2.5" />Join
                  </button>
                  <button className="h-6 px-2 text-[10px] font-medium rounded-md border border-border hover:bg-muted/60 transition-colors">
                    Candidate
                  </button>
                  <button className="h-6 px-2 text-[10px] font-medium rounded-md border border-border hover:bg-muted/60 transition-colors">
                    Notes
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Widget>
  )
}

// ─── SECTION: AI Suggestions ──────────────────────────────────────────────────

function AIAssistant() {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())
  const visible = AI_HINTS.filter(h => !dismissed.has(h.id))

  return (
    <Widget title="AI Suggestions" icon={Sparkles}
      action={<Link href="/dashboard/agents" className="hover:text-foreground transition-colors">AI Hub →</Link>}
    >
      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center px-4">
          <Sparkles className="size-7 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No suggestions right now. Check back soon.</p>
        </div>
      ) : (
        <div className="p-3 space-y-2">
          {visible.map(hint => {
            const Icon = hint.icon
            return (
              <div key={hint.id}
                className={cn('rounded-xl border p-3 transition-all group', AI_COLOR[hint.color]!)}>
                <div className="flex items-start gap-2 mb-2.5">
                  <Icon className={cn('size-3.5 shrink-0 mt-0.5', AI_ICON_COLOR[hint.color])} />
                  <p className="text-sm text-foreground leading-relaxed flex-1">{hint.text}</p>
                  <button
                    onClick={() => setDismissed(s => { const n = new Set(s); n.add(hint.id); return n })}
                    className="size-4 rounded flex items-center justify-center text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  >
                    <X className="size-3" />
                  </button>
                </div>
                <button className={cn(
                  'h-6 px-2.5 text-[10px] font-semibold rounded-lg border transition-colors',
                  AI_BTN_COLOR[hint.color]
                )}>
                  {hint.action}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </Widget>
  )
}

// ─── SECTION: My Jobs ─────────────────────────────────────────────────────────

function MyJobs() {
  return (
    <Widget title="My Jobs" icon={Briefcase}
      action={<Link href="/dashboard/jobs" className="hover:text-foreground transition-colors">View all →</Link>}
    >
      <div className="divide-y divide-border/30">
        {MY_JOBS.map(job => {
          const aging = job.daysOpen > 30 ? 'text-red-600 dark:text-red-400' :
                        job.daysOpen > 14 ? 'text-amber-600 dark:text-amber-400' :
                        'text-muted-foreground'
          const total = job.applicants
          const reviewPct  = Math.min((job.applicants - job.toReview) / total * 100, 100)
          const submitPct  = (total > 0 ? (job.applicants - job.toReview - job.toSubmit) / total * 100 : 0)

          return (
            <div key={job.id} className="px-5 py-4 hover:bg-muted/15 transition-colors group">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{job.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Building2 className="size-3 text-muted-foreground shrink-0" />
                    <p className="text-sm text-muted-foreground truncate">{job.client}</p>
                    <span className="text-muted-foreground/40">·</span>
                    <span className={cn('text-[11px] font-medium', aging)}>{job.daysOpen}d open</span>
                  </div>
                </div>
                <span className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0',
                  job.priority === 'high'
                    ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                    : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                )}>
                  {job.priority === 'high' ? 'High' : 'Medium'}
                </span>
              </div>

              {/* Mini pipeline */}
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
                <span className="font-medium">{job.applicants} applicants</span>
                {job.toReview > 0 && <span className="text-amber-600 dark:text-amber-400 font-semibold">{job.toReview} to review</span>}
                {job.toSubmit > 0 && <span className="text-violet-600 dark:text-violet-400 font-semibold">{job.toSubmit} to submit</span>}
              </div>

              {/* Progress bar */}
              <div className="h-1 rounded-full bg-muted overflow-hidden mb-3">
                <div className="h-full rounded-full bg-[#dd7456]/40 relative overflow-hidden" style={{ width:`${reviewPct}%` }}>
                  <div className="absolute inset-y-0 left-0 bg-[#dd7456] rounded-full" style={{ width:`${submitPct > 0 ? (submitPct/reviewPct*100) : 0}%` }} />
                </div>
              </div>

              {/* Next step + action */}
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] text-muted-foreground truncate">
                  <span className="font-medium">Next:</span> {job.nextStep}
                </p>
                <button className="h-7 px-3 text-sm rounded-lg bg-foreground text-background hover:bg-foreground/85 transition-colors font-medium shrink-0 opacity-0 group-hover:opacity-100">
                  Continue →
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </Widget>
  )
}

// ─── SECTION: Needs Attention ─────────────────────────────────────────────────

function NeedsAttention() {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())

  const groups = Object.entries(ATTENTION_GROUPS)
    .map(([groupName, items]) => ({
      groupName,
      items: items.filter(i => !dismissed.has(i.id)),
    }))
    .filter(g => g.items.length > 0)

  const total = groups.reduce((s, g) => s + g.items.length, 0)

  return (
    <Widget title="Needs Attention" icon={AlertTriangle}
      action={
        total > 0
          ? <span className="text-xs font-semibold text-red-600 dark:text-red-400">{total} items</span>
          : undefined
      }
    >
      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <CheckCircle2 className="size-9 text-emerald-500 mb-3" />
          <p className="text-sm font-semibold">All clear!</p>
          <p className="text-sm text-muted-foreground mt-1">Nothing needs attention right now.</p>
        </div>
      ) : (
        <div className="divide-y divide-border/30">
          {groups.map(({ groupName, items }) => (
            <div key={groupName}>
              <p className="px-5 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {groupName}
              </p>
              {items.map(item => (
                <div key={item.id}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors group">
                  <span className={cn(
                    'size-2 rounded-full shrink-0',
                    item.severity === 'high' ? 'bg-red-500' : 'bg-amber-400'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{item.issue}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Btn label={item.action} variant="ghost" />
                    <button
                      onClick={() => setDismissed(s => { const n = new Set(s); n.add(item.id); return n })}
                      className="size-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted/60 transition-all"
                      title="Dismiss"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </Widget>
  )
}

// ─── SECTION: Today's Progress ────────────────────────────────────────────────

function TodayProgress() {
  return (
    <div className="rounded-2xl bg-background border border-border/60 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Target className="size-3.5 text-muted-foreground" />
          <h3 className="text-sm font-semibold tracking-tight">Today's Progress</h3>
        </div>
        <span className="text-xs text-muted-foreground">Mon, June 30</span>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 divide-x divide-y md:divide-y-0 divide-border/40">
        {PROGRESS.map(m => {
          const pct = Math.min(m.done / m.goal, 1)
          const done = pct >= 1
          const Icon = m.icon
          return (
            <div key={m.label} className="flex flex-col items-center gap-2 py-4 px-3">
              <Icon className={cn('size-4', done ? 'text-emerald-500' : 'text-muted-foreground')} />
              <div className="text-center">
                <span className={cn(
                  'text-xl font-bold tabular-nums leading-none',
                  done ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                )}>{m.done}</span>
                <span className="text-sm text-muted-foreground">/{m.goal}</span>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{m.label}</p>
              <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', done ? 'bg-emerald-500' : 'bg-[#dd7456]')}
                  style={{ width:`${pct * 100}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── SECTION: Placement Watch ─────────────────────────────────────────────────

function PlacementWatch() {
  return (
    <Widget title="Placement Watch" icon={UserCheck}
      action={<Link href="/dashboard/placements" className="hover:text-foreground transition-colors">Open →</Link>}
    >
      <div className="divide-y divide-border/30">
        {PLACEMENTS.map(p => {
          const s = WATCH_STYLE[p.status]!
          return (
            <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/20 transition-colors group">
              <span className={cn('size-2 rounded-full shrink-0', s.dot)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">{p.company} · {p.detail}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap hidden sm:inline', s.badge)}>
                  {s.label}
                </span>
                <button className="h-7 px-2.5 text-sm rounded-lg border border-border hover:bg-muted/60 transition-colors font-medium opacity-0 group-hover:opacity-100">
                  {p.action}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </Widget>
  )
}

// ─── SECTION: Recent Updates ──────────────────────────────────────────────────

const FEED_TABS: { key: FeedTab; label: string }[] = [
  { key:'mine',       label:'My Updates'    },
  { key:'team',       label:'Team'          },
  { key:'ai',         label:'AI'            },
  { key:'automation', label:'Automation'    },
]

function RecentUpdates() {
  const [feed, setFeed] = useState<FeedTab>('mine')
  const visible = ACTIVITY.filter(a => a.feed === feed)

  return (
    <Widget title="Recent Updates" icon={Activity}>
      {/* Feed tabs */}
      <div className="flex border-b border-border/40 bg-muted/20 shrink-0">
        {FEED_TABS.map(t => (
          <button key={t.key} onClick={() => setFeed(t.key)}
            className={cn(
              'flex-1 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
              feed === t.key
                ? 'border-b-2 border-[#dd7456] text-[#dd7456] bg-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            )}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-5 py-2 divide-y divide-border/20">
        {visible.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Nothing here yet.</p>
        ) : visible.map(item => {
          const Icon = item.icon
          return (
            <div key={item.id} className="flex items-start gap-3 py-3">
              <div className={cn('size-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5', item.color)}>
                <Icon className="size-3.5" />
              </div>
              <p className="flex-1 text-sm leading-relaxed">{item.text}</p>
              <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap mt-0.5">{item.time}</span>
            </div>
          )
        })}
      </div>
    </Widget>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [now,       setNow]       = useState<Date | null>(null)
  const [firstName, setFirstName] = useState('')
  const [showModal, setShowModal] = useState(false)
  const todoRef = useRef<HTMLElement | null>(null)

  const store      = useDashboardStore()
  const activeDash = store.dashboards.find(d => d.id === store.activeDashboardId)

  // Returns true when a widget type should be shown (not hidden, or not in config yet)
  function visible(type: string) {
    if (!activeDash) return true
    const w = activeDash.widgets.find(w => w.type === type)
    return !w || !w.hidden
  }

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      createClient().auth.getUser().then(({ data: { user } }) => {
        if (!user) return
        const full = user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split('@')[0] ?? ''
        setFirstName(full.split(' ')[0])
      })
    })
  }, [])

  const h = now?.getHours() ?? 9

  function startMyDay() {
    const el = todoRef.current
    if (!el) return
    el.setAttribute('data-flash', 'true')
    el.scrollIntoView({ behavior:'smooth', block:'start' })
  }

  return (
    <>
    <div className="h-full overflow-y-auto">
      <div className="px-6 py-6 space-y-5 pb-12 max-w-[1600px] mx-auto">

        {/* Quick actions strip */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {([
              { label:'Post Job',       icon:Briefcase,    href:'/dashboard/jobs/new'       },
              { label:'Add Candidate',  icon:UserPlus,     href:'/dashboard/candidates/new' },
              { label:'New Interview',  icon:CalendarCheck,href:'/dashboard/interviews'     },
              { label:'Import Resume',  icon:Upload,       href:'/dashboard/candidates/new' },
              { label:'AI Agents',      icon:Sparkles,     href:'/dashboard/agents'         },
              { label:'Automations',    icon:Zap,          href:'/dashboard/automation'     },
            ] as const).map(({ label, icon: Icon, href }) => (
              <Link key={label} href={href}
                className="h-8 px-3 text-sm rounded-lg border border-border bg-background hover:bg-muted/60 transition-colors flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground whitespace-nowrap">
                <Icon className="size-3.5 shrink-0" />{label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setShowModal(true)}
              className="h-8 px-3 text-sm rounded-lg bg-foreground text-background hover:bg-foreground/85 transition-colors flex items-center gap-1.5 font-medium">
              <Plus className="size-3.5" />New
            </button>
          </div>
        </div>

        {/* ── Today's Focus ─────────────────────────────────────────────── */}
        {visible('today-focus') && (
          <TodayFocus
            greetStr={greet(h)}
            firstName={firstName}
            date={now ? `${fmtDate(now)} · ${fmtTime(now)}` : 'Loading…'}
            onStart={startMyDay}
          />
        )}

        {/* ── Pipeline ──────────────────────────────────────────────────── */}
        {visible('pipeline') && <PipelineFunnel />}

        {/* ── Main workspace + Right column ─────────────────────────────── */}
        {(visible('todo') || visible('schedule') || visible('ai-suggestions')) && (
          <div className="grid grid-cols-12 gap-5">
            {visible('todo') && <ThingsToDo refEl={todoRef} />}
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
              {visible('schedule')       && <TodaySchedule />}
              {visible('ai-suggestions') && <AIAssistant />}
            </div>
            <style>{`
              #things-to-do { grid-column: span 12; }
              @media (min-width: 1024px) { #things-to-do { grid-column: span 7; } }
            `}</style>
          </div>
        )}

        {/* ── My Jobs + Needs Attention ──────────────────────────────────── */}
        {(visible('my-jobs') || visible('attention')) && (
          <div className="grid grid-cols-12 gap-5">
            {visible('my-jobs')    && <div className="col-span-12 lg:col-span-7"><MyJobs /></div>}
            {visible('attention')  && <div className="col-span-12 lg:col-span-5"><NeedsAttention /></div>}
          </div>
        )}

        {/* ── Today's Progress ───────────────────────────────────────────── */}
        {visible('progress') && <TodayProgress />}

        {/* ── Placement Watch + Recent Updates ───────────────────────────── */}
        {(visible('placements') || visible('updates')) && (
          <div className="grid grid-cols-12 gap-5">
            {visible('placements') && <div className="col-span-12 lg:col-span-5"><PlacementWatch /></div>}
            {visible('updates')    && <div className="col-span-12 lg:col-span-7"><RecentUpdates /></div>}
          </div>
        )}

      </div>
    </div>

    {showModal && <NewButtonModal onClose={() => setShowModal(false)} />}
    </>
  )
}
