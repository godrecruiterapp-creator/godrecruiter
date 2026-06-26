'use client'

import { useState, useMemo, useTransition, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
  DropdownMenuLabel, DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import {
  Plus, Briefcase, ChevronDown, X, SlidersHorizontal, Trash2,
  Settings2, GripVertical, Check, ChevronUp, ChevronsUpDown,
  Search, ChevronLeft, ChevronRight,
  Users, Sparkles, Send, Mail, Phone, MessageSquare,
  Code2, ClipboardList, FileText, PenLine, Zap,
  Pencil, Globe, Share2, UserPlus, Copy, Link as LinkIcon,
} from 'lucide-react'
import { bulkUpdateJobsAction, bulkDeleteJobsAction } from './actions'

// ── Types ─────────────────────────────────────────────────────────────────────

export type Job = {
  id: string; display_id: string | null; title: string
  client: string | null; city: string | null; state: string | null
  employment_type: string | null; work_mode: string | null; client_type: string | null
  status: string; priority: string; recruiter_name: string | null
  openings: number; created_at: string; updated_at: string
}

type ColKey =
  | 'select' | 'job_id' | 'title' | 'client' | 'city' | 'state'
  | 'emp_type' | 'status' | 'priority' | 'recruiter'
  | 'openings' | 'submitted' | 'interviews' | 'offers'
  | 'created' | 'modified' | 'aging'

const COL_META: Record<ColKey, { label: string; width: number; sortable?: boolean }> = {
  select:     { label: 'Select',     width: 48  },
  job_id:     { label: 'Job ID',     width: 110, sortable: true },
  title:      { label: 'Job Title',  width: 220, sortable: true },
  client:     { label: 'Client',     width: 150, sortable: true },
  city:       { label: 'City',       width: 120, sortable: true },
  state:      { label: 'State',      width: 90  },
  emp_type:   { label: 'Emp. Type',  width: 120 },
  status:     { label: 'Status',     width: 100 },
  priority:   { label: 'Priority',   width: 95  },
  recruiter:  { label: 'Recruiter',  width: 140, sortable: true },
  openings:   { label: 'Openings',   width: 85  },
  submitted:  { label: 'Submitted',  width: 95  },
  interviews: { label: 'Interviews', width: 95  },
  offers:     { label: 'Offers',     width: 75  },
  created:    { label: 'Created',    width: 100, sortable: true },
  modified:   { label: 'Modified',   width: 100, sortable: true },
  aging:      { label: 'Aging',      width: 75,  sortable: true },
}

const DEFAULT_COLS: ColKey[] = [
  'select', 'job_id', 'title', 'client', 'city', 'state',
  'emp_type', 'status', 'priority', 'recruiter',
  'openings', 'submitted', 'interviews', 'offers',
  'created', 'modified', 'aging',
]

// ── Badge configs ──────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  open:    { label: 'Open',    className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  on_hold: { label: 'On Hold', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  closed:  { label: 'Closed',  className: 'bg-slate-100 text-slate-600 border-slate-200' },
  filled:  { label: 'Filled',  className: 'bg-blue-50 text-blue-700 border-blue-200' },
}
const PRIORITY_BADGE: Record<string, { label: string; className: string }> = {
  high:   { label: 'High',   className: 'bg-red-50 text-red-700 border-red-200' },
  medium: { label: 'Medium', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  low:    { label: 'Low',    className: 'bg-slate-100 text-slate-500 border-slate-200' },
}
const EMP_LABELS: Record<string, string> = {
  contract: 'Contract', full_time: 'Full-Time', cth: 'CTH',
  direct_hire: 'Direct Hire', remote: 'Remote', hybrid: 'Hybrid',
}

function Chip({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${className}`}>
      {label}
    </span>
  )
}
function fmt(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
}
function aging(createdAt: string) {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000)
}

// ── Filters ───────────────────────────────────────────────────────────────────

type Filters = {
  search: string; status: string; client: string; recruiter: string; empType: string
  priority: string; clientType: string; workMode: string; agingMin: string
  dateFrom: string; dateTo: string
}

const EMPTY_FILTERS: Filters = {
  search: '', status: '', client: '', recruiter: '', empType: '',
  priority: '', clientType: '', workMode: '', agingMin: '', dateFrom: '', dateTo: '',
}

function activeFilterCount(f: Filters) {
  return [f.status, f.client, f.recruiter, f.empType, f.priority, f.clientType, f.workMode, f.agingMin, f.dateFrom, f.dateTo].filter(Boolean).length
}

// ── Shared small components ───────────────────────────────────────────────────

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
        <SelectTrigger id={id} className="h-9 text-sm"><SelectValue placeholder={placeholder} /></SelectTrigger>
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
  const hidden = DEFAULT_COLS.filter(k => !cols.includes(k) && k !== 'select')

  function toggle(key: ColKey) {
    if (key === 'select') return
    if (cols.includes(key)) { onChange(cols.filter(k => k !== key)); return }
    onChange([...cols, key])
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
          {cols.filter(k => k !== 'select').map(key => (
            <div key={key} draggable onDragStart={() => { drag.current = key }}
              onDragOver={e => e.preventDefault()} onDrop={() => onDrop(key)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/60 cursor-grab active:cursor-grabbing group">
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

// ── Main component ─────────────────────────────────────────────────────────────

const PAGE_SIZES = [25, 50, 100] as const

export function JobsTableClient({ jobs }: { jobs: Job[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [cols, setCols]           = useState<ColKey[]>(DEFAULT_COLS)
  const [colWidths, setColWidths] = useState<Partial<Record<ColKey, number>>>({})
  const [selected, setSelected]   = useState<Set<string>>(new Set())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [draft, setDraft]         = useState<Filters>(EMPTY_FILTERS)
  const [applied, setApplied]     = useState<Filters>(EMPTY_FILTERS)
  const [sortKey, setSortKey]     = useState<ColKey | null>(null)
  const [sortDir, setSortDir]     = useState<'asc' | 'desc'>('asc')
  const [page, setPage]           = useState(0)
  const [pageSize, setPageSize]   = useState<25 | 50 | 100>(25)

  function setDraftField<K extends keyof Filters>(key: K, value: string) {
    setDraft(prev => ({ ...prev, [key]: value }))
  }
  function openDrawer() { setDraft(applied); setDrawerOpen(true) }
  function applyFilters() { setApplied(draft); setDrawerOpen(false); setPage(0) }
  function clearDraft() { setDraft(EMPTY_FILTERS) }
  function clearApplied() { setApplied(EMPTY_FILTERS); setDraft(EMPTY_FILTERS); setPage(0) }

  const clients    = useMemo(() => [...new Set(jobs.map(j => j.client).filter(Boolean))].sort() as string[], [jobs])
  const recruiters = useMemo(() => [...new Set(jobs.map(j => j.recruiter_name).filter(Boolean))].sort() as string[], [jobs])

  const filtered = useMemo(() => {
    const f = applied
    return jobs.filter(j => {
      if (f.search) {
        const q = f.search.toLowerCase()
        if (!j.title.toLowerCase().includes(q) && !(j.client ?? '').toLowerCase().includes(q) && !(j.display_id ?? '').toLowerCase().includes(q)) return false
      }
      if (f.status     && j.status !== f.status) return false
      if (f.client     && j.client !== f.client) return false
      if (f.recruiter  && j.recruiter_name !== f.recruiter) return false
      if (f.empType    && j.employment_type !== f.empType) return false
      if (f.priority   && j.priority !== f.priority) return false
      if (f.clientType && j.client_type !== f.clientType) return false
      if (f.workMode   && j.work_mode !== f.workMode) return false
      if (f.agingMin   && aging(j.created_at) < parseInt(f.agingMin)) return false
      if (f.dateFrom   && new Date(j.created_at) < new Date(f.dateFrom)) return false
      if (f.dateTo     && new Date(j.created_at) > new Date(f.dateTo + 'T23:59:59')) return false
      return true
    })
  }, [jobs, applied])

  const sorted = useMemo(() => sortKey ? [...filtered].sort((a, b) => {
    const get = (j: Job): string => {
      if (sortKey === 'job_id')   return j.display_id ?? j.id
      if (sortKey === 'title')    return j.title
      if (sortKey === 'client')   return j.client ?? ''
      if (sortKey === 'city')     return j.city ?? ''
      if (sortKey === 'recruiter') return j.recruiter_name ?? ''
      if (sortKey === 'created')  return j.created_at
      if (sortKey === 'modified') return j.updated_at
      if (sortKey === 'aging')    return String(aging(j.created_at))
      return ''
    }
    const cmp = get(a).localeCompare(get(b), undefined, { numeric: true })
    return sortDir === 'asc' ? cmp : -cmp
  }) : filtered, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated  = sorted.slice(page * pageSize, (page + 1) * pageSize)

  const allSel  = paginated.length > 0 && paginated.every(j => selected.has(j.id))
  const someSel = paginated.some(j => selected.has(j.id)) && !allSel
  function toggleAll(v: boolean) { setSelected(v ? new Set(paginated.map(j => j.id)) : new Set()) }
  function toggleRow(id: string, v: boolean) { const n = new Set(selected); v ? n.add(id) : n.delete(id); setSelected(n) }

  function handleSort(key: ColKey) {
    if (!COL_META[key].sortable) return
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(0)
  }

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

  async function handleBulkStatus(status: string) {
    startTransition(async () => { await bulkUpdateJobsAction([...selected], { status }); setSelected(new Set()); router.refresh() })
  }
  async function handleBulkPriority(priority: string) {
    startTransition(async () => { await bulkUpdateJobsAction([...selected], { priority }); setSelected(new Set()); router.refresh() })
  }
  async function handleBulkDelete() {
    if (!confirm(`Delete ${selected.size} job(s)? This cannot be undone.`)) return
    startTransition(async () => { await bulkDeleteJobsAction([...selected]); setSelected(new Set()); router.refresh() })
  }

  const colW = (k: ColKey) => colWidths[k] ?? COL_META[k].width
  const activeCount = activeFilterCount(applied)

  function SortChevron({ k }: { k: ColKey }) {
    if (!COL_META[k].sortable) return null
    if (sortKey !== k) return <ChevronsUpDown className="size-3 text-muted-foreground/30 ml-1 shrink-0" />
    return sortDir === 'asc' ? <ChevronUp className="size-3 text-brand ml-1 shrink-0" /> : <ChevronDown className="size-3 text-brand ml-1 shrink-0" />
  }

  function renderHeader(key: ColKey) {
    if (key === 'select') return <Checkbox checked={allSel} data-state={someSel ? 'indeterminate' : undefined} onCheckedChange={toggleAll} aria-label="Select all" />
    return (
      <button onClick={() => handleSort(key)} className={`flex items-center gap-0 w-full text-left ${COL_META[key].sortable ? 'cursor-pointer' : 'cursor-default'}`}>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{COL_META[key].label}</span>
        <SortChevron k={key} />
      </button>
    )
  }

  function renderCell(key: ColKey, job: Job) {
    const st  = STATUS_BADGE[job.status]    ?? STATUS_BADGE['open']!
    const pri = PRIORITY_BADGE[job.priority] ?? PRIORITY_BADGE['medium']!
    const days = aging(job.created_at)
    switch (key) {
      case 'select':
        return <Checkbox checked={selected.has(job.id)} onCheckedChange={v => toggleRow(job.id, !!v)} onClick={e => e.stopPropagation()} aria-label={`Select ${job.title}`} />
      case 'job_id':
        return (
          <Link href={`/dashboard/jobs/${job.id}`} onClick={e => e.stopPropagation()}
            className="text-xs text-muted-foreground font-medium tabular-nums hover:text-brand transition-colors">
            {job.display_id ?? `…${job.id.slice(-6).toUpperCase()}`}
          </Link>
        )
      case 'title':
        return (
          <Link href={`/dashboard/jobs/${job.id}`} onClick={e => e.stopPropagation()}
            className="text-sm font-medium truncate hover:text-brand transition-colors block">
            {job.title}
          </Link>
        )
      case 'client':     return <span className="text-xs text-muted-foreground truncate">{job.client ?? '—'}</span>
      case 'city':       return <span className="text-xs text-muted-foreground truncate">{job.city ?? '—'}</span>
      case 'state':      return <span className="text-xs text-muted-foreground">{job.state ?? '—'}</span>
      case 'emp_type':   return <span className="text-xs text-muted-foreground whitespace-nowrap">{EMP_LABELS[job.employment_type ?? ''] ?? '—'}</span>
      case 'status':     return <Chip label={st.label} className={st.className} />
      case 'priority':   return <Chip label={pri.label} className={pri.className} />
      case 'recruiter':  return <span className="text-xs text-muted-foreground">{job.recruiter_name ?? '—'}</span>
      case 'openings':   return <span className="text-xs text-muted-foreground tabular-nums">{job.openings}</span>
      case 'submitted':  return <span className="text-xs text-muted-foreground tabular-nums">0</span>
      case 'interviews': return <span className="text-xs text-muted-foreground tabular-nums">0</span>
      case 'offers':     return <span className="text-xs text-muted-foreground tabular-nums">0</span>
      case 'created':    return <span className="text-xs text-muted-foreground whitespace-nowrap">{fmt(job.created_at)}</span>
      case 'modified':   return <span className="text-xs text-muted-foreground whitespace-nowrap">{fmt(job.updated_at)}</span>
      case 'aging':
        return (
          <span className={`text-xs tabular-nums font-medium ${days > 30 ? 'text-red-600' : days > 14 ? 'text-amber-600' : 'text-muted-foreground'}`}>
            {days}d
          </span>
        )
    }
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="size-10 rounded-full bg-muted flex items-center justify-center">
          <Briefcase className="size-4 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No jobs yet</p>
        <p className="text-sm text-muted-foreground">Post your first job to start receiving applications.</p>
        <Button asChild size="sm" className="mt-1"><Link href="/dashboard/jobs/new">Post a job</Link></Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col h-full min-h-0 overflow-hidden">

        {/* ── Top bar ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pb-3 shrink-0 gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="relative shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input value={applied.search}
                onChange={e => { setApplied(p => ({ ...p, search: e.target.value })); setPage(0) }}
                placeholder="Search by title, client, ID…" className="h-8 w-52 pl-8 pr-7 text-xs" />
              {applied.search && (
                <button onClick={() => { setApplied(p => ({ ...p, search: '' })); setPage(0) }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={openDrawer} className="gap-1.5 h-8">
              <SlidersHorizontal className="size-3.5" />Filters
              {activeCount > 0 && (
                <span className="flex items-center justify-center size-4 rounded-full bg-brand text-white text-[10px] font-semibold">{activeCount}</span>
              )}
            </Button>
            <ColPicker cols={cols} onChange={setCols} />
            <Button asChild size="sm" className="h-8">
              <Link href="/dashboard/jobs/new"><Plus className="size-3.5 mr-1.5" />Post a job</Link>
            </Button>
          </div>
        </div>

        {/* ── Active filter chips ──────────────────────────────────────── */}
        {activeCount > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pb-3 shrink-0">
            {applied.status     && <ActiveChip label={`Status: ${STATUS_BADGE[applied.status]?.label ?? applied.status}`} onRemove={() => setApplied(p => ({ ...p, status: '' }))} />}
            {applied.client     && <ActiveChip label={`Client: ${applied.client}`} onRemove={() => setApplied(p => ({ ...p, client: '' }))} />}
            {applied.recruiter  && <ActiveChip label={`Recruiter: ${applied.recruiter}`} onRemove={() => setApplied(p => ({ ...p, recruiter: '' }))} />}
            {applied.empType    && <ActiveChip label={`Type: ${EMP_LABELS[applied.empType] ?? applied.empType}`} onRemove={() => setApplied(p => ({ ...p, empType: '' }))} />}
            {applied.priority   && <ActiveChip label={`Priority: ${applied.priority}`} onRemove={() => setApplied(p => ({ ...p, priority: '' }))} />}
            {applied.clientType && <ActiveChip label={applied.clientType === 'vms' ? 'VMS' : 'Direct Client'} onRemove={() => setApplied(p => ({ ...p, clientType: '' }))} />}
            {applied.workMode   && <ActiveChip label={`Mode: ${applied.workMode}`} onRemove={() => setApplied(p => ({ ...p, workMode: '' }))} />}
            {applied.agingMin   && <ActiveChip label={`Aging: ${applied.agingMin}+ days`} onRemove={() => setApplied(p => ({ ...p, agingMin: '' }))} />}
            {(applied.dateFrom || applied.dateTo) && (
              <ActiveChip label={`Date: ${applied.dateFrom || '…'} – ${applied.dateTo || '…'}`} onRemove={() => setApplied(p => ({ ...p, dateFrom: '', dateTo: '' }))} />
            )}
            <button onClick={clearApplied} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">Clear all</button>
          </div>
        )}

        {/* ── Bulk action bar ──────────────────────────────────────────── */}
        {selected.size > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 mb-2.5 bg-brand-muted border border-brand/20 rounded-lg shrink-0">
            <span className="text-xs font-semibold text-brand">{selected.size} selected</span>
            <div className="w-px h-4 bg-brand/20 mx-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" disabled={isPending} className="h-7 text-xs">
                  Manage <ChevronDown className="size-3.5 ml-1.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">

                {/* Candidates — find, evaluate, and submit candidates for the job */}
                <DropdownMenuLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1.5">Candidates</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {/* Find Candidates — search ATS database for matching candidates */}
                  <DropdownMenuItem><Users className="size-3.5 mr-2" />Find Candidates</DropdownMenuItem>
                  {/* AI Match — rank the best-fit candidates using AI */}
                  <DropdownMenuItem><Sparkles className="size-3.5 mr-2" />AI Match</DropdownMenuItem>
                  {/* Submit Candidate — send selected candidates to the client or hiring manager */}
                  <DropdownMenuItem><Send className="size-3.5 mr-2" />Submit Candidate</DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* Communication — connect with candidates throughout the hiring process */}
                <DropdownMenuLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1.5">Communication</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {/* Send Email — email selected candidates directly from the ATS */}
                  <DropdownMenuItem><Mail className="size-3.5 mr-2" />Send Email</DropdownMenuItem>
                  {/* Call — call candidates using the integrated dialer */}
                  <DropdownMenuItem><Phone className="size-3.5 mr-2" />Call</DropdownMenuItem>
                  {/* Send SMS — send text messages to selected candidates */}
                  <DropdownMenuItem><MessageSquare className="size-3.5 mr-2" />Send SMS</DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* AI Tools — accelerate sourcing, screening, and submissions */}
                <DropdownMenuLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1.5">AI Tools</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {/* Generate Boolean — create optimized Boolean search strings for external sourcing */}
                  <DropdownMenuItem><Code2 className="size-3.5 mr-2" />Generate Boolean</DropdownMenuItem>
                  {/* Screening Questions — generate job-specific candidate screening questions */}
                  <DropdownMenuItem><ClipboardList className="size-3.5 mr-2" />Screening Questions</DropdownMenuItem>
                  {/* Generate Outreach Email — create personalized outreach emails for candidates */}
                  <DropdownMenuItem><Mail className="size-3.5 mr-2" />Generate Outreach Email</DropdownMenuItem>
                  {/* Generate Submission Notes — generate a professional candidate summary for client submissions */}
                  <DropdownMenuItem><FileText className="size-3.5 mr-2" />Generate Submission Notes</DropdownMenuItem>
                  {/* Rewrite Job Description — improve and optimize the job description */}
                  <DropdownMenuItem><PenLine className="size-3.5 mr-2" />Rewrite Job Description</DropdownMenuItem>
                  {/* Extract Skills — identify required and preferred skills from the job description */}
                  <DropdownMenuItem><Zap className="size-3.5 mr-2" />Extract Skills</DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* Job Management — manage and maintain the job throughout its lifecycle */}
                <DropdownMenuLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1.5">Job Management</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {/* Edit Job — update the job details, requirements, or settings */}
                  <DropdownMenuItem><Pencil className="size-3.5 mr-2" />Edit Job</DropdownMenuItem>
                  {/* Post Job — publish the job to job boards and career sites */}
                  <DropdownMenuItem><Globe className="size-3.5 mr-2" />Post Job</DropdownMenuItem>
                  {/* Share Job — share with recruiters, hiring managers, or vendors */}
                  <DropdownMenuItem><Share2 className="size-3.5 mr-2" />Share Job</DropdownMenuItem>
                  {/* Assign — assign the job to recruiters, teams, or account managers */}
                  <DropdownMenuItem><UserPlus className="size-3.5 mr-2" />Assign</DropdownMenuItem>
                  {/* Duplicate — create a copy of the job for similar hiring needs */}
                  <DropdownMenuItem><Copy className="size-3.5 mr-2" />Duplicate</DropdownMenuItem>
                  {/* Copy Public Link — copy the public job URL to share externally */}
                  <DropdownMenuItem><LinkIcon className="size-3.5 mr-2" />Copy Public Link</DropdownMenuItem>
                  <DropdownMenuSub>
                    {/* Change status — update the job's current status */}
                    <DropdownMenuSubTrigger>Change Status</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {(['open','on_hold','closed','filled'] as const).map(s => (
                        <DropdownMenuItem key={s} onClick={() => handleBulkStatus(s)}>{STATUS_BADGE[s]?.label ?? s}</DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    {/* Change priority — update the job's hiring priority */}
                    <DropdownMenuSubTrigger>Change Priority</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {(['high','medium','low'] as const).map(p => (
                        <DropdownMenuItem key={p} onClick={() => handleBulkPriority(p)}>{PRIORITY_BADGE[p]?.label ?? p}</DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleBulkDelete}>
                  <Trash2 className="size-3.5 mr-2" />Delete Jobs
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>
            <button onClick={() => setSelected(new Set())} className="ml-auto size-6 flex items-center justify-center text-muted-foreground hover:text-foreground rounded transition-colors">
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {/* ── Table ───────────────────────────────────────────────────── */}
        <div className="flex flex-1 min-h-0 overflow-hidden border border-border rounded-lg">
          <div className="flex-1 overflow-auto">
            {paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2">
                <Search className="size-6 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No jobs match your filters</p>
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
                        {key !== 'select' && (
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
                  {paginated.map(job => {
                    const isSel = selected.has(job.id)
                    return (
                      <tr key={job.id}
                        className={`group border-b border-border transition-colors ${isSel ? 'bg-brand-muted/50' : 'hover:bg-muted/40'}`}>
                        {cols.map(key => (
                          <td key={key} style={{ width: colW(key), minWidth: colW(key) }}
                            className="px-3 py-2 align-middle overflow-hidden">
                            {renderCell(key, job)}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Pagination ───────────────────────────────────────────────── */}
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

      {/* ── Filter drawer ────────────────────────────────────────────── */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-80 sm:w-96 flex flex-col p-0">
          <SheetHeader className="px-5 py-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base">Filters</SheetTitle>
              {Object.values(draft).some(Boolean) && (
                <button onClick={clearDraft} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">Clear all</button>
              )}
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            <DrawerSelect id="f-status" label="Status" value={draft.status} onChange={v => setDraftField('status', v)} options={[
              { value: 'open', label: 'Open' }, { value: 'on_hold', label: 'On Hold' },
              { value: 'closed', label: 'Closed' }, { value: 'filled', label: 'Filled' },
            ]} />
            <DrawerSelect id="f-client" label="Client" value={draft.client} onChange={v => setDraftField('client', v)}
              options={clients.map(c => ({ value: c, label: c }))} placeholder={clients.length ? 'All clients' : 'No clients yet'} />
            <DrawerSelect id="f-recruiter" label="Recruiter" value={draft.recruiter} onChange={v => setDraftField('recruiter', v)}
              options={recruiters.map(r => ({ value: r, label: r }))} placeholder={recruiters.length ? 'All recruiters' : 'No recruiters yet'} />
            <DrawerSelect id="f-emptype" label="Job Type" value={draft.empType} onChange={v => setDraftField('empType', v)} options={[
              { value: 'full_time', label: 'Full-Time' }, { value: 'contract', label: 'Contract' },
              { value: 'cth', label: 'CTH (Contract to Hire)' }, { value: 'direct_hire', label: 'Direct Hire' },
              { value: 'remote', label: 'Remote' }, { value: 'hybrid', label: 'Hybrid' },
            ]} />
            <DrawerSelect id="f-priority" label="Priority" value={draft.priority} onChange={v => setDraftField('priority', v)} options={[
              { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' },
            ]} />
            <DrawerSelect id="f-clienttype" label="Client Type" value={draft.clientType} onChange={v => setDraftField('clientType', v)} options={[
              { value: 'direct', label: 'Direct Client' }, { value: 'vms', label: 'VMS' },
            ]} />
            <DrawerSelect id="f-workmode" label="Work Mode" value={draft.workMode} onChange={v => setDraftField('workMode', v)} options={[
              { value: 'remote', label: 'Remote' }, { value: 'hybrid', label: 'Hybrid' }, { value: 'onsite', label: 'Onsite' },
            ]} />
            <DrawerSelect id="f-aging" label="Aging (days open)" value={draft.agingMin} onChange={v => setDraftField('agingMin', v)} options={[
              { value: '7', label: '7+ days' }, { value: '14', label: '14+ days' },
              { value: '30', label: '30+ days' }, { value: '60', label: '60+ days' }, { value: '90', label: '90+ days' },
            ]} />
            <div className="space-y-2">
              <Label className="text-xs font-medium">Created date range</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <span className="text-[11px] text-muted-foreground">From</span>
                  <input type="date" value={draft.dateFrom} onChange={e => setDraftField('dateFrom', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div className="flex-1 space-y-1">
                  <span className="text-[11px] text-muted-foreground">To</span>
                  <input type="date" value={draft.dateTo} onChange={e => setDraftField('dateTo', e.target.value)}
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
    </>
  )
}
