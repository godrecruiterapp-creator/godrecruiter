'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
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
  BookmarkPlus, Bookmark, Download, SlidersHorizontal,
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

// ── Filters ───────────────────────────────────────────────────────────────────

type Filters = {
  search: string
  stage: string
  work_auth: string
  notice: string
  city: string
  state: string
  pay_min: string
  pay_max: string
  source: string
  date_from: string
  date_to: string
}
const EMPTY_FILTERS: Filters = {
  search: '', stage: '', work_auth: '', notice: '', city: '', state: '',
  pay_min: '', pay_max: '', source: '', date_from: '', date_to: '',
}

function activeFilterCount(f: Filters) {
  return [f.stage, f.work_auth, f.notice, f.city, f.state, f.pay_min, f.pay_max, f.source, f.date_from, f.date_to].filter(Boolean).length
}

// ── Saved views ───────────────────────────────────────────────────────────────

type SavedView = { name: string; cols: ColKey[]; filters: Filters; sortKey: ColKey | null; sortDir: 'asc' | 'desc' }
const VIEWS_KEY = 'gr:candidate-views-v2'
function loadViews(): SavedView[] { try { return JSON.parse(localStorage.getItem(VIEWS_KEY) ?? '[]') } catch { return [] } }
function persistViews(v: SavedView[]) { localStorage.setItem(VIEWS_KEY, JSON.stringify(v)) }

// ── Small helpers ─────────────────────────────────────────────────────────────

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 h-6 pl-2 pr-1 rounded-full border border-brand/30 bg-brand-muted text-xs text-foreground">
      {label}
      <button onClick={onRemove} className="flex items-center justify-center size-3.5 rounded-full hover:bg-brand/10 transition-colors" aria-label="Remove filter">
        <X className="size-2.5" />
      </button>
    </span>
  )
}

