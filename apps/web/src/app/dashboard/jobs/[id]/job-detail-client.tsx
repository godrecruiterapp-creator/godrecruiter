'use client'

import { useState, useTransition, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowLeft, Pencil, Plus, MoreHorizontal, MapPin, Briefcase,
  Users, Calendar, Search, SlidersHorizontal, ArrowUpDown,
  List, Mail, Phone, Send, ChevronDown, FileText, CheckSquare,
  Clock, Zap, Building2, ChevronLeft, ChevronRight, X, Check,
} from 'lucide-react'
import { deleteJobAction, updateJobStatusAction } from '../actions'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface JobDetailData {
  id: string; display_id: string | null; title: string
  client: string | null; city: string | null; state: string | null
  employment_type: string | null; work_mode: string | null; client_type: string | null
  status: string; priority: string | null; recruiter_name: string | null
  openings: number | null; department: string | null
  description: string | null; requirements: string | null
  salary_min: number | null; salary_max: number | null
  created_at: string; updated_at: string
}

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

const STAGES = [
  { id: 'sourced',   label: 'Sourced'   },
  { id: 'qualified', label: 'Qualified' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'interview', label: 'Interview' },
  { id: 'offer',     label: 'Offer'     },
  { id: 'start',     label: 'Started'   },
]

type Candidate = {
  id: string; name: string; initials: string
  exp: string; expYears: number; location: string
  visa: string; score: number; stage: string
}

const CANDIDATES: Candidate[] = [
  { id:'1',  name:'Priya Sharma',   initials:'PS', exp:'7 yrs', expYears:7,  location:'Dallas, TX',  visa:'H1B', score:95, stage:'sourced'   },
  { id:'2',  name:'Rajan Mehta',    initials:'RM', exp:'9 yrs', expYears:9,  location:'Austin, TX',  visa:'USC', score:91, stage:'sourced'   },
  { id:'3',  name:'Amit Choudhary', initials:'AC', exp:'6 yrs', expYears:6,  location:'Irving, TX',  visa:'H1B', score:89, stage:'sourced'   },
  { id:'4',  name:'Neha Verma',     initials:'NV', exp:'5 yrs', expYears:5,  location:'Remote',      visa:'GC',  score:88, stage:'qualified' },
  { id:'5',  name:'Dinesh Singh',   initials:'DS', exp:'8 yrs', expYears:8,  location:'Frisco, TX',  visa:'H1B', score:85, stage:'qualified' },
  { id:'6',  name:'Pooja Kulkarni', initials:'PK', exp:'4 yrs', expYears:4,  location:'Plano, TX',   visa:'USC', score:84, stage:'qualified' },
  { id:'7',  name:'Aditya Kumar',   initials:'AK', exp:'11 yrs',expYears:11, location:'Houston, TX', visa:'USC', score:86, stage:'submitted' },
  { id:'8',  name:'Suresh Patel',   initials:'SP', exp:'8 yrs', expYears:8,  location:'Dallas, TX',  visa:'H1B', score:82, stage:'submitted' },
  { id:'9',  name:'Nitin Tomar',    initials:'NT', exp:'7 yrs', expYears:7,  location:'Irving, TX',  visa:'H1B', score:81, stage:'submitted' },
  { id:'10', name:'Sonal Joshi',    initials:'SJ', exp:'6 yrs', expYears:6,  location:'Dallas, TX',  visa:'H1B', score:83, stage:'interview' },
  { id:'11', name:'Mayank Bansal',  initials:'MB', exp:'7 yrs', expYears:7,  location:'Frisco, TX',  visa:'GC',  score:80, stage:'interview' },
  { id:'12', name:'Vikram Sharma',  initials:'VS', exp:'8 yrs', expYears:8,  location:'Austin, TX',  visa:'GC',  score:88, stage:'offer'     },
  { id:'13', name:'Anjali Patel',   initials:'AP', exp:'7 yrs', expYears:7,  location:'Dallas, TX',  visa:'H1B', score:90, stage:'start'     },
]

const ALL_VISAS = [...new Set(CANDIDATES.map(c => c.visa))]

