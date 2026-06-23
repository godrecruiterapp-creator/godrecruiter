'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Mail, Star, Building2, TrendingUp, Activity, Eye,
  StickyNote, Paperclip, Zap, ChevronRight,
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
const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  open:    { label: 'Open',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  on_hold: { label: 'On Hold', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  closed:  { label: 'Closed',  cls: 'bg-muted text-muted-foreground border-border' },
  filled:  { label: 'Filled',  cls: 'bg-blue-50 text-blue-700 border-blue-200' },
}
const PRIORITY_MAP: Record<string, { label: string; cls: string }> = {
  high:   { label: 'High Priority',   cls: 'bg-red-50 text-red-700 border-red-200' },
  medium: { label: 'Med Priority', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  low:    { label: 'Low Priority',    cls: 'bg-muted text-muted-foreground border-border' },
}

// ─── Mock data ──────────────────────────────────────────────────────────────────

const STAGES = [
  { id: 'sourced',   label: 'Sourced',   count: 42 },
  { id: 'qualified', label: 'Qualified', count: 20 },
  { id: 'submitted', label: 'Submitted', count: 12 },
  { id: 'interview', label: 'Interview', count: 5  },
  { id: 'offer',     label: 'Offer',     count: 2  },
  { id: 'start',     label: 'Start',     count: 1  },
]

const MOCK_CANDIDATES = [
  { id: '1', name: 'Priya Sharma',  exp: '7 yrs', location: 'Dallas, TX',   visa: 'H1B', score: 95, stage: 'sourced',   recruiter: 'AR' },
  { id: '2', name: 'Rajan Mehta',   exp: '9 yrs', location: 'Austin, TX',   visa: 'USC', score: 91, stage: 'sourced',   recruiter: 'AR' },
  { id: '3', name: 'Neha Verma',    exp: '5 yrs', location: 'Remote',       visa: 'GC',  score: 88, stage: 'qualified', recruiter: 'SK' },
  { id: '4', name: 'Aditya Kumar',  exp: '11 yrs', location: 'Houston, TX', visa: 'USC', score: 86, stage: 'submitted', recruiter: 'AR' },
  { id: '5', name: 'Sonal Joshi',   exp: '6 yrs', location: 'Dallas, TX',   visa: 'H1B', score: 83, stage: 'interview', recruiter: 'SK' },
  { id: '6', name: 'Vikram Singh',  exp: '8 yrs', location: 'Remote',       visa: 'GC',  score: 79, stage: 'offer',     recruiter: 'AR' },
]

// ─── Small reusable pieces ─────────────────────────────────────────────────────

function Chip({ label, cls }: { label: string; cls: string }) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
      {children}
    </p>
  )
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0 w-24">{label}</span>
      <span className="text-xs text-foreground font-medium text-right">{value}</span>
    </div>
  )
}

function ScoreDot({ score }: { score: number }) {
  const cls = score >= 90 ? 'text-emerald-600' : score >= 80 ? 'text-amber-600' : 'text-muted-foreground'
  return <span className={`text-xs font-semibold tabular-nums ${cls}`}>{score}%</span>
}

// ─── Candidate card ─────────────────────────────────────────────────────────────

