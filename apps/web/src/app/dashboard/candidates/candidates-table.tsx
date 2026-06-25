'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import {
  Settings2, GripVertical, Check, ExternalLink, Trash2, Users, Plus,
  ChevronUp, ChevronDown, ChevronsUpDown, Search, X,
  Mail, Phone, Send, Eye, Pencil, ChevronLeft, ChevronRight,
  BookmarkPlus, Bookmark, Download,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

export type CandidateRow = {
  id: string
  candidate_number: number
  first_name: string | null; last_name: string | null
  current_title: string | null; current_company: string | null
  email: string; phone: string | null; location: string | null
  candidate_type: string | null; notice_period: string | null
  expected_ctc: number | null
  source: string | null
  created_at: string; updated_at: string
}

type ColKey =
  | 'select' | 'candidate_id' | 'name' | 'job_title' | 'stage' | 'experience' | 'skills'
  | 'email' | 'phone' | 'city' | 'state' | 'work_auth' | 'availability'
  | 'pay' | 'recruiter' | 'last_activity' | 'created' | 'actions'

const COL_META: Record<ColKey, { label: string; width: number; sortable?: boolean }> = {
  select:        { label: 'Select',             width: 48   },
  candidate_id:  { label: 'Candidate ID',       width: 110, sortable: true  },
  name:          { label: 'Candidate Name',     width: 200, sortable: true  },
  job_title:     { label: 'Job Title',          width: 150, sortable: true  },
  stage:         { label: 'Stage',              width: 110  },
  experience:    { label: 'Experience',         width: 110  },
  skills:        { label: 'Skills',             width: 180  },
  email:         { label: 'Email',              width: 200  },
  phone:         { label: 'Phone',              width: 140  },
  city:          { label: 'City',               width: 120, sortable: true  },
  state:         { label: 'State',              width: 90   },
  work_auth:     { label: 'Work Authorization', width: 155  },
  availability:  { label: 'Availability',       width: 120  },
  pay:           { label: 'Pay Expectation',    width: 135, sortable: true  },
  recruiter:     { label: 'Recruiter',          width: 130  },
  last_activity: { label: 'Last Activity',      width: 120, sortable: true  },
  created:       { label: 'Created',            width: 110, sortable: true  },
  actions:       { label: '',                   width: 80   },
}

const DEFAULT_COLS: ColKey[] = [
  'select', 'candidate_id', 'name', 'job_title', 'stage', 'experience', 'skills',
  'email', 'phone', 'city', 'state', 'work_auth', 'availability',
  'pay', 'recruiter', 'last_activity', 'created', 'actions',
]

const WORK_AUTH: Record<string, string> = {
  permanent: 'Citizen / PR', contract: 'Work Visa', temp: 'Temp / OPT', unknown: 'Unknown',
}

// ponytail: stage colors ready for when job_candidates data flows in
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const STAGE_COLORS: Record<string, string> = {
  sourced:   'bg-zinc-100 text-zinc-600 border-zinc-200',
  qualified: 'bg-blue-50 text-blue-700 border-blue-200',
  submitted: 'bg-amber-50 text-amber-700 border-amber-200',
  interview: 'bg-violet-50 text-violet-700 border-violet-200',
  offer:     'bg-orange-50 text-orange-700 border-orange-200',
  start:     'bg-emerald-50 text-emerald-700 border-emerald-200',
}