// ── Score badge ───────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 90
    ? 'bg-brand-muted text-brand border-brand/25'
    : score >= 80
    ? 'bg-blue-50 text-blue-700 border-blue-200'
    : 'bg-zinc-100 text-zinc-600 border-zinc-200'
  return (
    <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${cls}`}>
      {score}%
    </span>
  )
}

// ── Filter popover ────────────────────────────────────────────────────────────

function FilterPopover({
  stageFilter, setStageFilter, visaFilter, setVisaFilter, onClear,
}: {
  stageFilter: Set<string>; setStageFilter: (s: Set<string>) => void
  visaFilter: Set<string>;  setVisaFilter:  (s: Set<string>) => void
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const count = stageFilter.size + visaFilter.size

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function toggleStage(id: string) {
    const next = new Set(stageFilter)
    next.has(id) ? next.delete(id) : next.add(id)
    setStageFilter(next)
  }
  function toggleVisa(v: string) {
    const next = new Set(visaFilter)
    next.has(v) ? next.delete(v) : next.add(v)
    setVisaFilter(next)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`h-8 flex items-center gap-2 px-3 rounded-lg border text-sm transition-colors
          ${open || count > 0
            ? 'border-brand bg-brand-muted text-brand'
            : 'border-border bg-background text-foreground hover:bg-muted'
          }`}
      >
        <SlidersHorizontal className="size-3.5" />
        Filters
        {count > 0 && (
          <span className="size-4 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center leading-none">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-10 left-0 z-50 w-56 bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="text-sm font-semibold text-foreground">Filters</span>
            {count > 0 && (
              <button onClick={onClear} className="text-xs text-brand hover:underline">
                Clear all
              </button>
            )}
          </div>

          <div className="px-4 py-3 border-b">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">Stage</p>
            <div className="space-y-2">
              {STAGES.map(s => (
                <button key={s.id} onClick={() => toggleStage(s.id)} className="flex items-center gap-2.5 w-full text-left">
                  <span className={`size-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                    stageFilter.has(s.id) ? 'bg-brand border-brand' : 'border-border'
                  }`}>
                    {stageFilter.has(s.id) && <Check className="size-2.5 text-white" strokeWidth={3} />}
                  </span>
                  <span className="text-sm text-foreground">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">Visa</p>
            <div className="space-y-2">
              {ALL_VISAS.map(v => (
                <button key={v} onClick={() => toggleVisa(v)} className="flex items-center gap-2.5 w-full text-left">
                  <span className={`size-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                    visaFilter.has(v) ? 'bg-brand border-brand' : 'border-border'
                  }`}>
                    {visaFilter.has(v) && <Check className="size-2.5 text-white" strokeWidth={3} />}
                  </span>
                  <span className="text-sm text-foreground">{v}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Kanban card ───────────────────────────────────────────────────────────────

function KanbanCard({ c, active, onClick }: { c: Candidate; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border px-4 py-3.5 transition-all cursor-pointer
        ${active
          ? 'border-brand bg-brand-muted shadow-sm'
          : 'border-border bg-card hover:border-foreground/25 hover:shadow-sm'
        }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar className="size-7 shrink-0">
            <AvatarFallback className={`text-xs font-bold ${active ? 'bg-brand/10 text-brand' : 'bg-muted text-muted-foreground'}`}>
              {c.initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold text-foreground truncate">{c.name}</span>
        </div>
        <ScoreBadge score={c.score} />
      </div>
      <p className="text-xs text-muted-foreground mb-2.5 truncate pl-0.5">{c.exp} · {c.location}</p>
      <span className="inline-block text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
        {c.visa}
      </span>
    </button>
  )
}

// ── Table view ────────────────────────────────────────────────────────────────

function CandidateTable({ candidates, onSelect }: { candidates: Candidate[]; onSelect: (c: Candidate) => void }) {
  const stageLabel = (id: string) => STAGES.find(s => s.id === id)?.label ?? id

  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Users className="size-9 text-muted-foreground/25" />
        <p className="text-sm text-muted-foreground">No candidates match your filters</p>
        </div>
    )
  }

  return (
    <table className="w-full">
      <thead className="sticky top-0 bg-muted/50 backdrop-blur-sm">
        <tr className="border-b border-border">
          {['Name', 'Stage', 'Score', 'Experience', 'Location', 'Visa', ''].map(h => (
            <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-5 py-3 whitespace-nowrap">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {candidates.map(c => (
          <tr
            key={c.id}
            onClick={() => onSelect(c)}
            className="hover:bg-muted/30 cursor-pointer transition-colors group"
          >
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-3">
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className="text-xs font-bold bg-muted text-muted-foreground">{c.initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground whitespace-nowrap">{c.name}</span>
              </div>
            </td>
            <td className="px-5 py-3.5">
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg whitespace-nowrap">
                {stageLabel(c.stage)}
              </span>
            </td>
            <td className="px-5 py-3.5"><ScoreBadge score={c.score} /></td>
            <td className="px-5 py-3.5"><span className="text-sm text-foreground">{c.exp}</span></td>
            <td className="px-5 py-3.5"><span className="text-sm text-muted-foreground whitespace-nowrap">{c.location}</span></td>
            <td className="px-5 py-3.5">
              <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-1 rounded-md">{c.visa}</span>
            </td>
            <td className="px-5 py-3.5">
              <button
                onClick={e => { e.stopPropagation(); onSelect(c) }}
                className="text-xs text-foreground border border-border px-3 py-1.5 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 whitespace-nowrap"
              >
                View
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── Candidate drawer ──────────────────────────────────────────────────────────

function CandidateDrawer({ c, open, onClose }: { c: Candidate | null; open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<'profile' | 'resume' | 'notes'>('profile')
  if (!c) return null

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="right" className="w-[400px] p-0 flex flex-col gap-0">

        {/* Identity */}
        <div className="px-6 pt-6 border-b">
          <div className="flex items-start gap-4 mb-5">
            <Avatar className="size-12 shrink-0">
              <AvatarFallback className="text-sm font-bold bg-brand-muted text-brand">{c.initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <SheetTitle className="text-base font-semibold">{c.name}</SheetTitle>
                <ScoreBadge score={c.score} />
              </div>
              <p className="text-sm text-muted-foreground">{c.exp} · {c.location} · {c.visa}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mb-4">
            <Button size="sm" className="h-9 gap-2 text-sm flex-1 bg-brand hover:bg-brand/90 text-white border-0">
              <Send className="size-3.5" />Submit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm">
                  Move <ChevronDown className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                {STAGES.map(s => (
                  <DropdownMenuItem key={s.id} className={`text-sm gap-2 ${s.id === c.stage ? 'font-semibold text-brand' : ''}`}>
                    {s.id === c.stage && <span className="size-1.5 rounded-full bg-brand shrink-0" />}
                    {s.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button className="size-9 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:text-brand hover:border-brand transition-colors">
              <Mail className="size-4" />
            </button>
            <button className="size-9 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:text-brand hover:border-brand transition-colors">
              <Phone className="size-4" />
            </button>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-0 -mx-6 px-6">
            {(['profile', 'resume', 'notes'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-3 px-4 text-sm capitalize border-b-2 transition-colors font-medium ${
                  tab === t
                    ? 'border-brand text-brand'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {tab === 'profile' && (
            <div className="space-y-5">
              {[
                { label: 'Current Stage', value: STAGES.find(s => s.id === c.stage)?.label ?? c.stage },
                { label: 'Experience',    value: c.exp      },
                { label: 'Location',      value: c.location },
                { label: 'Visa Status',   value: c.visa     },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</p>
                  <p className="text-sm text-foreground">{value}</p>
                </div>
              ))}
            </div>
          )}
          {tab === 'resume' && (
            <div className="flex flex-col items-center justify-center py-14 gap-4 text-center">
              <div className="size-14 rounded-2xl bg-brand-muted flex items-center justify-center">
                <FileText className="size-6 text-brand" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">No resume uploaded</p>
                <p className="text-sm text-muted-foreground mt-1">Supports PDF and Word documents</p>
              </div>
              <Button size="sm" variant="outline" className="text-sm border-brand text-brand hover:bg-brand-muted">
                Upload Resume
              </Button>
            </div>
          )}
          {tab === 'notes' && (
            <div className="space-y-3">
              <textarea
                placeholder="Add a note about this candidate…"
                className="w-full h-32 text-sm border border-input rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-brand bg-background"
              />
              <Button size="sm" className="w-full text-sm bg-brand hover:bg-brand/90 text-white border-0">
                Save Note
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ── Right sidebar ─────────────────────────────────────────────────────────────

function JobInfoSidebar({ job, billRate, payRate, margin, marginPct, location, empType, workMode, open, onToggle }: {
  job: JobDetailData
  billRate: number; payRate: number; margin: number; marginPct: string
  location: string; empType: string; workMode: string
  open: boolean; onToggle: () => void
}) {
  const posted = new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const details = [
    { label: 'Client',    value: job.client },
    { label: 'Location',  value: location || null },
    { label: 'Job Type',  value: empType || null  },
    { label: 'Work Mode', value: workMode || null },
    { label: 'Openings',  value: String(job.openings ?? 1) },
    { label: 'Posted',    value: posted },
    { label: 'Type',      value: job.client_type === 'vms' ? 'VMS' : job.client_type === 'direct' ? 'Direct' : null },
  ].filter(f => f.value)

  const team = [
    { initials: job.recruiter_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '--', name: job.recruiter_name ?? 'Unassigned', role: 'Recruiter' },
    { initials: '--', name: 'Unassigned', role: 'Account Manager' },
    { initials: '--', name: 'Unassigned', role: 'Client Contact'  },
  ]

  return (
    <div
      className="relative border-l bg-background flex flex-col transition-[width] duration-300 ease-in-out overflow-hidden"
      style={{ width: open ? '300px' : '0px' }}
    >
      {open && (
        <>
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-5 h-11 border-b shrink-0">
            <span className="text-sm font-semibold text-foreground">Job Info</span>
            <div className="flex items-center gap-3">
              <Link href={`/dashboard/jobs/${job.id}/edit`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-brand transition-colors">
                <Pencil className="size-3" />Edit
              </Link>
              <button
                onClick={onToggle}
                className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="px-5 py-5 space-y-6">

              {/* Job details */}
              <section>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Details</p>
                <div className="space-y-3">
                  {details.map(({ label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <span className="text-xs text-muted-foreground w-20 shrink-0 leading-5">{label}</span>
                      <span className="text-sm text-foreground font-medium leading-5">{value}</span>
                    </div>
                  ))}
                </div>
              </section>

              <Separator />

              {/* Rates */}
              <section>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Rates</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: 'Bill Rate', value: `$${billRate}/hr`, cls: 'text-foreground' },
                    { label: 'Pay Rate',  value: `$${payRate}/hr`,  cls: 'text-foreground' },
                    { label: 'Margin',    value: `$${margin}/hr`,   cls: 'text-emerald-600' },
                    { label: 'Margin %',  value: `${marginPct}%`,   cls: 'text-emerald-600' },
                  ].map(({ label, value, cls }) => (
                    <div key={label} className="rounded-xl border border-border bg-muted/20 px-3 py-3">
                      <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
                      <p className={`text-sm font-bold tabular-nums ${cls}`}>{value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <Separator />

              {/* Skills */}
              <section>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Required Skills</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {['Java', 'Spring Boot', 'Microservices', 'REST APIs', 'AWS', 'SQL'].map(s => (
                    <span key={s} className="text-xs border border-border rounded-lg px-2.5 py-1 bg-background text-foreground">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Nice to Have</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Kubernetes', 'Docker', 'Terraform'].map(s => (
                    <span key={s} className="text-xs border border-dashed border-border rounded-lg px-2.5 py-1 text-muted-foreground">
                      {s}
                    </span>
                  ))}
                </div>
              </section>

              <Separator />

              {/* Hiring team */}
              <section>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Hiring Team</p>
                <div className="space-y-3.5">
                  {team.map(({ initials, name, role }) => (
                    <div key={role} className="flex items-center gap-3">
                      <Avatar className="size-8 shrink-0">
                        <AvatarFallback className="text-xs font-bold bg-brand-muted text-brand">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{name}</p>
                        <p className="text-xs text-muted-foreground">{role}</p>
                      </div>
                      {name !== 'Unassigned' && (
                        <button className="size-7 flex items-center justify-center text-muted-foreground hover:text-brand hover:bg-brand-muted rounded-md transition-colors">
                          <Mail className="size-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function JobDetailClient({ job }: { job: JobDetailData }) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [sidebarOpen, setSidebarOpen]         = useState(true)
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null)
  const [drawerOpen, setDrawerOpen]           = useState(false)
  const [viewMode, setViewMode]               = useState<'board' | 'table'>('board')

  const [search, setSearch]           = useState('')
  const [stageFilter, setStageFilter] = useState<Set<string>>(new Set())
  const [visaFilter, setVisaFilter]   = useState<Set<string>>(new Set())
  const [sortBy, setSortBy]           = useState<'score' | 'name' | 'exp'>('score')
  const [sortDir, setSortDir]         = useState<'desc' | 'asc'>('desc')

  const location  = [job.city, job.state].filter(Boolean).join(', ')
  const empType   = EMP_LABELS[job.employment_type ?? ''] ?? job.employment_type ?? ''
  const workMode  = WORK_MODE_LABELS[job.work_mode ?? ''] ?? job.work_mode ?? ''
  const billRate  = job.salary_max ? Math.round(job.salary_max / 100 / 2080) : 85
  const payRate   = job.salary_min ? Math.round(job.salary_min / 100 / 2080) : 65
  const margin    = billRate - payRate
  const marginPct = billRate > 0 ? ((margin / billRate) * 100).toFixed(1) : '0.0'
  const ageDays   = Math.floor((Date.now() - new Date(job.created_at).getTime()) / 86_400_000)
  const sc        = STATUS_CONFIG[job.status] ?? STATUS_CONFIG['open']!
  const prioLabel = { high: 'High', medium: 'Medium', low: 'Low' }[job.priority ?? 'medium'] ?? 'Medium'
  const prioColor = { high: 'text-red-600', medium: 'text-amber-600', low: 'text-zinc-500' }[job.priority ?? 'medium'] ?? 'text-amber-600'

  const filteredCandidates = useMemo(() => {
    let list = CANDIDATES.filter(c => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
      if (stageFilter.size && !stageFilter.has(c.stage)) return false
      if (visaFilter.size && !visaFilter.has(c.visa)) return false
      return true
    })
    return [...list].sort((a, b) => {
      let d = 0
      if (sortBy === 'score') d = a.score - b.score
      if (sortBy === 'name')  d = a.name.localeCompare(b.name)
      if (sortBy === 'exp')   d = a.expYears - b.expYears
      return sortDir === 'desc' ? -d : d
    })
  }, [search, stageFilter, visaFilter, sortBy, sortDir])

  const counts = {
    total:        CANDIDATES.length,
    qualified:    CANDIDATES.filter(c => ['qualified','submitted','interview','offer','start'].includes(c.stage)).length,
    submitted:    CANDIDATES.filter(c => ['submitted','interview','offer','start'].includes(c.stage)).length,
    interviewing: CANDIDATES.filter(c => ['interview','offer','start'].includes(c.stage)).length,
    offers:       CANDIDATES.filter(c => ['offer','start'].includes(c.stage)).length,
    placements:   CANDIDATES.filter(c => c.stage === 'start').length,
  }

  const statCards = [
    { label: 'Total',        value: counts.total,        bg: 'bg-blue-50',    border: 'border-blue-100',   text: 'text-blue-700'   },
    { label: 'Qualified',    value: counts.qualified,    bg: 'bg-emerald-50', border: 'border-emerald-100',text: 'text-emerald-700'},
    { label: 'Submitted',    value: counts.submitted,    bg: 'bg-amber-50',   border: 'border-amber-100',  text: 'text-amber-700'  },
    { label: 'Interviewing', value: counts.interviewing, bg: 'bg-violet-50',  border: 'border-violet-100', text: 'text-violet-700' },
    { label: 'Offers',       value: counts.offers,       bg: 'bg-orange-50',  border: 'border-orange-100', text: 'text-orange-700' },
    { label: 'Placements',   value: counts.placements,   bg: 'bg-brand-muted',border: 'border-brand/20',   text: 'text-brand'      },
  ]

  const sortOptions: { key: typeof sortBy; dir: typeof sortDir; label: string }[] = [
    { key: 'score', dir: 'desc', label: 'Score: High to Low' },
    { key: 'score', dir: 'asc',  label: 'Score: Low to High' },
    { key: 'name',  dir: 'asc',  label: 'Name: A → Z'       },
    { key: 'name',  dir: 'desc', label: 'Name: Z → A'       },
    { key: 'exp',   dir: 'desc', label: 'Experience: Most'   },
    { key: 'exp',   dir: 'asc',  label: 'Experience: Least'  },
  ]
  const activeSortLabel = sortOptions.find(o => o.key === sortBy && o.dir === sortDir)?.label

  function openDrawer(c: Candidate) { setActiveCandidate(c); setDrawerOpen(true) }
  function clearFilters() { setStageFilter(new Set()); setVisaFilter(new Set()); setSearch('') }
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
        <Link
          href="/dashboard/jobs"
          className="size-8 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
        >
          <ArrowLeft className="size-4" />
        </Link>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <h1 className="text-base font-semibold text-foreground truncate">{job.title}</h1>
          {job.display_id && (
            <span className="shrink-0 text-xs font-mono text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-md">
              {job.display_id}
            </span>
          )}
          <span className="shrink-0 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <span className={`size-2 rounded-full shrink-0 ${sc.dot}`} />{sc.label}
          </span>
          <span className={`shrink-0 text-sm font-medium ${prioColor}`}>{prioLabel}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm" asChild>
            <Link href={`/dashboard/jobs/${job.id}/edit`}><Pencil className="size-3.5" />Edit</Link>
          </Button>
          <Button size="sm" className="h-9 gap-1.5 text-sm bg-brand hover:bg-brand/90 text-white border-0">
            <Plus className="size-3.5" />Add Candidate
          </Button>
          {/* Sidebar toggle — lives right after Add Candidate */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            title={sidebarOpen ? 'Hide panel' : 'Show panel'}
            className={`size-9 flex items-center justify-center border rounded-lg transition-colors ${
              sidebarOpen
                ? 'border-brand bg-brand-muted text-brand'
                : 'border-border text-muted-foreground hover:text-brand hover:border-brand hover:bg-brand-muted'
            }`}
          >
            {sidebarOpen ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {job.status === 'open' && (
                <DropdownMenuItem onClick={() => handleStatusChange('on_hold')} className="text-sm gap-2">
                  <Clock className="size-4" />Put on Hold
                </DropdownMenuItem>
              )}
              {job.status === 'on_hold' && (
                <DropdownMenuItem onClick={() => handleStatusChange('open')} className="text-sm gap-2">
                  <Zap className="size-4" />Reopen
                </DropdownMenuItem>
              )}
              {job.status !== 'filled' && (
                <DropdownMenuItem onClick={() => handleStatusChange('filled')} className="text-sm gap-2">
                  <CheckSquare className="size-4" />Mark as Filled
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
      <div className="flex items-center gap-6 px-5 h-9 border-b bg-muted/15 shrink-0 overflow-x-auto">
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
            <span key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
              <Icon className="size-3.5 shrink-0" />{text}
            </span>
          )
        })}
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-3 border-b bg-background shrink-0 overflow-x-auto">
        {statCards.map(({ label, value, bg, border, text }) => (
          <div
            key={label}
            className={`flex flex-col items-center shrink-0 rounded-xl border px-5 py-2.5 min-w-[88px] ${bg} ${border}`}
          >
            <span className={`text-2xl font-bold tabular-nums leading-none mb-1 ${text}`}>{value}</span>
            <span className={`text-xs font-medium whitespace-nowrap ${text} opacity-70`}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <Tabs defaultValue="pipeline" className="flex flex-col flex-1 overflow-hidden">

            {/* Tab bar */}
            <TabsList className="h-11 bg-transparent px-5 justify-start shrink-0 border-b rounded-none w-full gap-0 p-0">
              {[
                { id: 'pipeline', label: 'Pipeline'    },
                { id: 'details',  label: 'Description' },
                { id: 'notes',    label: 'Notes'       },
                { id: 'activity', label: 'Activity'    },
              ].map(({ id, label }) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className="h-11 px-4 rounded-none border-b-2 border-transparent text-sm font-medium text-muted-foreground bg-transparent shadow-none
                    data-[state=active]:border-brand data-[state=active]:text-brand data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ── Pipeline ───────────────────────────────────────────────── */}
            <TabsContent value="pipeline" className="flex-1 m-0 flex flex-col overflow-hidden">

              {/* Toolbar */}
              <div className="flex items-center gap-2.5 px-5 py-3 border-b shrink-0 bg-muted/10">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search candidates…"
                    className="h-9 w-56 pl-9 pr-8 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-brand transition-shadow placeholder:text-muted-foreground"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="size-4" />
                    </button>
                  )}
                </div>

                <FilterPopover
                  stageFilter={stageFilter} setStageFilter={setStageFilter}
                  visaFilter={visaFilter}   setVisaFilter={setVisaFilter}
                  onClear={clearFilters}
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`h-9 flex items-center gap-2 px-3 rounded-lg border text-sm transition-colors
                        ${sortBy !== 'score' || sortDir !== 'desc'
                          ? 'border-brand bg-brand-muted text-brand'
                          : 'border-border bg-background text-foreground hover:bg-muted'
                        }`}
                    >
                      <ArrowUpDown className="size-3.5" />
                      {sortBy !== 'score' || sortDir !== 'desc' ? activeSortLabel : 'Sort'}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {sortOptions.map(o => (
                      <DropdownMenuItem
                        key={`${o.key}-${o.dir}`}
                        onClick={() => { setSortBy(o.key); setSortDir(o.dir) }}
                        className={`text-sm gap-2 ${o.key === sortBy && o.dir === sortDir ? 'text-brand font-semibold' : ''}`}
                      >
                        {o.key === sortBy && o.dir === sortDir && <Check className="size-3.5 text-brand shrink-0" />}
                        {o.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {(search || stageFilter.size > 0 || visaFilter.size > 0) && (
                  <span className="text-sm text-muted-foreground">
                    {filteredCandidates.length} of {CANDIDATES.length}
                  </span>
                )}

                {/* View toggle */}
                <div className="ml-auto flex items-center gap-1.5">
                  <button
                    onClick={() => setViewMode('board')}
                    className={`h-9 px-4 rounded-lg border text-sm font-medium transition-colors
                      ${viewMode === 'board' ? 'bg-brand text-white border-brand' : 'border-border text-muted-foreground hover:bg-muted'}`}
                  >
                    Board
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`h-9 px-4 rounded-lg border text-sm font-medium flex items-center gap-1.5 transition-colors
                      ${viewMode === 'table' ? 'bg-brand text-white border-brand' : 'border-border text-muted-foreground hover:bg-muted'}`}
                  >
                    <List className="size-4" />Table
                  </button>
                </div>
              </div>

              {/* Board */}
              {viewMode === 'board' ? (
                <div className="flex-1 overflow-x-auto overflow-y-auto px-5 py-5">
                  <div className="flex gap-4 h-full" style={{ minWidth: 'max-content' }}>
                    {STAGES.map(stage => {
                      const cards = filteredCandidates.filter(c => c.stage === stage.id)
                      const totalCount = CANDIDATES.filter(c => c.stage === stage.id).length
                      const visible = cards.slice(0, 4)
                      const overflow = totalCount - visible.length

                      return (
                        <div key={stage.id} className="w-56 shrink-0 flex flex-col">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">{stage.label}</span>
                              <span className={`text-xs font-medium rounded-full px-2 py-0.5 tabular-nums
                                ${cards.length > 0 ? 'bg-brand-muted text-brand' : 'bg-muted text-muted-foreground'}`}>
                                {totalCount}
                              </span>
                            </div>
                            <button className="size-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-brand hover:bg-brand-muted transition-colors">
                              <Plus className="size-4" />
                            </button>
                          </div>

                          <div className="flex flex-col gap-2.5">
                            {visible.map(c => (
                              <KanbanCard
                                key={c.id}
                                c={c}
                                active={activeCandidate?.id === c.id}
                                onClick={() => openDrawer(c)}
                              />
                            ))}
                          </div>

                          {cards.length === 0 && (
                            <div className="border-2 border-dashed border-border rounded-xl py-8 flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">No matches</span>
                            </div>
                          )}

                          {overflow > 0 && (
                            <button className="mt-2.5 text-xs text-brand hover:underline text-left font-medium">
                              +{overflow} more
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-auto">
                  <CandidateTable candidates={filteredCandidates} onSelect={openDrawer} />
                </div>
              )}
            </TabsContent>

            {/* ── Description ──────────────────────────────────────────────── */}
            <TabsContent value="details" className="flex-1 m-0 overflow-auto">
              <div className="max-w-2xl px-6 py-7 space-y-7">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Job Description</p>
                  {job.description ? (
                    <p className="text-sm text-foreground leading-7 whitespace-pre-wrap">{job.description}</p>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-2xl py-14 flex flex-col items-center gap-3 text-center">
                      <FileText className="size-8 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">No description yet</p>
                      <Link href={`/dashboard/jobs/${job.id}/edit`} className="text-sm text-brand hover:underline">Add description →</Link>
                    </div>
                  )}
                </div>
                {job.requirements && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Requirements</p>
                    <p className="text-sm text-foreground leading-7 whitespace-pre-wrap">{job.requirements}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── Notes ────────────────────────────────────────────────────── */}
            <TabsContent value="notes" className="flex-1 m-0 overflow-auto">
              <div className="max-w-2xl px-6 py-7 space-y-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notes</p>
                  <Button size="sm" className="h-9 gap-2 text-sm bg-brand hover:bg-brand/90 text-white border-0">
                    <Plus className="size-3.5" />Add Note
                  </Button>
                </div>
                {[
                  { author:'AR', name:'Arun',   time:'2 hours ago', note:'Client confirmed 3 resources by end of month. Budget firm at $85/hr. Prefer USC or GC only.' },
                  { author:'SK', name:'Suresh', time:'1 day ago',   note:'Spoke with hiring manager. Flexible on hybrid vs onsite. Max 2 interview rounds.' },
                ].map(({ author, name, time, note }) => (
                  <div key={time} className="border border-border rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="text-xs font-bold bg-brand-muted text-brand">{author}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-semibold text-foreground">{name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{time}</span>
                    </div>
                    <p className="text-sm text-foreground leading-6">{note}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* ── Activity ─────────────────────────────────────────────────── */}
            <TabsContent value="activity" className="flex-1 m-0 overflow-auto">
              <div className="max-w-xl px-6 py-7">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">Activity Log</p>
                <div>
                  {[
                    { text:'Job created',                      time:`${ageDays} days ago`, user:'AR' },
                    { text:'Priya Sharma added to Sourced',    time:'2 days ago',           user:'AR' },
                    { text:'Dinesh Singh moved to Qualified',  time:'1 day ago',            user:'SK' },
                    { text:'Aditya Kumar submitted to client', time:'18 hours ago',         user:'AR' },
                  ].map(({ text, time, user }, i) => (
                    <div key={i} className="flex items-start gap-4 py-4 border-b border-border last:border-0">
                      <Avatar className="size-8 shrink-0 mt-0.5">
                        <AvatarFallback className="text-xs font-bold bg-brand-muted text-brand">{user}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm text-foreground">{text}</p>
                        <p className="text-xs text-muted-foreground mt-1">{time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Right sidebar ─────────────────────────────────────────────────── */}
        <JobInfoSidebar
          job={job}
          billRate={billRate} payRate={payRate} margin={margin} marginPct={marginPct}
          location={location} empType={empType} workMode={workMode}
          open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)}
        />
      </div>

      {/* ── Candidate drawer ─────────────────────────────────────────────────── */}
      <CandidateDrawer
        c={activeCandidate}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setActiveCandidate(null) }}
      />
    </div>
  )
}