function DrawerSelect({ id, label, value, onChange, options, placeholder = 'All' }: {
  id: string; label: string; value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium">{label}</Label>
      <Select value={value || '__all__'} onValueChange={v => onChange(v === '__all__' ? '' : v)}>
        <SelectTrigger id={id} className="h-9 text-sm">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">{placeholder}</SelectItem>
          {options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

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
  const [applied, setApplied]       = useState<Filters>(EMPTY_FILTERS)
  const [draft, setDraft]           = useState<Filters>(EMPTY_FILTERS)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sortKey, setSortKey]       = useState<ColKey | null>(null)
  const [sortDir, setSortDir]       = useState<'asc' | 'desc'>('asc')
  const [page, setPage]             = useState(0)
  const [pageSize, setPageSize]     = useState<25 | 50 | 100>(25)
  const [views, setViews]           = useState<SavedView[]>([])
  const [viewName, setViewName]     = useState('')
  const [savingView, setSavingView] = useState(false)

  useEffect(() => { setViews(loadViews()) }, [])

  function setDraftField<K extends keyof Filters>(key: K, value: string) {
    setDraft(prev => ({ ...prev, [key]: value }))
  }
  function openDrawer() { setDraft(applied); setDrawerOpen(true) }
  function applyFilters() { setApplied(draft); setDrawerOpen(false); setPage(0) }
  function clearDraft() { setDraft(EMPTY_FILTERS) }
  function clearApplied() { setApplied(EMPTY_FILTERS); setDraft(EMPTY_FILTERS); setPage(0) }

  // ── Options derived from data ─────────────────────────────────────────
  const cities    = useMemo(() => [...new Set(all.map(c => c.location).filter(Boolean))].sort() as string[], [all])
  const notices   = useMemo(() => [...new Set(all.map(c => c.notice_period).filter(Boolean))].sort() as string[], [all])
  const sources   = useMemo(() => [...new Set(all.map(c => c.source).filter(Boolean))].sort() as string[], [all])

  // ── Filter ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => all.filter(c => {
    if (applied.search) {
      const q = applied.search.toLowerCase()
      const n = [c.first_name, c.last_name].filter(Boolean).join(' ').toLowerCase()
      if (!n.includes(q) && !c.email.toLowerCase().includes(q) && !canId(c.candidate_number).toLowerCase().includes(q) && !(c.current_title ?? '').toLowerCase().includes(q)) return false
    }
    if (applied.work_auth && c.candidate_type !== applied.work_auth) return false
    if (applied.notice    && c.notice_period !== applied.notice) return false
    if (applied.city      && c.location !== applied.city) return false
    if (applied.source    && c.source !== applied.source) return false
    if (applied.pay_min   && (c.expected_ctc ?? 0) < parseInt(applied.pay_min)) return false
    if (applied.pay_max   && (c.expected_ctc ?? 0) > parseInt(applied.pay_max)) return false
    if (applied.date_from && new Date(c.created_at) < new Date(applied.date_from)) return false
    if (applied.date_to   && new Date(c.created_at) > new Date(applied.date_to + 'T23:59:59')) return false
    return true
  }), [all, applied])

  // ── Sort ──────────────────────────────────────────────────────────────
  const sorted = useMemo(() => sortKey ? [...filtered].sort((a, b) => {
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
  }) : filtered, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated  = sorted.slice(page * pageSize, (page + 1) * pageSize)

  // ── Select ────────────────────────────────────────────────────────────
  const allSel  = paginated.length > 0 && paginated.every(c => selected.has(c.id))
  const someSel = paginated.some(c => selected.has(c.id)) && !allSel
  function toggleAll(v: boolean) { setSelected(v ? new Set(paginated.map(c => c.id)) : new Set()) }
  function toggleRow(id: string, v: boolean) { const n = new Set(selected); v ? n.add(id) : n.delete(id); setSelected(n) }

  // ── Sort toggle ───────────────────────────────────────────────────────
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
    const v: SavedView = { name: viewName.trim(), cols, filters: applied, sortKey, sortDir }
    const next = [...views.filter(x => x.name !== v.name), v]
    setViews(next); persistViews(next); setViewName(''); setSavingView(false)
  }
  function loadView(v: SavedView) { setCols(v.cols); setApplied(v.filters); setDraft(v.filters); setSortKey(v.sortKey); setSortDir(v.sortDir); setPage(0) }
  function deleteView(name: string) { const next = views.filter(v => v.name !== name); setViews(next); persistViews(next) }

  const colW = (k: ColKey) => colWidths[k] ?? COL_META[k].width
  const activeCount = activeFilterCount(applied)

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
        {/* Left: search + saved views */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="relative shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input value={applied.search}
              onChange={e => { setApplied(p => ({ ...p, search: e.target.value })); setPage(0) }}
              placeholder="Search by name, email, ID…" className="h-8 w-52 pl-8 pr-7 text-xs" />
            {applied.search && (
              <button onClick={() => { setApplied(p => ({ ...p, search: '' })); setPage(0) }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Saved view chips */}
          {views.length > 0 && views.map(v => (
            <div key={v.name} className="flex items-center shrink-0">
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

        {/* Right: actions */}
        <div className="flex items-center gap-2 shrink-0">
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

          <Button variant="outline" size="sm" onClick={openDrawer} className="gap-1.5 h-8">
            <SlidersHorizontal className="size-3.5" />
            Filters
            {activeCount > 0 && (
              <span className="flex items-center justify-center size-4 rounded-full bg-brand text-white text-[10px] font-semibold">
                {activeCount}
              </span>
            )}
          </Button>

          <ColPicker cols={cols} onChange={setCols} />

          <Button asChild size="sm" className="h-8">
            <Link href="/dashboard/candidates/new"><Plus className="size-3.5 mr-1.5" />Add candidate</Link>
          </Button>
        </div>
      </div>

      {/* ── Active filter chips ────────────────────────────────────────── */}
      {activeCount > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pb-3 shrink-0">
          {applied.stage     && <ActiveChip label={`Stage: ${applied.stage}`} onRemove={() => setApplied(p => ({ ...p, stage: '' }))} />}
          {applied.work_auth && <ActiveChip label={`Auth: ${WORK_AUTH[applied.work_auth] ?? applied.work_auth}`} onRemove={() => setApplied(p => ({ ...p, work_auth: '' }))} />}
          {applied.notice    && <ActiveChip label={`Availability: ${applied.notice}`} onRemove={() => setApplied(p => ({ ...p, notice: '' }))} />}
          {applied.city      && <ActiveChip label={`City: ${applied.city}`} onRemove={() => setApplied(p => ({ ...p, city: '' }))} />}
          {applied.state     && <ActiveChip label={`State: ${applied.state}`} onRemove={() => setApplied(p => ({ ...p, state: '' }))} />}
          {applied.source    && <ActiveChip label={`Source: ${applied.source}`} onRemove={() => setApplied(p => ({ ...p, source: '' }))} />}
          {(applied.pay_min || applied.pay_max) && (
            <ActiveChip label={`Pay: ${applied.pay_min ? `₹${applied.pay_min}` : '0'} – ${applied.pay_max ? `₹${applied.pay_max}` : '∞'}`}
              onRemove={() => setApplied(p => ({ ...p, pay_min: '', pay_max: '' }))} />
          )}
          {(applied.date_from || applied.date_to) && (
            <ActiveChip label={`Created: ${applied.date_from || '…'} – ${applied.date_to || '…'}`}
              onRemove={() => setApplied(p => ({ ...p, date_from: '', date_to: '' }))} />
          )}
          <button onClick={clearApplied} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">Clear all</button>
        </div>
      )}

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

      {/* ── Table + preview drawer ────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden border border-border rounded-lg">
        <div className="flex-1 overflow-auto">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <Search className="size-6 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No candidates match your filters</p>
              <button onClick={clearApplied} className="text-xs text-brand hover:underline">Clear filters</button>
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

      {/* ── Filter drawer ─────────────────────────────────────────────── */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-80 sm:w-96 flex flex-col p-0">
          <SheetHeader className="px-5 py-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base">Filters</SheetTitle>
              {Object.values(draft).some(v => v && v !== '') && (
                <button onClick={clearDraft} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">Clear all</button>
              )}
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            <DrawerSelect id="f-stage" label="Stage" value={draft.stage} onChange={v => setDraftField('stage', v)} options={[
              { value: 'sourced',   label: 'Sourced' },
              { value: 'qualified', label: 'Qualified' },
              { value: 'submitted', label: 'Submitted' },
              { value: 'interview', label: 'Interview' },
              { value: 'offer',     label: 'Offer' },
              { value: 'start',     label: 'Start' },
            ]} />

            <DrawerSelect id="f-work-auth" label="Work Authorization" value={draft.work_auth} onChange={v => setDraftField('work_auth', v)} options={
              Object.entries(WORK_AUTH).map(([k, v]) => ({ value: k, label: v }))
            } />

            <DrawerSelect id="f-notice" label="Availability" value={draft.notice} onChange={v => setDraftField('notice', v)}
              options={notices.map(n => ({ value: n, label: n }))} placeholder={notices.length ? 'All' : 'No data yet'} />

            <DrawerSelect id="f-city" label="City" value={draft.city} onChange={v => setDraftField('city', v)}
              options={cities.map(c => ({ value: c, label: c }))} placeholder={cities.length ? 'All cities' : 'No data yet'} />

            <DrawerSelect id="f-source" label="Source" value={draft.source} onChange={v => setDraftField('source', v)}
              options={sources.map(s => ({ value: s, label: s }))} placeholder={sources.length ? 'All sources' : 'No data yet'} />

            {/* Pay range */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Pay Expectation (₹)</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <span className="text-[11px] text-muted-foreground">Min</span>
                  <input type="number" placeholder="0" value={draft.pay_min} onChange={e => setDraftField('pay_min', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div className="flex-1 space-y-1">
                  <span className="text-[11px] text-muted-foreground">Max</span>
                  <input type="number" placeholder="∞" value={draft.pay_max} onChange={e => setDraftField('pay_max', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
              </div>
            </div>

            {/* Created date range */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Created date range</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <span className="text-[11px] text-muted-foreground">From</span>
                  <input type="date" value={draft.date_from} onChange={e => setDraftField('date_from', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div className="flex-1 space-y-1">
                  <span className="text-[11px] text-muted-foreground">To</span>
                  <input type="date" value={draft.date_to} onChange={e => setDraftField('date_to', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="px-5 py-4 border-t gap-2 flex-row">
            <Button variant="outline" className="flex-1" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={applyFilters}>Apply filters</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

    </div>
  )
}