function relTime(iso: string) {
  const d = Date.now() - new Date(iso).getTime()
  if (d < 60_000) return 'Just now'
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h ago`
  if (d < 7 * 86_400_000) return `${Math.floor(d / 86_400_000)}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatCtc(ctc: number) {
  if (ctc >= 100_000) return `₹${(ctc / 100_000).toFixed(1)}L`
  if (ctc >= 1_000) return `₹${(ctc / 1_000).toFixed(0)}K`
  return `₹${ctc}`
}

function canId(n: number) { return `CAN-${String(n).padStart(4, '0')}` }

// ── Saved views ───────────────────────────────────────────────────────────────

type Filters = { search: string; work_auth: string; notice: string; source: string }
const EMPTY_FILTERS: Filters = { search: '', work_auth: '', notice: '', source: '' }
type SavedView = { name: string; cols: ColKey[]; filters: Filters; sortKey: ColKey | null; sortDir: 'asc' | 'desc' }
const VIEWS_KEY = 'gr:candidate-views-v1'
function loadViews(): SavedView[] { try { return JSON.parse(localStorage.getItem(VIEWS_KEY) ?? '[]') } catch { return [] } }
function persistViews(v: SavedView[]) { localStorage.setItem(VIEWS_KEY, JSON.stringify(v)) }

// ── Column picker ─────────────────────────────────────────────────────────────

function ColPicker({ cols, onChange }: { cols: ColKey[]; onChange: (c: ColKey[]) => void }) {
  const drag = useRef<ColKey | null>(null)
  const hidden = DEFAULT_COLS.filter(k => !cols.includes(k) && k !== 'select' && k !== 'actions')

  function toggle(key: ColKey) {
    if (key === 'select' || key === 'actions') return
    if (cols.includes(key)) { onChange(cols.filter(k => k !== key)); return }
    const idx = cols.indexOf('actions')
    const next = [...cols]
    idx >= 0 ? next.splice(idx, 0, key) : next.push(key)
    onChange(next)
  }
  function onDrop(target: ColKey) {
    if (!drag.current || drag.current === target) return
    const next = [...cols]
    const fi = next.indexOf(drag.current), ti = next.indexOf(target)
    next.splice(fi, 1); next.splice(ti, 0, drag.current!)
    onChange(next); drag.current = null
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
          <Settings2 className="size-3.5" />Columns
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60 p-0">
        <div className="px-4 py-2.5 border-b flex items-center justify-between">
          <span className="text-sm font-semibold">Columns</span>
          <button onClick={() => onChange(DEFAULT_COLS)} className="text-xs text-brand hover:underline">Reset</button>
        </div>
        <div className="px-2 py-2 border-b max-h-64 overflow-y-auto">
          <p className="text-xs text-muted-foreground px-2 pb-1.5 font-semibold uppercase tracking-wide">Visible</p>
          {cols.filter(k => k !== 'select' && k !== 'actions').map(key => (
            <div key={key} draggable onDragStart={() => { drag.current = key }}
              onDragOver={e => e.preventDefault()} onDrop={() => onDrop(key)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/60 cursor-grab active:cursor-grabbing group"
            >
              <GripVertical className="size-3.5 text-muted-foreground/40 shrink-0" />
              <span className="size-4 rounded border flex items-center justify-center shrink-0 bg-brand border-brand">
                <Check className="size-2.5 text-white" strokeWidth={3} />
              </span>
              <span className="text-sm flex-1">{COL_META[key].label}</span>
              <button onClick={() => toggle(key)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity text-xs">✕</button>
            </div>
          ))}
        </div>
        {hidden.length > 0 && (
          <div className="px-2 py-2 max-h-40 overflow-y-auto">
            <p className="text-xs text-muted-foreground px-2 pb-1.5 font-semibold uppercase tracking-wide">Hidden</p>
            {hidden.map(key => (
              <button key={key} onClick={() => toggle(key)}
                className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-muted/60 text-left">
                <div className="size-3.5 shrink-0" />
                <span className="size-4 rounded border border-border flex items-center justify-center shrink-0" />
                <span className="text-sm text-muted-foreground">{COL_META[key].label}</span>
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// ── Preview drawer ────────────────────────────────────────────────────────────

function PreviewDrawer({ candidate, onClose }: { candidate: CandidateRow | null; onClose: () => void }) {
  const name = candidate ? [candidate.first_name, candidate.last_name].filter(Boolean).join(' ') || 'Unnamed' : ''
  const initials = candidate ? [candidate.first_name?.[0], candidate.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?' : ''

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className={`shrink-0 border-l bg-background flex flex-col transition-[width] duration-300 ease-in-out overflow-hidden ${candidate ? 'w-72' : 'w-0'}`}>
      {candidate && <>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="text-xs font-semibold bg-brand-muted text-brand">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{name}</p>
              <p className="text-xs text-muted-foreground">{canId(candidate.candidate_number)}</p>
            </div>
          </div>
          <button onClick={onClose} className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors shrink-0 ml-2">
            <X className="size-3.5" />
          </button>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-1 px-3 py-2.5 border-b shrink-0">
          <Link href={`/dashboard/candidates/${candidate.id}`}
            className="h-7 flex items-center justify-center gap-1 rounded-md border border-border text-xs text-foreground hover:bg-muted transition-colors">
            <Eye className="size-3" />View
          </Link>
          <Link href={`/dashboard/candidates/${candidate.id}/edit`}
            className="h-7 flex items-center justify-center gap-1 rounded-md border border-border text-xs text-foreground hover:bg-muted transition-colors">
            <Pencil className="size-3" />Edit
          </Link>
          <button className="h-7 flex items-center justify-center gap-1 rounded-md bg-brand text-white text-xs hover:bg-brand/90 transition-colors">
            <Send className="size-3" />Submit
          </button>
          {candidate.email && (
            <a href={`mailto:${candidate.email}`}
              className="h-7 flex items-center justify-center gap-1 rounded-md border border-border text-xs text-foreground hover:bg-muted transition-colors">
              <Mail className="size-3" />Email
            </a>
          )}
          {candidate.phone && (
            <a href={`tel:${candidate.phone}`}
              className="h-7 flex items-center justify-center gap-1 rounded-md border border-border text-xs text-foreground hover:bg-muted transition-colors">
              <Phone className="size-3" />Call
            </a>
          )}
        </div>

        {/* Info rows */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
          {[
            { label: 'Email',    value: candidate.email,           href: `mailto:${candidate.email}` },
            { label: 'Phone',    value: candidate.phone,           href: candidate.phone ? `tel:${candidate.phone}` : undefined },
            { label: 'Location', value: candidate.location,        href: undefined },
            { label: 'Title',    value: candidate.current_title,   href: undefined },
            { label: 'Company',  value: candidate.current_company, href: undefined },
            { label: 'Type',     value: WORK_AUTH[candidate.candidate_type ?? ''] ?? null, href: undefined },
            { label: 'Notice',   value: candidate.notice_period,   href: undefined },
            { label: 'Pay',      value: candidate.expected_ctc ? formatCtc(candidate.expected_ctc) : null, href: undefined },
            { label: 'Source',   value: candidate.source,          href: undefined },
            { label: 'Added',    value: relTime(candidate.created_at), href: undefined },
          ].filter(r => r.value).map(({ label, value, href }) => (
            <div key={label} className="flex items-start gap-2">
              <span className="text-xs text-muted-foreground w-14 shrink-0 leading-5">{label}</span>
              {href
                ? <a href={href} className="text-xs font-medium text-brand hover:underline leading-5 truncate">{value}</a>
                : <span className="text-xs font-medium text-foreground leading-5 break-words">{value}</span>
              }
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-3 py-2.5 border-t shrink-0">
          <Link href={`/dashboard/candidates/${candidate.id}`}
            className="flex items-center justify-center gap-1.5 w-full h-7 rounded-md border border-border text-xs text-foreground hover:bg-muted transition-colors">
            <ExternalLink className="size-3" />Open full profile
          </Link>
        </div>
      </>}
    </div>
  )
}

// ── Main table ────────────────────────────────────────────────────────────────

const PAGE_SIZES = [25, 50, 100] as const

export function CandidatesTable({ candidates: all }: { candidates: CandidateRow[] }) {
  const [cols, setCols]             = useState<ColKey[]>(DEFAULT_COLS)
  const [colWidths, setColWidths]   = useState<Partial<Record<ColKey, number>>>({})
  const [selected, setSelected]     = useState<Set<string>>(new Set())
  const [preview, setPreview]       = useState<CandidateRow | null>(null)
  const [filters, setFilters]       = useState<Filters>(EMPTY_FILTERS)
  const [sortKey, setSortKey]       = useState<ColKey | null>(null)
  const [sortDir, setSortDir]       = useState<'asc' | 'desc'>('asc')
  const [page, setPage]             = useState(0)
  const [pageSize, setPageSize]     = useState<25 | 50 | 100>(25)
  const [views, setViews]           = useState<SavedView[]>([])
  const [viewName, setViewName]     = useState('')
  const [savingView, setSavingView] = useState(false)

  useEffect(() => { setViews(loadViews()) }, [])

  function applyFilters(f: Filters) { setFilters(f); setPage(0) }

  // ── Derived data ──────────────────────────────────────────────────────
  const sources = [...new Set(all.map(c => c.source).filter(Boolean))] as string[]
  const notices = [...new Set(all.map(c => c.notice_period).filter(Boolean))] as string[]

  const filtered = all.filter(c => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const n = [c.first_name, c.last_name].filter(Boolean).join(' ').toLowerCase()
      if (!n.includes(q) && !c.email.toLowerCase().includes(q) && !canId(c.candidate_number).toLowerCase().includes(q) && !(c.current_title ?? '').toLowerCase().includes(q)) return false
    }
    if (filters.work_auth && c.candidate_type !== filters.work_auth) return false
    if (filters.notice && c.notice_period !== filters.notice) return false
    if (filters.source && c.source !== filters.source) return false
    return true
  })

  const sorted = sortKey ? [...filtered].sort((a, b) => {
    const get = (c: CandidateRow): string => {
      if (sortKey === 'name') return [c.first_name, c.last_name].filter(Boolean).join(' ')
      if (sortKey === 'candidate_id') return String(c.candidate_number)
      if (sortKey === 'job_title') return c.current_title ?? ''
      if (sortKey === 'city') return c.location ?? ''
      if (sortKey === 'pay') return String(c.expected_ctc ?? 0)
      if (sortKey === 'last_activity') return c.updated_at
      if (sortKey === 'created') return c.created_at
      return ''
    }
    const cmp = get(a).localeCompare(get(b), undefined, { numeric: true })
    return sortDir === 'asc' ? cmp : -cmp
  }) : filtered

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated  = sorted.slice(page * pageSize, (page + 1) * pageSize)

  // ── Select ────────────────────────────────────────────────────────────
  const allSel  = paginated.length > 0 && paginated.every(c => selected.has(c.id))
  const someSel = paginated.some(c => selected.has(c.id)) && !allSel
  function toggleAll(v: boolean) { setSelected(v ? new Set(paginated.map(c => c.id)) : new Set()) }
  function toggleRow(id: string, v: boolean) { const n = new Set(selected); v ? n.add(id) : n.delete(id); setSelected(n) }

  // ── Sort ──────────────────────────────────────────────────────────────
  function handleSort(key: ColKey) {
    if (!COL_META[key].sortable) return
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(0)
  }

  // ── Column resize ─────────────────────────────────────────────────────
  const resizing = useRef<{ key: ColKey; startX: number; startW: number } | null>(null)
  function onResizeStart(e: React.MouseEvent, key: ColKey) {
    e.preventDefault(); e.stopPropagation()
    resizing.current = { key, startX: e.clientX, startW: colWidths[key] ?? COL_META[key].width }
    const onMove = (ev: MouseEvent) => {
      if (!resizing.current) return
      setColWidths(p => ({ ...p, [resizing.current!.key]: Math.max(60, resizing.current!.startW + ev.clientX - resizing.current!.startX) }))
    }
    const onUp = () => { resizing.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
  }

  // ── Saved views ───────────────────────────────────────────────────────
  function saveView() {
    if (!viewName.trim()) return
    const v: SavedView = { name: viewName.trim(), cols, filters, sortKey, sortDir }
    const next = [...views.filter(x => x.name !== v.name), v]
    setViews(next); persistViews(next); setViewName(''); setSavingView(false)
  }
  function loadView(v: SavedView) { setCols(v.cols); setFilters(v.filters); setSortKey(v.sortKey); setSortDir(v.sortDir); setPage(0) }
  function deleteView(name: string) { const next = views.filter(v => v.name !== name); setViews(next); persistViews(next) }

  const colW = (k: ColKey) => colWidths[k] ?? COL_META[k].width
  const activeFilters = [filters.work_auth, filters.notice, filters.source].filter(Boolean).length

  function SortChevron({ k }: { k: ColKey }) {
    if (!COL_META[k].sortable) return null
    if (sortKey !== k) return <ChevronsUpDown className="size-3 text-muted-foreground/30 ml-1 shrink-0" />
    return sortDir === 'asc' ? <ChevronUp className="size-3 text-brand ml-1 shrink-0" /> : <ChevronDown className="size-3 text-brand ml-1 shrink-0" />
  }

  // ── Cell renderers ────────────────────────────────────────────────────
  function renderHeader(key: ColKey) {
    if (key === 'select') return <Checkbox checked={allSel} data-state={someSel ? 'indeterminate' : undefined} onCheckedChange={toggleAll} aria-label="Select all" />
    if (key === 'actions') return null
    return (
      <button onClick={() => handleSort(key)} className={`flex items-center gap-0 w-full text-left ${COL_META[key].sortable ? 'cursor-pointer' : 'cursor-default'}`}>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{COL_META[key].label}</span>
        <SortChevron k={key} />
      </button>
    )
  }

  function renderCell(key: ColKey, c: CandidateRow) {
    const name = [c.first_name, c.last_name].filter(Boolean).join(' ') || 'Unnamed'
    const ini  = [c.first_name?.[0], c.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?'
    switch (key) {
      case 'select':        return <Checkbox checked={selected.has(c.id)} onCheckedChange={v => toggleRow(c.id, !!v)} onClick={e => e.stopPropagation()} aria-label={`Select ${name}`} />
      case 'candidate_id':  return <span className="text-xs text-muted-foreground font-medium tabular-nums">{canId(c.candidate_number)}</span>
      case 'name':
        return (
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="size-6 shrink-0">
              <AvatarFallback className="text-[10px] font-semibold bg-brand-muted text-brand">{ini}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium truncate">{name}</span>
          </div>
        )
      case 'job_title':     return <span className="text-xs text-muted-foreground truncate">{c.current_title ?? '—'}</span>
      case 'stage':         return <span className="text-xs text-muted-foreground">—</span>
      case 'experience':    return <span className="text-xs text-muted-foreground">—</span>
      case 'skills':        return <span className="text-xs text-muted-foreground">—</span>
      case 'email':         return <span className="text-xs text-muted-foreground truncate">{c.email}</span>
      case 'phone':         return <span className="text-xs text-muted-foreground">{c.phone ?? '—'}</span>
      case 'city':          return <span className="text-xs text-muted-foreground truncate">{c.location ?? '—'}</span>
      case 'state':         return <span className="text-xs text-muted-foreground">—</span>
      case 'work_auth':     return <span className="text-xs text-muted-foreground">{WORK_AUTH[c.candidate_type ?? ''] ?? '—'}</span>
      case 'availability':  return <span className="text-xs text-muted-foreground">{c.notice_period ?? '—'}</span>
      case 'pay':           return <span className="text-xs text-muted-foreground tabular-nums">{c.expected_ctc ? formatCtc(c.expected_ctc) : '—'}</span>
      case 'recruiter':     return <span className="text-xs text-muted-foreground">—</span>
      case 'last_activity': return <span className="text-xs text-muted-foreground">{relTime(c.updated_at)}</span>
      case 'created':       return <span className="text-xs text-muted-foreground">{relTime(c.created_at)}</span>
      case 'actions':       return null
    }
  }

  // ── Empty state ───────────────────────────────────────────────────────
  if (all.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="size-10 rounded-full bg-muted flex items-center justify-center">
          <Users className="size-4 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No candidates yet</p>
        <p className="text-sm text-muted-foreground">Add your first candidate to build your talent pool.</p>
        <Button asChild size="sm" className="mt-1"><Link href="/dashboard/candidates/new">Add candidate</Link></Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">

      {/* ── Top bar ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-3 shrink-0 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0">
            <h1 className="text-lg font-semibold tracking-tight">Candidates</h1>
            <p className="text-xs text-muted-foreground">
              {filtered.length !== all.length ? `${filtered.length} of ${all.length}` : all.length} candidates
            </p>
          </div>
          {/* Saved view chips */}
          {views.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {views.map(v => (
                <div key={v.name} className="flex items-center">
                  <button onClick={() => loadView(v)}
                    className="h-6 px-2.5 text-xs rounded-l-md border border-border hover:bg-muted transition-colors flex items-center gap-1.5">
                    <Bookmark className="size-2.5" />{v.name}
                  </button>
                  <button onClick={() => deleteView(v.name)}
                    className="h-6 w-5 flex items-center justify-center rounded-r-md border border-l-0 border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                    <X className="size-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Save view */}
          {savingView ? (
            <div className="flex items-center gap-1">
              <input autoFocus value={viewName} onChange={e => setViewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveView(); if (e.key === 'Escape') setSavingView(false) }}
                placeholder="View name…"
                className="h-8 w-28 px-2.5 text-xs border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand" />
              <button onClick={saveView} disabled={!viewName.trim()} className="h-8 px-2.5 text-xs bg-brand text-white rounded-md hover:bg-brand/90 disabled:opacity-40">Save</button>
              <button onClick={() => setSavingView(false)} className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">✕</button>
            </div>
          ) : (
            <button onClick={() => setSavingView(true)}
              className="h-8 px-2.5 text-xs border border-border rounded-md hover:bg-muted transition-colors flex items-center gap-1.5">
              <BookmarkPlus className="size-3" />Save view
            </button>
          )}
          <ColPicker cols={cols} onChange={setCols} />
          <Button asChild size="sm" className="h-8">
            <Link href="/dashboard/candidates/new"><Plus className="size-3.5 mr-1.5" />Add candidate</Link>
          </Button>
        </div>
      </div>

      {/* ── Filter bar ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 pb-3 shrink-0 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input value={filters.search} onChange={e => applyFilters({ ...filters, search: e.target.value })}
            placeholder="Search by name, email, ID…" className="h-8 w-56 pl-8 pr-7 text-xs" />
          {filters.search && (
            <button onClick={() => applyFilters({ ...filters, search: '' })} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <Select value={filters.work_auth || '__all__'} onValueChange={v => applyFilters({ ...filters, work_auth: v === '__all__' ? '' : v })}>
          <SelectTrigger className={`h-8 text-xs w-36 ${filters.work_auth ? 'border-brand text-brand' : ''}`}>
            <SelectValue placeholder="Work Auth" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Work Auth</SelectItem>
            {Object.entries(WORK_AUTH).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>

        {notices.length > 0 && (
          <Select value={filters.notice || '__all__'} onValueChange={v => applyFilters({ ...filters, notice: v === '__all__' ? '' : v })}>
            <SelectTrigger className={`h-8 text-xs w-32 ${filters.notice ? 'border-brand text-brand' : ''}`}>
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Availability</SelectItem>
              {notices.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
        )}

        {sources.length > 0 && (
          <Select value={filters.source || '__all__'} onValueChange={v => applyFilters({ ...filters, source: v === '__all__' ? '' : v })}>
            <SelectTrigger className={`h-8 text-xs w-28 ${filters.source ? 'border-brand text-brand' : ''}`}>
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Source</SelectItem>
              {sources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        )}

        {activeFilters > 0 && (
          <button onClick={() => applyFilters(EMPTY_FILTERS)}
            className="h-8 px-2.5 text-xs text-brand border border-brand/30 rounded-md hover:bg-brand-muted transition-colors flex items-center gap-1.5">
            <X className="size-3" />Clear ({activeFilters})
          </button>
        )}
      </div>

      {/* ── Bulk action bar ───────────────────────────────────────────── */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 mb-2.5 bg-brand-muted border border-brand/20 rounded-lg shrink-0">
          <span className="text-xs font-semibold text-brand">{selected.size} selected</span>
          <div className="w-px h-4 bg-brand/20 mx-1" />
          <button className="h-7 px-2.5 text-xs border border-border bg-background rounded-md hover:bg-muted flex items-center gap-1.5 transition-colors">
            <Mail className="size-3" />Email All
          </button>
          <button className="h-7 px-2.5 text-xs border border-border bg-background rounded-md hover:bg-muted flex items-center gap-1.5 transition-colors">
            <Send className="size-3" />Submit All
          </button>
          <button className="h-7 px-2.5 text-xs border border-border bg-background rounded-md hover:bg-muted flex items-center gap-1.5 transition-colors">
            <Download className="size-3" />Export
          </button>
          <button className="h-7 px-2.5 text-xs text-destructive border border-destructive/30 bg-background rounded-md hover:bg-destructive/10 flex items-center gap-1.5 ml-auto transition-colors">
            <Trash2 className="size-3" />Delete
          </button>
          <button onClick={() => setSelected(new Set())} className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground rounded transition-colors">
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* ── Table + drawer ────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden border border-border rounded-lg">

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <Search className="size-6 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No candidates match your filters</p>
              <button onClick={() => applyFilters(EMPTY_FILTERS)} className="text-xs text-brand hover:underline">Clear filters</button>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                <tr className="border-b border-border">
                  {cols.map(key => (
                    <th key={key} style={{ width: colW(key), minWidth: colW(key) }}
                      className="relative h-9 px-3 text-left align-middle select-none">
                      {renderHeader(key)}
                      {key !== 'select' && key !== 'actions' && (
                        <div onMouseDown={e => onResizeStart(e, key)}
                          className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize group/resize">
                          <div className="absolute right-0 top-2 bottom-2 w-px bg-border group-hover/resize:bg-brand transition-colors" />
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map(c => {
                  const isSel  = selected.has(c.id)
                  const isPrev = preview?.id === c.id
                  return (
                    <tr key={c.id} onClick={() => setPreview(p => p?.id === c.id ? null : c)}
                      className={`group border-b border-border cursor-pointer transition-colors ${
                        isPrev ? 'bg-brand-muted' : isSel ? 'bg-brand-muted/50' : 'hover:bg-muted/40'
                      }`}
                    >
                      {cols.map(key => (
                        <td key={key} style={{ width: colW(key), minWidth: colW(key) }}
                          className="px-3 py-2 align-middle overflow-hidden">
                          {key === 'actions' ? (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link href={`/dashboard/candidates/${c.id}`} onClick={e => e.stopPropagation()}
                                title="View" className="size-6 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-brand hover:border-brand transition-colors">
                                <Eye className="size-3" />
                              </Link>
                              <Link href={`/dashboard/candidates/${c.id}/edit`} onClick={e => e.stopPropagation()}
                                title="Edit" className="size-6 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-brand hover:border-brand transition-colors">
                                <Pencil className="size-3" />
                              </Link>
                              {c.email && (
                                <a href={`mailto:${c.email}`} onClick={e => e.stopPropagation()}
                                  title="Email" className="size-6 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-brand hover:border-brand transition-colors">
                                  <Mail className="size-3" />
                                </a>
                              )}
                              {c.phone && (
                                <a href={`tel:${c.phone}`} onClick={e => e.stopPropagation()}
                                  title="Call" className="size-6 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-brand hover:border-brand transition-colors">
                                  <Phone className="size-3" />
                                </a>
                              )}
                            </div>
                          ) : (
                            renderCell(key, c)
                          )}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Preview drawer — slides in from right on row click */}
        <PreviewDrawer candidate={preview} onClose={() => setPreview(null)} />
      </div>

      {/* ── Pagination ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Rows per page</span>
          <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v) as 25 | 50 | 100); setPage(0) }}>
            <SelectTrigger className="h-7 w-16 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {sorted.length === 0 ? '0' : `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, sorted.length)} of ${sorted.length}`}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="size-7 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="size-3.5" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = totalPages <= 5 ? i : Math.max(0, Math.min(page - 2, totalPages - 5)) + i
              return (
                <button key={pg} onClick={() => setPage(pg)}
                  className={`size-7 flex items-center justify-center rounded-md text-xs border transition-colors ${
                    pg === page ? 'bg-brand border-brand text-white' : 'border-border text-muted-foreground hover:bg-muted'
                  }`}>
                  {pg + 1}
                </button>
              )
            })}
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="size-7 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
