'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowLeft, Pencil, Plus, MoreHorizontal, MapPin, Briefcase,
  Users, Calendar, Search, SlidersHorizontal, ArrowUpDown,
  LayoutGrid, List, Mail, Phone, Send, ChevronDown,
  FileText, Activity, CheckSquare, Clock, Zap, Building2,
} from 'lucide-react'
import { deleteJobAction, updateJobStatusAction } from '../actions'

// ── Types ────────────────────────────────────────────────────────────────────

export interface JobDetailData {
  id: string
  display_id: string | null
  title: string
  client: string | null
  city: string | null
  state: string | null
  employment_type: string | null
  work_mode: string | null
  client_type: string | null
  status: string
  priority: string | null
  recruiter_name: string | null
  openings: number | null
  department: string | null
  description: string | null
  requirements: string | null
  salary_min: number | null
  salary_max: number | null
  created_at: string
  updated_at: string
}

// ── Static maps ──────────────────────────────────────────────────────────────

const EMP_LABELS: Record<string, string> = {
  contract: 'Contract', full_time: 'Full-Time', cth: 'CTH', direct_hire: 'Direct Hire',
}
const WORK_MODE_LABELS: Record<string, string> = {
  onsite: 'On-site', hybrid: 'Hybrid', remote: 'Remote',
}
const STATUS_CONFIG: Record<string, { label: string; dot: string }> = {
  open:    { label: 'Open',    dot: 'bg-emerald-500' },
  on_hold: { label: 'On Hold', dot: 'bg-amber-500'   },
  filled:  { label: 'Filled',  dot: 'bg-blue-500'    },
  closed:  { label: 'Closed',  dot: 'bg-zinc-400'    },
}
const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-red-600', medium: 'text-amber-600', low: 'text-zinc-500',
}

// ── Pipeline stages ──────────────────────────────────────────────────────────

const STAGES = [
  { id: 'sourced',   label: 'Sourced',   count: 42 },
  { id: 'qualified', label: 'Qualified', count: 20 },
  { id: 'submitted', label: 'Submitted', count: 12 },
  { id: 'interview', label: 'Interview', count: 5  },
  { id: 'offer',     label: 'Offer',     count: 2  },
  { id: 'start',     label: 'Started',   count: 1  },
]

// ── Mock candidates ──────────────────────────────────────────────────────────

type Candidate = {
  id: string; name: string; initials: string
  exp: string; location: string; visa: string
  score: number; stage: string
}

const CANDIDATES: Candidate[] = [
  { id:'1',  name:'Priya Sharma',   initials:'PS', exp:'7 yrs', location:'Dallas, TX',  visa:'H1B', score:95, stage:'sourced'   },
  { id:'2',  name:'Rajan Mehta',    initials:'RM', exp:'9 yrs', location:'Austin, TX',  visa:'USC', score:91, stage:'sourced'   },
  { id:'3',  name:'Amit Choudhary', initials:'AC', exp:'6 yrs', location:'Irving, TX',  visa:'H1B', score:89, stage:'sourced'   },
  { id:'4',  name:'Neha Verma',     initials:'NV', exp:'5 yrs', location:'Remote',      visa:'GC',  score:88, stage:'qualified' },
  { id:'5',  name:'Dinesh Singh',   initials:'DS', exp:'8 yrs', location:'Frisco, TX',  visa:'H1B', score:85, stage:'qualified' },
  { id:'6',  name:'Pooja Kulkarni', initials:'PK', exp:'4 yrs', location:'Plano, TX',   visa:'USC', score:84, stage:'qualified' },
  { id:'7',  name:'Aditya Kumar',   initials:'AK', exp:'11 yrs',location:'Houston, TX', visa:'USC', score:86, stage:'submitted' },
  { id:'8',  name:'Suresh Patel',   initials:'SP', exp:'8 yrs', location:'Dallas, TX',  visa:'H1B', score:82, stage:'submitted' },
  { id:'9',  name:'Nitin Tomar',    initials:'NT', exp:'7 yrs', location:'Irving, TX',  visa:'H1B', score:81, stage:'submitted' },
  { id:'10', name:'Sonal Joshi',    initials:'SJ', exp:'6 yrs', location:'Dallas, TX',  visa:'H1B', score:83, stage:'interview' },
  { id:'11', name:'Mayank Bansal',  initials:'MB', exp:'7 yrs', location:'Frisco, TX',  visa:'GC',  score:80, stage:'interview' },
  { id:'12', name:'Vikram Sharma',  initials:'VS', exp:'8 yrs', location:'Austin, TX',  visa:'GC',  score:88, stage:'offer'     },
  { id:'13', name:'Anjali Patel',   initials:'AP', exp:'7 yrs', location:'Dallas, TX',  visa:'H1B', score:90, stage:'start'     },
]

