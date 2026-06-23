'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MapPin, Briefcase, Users, Clock, ChevronDown, Plus, Send,
  Share2, Pencil, Copy, XCircle, FileText, MessageSquare,
  CheckSquare, BarChart2, Search, Filter, LayoutGrid, List,
  Mail, Phone, Star, Building2, TrendingUp, Activity, Eye,
  Paperclip, Zap, ChevronRight, Calendar, Timer, ArrowUpDown,
  MoreHorizontal, Download, X,
} from 'lucide-react'
import { deleteJobAction, updateJobStatusAction } from '../actions'

// ─── Types ─────────────────────────────────────────────────────────────────────

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

// ─── Label maps ────────────────────────────────────────────────────────────────

const EMP_LABELS: Record<string, string> = {
  contract: 'Contract', full_time: 'Full-Time', cth: 'CTH',
  direct_hire: 'Direct Hire', remote: 'Remote', hybrid: 'Hybrid',
}
const WORK_MODE_LABELS: Record<string, string> = {
  onsite: 'On-site', hybrid: 'Hybrid', remote: 'Remote',
}

// ─── Mock pipeline data ─────────────────────────────────────────────────────────

const STAGES = [
  { id: 'sourced',   label: 'Sourced',   count: 42 },
  { id: 'qualified', label: 'Qualified', count: 20 },
  { id: 'submitted', label: 'Submitted', count: 12 },
  { id: 'interview', label: 'Interview', count: 5  },
  { id: 'offer',     label: 'Offer',     count: 2  },
  { id: 'start',     label: 'Start',     count: 1  },
]

type Candidate = {
  id: string; name: string; initials: string; exp: string
  location: string; visa: string; score: number; stage: string; recruiter: string
}

const MOCK_CANDIDATES: Candidate[] = [
  { id: '1',  name: 'Priya Sharma',    initials: 'PS', exp: '7 yrs',  location: 'Dallas, TX',   visa: 'H1B', score: 95, stage: 'sourced',   recruiter: 'RM' },
  { id: '2',  name: 'Rajan Mehta',     initials: 'RM', exp: '9 yrs',  location: 'Austin, TX',   visa: 'USC', score: 91, stage: 'sourced',   recruiter: 'RM' },
  { id: '3',  name: 'Amit Choudhary',  initials: 'AC', exp: '6 yrs',  location: 'Irving, TX',   visa: 'H1B', score: 89, stage: 'sourced',   recruiter: 'SK' },
  { id: '4',  name: 'Neha Verma',      initials: 'NV', exp: '5 yrs',  location: 'Remote',       visa: 'GC',  score: 88, stage: 'qualified', recruiter: 'SK' },
  { id: '5',  name: 'Dinesh Singh',    initials: 'DS', exp: '8 yrs',  location: 'Frisco, TX',   visa: 'H1B', score: 85, stage: 'qualified', recruiter: 'RM' },
  { id: '6',  name: 'Pooja Kulkarni',  initials: 'PK', exp: '4 yrs',  location: 'Plano, TX',    visa: 'USC', score: 84, stage: 'qualified', recruiter: 'AR' },
  { id: '7',  name: 'Aditya Kumar',    initials: 'AK', exp: '11 yrs', location: 'Houston, TX',  visa: 'USC', score: 86, stage: 'submitted', recruiter: 'AR' },
  { id: '8',  name: 'Suresh Patel',    initials: 'SP', exp: '8 yrs',  location: 'Dallas, TX',   visa: 'H1B', score: 84, stage: 'submitted', recruiter: 'RM' },
  { id: '9',  name: 'Nitin Tomar',     initials: 'NT', exp: '7 yrs',  location: 'Irving, TX',   visa: 'H1B', score: 82, stage: 'submitted', recruiter: 'SK' },
  { id: '10', name: 'Sonal Joshi',     initials: 'SJ', exp: '6 yrs',  location: 'Dallas, TX',   visa: 'H1B', score: 83, stage: 'interview', recruiter: 'SK' },
  { id: '11', name: 'Mayank Bansal',   initials: 'MB', exp: '7 yrs',  location: 'Frisco, TX',   visa: 'GC',  score: 81, stage: 'interview', recruiter: 'RM' },
  { id: '12', name: 'Pankaj Singh',    initials: 'PS', exp: '6 yrs',  location: 'Plano, TX',    visa: 'H1B', score: 79, stage: 'interview', recruiter: 'AR' },
  { id: '13', name: 'Vikram Sharma',   initials: 'VS', exp: '8 yrs',  location: 'Austin, TX',   visa: 'GC',  score: 88, stage: 'offer',    recruiter: 'RM' },
  { id: '14', name: 'Rahul Gupta',     initials: 'RG', exp: '6 yrs',  location: 'Dallas, TX',   visa: 'H1B', score: 85, stage: 'offer',    recruiter: 'AR' },
  { id: '15', name: 'Anjali Patel',    initials: 'AP', exp: '7 yrs',  location: 'Dallas, TX',   visa: 'H1B', score: 90, stage: 'start',    recruiter: 'RM' },
]

