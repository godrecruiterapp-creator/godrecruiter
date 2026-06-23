'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  ArrowLeft, MapPin, Briefcase, Users, Clock, ChevronDown,
  Plus, Send, Share2, Pencil, Copy, XCircle, MoreHorizontal,
  User, FileText, MessageSquare, CheckSquare, BarChart2,
  Search, Filter, LayoutGrid, List, Phone, Mail, MoveRight,
  Star, Building2, DollarSign, TrendingUp, Activity, Eye,
  StickyNote, Paperclip, Zap, AlertCircle, ChevronRight
} from 'lucide-react'
import { deleteJobAction, updateJobStatusAction } from '../actions'

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Constants ────────────────────────────────────────────────────────────────

const EMP_LABELS: Record<string, string> = {
  contract: 'Contract', full_time: 'Full-Time', cth: 'CTH',
  direct_hire: 'Direct Hire', remote: 'Remote', hybrid: 'Hybrid',
}
const WORK_MODE_LABELS: Record<string, string> = {
  onsite: 'On-site', hybrid: 'Hybrid', remote: 'Remote',
}

// ─── Mock pipeline data ───────────────────────────────────────────────────────

const STAGES = [
  { id: 'sourced',    label: 'Sourced',    count: 42 },
  { id: 'qualified',  label: 'Qualified',  count: 20 },
  { id: 'submitted',  label: 'Submitted',  count: 12 },
  { id: 'interview',  label: 'Interview',  count: 5  },
  { id: 'offer',      label: 'Offer',      count: 2  },
  { id: 'start',      label: 'Start',      count: 1  },
]