function CandidateCard({ c, onClick }: { c: typeof MOCK_CANDIDATES[0]; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-foreground/20 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start gap-2.5">
        <Avatar className="size-8 shrink-0">
          <AvatarFallback className="text-xs bg-muted text-foreground font-semibold">
            {c.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <p className="text-sm font-medium truncate">{c.name}</p>
            <ScoreDot score={c.score} />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{c.exp} · {c.location}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[10px] bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-medium">{c.visa}</span>
            <span className="text-[10px] text-muted-foreground">Rec: {c.recruiter}</span>
          </div>
        </div>
      </div>
      {/* Hover actions */}
      <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {([['View', Eye], ['Submit', Send], ['Email', Mail], ['Note', MessageSquare]] as const).map(([label, Icon]) => (
          <button
            key={label}
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground bg-muted hover:bg-accent rounded px-1.5 py-0.5 transition-colors"
          >
            <Icon className="size-2.5" />{label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Kanban ─────────────────────────────────────────────────────────────────────

function KanbanBoard({ onCandidateClick }: { onCandidateClick: (c: typeof MOCK_CANDIDATES[0]) => void }) {
  return (
    <div className="flex gap-3 pb-4 h-full">
      {STAGES.map(stage => {
        const cards = MOCK_CANDIDATES.filter(c => c.stage === stage.id)
        return (
          <div key={stage.id} className="flex-shrink-0 w-56 flex flex-col">
            {/* Column header */}
            <div className="flex items-center justify-between mb-2 px-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-foreground">{stage.label}</span>
                <span className="text-[10px] bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 font-medium tabular-nums">
                  {stage.count}
                </span>
              </div>
              <button className="size-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Plus className="size-3" />
              </button>
            </div>
            {/* Cards */}
            <div className="flex-1 space-y-2 overflow-y-auto">
              {cards.map(c => (
                <CandidateCard key={c.id} c={c} onClick={() => onCandidateClick(c)} />
              ))}
              {cards.length === 0 && (
                <div className="border-2 border-dashed border-border rounded-lg h-16 flex items-center justify-center">
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

// ─── Candidate drawer ───────────────────────────────────────────────────────────

function CandidateDrawer({ candidate, open, onClose }: {
  candidate: typeof MOCK_CANDIDATES[0] | null
  open: boolean
  onClose: () => void
}) {
  const [tab, setTab] = useState('profile')
  if (!candidate) return null

  const drawerTabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'resume', label: 'Resume' },
    { id: 'notes', label: 'Notes' },
    { id: 'checks', label: 'Checks' },
    { id: 'activity', label: 'Activity' },
  ]

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent className="w-[460px] sm:max-w-[460px] p-0 flex flex-col">
        {/* Drawer header */}
        <SheetHeader className="px-5 pt-5 pb-0 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="size-10">
              <AvatarFallback className="bg-muted text-foreground font-semibold">
                {candidate.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-sm font-semibold">{candidate.name}</SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{candidate.exp} · {candidate.location} · {candidate.visa}</p>
            </div>
            <div className="flex gap-1.5">
              <Button size="sm" className="h-7 text-xs px-3">Submit</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs px-3">Email</Button>
            </div>
          </div>
          {/* Sub-tabs */}
          <div className="flex gap-0 border-b">
            {drawerTabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`text-xs px-3 py-2 border-b-2 transition-colors ${
                  tab === t.id
                    ? 'border-foreground text-foreground font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-5 space-y-5">
            {tab === 'profile' && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Match Score', value: `${candidate.score}%` },
                    { label: 'Stage', value: STAGES.find(s => s.id === candidate.stage)?.label ?? candidate.stage },
                    { label: 'Visa', value: candidate.visa },
                    { label: 'Recruiter', value: candidate.recruiter },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-muted/40 rounded-lg p-3 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                      <p className="text-sm font-semibold">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Move stage */}
                <div>
                  <SectionLabel>Move to Stage</SectionLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {STAGES.map(s => (
                      <button
                        key={s.id}
                        className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                          s.id === candidate.stage
                            ? 'bg-foreground text-background border-foreground'
                            : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <SectionLabel>Skills Match</SectionLabel>
                  <div className="space-y-2">
                    {[
                      { skill: 'Java Spring Boot', match: 95 },
                      { skill: 'Microservices',    match: 88 },
                      { skill: 'AWS',              match: 72 },
                      { skill: 'Kubernetes',       match: 60 },
                    ].map(({ skill, match }) => (
                      <div key={skill} className="flex items-center gap-3">
                        <span className="text-xs w-32 truncate text-foreground">{skill}</span>
                        <Progress value={match} className="flex-1 h-1.5" />
                        <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">{match}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {tab === 'notes' && (
              <div className="space-y-3">
                <div className="border border-border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="size-5">
                      <AvatarFallback className="text-[10px]">AR</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">Arun</span>
                    <span className="text-xs text-muted-foreground ml-auto">2h ago</span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">
                    Strong Java background. Available in 2 weeks. Asked about remote flexibility — client is open to hybrid.
                  </p>
                </div>
                <textarea
                  placeholder="Add a note… (@mention teammates)"
                  className="w-full text-xs border border-input rounded-lg p-3 resize-none h-20 focus:outline-none focus:ring-1 focus:ring-ring bg-background"
                />
                <Button size="sm" className="h-7 text-xs w-full">Add Note</Button>
              </div>
            )}

            {tab === 'checks' && (
              <div className="space-y-2">
                <SectionLabel>Compliance Checklist</SectionLabel>
                {[
                  { label: 'Visa Verification',    done: true },
                  { label: 'Education Verification', done: true },
                  { label: 'Background Check',      done: false },
                  { label: 'Drug Screen',           done: false },
                  { label: 'Security Clearance',    done: false },
                  { label: 'Reference Check',       done: false },
                ].map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-3 p-2.5 border border-border rounded-lg">
                    <div className={`size-4 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-emerald-500' : 'border border-border bg-muted'}`}>
                      {done && (
                        <svg viewBox="0 0 12 12" className="size-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 6l3 3 5-5" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs flex-1 ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{label}</span>
                    {!done && <button className="text-[10px] text-primary hover:underline shrink-0">Initiate</button>}
                  </div>
                ))}
              </div>
            )}

            {(tab === 'resume' || tab === 'activity') && (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <FileText className="size-7 mb-2 opacity-30" />
                <p className="text-sm">Coming soon</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

// ─── Right panel section wrapper ────────────────────────────────────────────────

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 border-b border-border/60 last:border-0">
      <SectionLabel>{title}</SectionLabel>
      {children}
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────────

export function JobDetailClient({ job }: { job: JobDetailData }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [activeKPI, setActiveKPI] = useState<string | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<typeof MOCK_CANDIDATES[0] | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const location = [job.city, job.state].filter(Boolean).join(', ')
  const empType  = EMP_LABELS[job.employment_type ?? ''] ?? job.employment_type ?? ''
  const workMode = WORK_MODE_LABELS[job.work_mode ?? ''] ?? job.work_mode ?? ''

  const billRate  = job.salary_max ? Math.round(job.salary_max / 100 / 2080) : 85
  const payRate   = job.salary_min ? Math.round(job.salary_min / 100 / 2080) : 65
  const margin    = billRate - payRate
  const marginPct = billRate > 0 ? ((margin / billRate) * 100).toFixed(1) : '0.0'

  const status   = STATUS_MAP[job.status]   ?? STATUS_MAP['open']!
  const priority = PRIORITY_MAP[job.priority ?? 'medium'] ?? PRIORITY_MAP['medium']!

  const kpis = [
    { id: 'candidates', label: 'Candidates', value: 42, icon: Users,       color: 'text-blue-600' },
    { id: 'submitted',  label: 'Submitted',  value: 12, icon: Send,        color: 'text-violet-600' },
    { id: 'interviews', label: 'Interviews', value: 5,  icon: MessageSquare,color: 'text-amber-600' },
    { id: 'offers',     label: 'Offers',     value: 2,  icon: Star,        color: 'text-orange-600' },
    { id: 'starts',     label: 'Starts',     value: 1,  icon: Zap,         color: 'text-emerald-600' },
    { id: 'rejected',   label: 'Rejected',   value: 8,  icon: XCircle,     color: 'text-red-500' },
  ]

  const requiredSkills  = ['Java', 'Spring Boot', 'Microservices', 'REST APIs', 'AWS', 'SQL']
  const preferredSkills = ['Kubernetes', 'Docker', 'Kafka', 'CI/CD']

  function handleCandidateClick(c: typeof MOCK_CANDIDATES[0]) {
    setSelectedCandidate(c)
    setDrawerOpen(true)
  }

  function handleStatusChange(s: string) {
    startTransition(async () => {
      await updateJobStatusAction(job.id, s)
      router.refresh()
    })
  }

  function handleDelete() {
    if (!confirm('Delete this job?')) return
    startTransition(async () => { await deleteJobAction(job.id) })
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">

      {/* ── Job Header ─────────────────────────────────────────────────────── */}
      <div className="bg-background border-b">

        {/* Row 1: identity + actions */}
        <div className="flex items-center gap-3 px-6 pt-4 pb-2">
          {/* ID + Title + Badges */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {job.display_id && (
              <span className="text-xs font-mono text-muted-foreground shrink-0 bg-muted px-1.5 py-0.5 rounded">
                {job.display_id}
              </span>
            )}
            <h1 className="text-base font-semibold text-foreground truncate">{job.title}</h1>
            <Chip label={status.label} cls={status.cls} />
            <Chip label={priority.label} cls={priority.cls} />
            {workMode && (
              <Chip label={workMode} cls="bg-muted text-muted-foreground border-border" />
            )}
            {job.client_type && (
              <Chip
                label={job.client_type === 'vms' ? 'VMS' : 'Direct'}
                cls="bg-muted text-muted-foreground border-border"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" className="h-8 gap-1.5 text-sm">
              <Plus className="size-3.5" />Add Candidate
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-sm">
              <Send className="size-3.5" />Submit
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
                <DropdownMenuItem className="gap-2 text-sm"><Share2 className="size-3.5" />Share Job</DropdownMenuItem>
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

        {/* Row 2: meta + rates */}
        <div className="flex items-center gap-6 px-6 pb-3">
          {/* Meta pills */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {job.client && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                <Building2 className="size-3 shrink-0" />{job.client}
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                <MapPin className="size-3 shrink-0" />{location}
              </span>
            )}
            {empType && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                <Briefcase className="size-3 shrink-0" />{empType}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
              <Users className="size-3 shrink-0" />
              {job.openings ?? 1} {(job.openings ?? 1) === 1 ? 'Opening' : 'Openings'}
            </span>
          </div>

          {/* Rates */}
          <div className="flex items-center gap-4 shrink-0 text-xs">
            <span className="text-muted-foreground">
              Bill Rate <span className="text-foreground font-semibold ml-1">${billRate}/hr</span>
            </span>
            <div className="w-px h-3 bg-border" />
            <span className="text-muted-foreground">
              Pay Rate <span className="text-foreground font-semibold ml-1">${payRate}/hr</span>
            </span>
            <div className="w-px h-3 bg-border" />
            <span className="text-muted-foreground">
              Margin <span className="text-emerald-600 font-semibold ml-1">${margin}/hr ({marginPct}%)</span>
            </span>
          </div>
        </div>

        {/* KPI bar */}
        <div className="flex items-center border-t overflow-x-auto px-2">
          {kpis.map(kpi => {
            const Icon = kpi.icon
            const active = activeKPI === kpi.id
            return (
              <button
                key={kpi.id}
                onClick={() => setActiveKPI(active ? null : kpi.id)}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
                  active
                    ? 'border-foreground text-foreground bg-muted/40'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                <Icon className={`size-3.5 ${active ? 'text-foreground' : kpi.color}`} />
                <span className="text-sm font-semibold tabular-nums">{kpi.value}</span>
                <span className="text-xs">{kpi.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: tabs workspace */}
        <div className="flex-1 min-w-0 overflow-auto flex flex-col">
          <Tabs defaultValue="pipeline" className="flex flex-col flex-1 overflow-hidden">

            {/* Tab list */}
            <div className="border-b bg-background px-6 flex-shrink-0">
              <TabsList className="h-10 bg-transparent gap-0 p-0 w-full justify-start">
                {[
                  { id: 'pipeline',  label: 'Pipeline',      icon: LayoutGrid  },
                  { id: 'summary',   label: 'Summary',       icon: FileText    },
                  { id: 'checks',    label: 'Hiring Checks', icon: CheckSquare },
                  { id: 'notes',     label: 'Notes',         icon: StickyNote  },
                  { id: 'documents', label: 'Documents',     icon: Paperclip   },
                  { id: 'insights',  label: 'Insights',      icon: BarChart2   },
                ].map(({ id, label, icon: Icon }) => (
                  <TabsTrigger
                    key={id}
                    value={id}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none h-10 gap-1.5 px-3 text-xs text-muted-foreground data-[state=active]:text-foreground data-[state=active]:font-medium"
                  >
                    <Icon className="size-3.5" />{label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* ── Pipeline ─────────────────────────────────────────────────── */}
            <TabsContent value="pipeline" className="flex-1 m-0 flex flex-col overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-2 px-6 py-3 border-b bg-muted/20 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <input
                    placeholder="Search candidates…"
                    className="h-8 w-56 pl-8 pr-3 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-sm">
                  <Filter className="size-3.5" />Filter
                </Button>
                <div className="ml-auto flex items-center border border-input rounded-md overflow-hidden">
                  <button className="px-2.5 h-8 text-muted-foreground hover:bg-muted transition-colors border-r border-input">
                    <LayoutGrid className="size-3.5" />
                  </button>
                  <button className="px-2.5 h-8 text-muted-foreground hover:bg-muted transition-colors">
                    <List className="size-3.5" />
                  </button>
                </div>
              </div>
              {/* Board */}
              <div className="flex-1 overflow-x-auto px-6 pt-4">
                <KanbanBoard onCandidateClick={handleCandidateClick} />
              </div>
            </TabsContent>

            {/* ── Summary ──────────────────────────────────────────────────── */}
            <TabsContent value="summary" className="m-0 flex-1 overflow-auto">
              <div className="p-6 space-y-6 max-w-3xl">

                {/* AI Insights */}
                <section>
                  <SectionLabel>AI Insights</SectionLabel>
                  <div className="bg-muted/40 border border-border rounded-lg p-4 grid grid-cols-2 gap-3">
                    {[
                      { label: 'Market Availability',  value: '1,200+ matching profiles in DFW area' },
                      { label: 'Avg. Time to Fill',    value: '18 days for similar Java roles' },
                      { label: 'Suggested Search',     value: '"Java Spring Boot" AND "Microservices" AND "AWS"' },
                      { label: 'Missing Skills',       value: 'Consider adding Kafka — 65% of candidates have it' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                        <p className="text-xs text-foreground font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <Separator />

                {/* Description */}
                <section>
                  <SectionLabel>Job Description</SectionLabel>
                  {job.description ? (
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{job.description}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No description added yet. <Link href={`/dashboard/jobs/${job.id}/edit`} className="text-foreground underline underline-offset-2">Add one →</Link></p>
                  )}
                </section>

                {job.requirements && (
                  <>
                    <Separator />
                    <section>
                      <SectionLabel>Requirements</SectionLabel>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
                    </section>
                  </>
                )}

                <Separator />

                {/* Hiring team */}
                <section>
                  <SectionLabel>Hiring Team</SectionLabel>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { role: 'Recruiter',       name: job.recruiter_name ?? '—' },
                      { role: 'Account Manager', name: '—' },
                      { role: 'Client Contact',  name: '—' },
                    ].map(({ role, name }) => (
                      <div key={role} className="flex items-center gap-2.5 border border-border rounded-lg px-3 py-2 bg-card">
                        <Avatar className="size-7">
                          <AvatarFallback className="text-xs bg-muted text-foreground">
                            {name !== '—' ? name.slice(0, 2).toUpperCase() : role.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs text-muted-foreground">{role}</p>
                          <p className="text-sm font-medium">{name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </TabsContent>

            {/* ── Hiring Checks ─────────────────────────────────────────────── */}
            <TabsContent value="checks" className="m-0 flex-1 overflow-auto">
              <div className="p-6 max-w-lg space-y-3">
                <SectionLabel>Compliance Requirements</SectionLabel>
                {[
                  { label: 'Visa Verification',     done: 3, total: 3 },
                  { label: 'Education Verification', done: 2, total: 3 },
                  { label: 'Background Check',       done: 1, total: 2 },
                  { label: 'Drug Screen',            done: 0, total: 2 },
                  { label: 'Security Clearance',     done: 0, total: 1 },
                  { label: 'Reference Check',        done: 3, total: 3 },
                ].map(({ label, done, total }) => (
                  <div key={label} className="flex items-center gap-4 border border-border rounded-lg p-3 bg-card">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
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
            <TabsContent value="notes" className="m-0 flex-1 overflow-auto">
              <div className="p-6 max-w-2xl space-y-4">
                <div className="flex items-center gap-2">
                  {['All', 'Internal', 'Client', 'Candidate'].map(t => (
                    <button key={t} className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                      t === 'All' ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:text-foreground'
                    }`}>{t}</button>
                  ))}
                  <Button size="sm" className="h-7 text-xs ml-auto gap-1.5">
                    <Plus className="size-3" />Add Note
                  </Button>
                </div>
                {[
                  { author: 'AR', name: 'Arun',   time: '2 hours ago', type: 'Internal', content: 'Client confirmed they need 3 resources by end of month. Budget is firm at $85/hr. Prefer USC/GC only.' },
                  { author: 'SK', name: 'Suresh', time: '1 day ago',   type: 'Client',   content: 'Spoke with hiring manager at ABC Corp. Flexible on hybrid vs onsite. 2 rounds of interviews max.' },
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
            <TabsContent value="documents" className="m-0 flex-1 overflow-auto">
              <div className="p-6 max-w-2xl space-y-5">
                {[
                  { category: 'Job Documents',       docs: ['Job Description.pdf', 'SOW_v2.pdf', 'Rate Card.xlsx'] },
                  { category: 'Client Documents',    docs: [] },
                  { category: 'Candidate Documents', docs: [] },
                ].map(({ category, docs }) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <SectionLabel>{category}</SectionLabel>
                      <Button variant="ghost" size="sm" className="h-6 text-xs gap-1">
                        <Plus className="size-3" />Upload
                      </Button>
                    </div>
                    <div className="border border-border rounded-lg overflow-hidden bg-card">
                      {docs.length > 0 ? docs.map(doc => (
                        <div key={doc} className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40 transition-colors border-b border-border last:border-0">
                          <FileText className="size-4 text-muted-foreground shrink-0" />
                          <span className="text-sm flex-1">{doc}</span>
                          <button className="text-xs text-muted-foreground hover:text-foreground">Download</button>
                        </div>
                      )) : (
                        <div className="px-3 py-8 text-center text-xs text-muted-foreground">
                          No documents. Drag & drop or click Upload.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* ── Insights ─────────────────────────────────────────────────── */}
            <TabsContent value="insights" className="m-0 flex-1 overflow-auto">
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6 max-w-3xl">
                  {[
                    { label: 'Fill Rate',          value: '2.4%',   sub: '1 of 3 openings filled',         color: 'text-blue-600' },
                    { label: 'Submit Rate',        value: '28.6%',  sub: '12 submitted of 42 candidates',  color: 'text-violet-600' },
                    { label: 'Offer Rate',         value: '16.7%',  sub: '2 offers from 12 submissions',   color: 'text-orange-600' },
                    { label: 'Time to Submit',     value: '3.2 days', sub: 'From sourced to submitted',    color: 'text-amber-600' },
                    { label: 'Est. Annual Revenue',value: `$${(billRate * 2080).toLocaleString()}`, sub: 'Per placement', color: 'text-emerald-600' },
                    { label: 'Est. Annual Margin', value: `$${(margin * 2080).toLocaleString()}`,  sub: `${marginPct}% margin`, color: 'text-emerald-600' },
                  ].map(({ label, value, sub, color }) => (
                    <Card key={label} className="bg-card">
                      <CardContent className="pt-4">
                        <p className="text-xs text-muted-foreground mb-1">{label}</p>
                        <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="max-w-3xl text-sm text-muted-foreground text-center py-10 border border-dashed border-border rounded-xl">
                  Pipeline funnel chart coming soon
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Right panel ──────────────────────────────────────────────────── */}
        <div className="w-64 shrink-0 border-l bg-muted/10 overflow-auto">

          <PanelSection title="Job Details">
            <div>
              <MetaRow label="Client"      value={job.client} />
              <MetaRow label="Location"    value={location || null} />
              <MetaRow label="Type"        value={empType || null} />
              <MetaRow label="Work Mode"   value={workMode || null} />
              <MetaRow label="Client Type" value={job.client_type === 'vms' ? 'VMS' : job.client_type === 'direct' ? 'Direct' : null} />
              <MetaRow label="Openings"    value={String(job.openings ?? 1)} />
              <MetaRow label="Department"  value={job.department} />
              <MetaRow label="Recruiter"   value={job.recruiter_name} />
              <MetaRow label="Created"     value={new Date(job.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} />
            </div>
          </PanelSection>

          <PanelSection title="Required Skills">
            <div className="flex flex-wrap gap-1">
              {requiredSkills.map(s => (
                <span key={s} className="text-xs bg-foreground/5 text-foreground border border-border rounded px-2 py-0.5 font-medium">{s}</span>
              ))}
            </div>
          </PanelSection>

          <PanelSection title="Preferred Skills">
            <div className="flex flex-wrap gap-1">
              {preferredSkills.map(s => (
                <span key={s} className="text-xs bg-muted text-muted-foreground border border-border/50 rounded px-2 py-0.5">{s}</span>
              ))}
            </div>
          </PanelSection>

          <PanelSection title="Rates & Margin">
            <div>
              <MetaRow label="Bill Rate" value={`$${billRate}/hr`} />
              <MetaRow label="Pay Rate"  value={`$${payRate}/hr`} />
              <MetaRow label="Margin"    value={<span className="text-emerald-600">${margin}/hr</span>} />
              <MetaRow label="Margin %"  value={<span className="text-emerald-600">{marginPct}%</span>} />
            </div>
          </PanelSection>

          <PanelSection title="Contacts">
            <div className="space-y-2.5">
              {[
                { role: 'Recruiter',       name: job.recruiter_name ?? '—' },
                { role: 'Account Manager', name: '—' },
                { role: 'Client Contact',  name: '—' },
              ].map(({ role, name }) => (
                <div key={role} className="flex items-center gap-2">
                  <Avatar className="size-6 shrink-0">
                    <AvatarFallback className="text-[9px] bg-muted text-muted-foreground">
                      {name !== '—' ? name.slice(0, 2).toUpperCase() : role.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground leading-none mb-0.5">{role}</p>
                    <p className="text-xs font-medium truncate">{name}</p>
                  </div>
                </div>
              ))}
            </div>
          </PanelSection>

          <PanelSection title="AI Insights">
            <div className="space-y-2">
              {[
                { label: '1,200+ profiles', sub: 'matching in DFW' },
                { label: '18 days avg',     sub: 'time to fill' },
                { label: 'High pool',       sub: 'Java talent market' },
              ].map(({ label, sub }) => (
                <div key={label} className="flex items-start gap-2 bg-muted/60 rounded-md p-2">
                  <Zap className="size-3 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-foreground leading-none mb-0.5">{label}</p>
                    <p className="text-[10px] text-muted-foreground">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </PanelSection>
        </div>
      </div>

      {/* Candidate drawer */}
      <CandidateDrawer
        candidate={selectedCandidate}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  )
}