// ─── Helpers ────────────────────────────────────────────────────────────────────

function statusConfig(s: string) {
  const map: Record<string, { label: string; cls: string }> = {
    open:    { label: 'Open',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    on_hold: { label: 'On Hold', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    closed:  { label: 'Closed',  cls: 'bg-muted text-muted-foreground border-border' },
    filled:  { label: 'Filled',  cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  }
  return map[s] ?? map['open']!
}

function priorityConfig(p: string | null) {
  const map: Record<string, { label: string; cls: string }> = {
    high:   { label: 'High Priority',   cls: 'bg-red-50 text-red-700 border-red-200' },
    medium: { label: 'Med Priority', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    low:    { label: 'Low Priority',    cls: 'bg-muted text-muted-foreground border-border' },
  }
  return map[p ?? 'medium'] ?? map['medium']!
}

function Badge({ label, cls }: { label: string; cls: string }) {
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  )
}

function ScoreBar({ score }: { score: number }) {
  const cls = score >= 90 ? 'text-emerald-600' : score >= 80 ? 'text-blue-600' : 'text-muted-foreground'
  return <span className={`text-xs font-bold tabular-nums ${cls}`}>{score}%</span>
}

// ─── Donut chart ────────────────────────────────────────────────────────────────

function DonutChart({ value, size = 44 }: { value: number; size?: number }) {
  const r = 16
  const c = 2 * Math.PI * r
  const dash = (value / 100) * c
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
      <circle
        cx="20" cy="20" r={r} fill="none"
        stroke="var(--color-primary)" strokeWidth="5"
        strokeDasharray={`${dash} ${c}`}
        strokeLinecap="round"
        transform="rotate(-90 20 20)"
      />
    </svg>
  )
}

// ─── Candidate card ─────────────────────────────────────────────────────────────

function CandidateCard({ c, selected, onClick }: { c: Candidate; selected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`border rounded-lg p-3 cursor-pointer transition-all ${
        selected
          ? 'border-foreground bg-foreground/5 shadow-sm'
          : 'border-border bg-card hover:border-foreground/30 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-2">
        <Avatar className="size-8 shrink-0">
          <AvatarFallback className="text-xs font-semibold bg-muted text-foreground">
            {c.initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <p className="text-xs font-semibold truncate text-foreground">{c.name}</p>
            <ScoreBar score={c.score} />
          </div>
          <p className="text-[11px] text-muted-foreground">{c.exp} · {c.location}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[10px] bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-medium">{c.visa}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Kanban board ───────────────────────────────────────────────────────────────

function KanbanBoard({
  selectedId,
  onSelect,
}: {
  selectedId: string | null
  onSelect: (c: Candidate) => void
}) {
  return (
    <div className="flex gap-3 h-full">
      {STAGES.map(stage => {
        const cards = MOCK_CANDIDATES.filter(c => c.stage === stage.id)
        const visible = cards.slice(0, 3)
        const overflow = cards.length - visible.length
        return (
          <div key={stage.id} className="flex-shrink-0 w-48 flex flex-col">
            {/* Column header */}
            <div className="flex items-center justify-between mb-2 px-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-foreground">{stage.label}</span>
                <span className="text-[10px] bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 font-medium tabular-nums">
                  {stage.count}
                </span>
              </div>
              <button className="size-5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
                <Plus className="size-3" />
              </button>
            </div>
            {/* Cards */}
            <div className="space-y-2">
              {visible.map(c => (
                <CandidateCard
                  key={c.id}
                  c={c}
                  selected={selectedId === c.id}
                  onClick={() => onSelect(c)}
                />
              ))}
            </div>
            {overflow > 0 && (
              <button className="mt-2 text-[11px] text-muted-foreground hover:text-foreground text-left px-1 transition-colors">
                +{overflow} more
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Bottom candidate panel ─────────────────────────────────────────────────────

function CandidatePanel({ c, onClose }: { c: Candidate; onClose: () => void }) {
  const [tab, setTab] = useState('profile')
  return (
    <div className="border-t border-border bg-background flex" style={{ height: '220px' }}>
      {/* Left nav */}
      <div className="w-32 border-r border-border flex-shrink-0 flex flex-col pt-2">
        {[
          { id: 'profile', label: 'Profile',  icon: Users },
          { id: 'resume',  label: 'Resume',   icon: FileText },
          { id: 'notes',   label: 'Notes',    icon: MessageSquare },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-3 py-2 text-xs transition-colors text-left ${
              tab === id
                ? 'bg-muted text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Icon className="size-3.5 shrink-0" />{label}
          </button>
        ))}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0 overflow-auto px-5 py-3">
        {/* Candidate header */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="size-10 shrink-0">
            <AvatarFallback className="font-semibold bg-muted text-foreground">{c.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{c.name}</p>
              <span className="text-xs font-bold text-emerald-600">{c.score}% Match</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {c.exp} Experience · {c.location} · {c.visa}
            </p>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="h-7 text-xs gap-1 px-3">
                  Move Stage<ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-36">
                {STAGES.map(s => (
                  <DropdownMenuItem key={s.id} className={`text-xs ${s.id === c.stage ? 'font-semibold' : ''}`}>
                    {s.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" className="h-7 text-xs gap-1 px-3">
              <Send className="size-3" />Submit
            </Button>
            <button className="size-7 flex items-center justify-center border border-border rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Mail className="size-3.5" />
            </button>
            <button className="size-7 flex items-center justify-center border border-border rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Phone className="size-3.5" />
            </button>
            <button className="size-7 flex items-center justify-center border border-border rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <MoreHorizontal className="size-3.5" />
            </button>
            <button onClick={onClose} className="size-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors ml-1">
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Stage pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {STAGES.map(s => (
            <span
              key={s.id}
              className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                s.id === c.stage
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              {s.label}
            </span>
          ))}
        </div>

        {tab === 'notes' && (
          <div className="mt-3 space-y-2">
            <textarea
              placeholder="Add a note…"
              className="w-full text-xs border border-input rounded-md p-2 resize-none h-16 focus:outline-none focus:ring-1 focus:ring-ring bg-background"
            />
          </div>
        )}
      </div>

      {/* Right: Resume */}
      <div className="w-48 border-l border-border flex-shrink-0 flex flex-col">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="text-xs font-semibold text-foreground">Resume</span>
          <div className="flex items-center gap-1">
            <button className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-0.5 border border-border rounded hover:bg-muted transition-colors">
              Preview
            </button>
            <button className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
              <Download className="size-3" />
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-muted/20">
          <div className="text-center">
            <FileText className="size-8 text-muted-foreground/30 mx-auto mb-1.5" />
            <p className="text-[10px] text-muted-foreground">No resume uploaded</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Right panel ────────────────────────────────────────────────────────────────

function RightPanel({ job, billRate, payRate, margin, marginPct, location, empType, workMode }: {
  job: JobDetailData
  billRate: number; payRate: number; margin: number; marginPct: string
  location: string; empType: string; workMode: string
}) {
  const fields = [
    { label: 'Client',      value: job.client },
    { label: 'End Client',  value: null },
    { label: 'Location',    value: location || null },
    { label: 'Job Type',    value: empType || null },
    { label: 'Duration',    value: null },
    { label: 'Openings',    value: String(job.openings ?? 1) },
    { label: 'Start Date',  value: null },
    { label: 'Work Mode',   value: workMode || null },
    { label: 'VMS / MSP',   value: job.client_type === 'vms' ? 'VMS' : job.client_type === 'direct' ? 'Direct' : null },
  ].filter(f => f.value)

  const requiredSkills  = ['Java', 'Spring Boot', 'Microservices', 'REST APIs', 'AWS', 'SQL']
  const preferredSkills = ['Kubernetes', 'Docker', 'Terraform']

  const team = [
    { name: job.recruiter_name ?? 'Unassigned', role: 'Recruiter',       initials: job.recruiter_name?.slice(0, 2).toUpperCase() ?? 'RR' },
    { name: 'Unassigned',                        role: 'Account Manager', initials: 'AM' },
    { name: 'Unassigned',                        role: 'Client Contact',  initials: 'CC' },
  ]

  return (
    <ScrollArea className="h-full">
      {/* Job Details */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">Job Details</p>
          <Link href={`/dashboard/jobs/${job.id}/edit`} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
            <Pencil className="size-2.5" />Edit
          </Link>
        </div>
        <div className="space-y-1.5">
          {fields.map(({ label, value }) => (
            <div key={label} className="flex items-start justify-between gap-2">
              <span className="text-xs text-muted-foreground shrink-0">{label}</span>
              <span className="text-xs text-foreground font-medium text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Skills */}
      <div className="px-4 py-3 border-b border-border">
        <p className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-2">Key Skills</p>
        <div className="mb-2">
          <p className="text-[10px] text-muted-foreground mb-1.5">Required Skills</p>
          <div className="flex flex-wrap gap-1">
            {requiredSkills.map(s => (
              <span key={s} className="text-[10px] border border-border rounded px-1.5 py-0.5 bg-muted/40 text-foreground font-medium">{s}</span>
            ))}
          </div>
        </div>
        <div className="mb-2">
          <p className="text-[10px] text-muted-foreground mb-1.5">Preferred Skills</p>
          <div className="flex flex-wrap gap-1">
            {preferredSkills.map(s => (
              <span key={s} className="text-[10px] border border-border rounded px-1.5 py-0.5 text-muted-foreground">{s}</span>
            ))}
          </div>
        </div>
        <button className="text-[10px] text-foreground hover:underline font-medium">View All</button>
      </div>

      {/* Hiring Team */}
      <div className="px-4 py-3">
        <p className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-2">Hiring Team</p>
        <div className="space-y-3">
          {team.map(({ name, role, initials }) => (
            <div key={role} className="flex items-center gap-2">
              <Avatar className="size-7 shrink-0">
                <AvatarFallback className="text-[10px] bg-muted text-foreground font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{name}</p>
                <p className="text-[10px] text-muted-foreground">{role}</p>
              </div>
              <button className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
                <Mail className="size-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────────

export function JobDetailClient({ job }: { job: JobDetailData }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [starred, setStarred] = useState(false)

  const location = [job.city, job.state].filter(Boolean).join(', ')
  const empType  = EMP_LABELS[job.employment_type ?? ''] ?? job.employment_type ?? ''
  const workMode = WORK_MODE_LABELS[job.work_mode ?? ''] ?? job.work_mode ?? ''

  const billRate  = job.salary_max ? Math.round(job.salary_max / 100 / 2080) : 85
  const payRate   = job.salary_min ? Math.round(job.salary_min / 100 / 2080) : 65
  const margin    = billRate - payRate
  const marginPct = billRate > 0 ? ((margin / billRate) * 100).toFixed(2) : '0.00'

  const createdAt = new Date(job.created_at)
  const now = new Date()
  const ageDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

  const sc = statusConfig(job.status)
  const pc = priorityConfig(job.priority)

  const kpis = [
    { label: 'Candidates', value: 42, icon: Users       },
    { label: 'Qualified',  value: 20, icon: CheckSquare },
    { label: 'Submitted',  value: 12, icon: Send        },
    { label: 'Interviews', value: 5,  icon: MessageSquare },
    { label: 'Offers',     value: 2,  icon: Star        },
    { label: 'Starts',     value: 1,  icon: Zap         },
    { label: 'Rejected',   value: 8,  icon: XCircle     },
  ]

  const fillRatio = Math.round((1 / (job.openings ?? 3)) * 100)

  function handleStatusChange(s: string) {
    startTransition(async () => { await updateJobStatusAction(job.id, s); router.refresh() })
  }
  function handleDelete() {
    if (!confirm('Delete this job?')) return
    startTransition(async () => { await deleteJobAction(job.id) })
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">

      {/* ── Job Header ─────────────────────────────────────────────────────── */}
      <div className="border-b bg-background flex-shrink-0">

        {/* Row 1: Title + Action buttons */}
        <div className="flex items-center justify-between gap-4 px-6 pt-4 pb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">{job.title}</h1>
            <button
              onClick={() => setStarred(s => !s)}
              className={`shrink-0 transition-colors ${starred ? 'text-amber-400' : 'text-muted-foreground hover:text-amber-400'}`}
            >
              <Star className={`size-4 ${starred ? 'fill-amber-400' : ''}`} />
            </button>
          </div>
          {/* Rate cards */}
          <div className="hidden lg:flex items-stretch gap-3 shrink-0">
            {[
              { label: 'Bill Rate',  value: `$${billRate}/hr`, green: false },
              { label: 'Pay Rate',   value: `$${payRate}/hr`,  green: false },
              { label: 'Margin',     value: `$${margin}/hr`,   green: true  },
              { label: 'Margin %',   value: `${marginPct}%`,   green: true  },
            ].map(({ label, value, green }) => (
              <div key={label} className="text-center px-4 py-1 border border-border rounded-lg bg-muted/20">
                <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
                <p className={`text-sm font-bold tabular-nums ${green ? 'text-emerald-600' : 'text-foreground'}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Badges */}
        <div className="flex items-center gap-2 px-6 py-1.5 flex-wrap">
          {job.display_id && (
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
              {job.display_id}
            </span>
          )}
          <Badge label={sc.label} cls={sc.cls} />
          <Badge label={pc.label} cls={pc.cls} />
          {workMode && <Badge label={workMode} cls="bg-muted text-muted-foreground border-border" />}
          {job.client_type && (
            <Badge
              label={job.client_type === 'vms' ? 'VMS' : 'Direct'}
              cls="bg-muted text-muted-foreground border-border"
            />
          )}
          {/* Actions pushed right */}
          <div className="ml-auto flex items-center gap-1.5">
            <Button size="sm" className="h-8 gap-1.5 text-sm">
              <Plus className="size-3.5" />Add Candidate
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-sm">
              <Send className="size-3.5" />Submit Candidate
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-sm">
              <Share2 className="size-3.5" />Share
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1 text-sm">
                  More<ChevronDown className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/jobs/${job.id}/edit`} className="flex items-center gap-2 text-sm">
                    <Pencil className="size-3.5" />Edit Job
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-sm"><Copy className="size-3.5" />Clone Job</DropdownMenuItem>
                <DropdownMenuSeparator />
                {job.status === 'open' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('on_hold')} className="gap-2 text-sm">
                    <Clock className="size-3.5" />Put on Hold
                  </DropdownMenuItem>
                )}
                {(job.status === 'on_hold' || job.status === 'closed') && (
                  <DropdownMenuItem onClick={() => handleStatusChange('open')} className="gap-2 text-sm">
                    <Activity className="size-3.5" />Reopen Job
                  </DropdownMenuItem>
                )}
                {job.status !== 'filled' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('filled')} className="gap-2 text-sm">
                    <CheckSquare className="size-3.5" />Mark Filled
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="gap-2 text-sm text-destructive focus:text-destructive">
                  <XCircle className="size-3.5" />Delete Job
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Row 3: Meta info */}
        <div className="flex items-center gap-0 px-6 pb-2 flex-wrap">
          {[
            job.client      && { icon: Building2, text: `${job.client} (Client)` },
            location        && { icon: MapPin,    text: location },
            empType         && { icon: Briefcase, text: empType },
            (job.openings ?? 1) > 0 && { icon: Users,  text: `${job.openings ?? 1} Opening${(job.openings ?? 1) > 1 ? 's' : ''}` },
            { icon: Calendar, text: `Posted on ${createdAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}` },
            { icon: Timer,    text: `Open for ${ageDays} day${ageDays !== 1 ? 's' : ''}` },
          ].filter(Boolean).map((item, i) => {
            if (!item) return null
            const { icon: Icon, text } = item as { icon: React.ComponentType<{ className?: string }>; text: string }
            return (
              <span key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground mr-5 shrink-0">
                <Icon className="size-3 shrink-0" />{text}
              </span>
            )
          })}
        </div>
      </div>

      {/* ── KPI Bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center border-b bg-background flex-shrink-0 overflow-x-auto">
        <div className="flex items-center flex-1 px-4">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon
            return (
              <div
                key={kpi.label}
                className={`flex items-center gap-2.5 px-4 py-3 ${i < kpis.length - 1 ? 'border-r border-border' : ''}`}
              >
                <Icon className="size-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-base font-bold text-foreground tabular-nums leading-none">{kpi.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
                </div>
              </div>
            )
          })}
        </div>
        {/* Fill ratio */}
        <div className="flex items-center gap-2.5 px-5 border-l border-border">
          <DonutChart value={fillRatio} size={44} />
          <div>
            <p className="text-[10px] text-muted-foreground">Fill Ratio</p>
            <p className="text-base font-bold text-foreground tabular-nums">{fillRatio}%</p>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: main workspace */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <Tabs defaultValue="pipeline" className="flex flex-col flex-1 overflow-hidden">

            {/* Tab bar */}
            <div className="border-b bg-background flex-shrink-0 px-4">
              <TabsList className="h-10 bg-transparent gap-0 p-0 justify-start w-full">
                {[
                  { id: 'pipeline',  label: 'Pipeline',      icon: LayoutGrid   },
                  { id: 'summary',   label: 'Summary',       icon: FileText     },
                  { id: 'checks',    label: 'Hiring Checks', icon: CheckSquare  },
                  { id: 'notes',     label: 'Notes',         icon: MessageSquare},
                  { id: 'documents', label: 'Documents',     icon: Paperclip    },
                  { id: 'insights',  label: 'Insights',      icon: BarChart2    },
                  { id: 'activity',  label: 'Activity',      icon: Activity     },
                ].map(({ id, label, icon: Icon }) => (
                  <TabsTrigger
                    key={id}
                    value={id}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none h-10 gap-1.5 px-3 text-xs font-normal text-muted-foreground data-[state=active]:text-foreground data-[state=active]:font-medium"
                  >
                    <Icon className="size-3.5" />{label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* ── Pipeline tab ─────────────────────────────────────────────── */}
            <TabsContent value="pipeline" className="flex-1 m-0 flex flex-col overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/10 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <input
                    placeholder="Search candidates…"
                    className="h-8 w-52 pl-8 pr-3 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                  <Filter className="size-3.5" />
                  Filters
                  <span className="flex items-center justify-center size-4 rounded-full bg-foreground text-background text-[9px] font-bold">3</span>
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                  <ArrowUpDown className="size-3.5" />Sort
                </Button>
                <div className="ml-auto flex items-center gap-1">
                  <div className="flex border border-input rounded-md overflow-hidden">
                    <button className="px-2.5 h-8 bg-foreground text-background transition-colors">
                      <LayoutGrid className="size-3.5" />
                    </button>
                    <button className="px-2.5 h-8 text-muted-foreground hover:bg-muted transition-colors">
                      <List className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Kanban + bottom panel */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Board */}
                <div className="flex-1 overflow-x-auto overflow-y-auto px-4 pt-3 pb-2">
                  <KanbanBoard
                    selectedId={selectedCandidate?.id ?? null}
                    onSelect={c => setSelectedCandidate(prev => prev?.id === c.id ? null : c)}
                  />
                </div>
                {/* Bottom panel */}
                {selectedCandidate && (
                  <CandidatePanel
                    c={selectedCandidate}
                    onClose={() => setSelectedCandidate(null)}
                  />
                )}
              </div>
            </TabsContent>

            {/* ── Summary ──────────────────────────────────────────────────── */}
            <TabsContent value="summary" className="m-0 flex-1 overflow-auto p-6">
              <div className="max-w-2xl space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Job Description</p>
                  {job.description
                    ? <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{job.description}</p>
                    : <p className="text-sm text-muted-foreground italic">No description added. <Link href={`/dashboard/jobs/${job.id}/edit`} className="text-foreground underline underline-offset-2">Add one →</Link></p>
                  }
                </div>
                {job.requirements && (
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Requirements</p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── Hiring Checks ─────────────────────────────────────────────── */}
            <TabsContent value="checks" className="m-0 flex-1 overflow-auto p-6">
              <div className="max-w-lg space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Compliance Requirements</p>
                {[
                  { label: 'Visa Verification',     done: 3, total: 3 },
                  { label: 'Education Verification', done: 2, total: 3 },
                  { label: 'Background Check',       done: 1, total: 2 },
                  { label: 'Drug Screen',            done: 0, total: 2 },
                  { label: 'Reference Check',        done: 3, total: 3 },
                ].map(({ label, done, total }) => (
                  <div key={label} className="flex items-center gap-4 border border-border rounded-lg p-3 bg-card">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-medium">{label}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">{done}/{total}</span>
                      </div>
                      <Progress value={(done / total) * 100} className="h-1.5" />
                    </div>
                    <span className={`text-xs font-medium shrink-0 ${done === total ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {done === total ? 'Complete' : 'In Progress'}
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* ── Notes ────────────────────────────────────────────────────── */}
            <TabsContent value="notes" className="m-0 flex-1 overflow-auto p-6">
              <div className="max-w-2xl space-y-4">
                <div className="flex items-center gap-2">
                  {['All', 'Internal', 'Client', 'Candidate'].map(t => (
                    <button key={t} className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                      t === 'All' ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:text-foreground'
                    }`}>{t}</button>
                  ))}
                  <Button size="sm" className="h-7 text-xs ml-auto gap-1">
                    <Plus className="size-3" />Add Note
                  </Button>
                </div>
                {[
                  { author: 'AR', name: 'Arun',   time: '2h ago', type: 'Internal', content: 'Client confirmed 3 resources by end of month. Budget firm at $85/hr. Prefer USC/GC only.' },
                  { author: 'SK', name: 'Suresh', time: '1d ago', type: 'Client',   content: 'Spoke with hiring manager. Flexible on hybrid vs onsite. Max 2 interview rounds.' },
                ].map(({ author, name, time, type, content }) => (
                  <div key={time} className="border border-border rounded-lg p-4 bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="size-6">
                        <AvatarFallback className="text-[10px] bg-muted text-foreground">{author}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{name}</span>
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{type}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{time}</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{content}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* ── Documents ────────────────────────────────────────────────── */}
            <TabsContent value="documents" className="m-0 flex-1 overflow-auto p-6">
              <div className="max-w-2xl space-y-4">
                {[
                  { category: 'Job Documents',    docs: ['Job Description.pdf', 'Rate Card.xlsx'] },
                  { category: 'Client Documents', docs: [] },
                ].map(({ category, docs }) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{category}</p>
                      <Button variant="ghost" size="sm" className="h-6 text-xs gap-1"><Plus className="size-3" />Upload</Button>
                    </div>
                    <div className="border border-border rounded-lg overflow-hidden bg-card">
                      {docs.length > 0 ? docs.map(doc => (
                        <div key={doc} className="flex items-center gap-3 px-3 py-2.5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                          <FileText className="size-4 text-muted-foreground shrink-0" />
                          <span className="text-sm flex-1">{doc}</span>
                          <button className="text-xs text-muted-foreground hover:text-foreground"><Download className="size-3.5" /></button>
                        </div>
                      )) : (
                        <div className="py-8 text-center text-xs text-muted-foreground">
                          No documents. Drag & drop or click Upload.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* ── Insights ─────────────────────────────────────────────────── */}
            <TabsContent value="insights" className="m-0 flex-1 overflow-auto p-6">
              <div className="grid grid-cols-3 gap-4 max-w-2xl mb-6">
                {[
                  { label: 'Submit Rate',    value: '28.6%', sub: '12 of 42 candidates',    color: 'text-blue-600' },
                  { label: 'Offer Rate',     value: '16.7%', sub: '2 of 12 submissions',    color: 'text-violet-600' },
                  { label: 'Fill Rate',      value: `${fillRatio}%`, sub: '1 of 3 openings', color: 'text-emerald-600' },
                  { label: 'Time to Submit', value: '3.2d',  sub: 'Avg sourced → submitted', color: 'text-amber-600' },
                  { label: 'Est. Revenue',   value: `$${(billRate * 2080).toLocaleString()}`, sub: 'Per placement/yr', color: 'text-emerald-600' },
                  { label: 'Est. Margin',    value: `$${(margin * 2080).toLocaleString()}`,   sub: `${marginPct}% margin`,  color: 'text-emerald-600' },
                ].map(({ label, value, sub, color }) => (
                  <Card key={label}>
                    <CardContent className="pt-4">
                      <p className="text-xs text-muted-foreground mb-1">{label}</p>
                      <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* ── Activity ─────────────────────────────────────────────────── */}
            <TabsContent value="activity" className="m-0 flex-1 overflow-auto p-6">
              <div className="max-w-lg">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Recent Activity</p>
                <div className="space-y-3">
                  {[
                    { text: 'Job created', time: `${ageDays} days ago`, user: 'AR' },
                    { text: 'Priya Sharma added to Sourced', time: '2 days ago', user: 'AR' },
                    { text: 'Status changed to Open', time: `${ageDays} days ago`, user: 'AR' },
                  ].map(({ text, time, user }) => (
                    <div key={text} className="flex items-start gap-3">
                      <Avatar className="size-6 shrink-0 mt-0.5">
                        <AvatarFallback className="text-[9px] bg-muted text-foreground">{user}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm text-foreground">{text}</p>
                        <p className="text-xs text-muted-foreground">{time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Right panel ──────────────────────────────────────────────────── */}
        <div className="w-56 shrink-0 border-l bg-background overflow-hidden flex flex-col">
          <RightPanel
            job={job}
            billRate={billRate} payRate={payRate}
            margin={margin} marginPct={marginPct}
            location={location} empType={empType} workMode={workMode}
          />
        </div>
      </div>
    </div>
  )
}
