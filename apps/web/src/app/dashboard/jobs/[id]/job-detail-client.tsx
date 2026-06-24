'use client'

import { useState, useTransition, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowLeft, Pencil, Plus, MoreHorizontal,
  Users, Search, SlidersHorizontal, ArrowUpDown,
  Mail, Phone, Send, ChevronDown, FileText, CheckSquare,
  Clock, Zap, ChevronRight, X, Check,
  Upload, File, Trash2,
} from 'lucide-react'
import {
  deleteJobAction, updateJobStatusAction,
  addJobNoteAction, deleteJobNoteAction,
  uploadJobDocumentAction, deleteJobDocumentAction,
} from '../actions'

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
type Note         = { id: string; author: string; initials: string; text: string; time: string }
type Doc          = { id: string; name: string; size: string; type: string; uploadedAt: string }
type ActivityItem = { id: string; actor: string; action: string; time: string }

// ponytail: CANDIDATES/NOTES/DOCS are empty until job_candidates/job_notes/job_documents tables exist

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
  stageFilter, setStageFilter, visaFilter, setVisaFilter, onClear, allVisas,
}: {
  stageFilter: Set<string>; setStageFilter: (s: Set<string>) => void
  visaFilter: Set<string>;  setVisaFilter:  (s: Set<string>) => void
  onClear: () => void; allVisas: string[]
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
    const next = new Set(stageFilter); next.has(id) ? next.delete(id) : next.add(id); setStageFilter(next)
  }
  function toggleVisa(v: string) {
    const next = new Set(visaFilter); next.has(v) ? next.delete(v) : next.add(v); setVisaFilter(next)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`h-9 flex items-center gap-2 px-3 rounded-md border text-sm transition-colors
          ${open || count > 0 ? 'border-brand bg-brand-muted text-brand' : 'border-border bg-background text-foreground hover:bg-muted'}`}
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
        <div className="absolute top-11 left-0 z-50 w-52 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b">
            <span className="text-sm font-semibold">Filters</span>
            {count > 0 && <button onClick={onClear} className="text-xs text-brand hover:underline">Clear all</button>}
          </div>
          <div className="px-4 py-3 border-b">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Stage</p>
            <div className="space-y-2">
              {STAGES.map(s => (
                <button key={s.id} onClick={() => toggleStage(s.id)} className="flex items-center gap-2.5 w-full text-left">
                  <span className={`size-4 rounded border flex items-center justify-center shrink-0 transition-colors ${stageFilter.has(s.id) ? 'bg-brand border-brand' : 'border-border'}`}>
                    {stageFilter.has(s.id) && <Check className="size-2.5 text-white" strokeWidth={3} />}
                  </span>
                  <span className="text-sm">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Visa</p>
            <div className="space-y-2">
              {allVisas.map(v => (
                <button key={v} onClick={() => toggleVisa(v)} className="flex items-center gap-2.5 w-full text-left">
                  <span className={`size-4 rounded border flex items-center justify-center shrink-0 transition-colors ${visaFilter.has(v) ? 'bg-brand border-brand' : 'border-border'}`}>
                    {visaFilter.has(v) && <Check className="size-2.5 text-white" strokeWidth={3} />}
                  </span>
                  <span className="text-sm">{v}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Candidate table ───────────────────────────────────────────────────────────

function CandidateTable({ candidates, onSelect }: { candidates: Candidate[]; onSelect: (c: Candidate) => void }) {
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
      <thead className="sticky top-0 bg-muted/60 backdrop-blur-sm">
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
          <tr key={c.id} onClick={() => onSelect(c)} className="hover:bg-muted/30 cursor-pointer transition-colors group">
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-3">
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className="text-xs font-bold bg-muted text-muted-foreground">{c.initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground whitespace-nowrap">{c.name}</span>
              </div>
            </td>
            <td className="px-5 py-3.5">
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md whitespace-nowrap">
                {STAGES.find(s => s.id === c.stage)?.label ?? c.stage}
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
                className="text-xs text-foreground border border-border px-3 py-1.5 rounded-md hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 whitespace-nowrap"
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

// ── Candidate drawer (50% width) ──────────────────────────────────────────────

function CandidateDrawer({ c, open, onClose }: { c: Candidate | null; open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<'profile' | 'resume' | 'notes'>('profile')
  const [noteText, setNoteText] = useState('')
  const [notes, setNotes] = useState<{ id: string; text: string; time: string }[]>([])

  if (!c) return null

  function addNote() {
    if (!noteText.trim()) return
    setNotes(prev => [{ id: Date.now().toString(), text: noteText.trim(), time: 'Just now' }, ...prev])
    setNoteText('')
  }

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0"
        style={{ width: '50vw', maxWidth: '50vw' }}
      >
        {/* Identity */}
        <div className="px-7 pt-6 border-b">
          <div className="flex items-start gap-4 mb-5">
            <Avatar className="size-12 shrink-0">
              <AvatarFallback className="text-sm font-bold bg-brand-muted text-brand">{c.initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1.5">
                <SheetTitle className="text-lg font-semibold">{c.name}</SheetTitle>
                <ScoreBadge score={c.score} />
              </div>
              <p className="text-sm text-muted-foreground">{c.exp} · {c.location} · {c.visa}</p>
            </div>
          </div>

          {/* Stage pill row */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {STAGES.map(s => (
              <span
                key={s.id}
                className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
                  s.id === c.stage
                    ? 'bg-brand text-white border-brand'
                    : 'bg-background text-muted-foreground border-border'
                }`}
              >
                {s.label}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 mb-5">
            <Button className="h-9 gap-2 text-sm bg-brand hover:bg-brand/90 text-white border-0 flex-1">
              <Send className="size-4" />Submit to Client
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9 gap-1.5 text-sm">
                  Move Stage <ChevronDown className="size-4" />
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
            <button className="size-9 flex items-center justify-center border border-border rounded-md text-muted-foreground hover:text-brand hover:border-brand transition-colors">
              <Mail className="size-4" />
            </button>
            <button className="size-9 flex items-center justify-center border border-border rounded-md text-muted-foreground hover:text-brand hover:border-brand transition-colors">
              <Phone className="size-4" />
            </button>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-0">
            {(['profile', 'resume', 'notes'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-3 px-5 text-sm font-medium border-b-2 transition-colors capitalize ${
                  tab === t ? 'border-brand text-brand' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
                {t === 'notes' && notes.length > 0 && (
                  <span className="ml-1.5 text-xs bg-brand-muted text-brand px-1.5 py-0.5 rounded-full font-bold">
                    {notes.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0 px-7 py-6">
          {tab === 'profile' && (
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: 'Current Stage', value: STAGES.find(s => s.id === c.stage)?.label ?? c.stage },
                { label: 'Experience',    value: c.exp      },
                { label: 'Location',      value: c.location },
                { label: 'Visa Status',   value: c.visa     },
                { label: 'Match Score',   value: `${c.score}%` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
                  <p className="text-sm text-foreground font-medium">{value}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'resume' && (
            <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
              <div className="size-16 rounded-2xl bg-brand-muted flex items-center justify-center">
                <FileText className="size-7 text-brand" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">No resume uploaded</p>
                <p className="text-sm text-muted-foreground mt-1.5">Supports PDF and Word documents</p>
              </div>
              <Button className="text-sm border-brand text-brand hover:bg-brand-muted" variant="outline">
                <Upload className="size-4 mr-2" />Upload Resume
              </Button>
            </div>
          )}

          {tab === 'notes' && (
            <div className="space-y-5">
              {/* Add note form */}
              <div className="border border-border rounded-lg p-4 bg-muted/20">
                <Textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Write a note about this candidate…"
                  className="h-24 resize-none mb-3 text-sm"
                />
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => setNoteText('')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Clear
                  </button>
                  <Button
                    onClick={addNote}
                    disabled={!noteText.trim()}
                    className="h-8 text-sm bg-brand hover:bg-brand/90 text-white border-0 disabled:opacity-40"
                  >
                    Add Note
                  </Button>
                </div>
              </div>

              {/* Notes list */}
              {notes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No notes yet. Add one above.</p>
              ) : (
                notes.map(n => (
                  <div key={n.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="size-7">
                        <AvatarFallback className="text-xs font-bold bg-brand-muted text-brand">ME</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">You</span>
                      <span className="text-xs text-muted-foreground ml-auto">{n.time}</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{n.text}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ── Right sidebar ─────────────────────────────────────────────────────────────

function JobInfoSidebar({ job, billRate, payRate, margin, marginPct, location, empType, workMode, open, onToggle }: {
  job: JobDetailData; billRate: number; payRate: number; margin: number; marginPct: string
  location: string; empType: string; workMode: string; open: boolean; onToggle: () => void
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
      className="border-l bg-background flex flex-col transition-[width] duration-300 ease-in-out overflow-hidden"
      style={{ width: open ? '300px' : '0px' }}
    >
      {open && (
        <>
          <div className="flex items-center justify-between px-5 h-11 border-b shrink-0">
            <span className="text-sm font-semibold">Job Info</span>
            <button onClick={onToggle} className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="px-5 py-5 space-y-6">
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

              <section>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Rates</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Bill Rate', value: `$${billRate}/hr`, cls: 'text-foreground'   },
                    { label: 'Pay Rate',  value: `$${payRate}/hr`,  cls: 'text-foreground'   },
                    { label: 'Margin',    value: `$${margin}/hr`,   cls: 'text-emerald-600'  },
                    { label: 'Margin %',  value: `${marginPct}%`,   cls: 'text-emerald-600'  },
                  ].map(({ label, value, cls }) => (
                    <div key={label} className="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                      <p className="text-xs text-muted-foreground mb-1">{label}</p>
                      <p className={`text-sm font-bold tabular-nums ${cls}`}>{value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <Separator />

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

// ponytail: SELECT_CLS removed — shadcn Select used throughout

// ── Notes tab ─────────────────────────────────────────────────────────────────

function NotesTab({ jobId, notes, setNotes }: {
  jobId: string
  notes: Note[]
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>
}) {
  const [text, setText] = useState('')
  const [byFilter, setByFilter] = useState('')

  const authors = [...new Set(notes.map(n => n.author))]
  const visible = byFilter ? notes.filter(n => n.author === byFilter) : notes

  async function addNote() {
    if (!text.trim()) return
    const draft = text.trim()
    const tempId = `temp_${Date.now()}`
    setNotes(prev => [{ id: tempId, author: 'You', initials: 'ME', text: draft, time: 'Just now' }, ...prev])
    setText('')
    const res = await addJobNoteAction(jobId, draft)
    if ('error' in res) {
      setNotes(prev => prev.filter(n => n.id !== tempId))
    } else {
      const initials = res.author_name.split(' ').map((w: string) => w[0] ?? '').join('').toUpperCase().slice(0, 2) || 'ME'
      setNotes(prev => prev.map(n => n.id === tempId ? { ...n, id: res.id, author: res.author_name, initials } : n))
    }
  }

  async function deleteNote(noteId: string) {
    setNotes(prev => prev.filter(n => n.id !== noteId))
    await deleteJobNoteAction(noteId)
  }

  return (
    <div className="flex h-full divide-x divide-border">

      {/* Left 50% — filters + list */}
      <div className="w-1/2 flex flex-col overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-2.5 border-b shrink-0 bg-muted/10">
          <Select value="__all__" onValueChange={() => {}}>
            <SelectTrigger className="h-9 text-sm w-36">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Date</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
            </SelectContent>
          </Select>
          <Select value={byFilter || '__all__'} onValueChange={v => setByFilter(v === '__all__' ? '' : v)}>
            <SelectTrigger className="h-9 text-sm w-40">
              <SelectValue placeholder="Added By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Added By</SelectItem>
              {authors.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          {byFilter && <button onClick={() => setByFilter('')} className="text-xs text-brand hover:underline">Clear</button>}
        </div>
        <div className="flex-1 overflow-auto px-5 py-4 space-y-3">
          {visible.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-10">No notes yet</p>
          )}
          {visible.map(n => (
            <div key={n.id} className="border border-border rounded-lg p-4 group">
              <div className="flex items-center gap-2.5 mb-2.5">
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs font-bold bg-brand-muted text-brand">{n.initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold text-foreground">{n.author}</span>
                <span className="text-xs text-muted-foreground ml-auto">{n.time}</span>
                <button onClick={() => deleteNote(n.id)}
                  className="size-6 flex items-center justify-center text-muted-foreground hover:text-destructive rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{n.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right 50% — compose */}
      <div className="w-1/2 px-6 py-6">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Add Note</p>
        <div className="border border-border rounded-lg overflow-hidden">
          <Textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write a note about this job…"
            className="h-36 resize-none border-0 rounded-none shadow-none focus-visible:ring-0 text-sm px-4 py-3"
          />
          <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/20">
            <span className="text-xs text-muted-foreground">Visible to all team members</span>
            <Button onClick={addNote} disabled={!text.trim()} size="sm"
              className="h-8 text-sm bg-brand hover:bg-brand/90 text-white border-0 disabled:opacity-40">
              Post Note
            </Button>
          </div>
        </div>
      </div>

    </div>
  )
}

// ── Documents tab ─────────────────────────────────────────────────────────────

function DocumentsTab({ jobId, docs, setDocs }: {
  jobId: string
  docs: Doc[]
  setDocs: React.Dispatch<React.SetStateAction<Doc[]>>
}) {
  const [typeFilter, setTypeFilter] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    for (const f of files) {
      const tempId = `temp_${Date.now()}_${Math.random()}`
      const size = f.size > 1024 * 1024 ? `${(f.size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`
      setDocs(prev => [{
        id: tempId, name: f.name, size,
        type: f.name.split('.').pop() ?? 'file',
        uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      }, ...prev])
      const fd = new FormData(); fd.append('file', f)
      const res = await uploadJobDocumentAction(jobId, fd)
      if ('error' in res) {
        setDocs(prev => prev.filter(d => d.id !== tempId))
      } else {
        setDocs(prev => prev.map(d => d.id === tempId ? { ...d, id: res.id } : d))
      }
    }
  }

  async function deleteDoc(docId: string) {
    setDocs(prev => prev.filter(d => d.id !== docId))
    await deleteJobDocumentAction(docId)
  }

  const iconColor: Record<string, string> = {
    pdf: 'text-red-500', doc: 'text-blue-500', docx: 'text-blue-500',
    xls: 'text-emerald-500', xlsx: 'text-emerald-500',
  }
  const types = [...new Set(docs.map(d => d.type))]
  const visible = typeFilter ? docs.filter(d => d.type === typeFilter) : docs

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2.5 px-6 py-2.5 border-b shrink-0 bg-muted/10">
        <Button size="sm" onClick={() => inputRef.current?.click()}
          className="h-9 gap-1.5 text-sm bg-brand hover:bg-brand/90 text-white border-0">
          <Upload className="size-3.5" />Add Document
        </Button>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
        <Select value="__all__" onValueChange={() => {}}>
          <SelectTrigger className="h-9 text-sm w-36"><SelectValue placeholder="Date" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Date</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This week</SelectItem>
            <SelectItem value="month">This month</SelectItem>
          </SelectContent>
        </Select>
        <Select value="__all__" onValueChange={() => {}}>
          <SelectTrigger className="h-9 text-sm w-36"><SelectValue placeholder="Created By" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Created By</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter || '__all__'} onValueChange={v => setTypeFilter(v === '__all__' ? '' : v)}>
          <SelectTrigger className="h-9 text-sm w-40"><SelectValue placeholder="Document Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Document Type</SelectItem>
            {types.map(t => <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>)}
          </SelectContent>
        </Select>
        {typeFilter && <button onClick={() => setTypeFilter('')} className="text-xs text-brand hover:underline">Clear</button>}
      </div>

      {/* File list */}
      <div className="flex-1 overflow-auto">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-center">
            <File className="size-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No documents yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {visible.map(doc => (
              <div key={doc.id} className="flex items-center gap-3.5 px-6 py-3 group hover:bg-muted/20 transition-colors">
                <div className={`shrink-0 ${iconColor[doc.type] ?? 'text-muted-foreground'}`}>
                  <File className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.size} · {doc.uploadedAt}</p>
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-xs text-foreground border border-border px-2.5 py-1 rounded-md hover:bg-muted transition-colors">Download</button>
                  <button onClick={() => deleteDoc(doc.id)}
                    className="size-7 flex items-center justify-center text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10 transition-colors">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function JobDetailClient({ job, initialNotes, initialDocs, initialActivity }: {
  job: JobDetailData
  initialNotes: Note[]
  initialDocs: Doc[]
  initialActivity: ActivityItem[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [candidates, setCandidates]           = useState<Candidate[]>([])
  const [notes, setNotes]                     = useState<Note[]>(initialNotes)
  const [docs, setDocs]                       = useState<Doc[]>(initialDocs)
  const [activity]                            = useState<ActivityItem[]>(initialActivity)
  const [sidebarOpen, setSidebarOpen]         = useState(true)
  const [activeTab, setActiveTab]             = useState<'pipeline' | 'details' | 'notes' | 'documents' | 'activity'>('details')
  const [descOpen, setDescOpen]               = useState(false)
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null)
  const [drawerOpen, setDrawerOpen]           = useState(false)
  const [search, setSearch]                   = useState('')
  const [stageFilter, setStageFilter]         = useState<Set<string>>(new Set())
  const [visaFilter, setVisaFilter]           = useState<Set<string>>(new Set())
  const [sortBy, setSortBy]                   = useState<'score' | 'name' | 'exp'>('score')
  const [sortDir, setSortDir]                 = useState<'desc' | 'asc'>('desc')

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
    let list = candidates.filter(c => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
      if (stageFilter.size && !stageFilter.has(c.stage)) return false
      if (visaFilter.size && !visaFilter.has(c.visa)) return false
      return true
    })
    return [...list].sort((a, b) => {
      let d = sortBy === 'score' ? a.score - b.score : sortBy === 'name' ? a.name.localeCompare(b.name) : a.expYears - b.expYears
      return sortDir === 'desc' ? -d : d
    })
  }, [candidates, search, stageFilter, visaFilter, sortBy, sortDir])

  const counts = {
    total:        candidates.length,
    qualified:    candidates.filter(c => ['qualified','submitted','interview','offer','start'].includes(c.stage)).length,
    submitted:    candidates.filter(c => ['submitted','interview','offer','start'].includes(c.stage)).length,
    interviewing: candidates.filter(c => ['interview','offer','start'].includes(c.stage)).length,
    offers:       candidates.filter(c => ['offer','start'].includes(c.stage)).length,
    placements:   candidates.filter(c => c.stage === 'start').length,
  }

  const statCards = [
    { label: 'Total',        value: counts.total,        bg: 'bg-blue-50',    border: 'border-blue-200',   num: 'text-blue-700',   sub: 'text-blue-500'   },
    { label: 'Qualified',    value: counts.qualified,    bg: 'bg-emerald-50', border: 'border-emerald-200',num: 'text-emerald-700',sub: 'text-emerald-500'},
    { label: 'Submitted',    value: counts.submitted,    bg: 'bg-amber-50',   border: 'border-amber-200',  num: 'text-amber-700',  sub: 'text-amber-500'  },
    { label: 'Interviewing', value: counts.interviewing, bg: 'bg-violet-50',  border: 'border-violet-200', num: 'text-violet-700', sub: 'text-violet-500' },
    { label: 'Offers',       value: counts.offers,       bg: 'bg-orange-50',  border: 'border-orange-200', num: 'text-orange-700', sub: 'text-orange-500' },
    { label: 'Placements',   value: counts.placements,   bg: 'bg-brand-muted',border: 'border-brand/20',   num: 'text-brand',      sub: 'text-brand/60'   },
  ]

  const sortOptions = [
    { key: 'score' as const, dir: 'desc' as const, label: 'Score: High to Low' },
    { key: 'score' as const, dir: 'asc'  as const, label: 'Score: Low to High' },
    { key: 'name'  as const, dir: 'asc'  as const, label: 'Name: A → Z'        },
    { key: 'name'  as const, dir: 'desc' as const, label: 'Name: Z → A'        },
    { key: 'exp'   as const, dir: 'desc' as const, label: 'Experience: Most'   },
    { key: 'exp'   as const, dir: 'asc'  as const, label: 'Experience: Least'  },
  ]
  const activeSortLabel = sortOptions.find(o => o.key === sortBy && o.dir === sortDir)?.label

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
        <Link href="/dashboard/jobs" className="size-8 flex items-center justify-center border border-border rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0">
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <h1 className="text-base font-semibold text-foreground truncate">{job.title}</h1>
          {job.display_id && (
            <span className="shrink-0 text-xs font-sans text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-md">
              {job.display_id}
            </span>
          )}
          <span className="shrink-0 flex items-center gap-1.5 text-sm font-medium">
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
          <button
            onClick={() => setSidebarOpen(o => !o)}
            title={sidebarOpen ? 'Hide panel' : 'Show Job Info'}
            className={`size-9 flex items-center justify-center border rounded-md transition-colors ${
              sidebarOpen ? 'border-brand bg-brand-muted text-brand' : 'border-border text-muted-foreground hover:text-brand hover:border-brand hover:bg-brand-muted'
            }`}
          >
            <ChevronRight className="size-4" />
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
      <div className="flex items-center gap-2 px-5 h-12 border-b bg-muted/15 shrink-0 overflow-x-auto">
        {[
          job.client && job.client,
          location   || null,
          empType    || null,
          workMode   || null,
          `${job.openings ?? 1} opening${(job.openings ?? 1) !== 1 ? 's' : ''}`,
          `Open ${ageDays}d`,
          `Bill $${billRate}/hr`,
          `Pay $${payRate}/hr`,
        ].filter(Boolean).map((text, i) => (
          <span key={i} className="shrink-0 text-xs font-medium text-foreground bg-muted border border-border rounded-full px-3 py-1 whitespace-nowrap">
            {text as string}
          </span>
        ))}
      </div>


      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

            {/* ── Tab bar (custom — no shadcn interference) ──────────────── */}
            <div className="border-b shrink-0 px-5 flex">
              {([
                { id: 'details',   label: 'Overview'    },
                { id: 'pipeline',  label: 'Candidates'  },
                { id: 'notes',     label: 'Notes'       },
                { id: 'documents', label: 'Documents'   },
                { id: 'activity',  label: 'Activity'    },
              ] as const).map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`h-11 px-4 text-sm font-medium -mb-px border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === id
                      ? 'border-brand text-brand'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ── Candidates ─────────────────────────────────────────────── */}
            {activeTab === 'pipeline' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Stat cards */}
                <div className="flex items-center gap-2.5 px-5 py-2.5 border-b bg-background shrink-0">
                  {statCards.map(({ label, value, bg, border, num, sub }) => (
                    <div key={label} className={`flex flex-col items-center flex-1 rounded-lg border px-4 py-2 ${bg} ${border}`}>
                      <span className={`text-xl font-bold tabular-nums leading-none mb-0.5 ${num}`}>{value}</span>
                      <span className={`text-xs font-medium whitespace-nowrap ${sub}`}>{label}</span>
                    </div>
                  ))}
                </div>
                {/* Toolbar */}
                <div className="flex items-center gap-2.5 px-5 py-3 border-b shrink-0 bg-muted/10">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search candidates…"
                      className="h-9 w-56 pl-9 pr-8 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-brand placeholder:text-muted-foreground"
                    />
                    {search && (
                      <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        <X className="size-4" />
                      </button>
                    )}
                  </div>
                  <FilterPopover stageFilter={stageFilter} setStageFilter={setStageFilter} visaFilter={visaFilter} setVisaFilter={setVisaFilter} onClear={() => { setStageFilter(new Set()); setVisaFilter(new Set()); setSearch('') }} allVisas={[...new Set(candidates.map(c => c.visa))]} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={`h-9 flex items-center gap-2 px-3 rounded-md border text-sm transition-colors
                        ${sortBy !== 'score' || sortDir !== 'desc' ? 'border-brand bg-brand-muted text-brand' : 'border-border bg-background text-foreground hover:bg-muted'}`}
                      >
                        <ArrowUpDown className="size-3.5" />
                        {sortBy !== 'score' || sortDir !== 'desc' ? activeSortLabel : 'Sort'}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {sortOptions.map(o => (
                        <DropdownMenuItem key={`${o.key}-${o.dir}`} onClick={() => { setSortBy(o.key); setSortDir(o.dir) }}
                          className={`text-sm gap-2 ${o.key === sortBy && o.dir === sortDir ? 'text-brand font-semibold' : ''}`}
                        >
                          {o.key === sortBy && o.dir === sortDir && <Check className="size-3.5 text-brand shrink-0" />}
                          {o.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {(search || stageFilter.size > 0 || visaFilter.size > 0) && (
                    <span className="text-sm text-muted-foreground">{filteredCandidates.length} of {candidates.length}</span>
                  )}
                </div>
                {/* Table */}
                <div className="flex-1 overflow-auto">
                  <CandidateTable
                    candidates={filteredCandidates}
                    onSelect={c => { setActiveCandidate(c); setDrawerOpen(true) }}
                  />
                </div>
              </div>
            )}

            {/* ── Overview (70/30 split) ──────────────────────────────────── */}
            {activeTab === 'details' && (
              <div className="flex-1 overflow-auto">
                <div className="flex h-full divide-x divide-border">

                  {/* 70% — Job Description */}
                  <div className="w-[70%] px-6 py-6 overflow-auto">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Job Description</p>
                      <button
                        onClick={() => setDescOpen(true)}
                        className="size-7 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Open full view"
                      >
                        <ChevronRight className="size-4 rotate-[-45deg]" />
                      </button>
                    </div>
                    {job.description ? (
                      <p className="text-sm text-foreground leading-7 whitespace-pre-wrap">{job.description}</p>
                    ) : (
                      <div className="border-2 border-dashed border-border rounded-lg py-14 flex flex-col items-center gap-3 text-center">
                        <FileText className="size-8 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">No description yet</p>
                        <Link href={`/dashboard/jobs/${job.id}/edit`} className="text-sm text-brand hover:underline">Add description →</Link>
                      </div>
                    )}
                  </div>

                  {/* 30% — Job details */}
                  <div className="w-[30%] px-5 py-6 space-y-5 overflow-auto">
                    {[
                      { label: 'Department', value: job.department || '—' },
                      { label: 'Duration',   value: empType       || '—' },
                      { label: 'Work Mode',  value: workMode      || '—' },
                      { label: 'Openings',   value: String(job.openings ?? 1) },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
                        <p className="text-sm text-foreground leading-relaxed">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description popup */}
                {descOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDescOpen(false)}>
                    <div className="bg-background rounded-xl shadow-2xl w-[700px] max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                        <p className="text-sm font-semibold">Job Description</p>
                        <button onClick={() => setDescOpen(false)} className="size-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                          <X className="size-4" />
                        </button>
                      </div>
                      <div className="overflow-auto px-6 py-5">
                        {job.description ? (
                          <p className="text-sm text-foreground leading-7 whitespace-pre-wrap">{job.description}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">No description yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Notes ──────────────────────────────────────────────────── */}
            {activeTab === 'notes' && (
              <div className="flex-1 overflow-auto">
                <NotesTab jobId={job.id} notes={notes} setNotes={setNotes} />
              </div>
            )}

            {/* ── Documents ──────────────────────────────────────────────── */}
            {activeTab === 'documents' && (
              <div className="flex-1 overflow-auto">
                <DocumentsTab jobId={job.id} docs={docs} setDocs={setDocs} />
              </div>
            )}

            {/* ── Activity ───────────────────────────────────────────────── */}
            {activeTab === 'activity' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center gap-2.5 px-6 py-2.5 border-b shrink-0 bg-muted/10">
                  <Select value="__all__" onValueChange={() => {}}>
                    <SelectTrigger className="h-9 text-sm w-36"><SelectValue placeholder="Date" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Date</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This week</SelectItem>
                      <SelectItem value="month">This month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 overflow-auto px-6 py-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">Activity Log</p>
                  {activity.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No activity yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {activity.map(a => (
                        <div key={a.id} className="flex gap-3">
                          <Avatar className="size-7 shrink-0 mt-0.5">
                            <AvatarFallback className="text-xs font-bold bg-muted text-muted-foreground">
                              {a.actor.split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2) || '??'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm"><span className="font-medium">{a.actor}</span> {a.action}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>

        {/* Right sidebar */}
        <JobInfoSidebar
          job={job} billRate={billRate} payRate={payRate} margin={margin} marginPct={marginPct}
          location={location} empType={empType} workMode={workMode}
          open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)}
        />
      </div>

      {/* Candidate drawer */}
      <CandidateDrawer
        c={activeCandidate}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setActiveCandidate(null) }}
      />
    </div>
  )
}