// ── Score badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 90
    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : score >= 80
    ? 'text-blue-700 bg-blue-50 border-blue-200'
    : 'text-zinc-600 bg-zinc-100 border-zinc-200'
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${cls}`}>
      {score}%
    </span>
  )
}

// ── Kanban card ──────────────────────────────────────────────────────────────

function KanbanCard({ c, active, onClick }: {
  c: Candidate; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border px-3 py-3 transition-all cursor-pointer group
        ${active
          ? 'border-foreground bg-foreground/[0.03] shadow-sm'
          : 'border-border bg-card hover:border-foreground/30 hover:shadow-sm'
        }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="size-6 shrink-0">
            <AvatarFallback className="text-[9px] font-bold bg-muted text-muted-foreground">
              {c.initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-semibold text-foreground truncate">{c.name}</span>
        </div>
        <ScoreBadge score={c.score} />
      </div>
      <p className="text-[11px] text-muted-foreground mb-2">
        {c.exp} · {c.location}
      </p>
      <span className="inline-block text-[10px] font-medium bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md">
        {c.visa}
      </span>
    </button>
  )
}

// ── Candidate drawer ─────────────────────────────────────────────────────────

function CandidateDrawer({ c, open, onClose }: {
  c: Candidate | null; open: boolean; onClose: () => void
}) {
  const [tab, setTab] = useState<'profile' | 'resume' | 'notes'>('profile')
  if (!c) return null

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="right" className="w-[380px] p-0 flex flex-col gap-0">
        {/* Candidate header */}
        <div className="px-5 pt-5 pb-4 border-b">
          <div className="flex items-start gap-3 mb-4">
            <Avatar className="size-11">
              <AvatarFallback className="font-bold bg-muted text-foreground text-sm">
                {c.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">{c.name}</h3>
                <ScoreBadge score={c.score} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{c.exp} · {c.location} · {c.visa}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-8 gap-1.5 text-xs flex-1">
              <Send className="size-3" />Submit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                  Move <ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                {STAGES.map(s => (
                  <DropdownMenuItem key={s.id} className={`text-xs ${s.id === c.stage ? 'font-semibold' : ''}`}>
                    {s.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button className="size-8 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Mail className="size-3.5" />
            </button>
            <button className="size-8 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Phone className="size-3.5" />
            </button>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-0 mt-4 -mx-5 px-5 border-t pt-0">
            {(['profile', 'resume', 'notes'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pt-3 pb-2 px-3 text-xs capitalize border-b-2 transition-colors ${
                  tab === t
                    ? 'border-foreground text-foreground font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-5 py-5">
            {tab === 'profile' && (
              <div className="space-y-5">
                {[
                  { label: 'Stage',      value: STAGES.find(s => s.id === c.stage)?.label ?? c.stage },
                  { label: 'Experience', value: c.exp      },
                  { label: 'Location',   value: c.location },
                  { label: 'Visa',       value: c.visa     },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</p>
                    <p className="text-sm text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === 'resume' && (
              <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
                <div className="size-12 rounded-2xl bg-muted flex items-center justify-center">
                  <FileText className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No resume uploaded</p>
                <p className="text-xs text-muted-foreground">Upload a PDF or Word document</p>
                <Button size="sm" variant="outline" className="mt-1 text-xs">Upload Resume</Button>
              </div>
            )}

            {tab === 'notes' && (
              <div className="space-y-3">
                <textarea
                  placeholder="Add a note about this candidate…"
                  className="w-full h-32 text-sm border border-input rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                />
                <Button size="sm" className="w-full text-xs">Save Note</Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

// ── Right panel (job info) ───────────────────────────────────────────────────

function JobInfoPanel({ job, billRate, payRate, margin, marginPct, location, empType, workMode }: {
  job: JobDetailData
  billRate: number; payRate: number; margin: number; marginPct: string
  location: string; empType: string; workMode: string
}) {
  const createdAt = new Date(job.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  const details = [
    { label: 'Client',    value: job.client },
    { label: 'Location',  value: location || null },
    { label: 'Job Type',  value: empType || null  },
    { label: 'Work Mode', value: workMode || null },
    { label: 'Openings',  value: job.openings ? String(job.openings) : '1' },
    { label: 'Posted',    value: createdAt },
    { label: 'Type',      value: job.client_type === 'vms' ? 'VMS' : job.client_type === 'direct' ? 'Direct' : null },
  ].filter(f => f.value)

  const team = [
    { initials: job.recruiter_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '--', name: job.recruiter_name ?? 'Unassigned', role: 'Recruiter' },
    { initials: '--', name: 'Unassigned', role: 'Account Manager'  },
    { initials: '--', name: 'Unassigned', role: 'Client Contact'   },
  ]

  return (
    <ScrollArea className="h-full">
      <div className="px-5 py-5 space-y-6">

        {/* Details */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Job Details</p>
            <Link href={`/dashboard/jobs/${job.id}/edit`} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
              <Pencil className="size-2.5" />Edit
            </Link>
          </div>
          <div className="space-y-2.5">
            {details.map(({ label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="text-xs text-muted-foreground w-20 shrink-0 leading-5">{label}</span>
                <span className="text-xs text-foreground font-medium leading-5 break-words">{value}</span>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Rates */}
        <section>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Rates</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Bill Rate', value: `$${billRate}/hr`, green: false },
              { label: 'Pay Rate',  value: `$${payRate}/hr`,  green: false },
              { label: 'Margin',    value: `$${margin}/hr`,   green: true  },
              { label: 'Margin %',  value: `${marginPct}%`,   green: true  },
            ].map(({ label, value, green }) => (
              <div key={label} className="rounded-xl border border-border bg-muted/20 px-3 py-2.5">
                <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
                <p className={`text-sm font-bold tabular-nums ${green ? 'text-emerald-600' : 'text-foreground'}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Skills */}
        <section>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Required Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {['Java', 'Spring Boot', 'Microservices', 'REST APIs', 'AWS', 'SQL'].map(s => (
              <span key={s} className="text-[11px] border border-border rounded-lg px-2 py-1 bg-background text-foreground">
                {s}
              </span>
            ))}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-4 mb-3">Nice to Have</p>
          <div className="flex flex-wrap gap-1.5">
            {['Kubernetes', 'Docker', 'Terraform'].map(s => (
              <span key={s} className="text-[11px] border border-dashed border-border rounded-lg px-2 py-1 text-muted-foreground">
                {s}
              </span>
            ))}
          </div>
        </section>

        <Separator />

        {/* Hiring team */}
        <section>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Hiring Team</p>
          <div className="space-y-3">
            {team.map(({ initials, name, role }) => (
              <div key={role} className="flex items-center gap-2.5">
                <Avatar className="size-7 shrink-0">
                  <AvatarFallback className="text-[10px] font-semibold bg-muted text-muted-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{name}</p>
                  <p className="text-[10px] text-muted-foreground">{role}</p>
                </div>
                {name !== 'Unassigned' && (
                  <button className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                    <Mail className="size-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </ScrollArea>
  )
}

// ── Main export ──────────────────────────────────────────────────────────────

export function JobDetailClient({ job }: { job: JobDetailData }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Computed values
  const location  = [job.city, job.state].filter(Boolean).join(', ')
  const empType   = EMP_LABELS[job.employment_type ?? ''] ?? job.employment_type ?? ''
  const workMode  = WORK_MODE_LABELS[job.work_mode ?? ''] ?? job.work_mode ?? ''
  const billRate  = job.salary_max ? Math.round(job.salary_max / 100 / 2080) : 85
  const payRate   = job.salary_min ? Math.round(job.salary_min / 100 / 2080) : 65
  const margin    = billRate - payRate
  const marginPct = billRate > 0 ? ((margin / billRate) * 100).toFixed(1) : '0.0'
  const ageDays   = Math.floor((Date.now() - new Date(job.created_at).getTime()) / 86_400_000)

  const sc        = STATUS_CONFIG[job.status] ?? STATUS_CONFIG['open']!
  const prioColor = PRIORITY_COLORS[job.priority ?? 'medium'] ?? PRIORITY_COLORS['medium']!
  const prioLabel = { high: 'High', medium: 'Medium', low: 'Low' }[job.priority ?? 'medium'] ?? 'Medium'

  // Pipeline counts
  const counts = {
    total:       CANDIDATES.length,
    qualified:   CANDIDATES.filter(c => ['qualified','submitted','interview','offer','start'].includes(c.stage)).length,
    submitted:   CANDIDATES.filter(c => ['submitted','interview','offer','start'].includes(c.stage)).length,
    interviewing:CANDIDATES.filter(c => ['interview','offer','start'].includes(c.stage)).length,
    offers:      CANDIDATES.filter(c => ['offer','start'].includes(c.stage)).length,
    placements:  CANDIDATES.filter(c => c.stage === 'start').length,
  }

  function openDrawer(c: Candidate) {
    setActiveCandidate(c)
    setDrawerOpen(true)
  }

  function handleStatusChange(s: string) {
    startTransition(async () => { await updateJobStatusAction(job.id, s); router.refresh() })
  }
  function handleDelete() {
    if (!confirm('Delete this job? This cannot be undone.')) return
    startTransition(async () => { await deleteJobAction(job.id) })
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-5 h-14 border-b bg-background shrink-0">
        {/* Back */}
        <Link
          href="/dashboard/jobs"
          className="size-8 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
        >
          <ArrowLeft className="size-4" />
        </Link>

        {/* Title + badges */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-foreground truncate">{job.title}</h1>

          {job.display_id && (
            <span className="shrink-0 text-[10px] font-mono text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded-md">
              {job.display_id}
            </span>
          )}

          <span className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-foreground">
            <span className={`size-1.5 rounded-full shrink-0 ${sc.dot}`} />
            {sc.label}
          </span>

          <span className={`shrink-0 text-xs font-medium ${prioColor}`}>
            {prioLabel}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" asChild>
            <Link href={`/dashboard/jobs/${job.id}/edit`}>
              <Pencil className="size-3" />Edit
            </Link>
          </Button>
          <Button size="sm" className="h-8 gap-1.5 text-xs">
            <Plus className="size-3" />Add Candidate
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {job.status === 'open' && (
                <DropdownMenuItem onClick={() => handleStatusChange('on_hold')} className="text-sm gap-2">
                  <Clock className="size-3.5" />Put on Hold
                </DropdownMenuItem>
              )}
              {job.status === 'on_hold' && (
                <DropdownMenuItem onClick={() => handleStatusChange('open')} className="text-sm gap-2">
                  <Zap className="size-3.5" />Reopen
                </DropdownMenuItem>
              )}
              {job.status !== 'filled' && (
                <DropdownMenuItem onClick={() => handleStatusChange('filled')} className="text-sm gap-2">
                  <CheckSquare className="size-3.5" />Mark as Filled
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-sm gap-2 text-destructive focus:text-destructive">
                Delete Job
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Meta bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-6 px-5 h-9 border-b bg-muted/20 shrink-0 overflow-x-auto">
        {[
          job.client && { icon: Building2, text: job.client },
          location   && { icon: MapPin,    text: location   },
          empType    && { icon: Briefcase, text: empType    },
          workMode   && { icon: Briefcase, text: workMode   },
          { icon: Users,    text: `${job.openings ?? 1} opening${(job.openings ?? 1) !== 1 ? 's' : ''}` },
          { icon: Calendar, text: `Open ${ageDays}d` },
        ].filter(Boolean).map((item, i) => {
          const { icon: Icon, text } = item as { icon: React.ComponentType<{ className?: string }>; text: string }
          return (
            <span key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground shrink-0">
              <Icon className="size-3 shrink-0" />{text}
            </span>
          )
        })}
      </div>

      {/* ── Pipeline funnel strip ─────────────────────────────────────────── */}
      <div className="flex border-b bg-background shrink-0">
        {[
          { label: 'Total',        value: counts.total        },
          { label: 'Qualified',    value: counts.qualified    },
          { label: 'Submitted',    value: counts.submitted    },
          { label: 'Interviewing', value: counts.interviewing },
          { label: 'Offers',       value: counts.offers       },
          { label: 'Placements',   value: counts.placements   },
        ].map(({ label, value }, i, arr) => (
          <div
            key={label}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 ${
              i < arr.length - 1 ? 'border-r border-border' : ''
            }`}
          >
            <span className="text-base font-bold text-foreground tabular-nums leading-none">{value}</span>
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <Tabs defaultValue="pipeline" className="flex flex-col flex-1 overflow-hidden">

            {/* Tabs */}
            <TabsList className="h-10 bg-transparent px-5 justify-start shrink-0 border-b rounded-none w-full gap-0 p-0">
              {[
                { id: 'pipeline', label: 'Pipeline'    },
                { id: 'details',  label: 'Description' },
                { id: 'notes',    label: 'Notes'       },
                { id: 'activity', label: 'Activity'    },
              ].map(({ id, label }) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className="h-10 px-4 rounded-none border-b-2 border-transparent text-sm font-normal text-muted-foreground bg-transparent shadow-none
                    data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ── Pipeline tab ─────────────────────────────────────────── */}
            <TabsContent value="pipeline" className="flex-1 m-0 flex flex-col overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-2 px-5 py-2.5 border-b shrink-0 bg-muted/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    placeholder="Search candidates…"
                    className="h-8 w-52 pl-9 pr-3 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
                  <SlidersHorizontal className="size-3.5" />Filters
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
                  <ArrowUpDown className="size-3.5" />Sort
                </Button>
                <div className="ml-auto flex items-center border border-input rounded-lg overflow-hidden">
                  <button className="h-8 px-2.5 bg-foreground text-background flex items-center transition-colors">
                    <LayoutGrid className="size-3.5" />
                  </button>
                  <button className="h-8 px-2.5 text-muted-foreground hover:bg-muted flex items-center transition-colors">
                    <List className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Kanban */}
              <div className="flex-1 overflow-x-auto overflow-y-auto px-5 py-4">
                <div className="flex gap-3 h-full" style={{ minWidth: 'max-content' }}>
                  {STAGES.map(stage => {
                    const cards = CANDIDATES.filter(c => c.stage === stage.id)
                    const visible = cards.slice(0, 4)
                    const overflow = cards.length - visible.length
                    return (
                      <div key={stage.id} className="w-52 shrink-0 flex flex-col">
                        {/* Column header */}
                        <div className="flex items-center justify-between mb-2.5 px-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground">{stage.label}</span>
                            <span className="text-[10px] font-medium bg-muted text-muted-foreground rounded-full px-2 py-0.5 tabular-nums">
                              {stage.count}
                            </span>
                          </div>
                          <button className="size-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                            <Plus className="size-3.5" />
                          </button>
                        </div>

                        {/* Cards */}
                        <div className="flex flex-col gap-2">
                          {visible.map(c => (
                            <KanbanCard
                              key={c.id}
                              c={c}
                              active={activeCandidate?.id === c.id}
                              onClick={() => openDrawer(c)}
                            />
                          ))}
                        </div>

                        {overflow > 0 && (
                          <button className="mt-2 text-[11px] text-muted-foreground hover:text-foreground px-0.5 text-left transition-colors">
                            +{overflow} more
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </TabsContent>

            {/* ── Description tab ───────────────────────────────────────── */}
            <TabsContent value="details" className="flex-1 m-0 overflow-auto">
              <div className="max-w-2xl px-6 py-6 space-y-6">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Job Description</p>
                  {job.description ? (
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{job.description}</p>
                  ) : (
                    <div className="border border-dashed border-border rounded-2xl py-12 flex flex-col items-center gap-3 text-center">
                      <FileText className="size-7 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">No description added yet</p>
                      <Link href={`/dashboard/jobs/${job.id}/edit`} className="text-xs text-foreground underline underline-offset-2">
                        Add description →
                      </Link>
                    </div>
                  )}
                </div>
                {job.requirements && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Requirements</p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── Notes tab ─────────────────────────────────────────────── */}
            <TabsContent value="notes" className="flex-1 m-0 overflow-auto">
              <div className="max-w-2xl px-6 py-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</p>
                  <Button size="sm" className="h-8 gap-1.5 text-xs">
                    <Plus className="size-3" />Add Note
                  </Button>
                </div>
                <div className="space-y-3">
                  {[
                    { author:'AR', name:'Arun',   time:'2 hours ago', note:'Client confirmed 3 resources by end of month. Budget firm at $85/hr. Prefer USC or GC only.' },
                    { author:'SK', name:'Suresh', time:'1 day ago',   note:'Spoke with hiring manager. Flexible on hybrid vs onsite. Max 2 interview rounds.' },
                  ].map(({ author, name, time, note }) => (
                    <div key={time} className="border border-border rounded-2xl p-4">
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <Avatar className="size-7">
                          <AvatarFallback className="text-[10px] font-semibold bg-muted text-foreground">{author}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-foreground">{name}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{time}</span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* ── Activity tab ───────────────────────────────────────────── */}
            <TabsContent value="activity" className="flex-1 m-0 overflow-auto">
              <div className="max-w-xl px-6 py-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">Activity Log</p>
                <div className="space-y-0">
                  {[
                    { text:'Job created',                      time:`${ageDays} days ago`, user:'AR' },
                    { text:'Priya Sharma added to Sourced',    time:'2 days ago',           user:'AR' },
                    { text:'Dinesh Singh moved to Qualified',  time:'1 day ago',            user:'SK' },
                    { text:'Aditya Kumar submitted to client', time:'18 hours ago',         user:'AR' },
                  ].map(({ text, time, user }, i) => (
                    <div key={i} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
                      <Avatar className="size-6 shrink-0 mt-0.5">
                        <AvatarFallback className="text-[9px] font-semibold bg-muted text-foreground">{user}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm text-foreground">{text}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Right panel ──────────────────────────────────────────────────── */}
        <div className="w-64 shrink-0 border-l bg-background overflow-hidden flex flex-col">
          <JobInfoPanel
            job={job}
            billRate={billRate} payRate={payRate}
            margin={margin} marginPct={marginPct}
            location={location} empType={empType} workMode={workMode}
          />
        </div>
      </div>

      {/* ── Candidate side drawer ─────────────────────────────────────────── */}
      <CandidateDrawer
        c={activeCandidate}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setActiveCandidate(null) }}
      />
    </div>
  )
}