const MOCK_CANDIDATES = [
  { id: '1', name: 'Priya Sharma',   exp: '7 yrs', location: 'Dallas, TX', visa: 'H1B',    score: 95, stage: 'sourced',   recruiter: 'AR' },
  { id: '2', name: 'Rajan Mehta',    exp: '9 yrs', location: 'Austin, TX', visa: 'USC',    score: 91, stage: 'sourced',   recruiter: 'AR' },
  { id: '3', name: 'Neha Verma',     exp: '5 yrs', location: 'Remote',     visa: 'GC',     score: 88, stage: 'qualified', recruiter: 'SK' },
  { id: '4', name: 'Aditya Kumar',   exp: '11 yrs', location: 'Houston, TX', visa: 'USC',  score: 86, stage: 'submitted', recruiter: 'AR' },
  { id: '5', name: 'Sonal Joshi',    exp: '6 yrs', location: 'Dallas, TX', visa: 'H1B',    score: 83, stage: 'interview', recruiter: 'SK' },
  { id: '6', name: 'Vikram Singh',   exp: '8 yrs', location: 'Remote',     visa: 'GC',     score: 79, stage: 'offer',    recruiter: 'AR' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open:    'bg-emerald-50 text-emerald-700 border-emerald-200',
    on_hold: 'bg-amber-50 text-amber-700 border-amber-200',
    closed:  'bg-slate-100 text-slate-600 border-slate-200',
    filled:  'bg-blue-50 text-blue-700 border-blue-200',
  }
  const labels: Record<string, string> = {
    open: 'Open', on_hold: 'On Hold', closed: 'Closed', filled: 'Filled',
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[status] ?? map['open']}`}>
      {labels[status] ?? status}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) return null
  const map: Record<string, string> = {
    high:   'bg-red-50 text-red-700 border-red-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low:    'bg-slate-100 text-slate-500 border-slate-200',
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[priority] ?? map['medium']}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
    </span>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? 'text-emerald-600' : score >= 80 ? 'text-amber-600' : 'text-slate-500'
  return <span className={`text-xs font-semibold ${color}`}>{score}%</span>
}

function CandidateCard({ candidate, onClick }: { candidate: typeof MOCK_CANDIDATES[0]; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-border rounded-lg p-3 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start gap-2.5">
        <Avatar className="size-8 shrink-0 mt-0.5">
          <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
            {candidate.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <p className="text-sm font-medium truncate">{candidate.name}</p>
            <ScoreBadge score={candidate.score} />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{candidate.exp} · {candidate.location}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 font-medium">{candidate.visa}</span>
            <span className="text-[10px] text-muted-foreground">• Rec: {candidate.recruiter}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {[
          { icon: Eye, label: 'View' },
          { icon: Send, label: 'Submit' },
          { icon: Mail, label: 'Email' },
          { icon: MessageSquare, label: 'Note' },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded px-1.5 py-0.5 transition-colors"
          >
            <Icon className="size-2.5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

function KanbanBoard({ onCandidateClick }: { onCandidateClick: (c: typeof MOCK_CANDIDATES[0]) => void }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4 min-h-[calc(100vh-320px)]">
      {STAGES.map(stage => {
        const cards = MOCK_CANDIDATES.filter(c => c.stage === stage.id)
        return (
          <div key={stage.id} className="flex-shrink-0 w-56">
            <div className="flex items-center justify-between mb-2 px-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-foreground">{stage.label}</span>
                <span className="text-[10px] bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 font-medium">{stage.count}</span>
              </div>
              <button className="size-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Plus className="size-3" />
              </button>
            </div>
            <div className="space-y-2">
              {cards.map(c => (
                <CandidateCard key={c.id} candidate={c} onClick={() => onCandidateClick(c)} />
              ))}
              {cards.length === 0 && (
                <div className="border-2 border-dashed border-border rounded-lg h-20 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Drop here</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CandidateDrawer({ candidate, open, onClose }: {
  candidate: typeof MOCK_CANDIDATES[0] | null
  open: boolean
  onClose: () => void
}) {
  const [drawerTab, setDrawerTab] = useState('profile')
  if (!candidate) return null
  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent className="w-[480px] sm:max-w-[480px] p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {candidate.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-base">{candidate.name}</SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{candidate.exp} · {candidate.location} · {candidate.visa}</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <Button size="sm" className="h-7 text-xs">Submit</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                <Phone className="size-3 mr-1" />
                Call
              </Button>
            </div>
          </div>
          <div className="flex gap-1 mt-3">
            {['profile','resume','notes','submissions','messages','checks','activity'].map(t => (
              <button
                key={t}
                onClick={() => setDrawerTab(t)}
                className={`text-xs px-2.5 py-1 rounded-md capitalize transition-colors ${
                  drawerTab === t
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {t === 'checks' ? 'Hiring Checks' : t === 'submissions' ? 'Submissions' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </SheetHeader>
        <ScrollArea className="flex-1 p-4">
          {drawerTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Match Score', value: `${candidate.score}%` },
                  { label: 'Stage', value: STAGES.find(s => s.id === candidate.stage)?.label ?? candidate.stage },
                  { label: 'Visa Status', value: candidate.visa },
                  { label: 'Recruiter', value: candidate.recruiter },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-muted/40 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">{label}</p>
                    <p className="text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Move to Stage</p>
                <div className="flex flex-wrap gap-1.5">
                  {STAGES.map(s => (
                    <button
                      key={s.id}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        s.id === candidate.stage
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Skills Match</p>
                <div className="space-y-2">
                  {[
                    { skill: 'Java Spring Boot', match: 95 },
                    { skill: 'Microservices', match: 88 },
                    { skill: 'AWS', match: 72 },
                    { skill: 'Kubernetes', match: 60 },
                  ].map(({ skill, match }) => (
                    <div key={skill} className="flex items-center gap-2">
                      <span className="text-xs w-32 truncate">{skill}</span>
                      <Progress value={match} className="flex-1 h-1.5" />
                      <span className="text-xs text-muted-foreground w-8 text-right">{match}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {drawerTab === 'notes' && (
            <div className="space-y-3">
              <div className="border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="size-5">
                    <AvatarFallback className="text-[10px]">AR</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">Arun</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">2h ago</span>
                </div>
                <p className="text-xs text-foreground">Strong Java background. Available in 2 weeks. Asked about remote flexibility — client is open to hybrid.</p>
              </div>
              <textarea
                placeholder="Add a note... (@mention teammates)"
                className="w-full text-xs border border-border rounded-lg p-3 resize-none h-20 focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <Button size="sm" className="h-7 text-xs w-full">Add Note</Button>
            </div>
          )}
          {drawerTab === 'checks' && (
            <div className="space-y-2">
              {[
                { label: 'Visa Verification', done: true },
                { label: 'Education Verification', done: true },
                { label: 'Background Check', done: false },
                { label: 'Drug Screen', done: false },
                { label: 'Security Clearance', done: false },
                { label: 'Reference Check', done: false },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-3 p-2.5 border border-border rounded-lg">
                  <div className={`size-4 rounded-full flex items-center justify-center ${done ? 'bg-emerald-500' : 'bg-muted border border-border'}`}>
                    {done && (
                      <svg viewBox="0 0 12 12" className="size-2.5 text-white" fill="currentColor">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{label}</span>
                  {!done && (
                    <button className="ml-auto text-[10px] text-primary hover:underline">Initiate</button>
                  )}
                </div>
              ))}
            </div>
          )}
          {(drawerTab === 'resume' || drawerTab === 'submissions' || drawerTab === 'messages' || drawerTab === 'activity') && (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <FileText className="size-8 mb-2 opacity-30" />
              <p className="text-sm">Coming soon</p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function JobDetailClient({ job }: { job: JobDetailData }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [activeKPI, setActiveKPI] = useState<string | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<typeof MOCK_CANDIDATES[0] | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const location = [job.city, job.state].filter(Boolean).join(', ')
  const empType = EMP_LABELS[job.employment_type ?? ''] ?? job.employment_type ?? ''
  const workMode = WORK_MODE_LABELS[job.work_mode ?? ''] ?? job.work_mode ?? ''

  // mock rates
  const billRate = job.salary_max ? Math.round(job.salary_max / 100 / 2080) : 85
  const payRate  = job.salary_min ? Math.round(job.salary_min / 100 / 2080) : 65
  const margin   = billRate - payRate
  const marginPct = billRate > 0 ? ((margin / billRate) * 100).toFixed(1) : '0.0'

  const kpis = [
    { id: 'candidates',  label: 'Candidates',  value: 42, icon: Users,    color: 'text-blue-600' },
    { id: 'submitted',   label: 'Submitted',   value: 12, icon: Send,     color: 'text-violet-600' },
    { id: 'interviews',  label: 'Interviews',  value: 5,  icon: MessageSquare, color: 'text-amber-600' },
    { id: 'offers',      label: 'Offers',      value: 2,  icon: Star,     color: 'text-orange-600' },
    { id: 'starts',      label: 'Starts',      value: 1,  icon: Zap,      color: 'text-emerald-600' },
    { id: 'rejected',    label: 'Rejected',    value: 8,  icon: XCircle,  color: 'text-red-500' },
  ]

  const requiredSkills = ['Java', 'Spring Boot', 'Microservices', 'REST APIs', 'AWS', 'SQL']
  const preferredSkills = ['Kubernetes', 'Docker', 'Kafka', 'CI/CD']

  function handleCandidateClick(c: typeof MOCK_CANDIDATES[0]) {
    setSelectedCandidate(c)
    setDrawerOpen(true)
  }

  async function handleDelete() {
    if (!confirm('Delete this job?')) return
    startTransition(async () => {
      await deleteJobAction(job.id)
    })
  }

  async function handleStatusChange(status: string) {
    startTransition(async () => {
      await updateJobStatusAction(job.id, status)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      {/* ── Sticky Header ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-background border-b shadow-sm">

        {/* Row 1: nav + title + actions */}
        <div className="flex items-center gap-3 px-5 pt-3 pb-2">
          {/* Back */}
          <Link href="/dashboard/jobs" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <ArrowLeft className="size-3.5" />
            <span>Jobs</span>
          </Link>
          <ChevronRight className="size-3 text-muted-foreground/40 shrink-0" />

          {/* Title + badges */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {job.display_id && (
              <span className="text-xs font-mono text-muted-foreground shrink-0">{job.display_id}</span>
            )}
            <h1 className="text-sm font-semibold tracking-tight truncate">{job.title}</h1>
            <div className="flex items-center gap-1.5 flex-wrap">
              <StatusBadge status={job.status} />
              <PriorityBadge priority={job.priority} />
              {workMode && (
                <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground bg-muted/60">
                  {workMode}
                </span>
              )}
              {job.client_type && (
                <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground bg-muted/60">
                  {job.client_type === 'vms' ? 'VMS' : 'Direct'}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button size="sm" className="h-8 gap-1.5 text-xs">
              <Plus className="size-3.5" />Add Candidate
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Send className="size-3.5" />Submit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                  More<ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/jobs/${job.id}/edit`} className="flex items-center gap-2">
                    <Pencil className="size-3.5" />Edit Job
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Share2 className="size-3.5" />Share Job
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Copy className="size-3.5" />Clone Job
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {job.status === 'open' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('on_hold')} className="gap-2">
                    <Clock className="size-3.5" />Put on Hold
                  </DropdownMenuItem>
                )}
                {(job.status === 'on_hold' || job.status === 'closed') && (
                  <DropdownMenuItem onClick={() => handleStatusChange('open')} className="gap-2">
                    <Activity className="size-3.5" />Reopen Job
                  </DropdownMenuItem>
                )}
                {job.status !== 'filled' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('filled')} className="gap-2">
                    <CheckSquare className="size-3.5" />Mark Filled
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="gap-2 text-destructive focus:text-destructive">
                  <XCircle className="size-3.5" />Delete Job
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Row 2: meta + rates */}
        <div className="flex items-center gap-0 px-5 pb-2">
          {/* Left meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-1 min-w-0">
            {job.client && (
              <span className="flex items-center gap-1.5 shrink-0">
                <Building2 className="size-3" />{job.client}
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1.5 shrink-0">
                <MapPin className="size-3" />{location}
              </span>
            )}
            {empType && (
              <span className="flex items-center gap-1.5 shrink-0">
                <Briefcase className="size-3" />{empType}
              </span>
            )}
            <span className="flex items-center gap-1.5 shrink-0">
              <Users className="size-3" />{job.openings ?? 1} {(job.openings ?? 1) === 1 ? 'Opening' : 'Openings'}
            </span>
          </div>

          {/* Rates pill */}
          <div className="flex items-center gap-3 shrink-0 bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-xs">
            <span className="text-muted-foreground">Bill <span className="text-foreground font-semibold">${billRate}/hr</span></span>
            <div className="w-px h-3 bg-border" />
            <span className="text-muted-foreground">Pay <span className="text-foreground font-semibold">${payRate}/hr</span></span>
            <div className="w-px h-3 bg-border" />
            <span className="text-muted-foreground">Margin <span className="text-emerald-600 font-semibold">${margin}/hr</span></span>
            <span className="text-emerald-600 font-semibold">({marginPct}%)</span>
          </div>
        </div>

        {/* KPI Bar */}
        <div className="flex items-center border-t overflow-x-auto">
          {kpis.map((kpi) => {
            const Icon = kpi.icon
            const active = activeKPI === kpi.id
            return (
              <button
                key={kpi.id}
                onClick={() => setActiveKPI(active ? null : kpi.id)}
                className={`flex items-center gap-2 px-5 py-2.5 transition-colors border-b-2 whitespace-nowrap ${
                  active
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                <Icon className={`size-3.5 ${active ? 'text-primary' : kpi.color}`} />
                <span className="text-sm font-semibold">{kpi.value}</span>
                <span className="text-xs">{kpi.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Body: two-column ──────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: main workspace 70% */}
        <div className="flex-1 min-w-0 overflow-auto flex flex-col">
          <Tabs defaultValue="pipeline" className="flex flex-col flex-1 overflow-hidden">
            <div className="px-6 pt-4 pb-0 border-b">
              <TabsList className="h-9 bg-transparent gap-0 p-0">
                {[
                  { id: 'pipeline',  label: 'Pipeline',       icon: LayoutGrid },
                  { id: 'summary',   label: 'Summary',        icon: FileText },
                  { id: 'checks',    label: 'Hiring Checks',  icon: CheckSquare },
                  { id: 'notes',     label: 'Notes',          icon: StickyNote },
                  { id: 'documents', label: 'Documents',      icon: Paperclip },
                  { id: 'insights',  label: 'Insights',       icon: BarChart2 },
                ].map(({ id, label, icon: Icon }) => (
                  <TabsTrigger
                    key={id}
                    value={id}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-9 gap-1.5 px-3 text-muted-foreground data-[state=active]:text-primary"
                  >
                    <Icon className="size-3.5" />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* ── Pipeline Tab ──────────────────────────────────────────── */}
            <TabsContent value="pipeline" className="flex-1 m-0 p-0">
              <div className="px-6 py-3 flex items-center gap-2 border-b bg-muted/20">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <input
                    placeholder="Search candidates..."
                    className="w-full h-8 pl-8 pr-3 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                  <Filter className="size-3.5" />Filter
                </Button>
                <div className="flex items-center border border-input rounded-md overflow-hidden ml-auto">
                  <button className="px-2.5 h-8 text-muted-foreground hover:bg-muted transition-colors border-r border-input">
                    <LayoutGrid className="size-3.5" />
                  </button>
                  <button className="px-2.5 h-8 text-muted-foreground hover:bg-muted transition-colors">
                    <List className="size-3.5" />
                  </button>
                </div>
              </div>
              <div className="px-6 pt-4 overflow-x-auto">
                <KanbanBoard onCandidateClick={handleCandidateClick} />
              </div>
            </TabsContent>

            {/* ── Summary Tab ───────────────────────────────────────────── */}
            <TabsContent value="summary" className="m-0 p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Job Description */}
                <div className="col-span-2">
                  <h3 className="text-sm font-semibold mb-3">Job Description</h3>
                  <div className="prose prose-sm max-w-none text-foreground">
                    {job.description ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{job.description}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No description added yet.</p>
                    )}
                  </div>
                </div>

                {/* Requirements */}
                {job.requirements && (
                  <div className="col-span-2">
                    <h3 className="text-sm font-semibold mb-3">Requirements</h3>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{job.requirements}</p>
                  </div>
                )}

                {/* AI Insights */}
                <div className="col-span-2">
                  <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="size-5 rounded-full bg-violet-600 flex items-center justify-center">
                        <Zap className="size-3 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-violet-900">AI Insights</span>
                      <span className="text-xs text-violet-500 ml-auto">Updated just now</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Market Availability', value: 'High — 1,200+ matching profiles in DFW area' },
                        { label: 'Avg. Time to Fill',   value: '18 days for similar Java roles' },
                        { label: 'Suggested Search',    value: '"Java Spring Boot" AND "Microservices" AND "AWS"' },
                        { label: 'Missing Skills',      value: 'Consider adding Kafka — 65% of matching candidates have it' },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-white/60 rounded-lg p-3">
                          <p className="text-xs text-violet-600 font-medium mb-1">{label}</p>
                          <p className="text-xs text-violet-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hiring Team */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Hiring Team</h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { role: 'Recruiter',       name: job.recruiter_name ?? 'Unassigned', initials: job.recruiter_name?.slice(0, 2).toUpperCase() ?? 'UN' },
                    { role: 'Account Manager', name: 'Unassigned', initials: 'AM' },
                    { role: 'Client Contact',  name: 'Unassigned', initials: 'CC' },
                  ].map(({ role, name, initials }) => (
                    <div key={role} className="flex items-center gap-2.5 border border-border rounded-lg px-3 py-2 bg-background">
                      <Avatar className="size-7">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs text-muted-foreground">{role}</p>
                        <p className="text-sm font-medium">{name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* ── Hiring Checks Tab ─────────────────────────────────────── */}
            <TabsContent value="checks" className="m-0 p-6">
              <div className="space-y-3 max-w-lg">
                <p className="text-sm text-muted-foreground mb-4">Track onboarding and compliance requirements per candidate.</p>
                {[
                  { label: 'Visa Verification',    candidates: 3, done: 3, total: 3 },
                  { label: 'Education Verification', candidates: 3, done: 2, total: 3 },
                  { label: 'Background Check',      candidates: 2, done: 1, total: 2 },
                  { label: 'Drug Screen',           candidates: 2, done: 0, total: 2 },
                  { label: 'Security Clearance',    candidates: 1, done: 0, total: 1 },
                  { label: 'Reference Check',       candidates: 3, done: 3, total: 3 },
                ].map(({ label, done, total }) => (
                  <div key={label} className="flex items-center gap-4 border border-border rounded-lg p-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium">{label}</span>
                        <span className="text-xs text-muted-foreground">{done}/{total}</span>
                      </div>
                      <Progress value={(done / total) * 100} className="h-1.5" />
                    </div>
                    <span className={`text-xs font-medium ${done === total ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {done === total ? 'Complete' : 'In Progress'}
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* ── Notes Tab ─────────────────────────────────────────────── */}
            <TabsContent value="notes" className="m-0 p-6">
              <div className="max-w-2xl space-y-4">
                <div className="flex gap-2">
                  {['All', 'Internal', 'Client', 'Candidate'].map(t => (
                    <button key={t} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      t === 'All' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'
                    }`}>
                      {t}
                    </button>
                  ))}
                  <Button size="sm" className="h-7 text-xs ml-auto gap-1.5">
                    <Plus className="size-3" />Add Note
                  </Button>
                </div>
                {[
                  { author: 'AR', name: 'Arun', time: '2 hours ago', type: 'Internal', content: 'Client confirmed they need 3 resources by end of month. Budget is firm at $85/hr. They prefer USC/GC only.' },
                  { author: 'SK', name: 'Suresh', time: '1 day ago', type: 'Client', content: 'Spoke with hiring manager at ABC Corp. They are flexible on hybrid vs onsite. 2 rounds of interviews max.' },
                ].map(({ author, name, time, type, content }) => (
                  <div key={time} className="border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="size-6">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{author}</AvatarFallback>
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

            {/* ── Documents Tab ─────────────────────────────────────────── */}
            <TabsContent value="documents" className="m-0 p-6">
              <div className="max-w-2xl space-y-4">
                {[
                  { category: 'Job Documents',       docs: ['Job Description.pdf', 'SOW_v2.pdf', 'Rate Card.xlsx'] },
                  { category: 'Client Documents',    docs: [] },
                  { category: 'Candidate Documents', docs: [] },
                ].map(({ category, docs }) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold">{category}</h3>
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                        <Plus className="size-3" />Upload
                      </Button>
                    </div>
                    <div className="border border-border rounded-lg overflow-hidden">
                      {docs.length > 0 ? docs.map(doc => (
                        <div key={doc} className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40 transition-colors border-b border-border last:border-0">
                          <FileText className="size-4 text-muted-foreground shrink-0" />
                          <span className="text-sm flex-1">{doc}</span>
                          <button className="text-xs text-primary hover:underline">Download</button>
                        </div>
                      )) : (
                        <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                          No documents. Drag & drop or click Upload.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* ── Insights Tab ──────────────────────────────────────────── */}
            <TabsContent value="insights" className="m-0 p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Fill Rate',      value: '2.4%', sub: '1 of 3 openings', color: 'text-blue-600' },
                  { label: 'Submit Rate',    value: '28.6%',sub: '12 submitted of 42', color: 'text-violet-600' },
                  { label: 'Offer Rate',     value: '16.7%',sub: '2 offers of 12 submissions', color: 'text-orange-600' },
                  { label: 'Avg Time to Submit', value: '3.2 days', sub: 'From sourced to submitted', color: 'text-amber-600' },
                  { label: 'Est. Revenue',   value: `$${(billRate * 2080).toLocaleString()}`, sub: 'Annual per placement', color: 'text-emerald-600' },
                  { label: 'Est. Margin',    value: `$${(margin * 2080).toLocaleString()}`, sub: `${marginPct}% margin`, color: 'text-emerald-600' },
                ].map(({ label, value, sub, color }) => (
                  <Card key={label}>
                    <CardContent className="pt-4">
                      <p className="text-xs text-muted-foreground mb-1">{label}</p>
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-xl">
                Full pipeline funnel charts coming soon
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: job details panel 30% */}
        <div className="w-72 shrink-0 border-l bg-muted/20 overflow-auto">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-5">

              {/* Job Details */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Job Details</p>
                <div className="space-y-2">
                  {[
                    { label: 'Client',       value: job.client },
                    { label: 'Location',     value: location || null },
                    { label: 'Type',         value: empType || null },
                    { label: 'Work Mode',    value: workMode || null },
                    { label: 'Client Type',  value: job.client_type === 'vms' ? 'VMS' : job.client_type === 'direct' ? 'Direct Client' : null },
                    { label: 'Openings',     value: String(job.openings ?? 1) },
                    { label: 'Department',   value: job.department },
                    { label: 'Recruiter',    value: job.recruiter_name },
                    { label: 'Created',      value: new Date(job.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
                  ].filter(r => r.value).map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-2 text-xs">
                      <span className="text-muted-foreground shrink-0">{label}</span>
                      <span className="text-foreground text-right font-medium truncate">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Skills */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-1">
                  {requiredSkills.map(s => (
                    <span key={s} className="text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5 font-medium">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Preferred Skills</p>
                <div className="flex flex-wrap gap-1">
                  {preferredSkills.map(s => (
                    <span key={s} className="text-xs bg-muted text-muted-foreground border border-border rounded-full px-2 py-0.5">{s}</span>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Rates & Margin */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Rates & Margin</p>
                <div className="space-y-2">
                  {[
                    { label: 'Bill Rate',  value: `$${billRate}/hr`,  highlight: false },
                    { label: 'Pay Rate',   value: `$${payRate}/hr`,   highlight: false },
                    { label: 'Margin',     value: `$${margin}/hr`,    highlight: true },
                    { label: 'Margin %',   value: `${marginPct}%`,    highlight: true },
                  ].map(({ label, value, highlight }) => (
                    <div key={label} className="flex justify-between gap-2 text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className={`font-semibold ${highlight ? 'text-emerald-600' : 'text-foreground'}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* AI Insights mini */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">AI Insights</p>
                <div className="space-y-2">
                  {[
                    { label: '1,200+ profiles', sub: 'matching in DFW', icon: Users },
                    { label: '18 days avg fill',  sub: 'for similar roles',  icon: Clock },
                    { label: 'High availability', sub: 'Java talent pool',   icon: TrendingUp },
                  ].map(({ label, sub, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-lg p-2.5">
                      <Icon className="size-3.5 text-violet-500 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-violet-900">{label}</p>
                        <p className="text-[10px] text-violet-500">{sub}</p>
                      </div>
                    </div>
                  ))}
                  <button className="w-full text-xs text-primary hover:underline text-left flex items-center gap-1 mt-1">
                    View full insights
                    <ChevronRight className="size-3" />
                  </button>
                </div>
              </div>

              <Separator />

              {/* Contacts */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Contacts</p>
                <div className="space-y-2">
                  {[
                    { role: 'Recruiter', name: job.recruiter_name ?? '—', initials: job.recruiter_name?.slice(0,2).toUpperCase() ?? 'RR' },
                    { role: 'Account Manager', name: '—', initials: 'AM' },
                    { role: 'Client Contact', name: '—', initials: 'CC' },
                  ].map(({ role, name, initials }) => (
                    <div key={role} className="flex items-center gap-2">
                      <Avatar className="size-6 shrink-0">
                        <AvatarFallback className="text-[9px] bg-muted text-muted-foreground">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground">{role}</p>
                        <p className="text-xs font-medium truncate">{name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Candidate Drawer */}
      <CandidateDrawer
        candidate={selectedCandidate}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  )
}
