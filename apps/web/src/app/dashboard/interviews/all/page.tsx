'use client'

import { useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search, SlidersHorizontal, Settings2, GripVertical, Check,
  ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight,
  CalendarCheck, MoreHorizontal, X, Mail, RefreshCw, XCircle, Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScheduleWizard } from '../schedule-wizard'

type ColKey = 'select' | 'interview_id' | 'candidate' | 'job' | 'client' | 'recruiter' |
  'type' | 'round' | 'date' | 'time' | 'timezone' | 'interviewer' | 'status' |
  'email_status' | 'confirmation' | 'feedback' | 'actions'

const COL_META: Record<ColKey, { label: string; width: number; sortable?: boolean }> = {
  select:       { label: 'Select',       width: 48 },
  interview_id: { label: 'Interview ID', width: 110, sortable: true },
  candidate:    { label: 'Candidate',    width: 180, sortable: true },
  job:          { label: 'Job',          width: 160, sortable: true },
  client:       { label: 'Client',       width: 140 },
  recruiter:    { label: 'Recruiter',    width: 130 },
  type:         { label: 'Type',         width: 130 },
  round:        { label: 'Round',        width: 90 },
  date:         { label: 'Date',         width: 100, sortable: true },
  time:         { label: 'Time',         width: 90 },
  timezone:     { label: 'Timezone',     width: 90 },
  interviewer:  { label: 'Interviewer',  width: 140 },
  status:       { label: 'Status',       width: 100, sortable: true },
  email_status: { label: 'Email Status', width: 110 },
  confirmation: { label: 'Confirmation', width: 120 },
  feedback:     { label: 'Feedback',     width: 110 },
  actions:      { label: '',             width: 48 },
}

const DEFAULT_COLS: ColKey[] = [
  'select','interview_id','candidate','job','client','recruiter',
  'type','round','date','time','timezone','interviewer','status',
  'email_status','confirmation','feedback','actions',
]

type Interview = {
  id: string; interview_id: string; candidate: string; job: string; client: string
  recruiter: string; type: string; round: string; date: string; time: string
  timezone: string; interviewer: string; status: string; email_status: string
  confirmation: string; feedback: string
}

const MOCK_INTERVIEWS: Interview[] = [
  { id:'1', interview_id:'INT-0001', candidate:'Sarah Johnson', job:'Senior Java Developer', client:'TechCorp Inc', recruiter:'Arun Kumar', type:'Technical Interview', round:'Round 2', date:'2026-06-28', time:'10:00 AM', timezone:'EST', interviewer:'Mike Chen', status:'scheduled', email_status:'opened', confirmation:'confirmed', feedback:'pending' },
  { id:'2', interview_id:'INT-0002', candidate:'James Martinez', job:'RN – ICU', client:'Metro Health', recruiter:'Arun Kumar', type:'Client Interview', round:'Round 1', date:'2026-06-28', time:'2:00 PM', timezone:'CST', interviewer:'Dr. Smith', status:'confirmed', email_status:'delivered', confirmation:'confirmed', feedback:'pending' },
  { id:'3', interview_id:'INT-0003', candidate:'Emily Chen', job:'DevOps Engineer', client:'CloudBase', recruiter:'Arun Kumar', type:'Video Interview', round:'Round 1', date:'2026-06-29', time:'11:00 AM', timezone:'PST', interviewer:'Tom Wilson', status:'scheduled', email_status:'sent', confirmation:'pending', feedback:'pending' },
  { id:'4', interview_id:'INT-0004', candidate:'Robert Kim', job:'Project Manager', client:'BuildRight', recruiter:'Arun Kumar', type:'Panel Interview', round:'Final', date:'2026-06-27', time:'9:00 AM', timezone:'EST', interviewer:'Panel', status:'completed', email_status:'replied', confirmation:'confirmed', feedback:'submitted' },
  { id:'5', interview_id:'INT-0005', candidate:'Lisa Thompson', job:'Data Scientist', client:'Analytics Co', recruiter:'Arun Kumar', type:'Phone Screen', round:'Round 1', date:'2026-06-27', time:'3:30 PM', timezone:'EST', interviewer:'HR Team', status:'completed', email_status:'opened', confirmation:'confirmed', feedback:'pending' },
  { id:'6', interview_id:'INT-0006', candidate:'David Park', job:'Software Architect', client:'FinTech Ltd', recruiter:'Arun Kumar', type:'Technical Interview', round:'Round 3', date:'2026-06-30', time:'1:00 PM', timezone:'EST', interviewer:'CTO Office', status:'scheduled', email_status:'delivered', confirmation:'pending', feedback:'pending' },
  { id:'7', interview_id:'INT-0007', candidate:'Maria Garcia', job:'Physical Therapist', client:'RehabCare', recruiter:'Arun Kumar', type:'HR Interview', round:'Round 1', date:'2026-06-26', time:'10:00 AM', timezone:'MST', interviewer:'HR Director', status:'cancelled', email_status:'bounced', confirmation:'declined', feedback:'pending' },
  { id:'8', interview_id:'INT-0008', candidate:'Kevin Brown', job:'Network Engineer', client:'NetSec Corp', recruiter:'Arun Kumar', type:'Technical Interview', round:'Round 2', date:'2026-06-25', time:'2:00 PM', timezone:'EST', interviewer:'Tech Lead', status:'no_show', email_status:'opened', confirmation:'confirmed', feedback:'pending' },
  { id:'9', interview_id:'INT-0009', candidate:'Amy Wilson', job:'UX Designer', client:'Creative Labs', recruiter:'Arun Kumar', type:'Client Interview', round:'Round 2', date:'2026-07-01', time:'11:30 AM', timezone:'PST', interviewer:'Design Head', status:'scheduled', email_status:'sent', confirmation:'pending', feedback:'pending' },
  { id:'10', interview_id:'INT-0010', candidate:'Chris Lee', job:'ML Engineer', client:'AI Startup', recruiter:'Arun Kumar', type:'Video Interview', round:'Round 1', date:'2026-07-02', time:'4:00 PM', timezone:'EST', interviewer:'Tech Team', status:'scheduled', email_status:'delivered', confirmation:'pending', feedback:'pending' },
  { id:'11', interview_id:'INT-0011', candidate:'Sandra Davis', job:'LPN – Acute Care', client:'City Hospital', recruiter:'Arun Kumar', type:'Final Interview', round:'Final', date:'2026-06-27', time:'9:30 AM', timezone:'EST', interviewer:'Nurse Manager', status:'rescheduled', email_status:'replied', confirmation:'confirmed', feedback:'pending' },
  { id:'12', interview_id:'INT-0012', candidate:'Tom Anderson', job:'Sales Manager', client:'RetailCo', recruiter:'Arun Kumar', type:'Manager Interview', round:'Round 1', date:'2026-07-03', time:'10:00 AM', timezone:'CST', interviewer:'VP Sales', status:'scheduled', email_status:'sent', confirmation:'pending', feedback:'pending' },
]

const STATUS_BADGE: Record<string, string> = {
  scheduled:   'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  confirmed:   'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  completed:   'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  cancelled:   'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
  rescheduled: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  no_show:     'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
}

const EMAIL_BADGE: Record<string, string> = {
  sent:      'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  delivered: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400',
  opened:    'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400',
  replied:   'bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-400',
  bounced:   'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400',
}

const CONFIRM_BADGE: Record<string, string> = {
  confirmed: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400',
  pending:   'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400',
  declined:  'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400',
}

function Chip({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${className}`}>
      {label}
    </span>
  )
}

function ColPicker({ cols, onChange }: { cols: ColKey[]; onChange: (c: ColKey[]) => void }) {
  const drag = useRef<ColKey | null>(null)
  const hidden = DEFAULT_COLS.filter(k => !cols.includes(k) && k !== 'select' && k !== 'actions')

  function toggle(key: ColKey) {
    if (key === 'select' || key === 'actions') return
    cols.includes(key) ? onChange(cols.filter(k => k !== key)) : onChange([...cols, key])
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
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-sm">
          <Settings2 className="size-3.5" />Columns
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60 p-0">
        <div className="px-4 py-2.5 border-b flex items-center justify-between">
          <span className="text-sm font-semibold">Columns</span>
          <button onClick={() => onChange(DEFAULT_COLS)} className="text-sm text-brand hover:underline">Reset</button>
        </div>
        <div className="px-2 py-2 max-h-64 overflow-y-auto">
          {cols.filter(k => k !== 'select' && k !== 'actions').map(key => (
            <div key={key} draggable onDragStart={() => { drag.current = key }}
              onDragOver={e => e.preventDefault()} onDrop={() => onDrop(key)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/60 cursor-grab group">
              <GripVertical className="size-3.5 text-muted-foreground/40 shrink-0" />
              <span className="size-4 rounded border flex items-center justify-center shrink-0 bg-brand border-brand">
                <Check className="size-2.5 text-white" strokeWidth={3} />
              </span>
              <span className="text-sm flex-1">{COL_META[key].label}</span>
              <button onClick={() => toggle(key)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 text-sm">✕</button>
            </div>
          ))}
        </div>
        {hidden.length > 0 && (
          <div className="px-2 py-2 max-h-40 overflow-y-auto border-t">
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

const PAGE_SIZES = [25, 50, 100] as const

export default function AllInterviewsPage() {
  const [cols, setCols]           = useState<ColKey[]>(DEFAULT_COLS)
  const [colWidths, setColWidths] = useState<Partial<Record<ColKey, number>>>({})
  const [selected, setSelected]   = useState<Set<string>>(new Set())
  const [search, setSearch]       = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sortKey, setSortKey]     = useState<ColKey | null>(null)
  const [sortDir, setSortDir]     = useState<'asc' | 'desc'>('asc')
  const [page, setPage]           = useState(0)
  const [pageSize, setPageSize]   = useState<25|50|100>(25)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType]     = useState('')
  const [filterRound, setFilterRound]   = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo]     = useState('')

  const filtered = useMemo(() => {
    return MOCK_INTERVIEWS.filter(r => {
      if (search) {
        const q = search.toLowerCase()
        if (!r.candidate.toLowerCase().includes(q) && !r.interview_id.toLowerCase().includes(q) && !r.job.toLowerCase().includes(q)) return false
      }
      if (filterStatus && r.status !== filterStatus) return false
      if (filterType   && r.type   !== filterType)   return false
      if (filterRound  && r.round  !== filterRound)  return false
      if (filterDateFrom && r.date < filterDateFrom) return false
      if (filterDateTo   && r.date > filterDateTo)   return false
      return true
    })
  }, [search, filterStatus, filterType, filterRound, filterDateFrom, filterDateTo])

  const sorted = useMemo(() => sortKey ? [...filtered].sort((a, b) => {
    const get = (r: Interview) => {
      if (sortKey === 'interview_id') return r.interview_id
      if (sortKey === 'candidate')    return r.candidate
      if (sortKey === 'job')          return r.job
      if (sortKey === 'date')         return r.date
      if (sortKey === 'status')       return r.status
      return ''
    }
    const cmp = get(a).localeCompare(get(b))
    return sortDir === 'asc' ? cmp : -cmp
  }) : filtered, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated  = sorted.slice(page * pageSize, (page + 1) * pageSize)

  const allSel  = paginated.length > 0 && paginated.every(r => selected.has(r.id))
  const someSel = paginated.some(r => selected.has(r.id)) && !allSel
  function toggleAll(v: boolean) { setSelected(v ? new Set(paginated.map(r => r.id)) : new Set()) }
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

  const colW = (k: ColKey) => colWidths[k] ?? COL_META[k].width

  function SortChevron({ k }: { k: ColKey }) {
    if (!COL_META[k].sortable) return null
    if (sortKey !== k) return <ChevronsUpDown className="size-3 text-muted-foreground/30 ml-1 shrink-0" />
    return sortDir === 'asc' ? <ChevronUp className="size-3 text-brand ml-1 shrink-0" /> : <ChevronDown className="size-3 text-brand ml-1 shrink-0" />
  }

  function renderHeader(key: ColKey) {
    if (key === 'select') return <Checkbox checked={allSel} data-state={someSel ? 'indeterminate' : undefined} onCheckedChange={toggleAll} />
    if (key === 'actions') return null
    return (
      <button onClick={() => handleSort(key)} className={cn('flex items-center gap-0 w-full text-left', COL_META[key].sortable ? 'cursor-pointer' : 'cursor-default')}>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{COL_META[key].label}</span>
        <SortChevron k={key} />
      </button>
    )
  }

  function renderCell(key: ColKey, r: Interview) {
    switch (key) {
      case 'select':
        return <Checkbox checked={selected.has(r.id)} onCheckedChange={v => toggleRow(r.id, !!v)} onClick={e => e.stopPropagation()} />
      case 'interview_id':
        return (
          <Link href={`/dashboard/interviews/${r.id}`} onClick={e => e.stopPropagation()}
            className="text-xs text-muted-foreground font-medium tabular-nums hover:text-brand transition-colors">
            {r.interview_id}
          </Link>
        )
      case 'candidate':
        return (
          <Link href={`/dashboard/interviews/${r.id}`} onClick={e => e.stopPropagation()}
            className="text-sm font-medium truncate hover:text-brand transition-colors block">
            {r.candidate}
          </Link>
        )
      case 'job':         return <span className="text-sm text-muted-foreground truncate block">{r.job}</span>
      case 'client':      return <span className="text-sm text-muted-foreground truncate">{r.client}</span>
      case 'recruiter':   return <span className="text-sm text-muted-foreground">{r.recruiter}</span>
      case 'type':        return <span className="text-sm text-muted-foreground whitespace-nowrap">{r.type}</span>
      case 'round':       return <span className="text-sm text-muted-foreground">{r.round}</span>
      case 'date':        return <span className="text-xs text-muted-foreground whitespace-nowrap">{r.date}</span>
      case 'time':        return <span className="text-xs text-muted-foreground whitespace-nowrap">{r.time}</span>
      case 'timezone':    return <span className="text-sm text-muted-foreground">{r.timezone}</span>
      case 'interviewer': return <span className="text-sm text-muted-foreground truncate">{r.interviewer}</span>
      case 'status':      return <Chip label={r.status.replace('_', ' ')} className={STATUS_BADGE[r.status] ?? ''} />
      case 'email_status':return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${EMAIL_BADGE[r.email_status] ?? ''}`}>{r.email_status}</span>
      case 'confirmation':return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CONFIRM_BADGE[r.confirmation] ?? ''}`}>{r.confirmation}</span>
      case 'feedback':    return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${r.feedback === 'submitted' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400'}`}>{r.feedback}</span>
      case 'actions':
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
              <button className="size-7 flex items-center justify-center rounded hover:bg-muted transition-colors">
                <MoreHorizontal className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild><Link href={`/dashboard/interviews/${r.id}`}>View</Link></DropdownMenuItem>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem><Mail className="size-3.5 mr-2" />Send Reminder</DropdownMenuItem>
              <DropdownMenuItem><RefreshCw className="size-3.5 mr-2" />Reschedule</DropdownMenuItem>
              <DropdownMenuItem><XCircle className="size-3.5 mr-2" />Cancel</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <Trash2 className="size-3.5 mr-2" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
    }
  }

  return (
    <>
      <div className="flex flex-col h-full p-6 min-h-0 overflow-hidden">
        <div className="mb-4 shrink-0">
          <h1 className="text-xl font-semibold">All Interviews</h1>
          <p className="text-sm text-muted-foreground">{MOCK_INTERVIEWS.length} interviews total</p>
        </div>

        {/* Top bar */}
        <div className="flex items-center justify-between pb-3 shrink-0 gap-3">
          <div className="relative shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
              placeholder="Search candidate, ID, job…" className="h-8 w-56 pl-8 text-sm" />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setDrawerOpen(true)} className="gap-1.5 h-8">
              <SlidersHorizontal className="size-3.5" />Filters
            </Button>
            <ColPicker cols={cols} onChange={setCols} />
            <Button size="sm" className="h-8" onClick={() => setWizardOpen(true)}>
              <CalendarCheck className="size-3.5 mr-1.5" />Schedule Interview
            </Button>
          </div>
        </div>

        {/* Bulk bar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 mb-2.5 bg-brand-muted border border-brand/20 rounded-lg shrink-0">
            <span className="text-sm font-semibold text-brand">{selected.size} selected</span>
            <div className="w-px h-4 bg-brand/20 mx-1" />
            {['Send Reminder','Send Email','Reschedule','Cancel','Export'].map(a => (
              <Button key={a} size="sm" variant="outline" className="h-7 text-sm">{a}</Button>
            ))}
            <button onClick={() => setSelected(new Set())} className="ml-auto size-6 flex items-center justify-center text-muted-foreground hover:text-foreground rounded">
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {/* Table */}
        <div className="flex flex-1 min-h-0 overflow-hidden border border-border rounded-lg">
          <div className="flex-1 overflow-auto">
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
                {paginated.map(r => {
                  const isSel = selected.has(r.id)
                  return (
                    <tr key={r.id} className={`group border-b border-border transition-colors ${isSel ? 'bg-brand-muted/50' : 'hover:bg-muted/40'}`}>
                      {cols.map(key => (
                        <td key={key} style={{ width: colW(key), minWidth: colW(key) }}
                          className="px-3 py-2 align-middle overflow-hidden">
                          {renderCell(key, r)}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v) as 25|50|100); setPage(0) }}>
              <SelectTrigger className="h-7 w-16 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{PAGE_SIZES.map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {sorted.length === 0 ? '0' : `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, sorted.length)} of ${sorted.length}`}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="size-7 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft className="size-3.5" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = totalPages <= 5 ? i : Math.max(0, Math.min(page - 2, totalPages - 5)) + i
                return (
                  <button key={pg} onClick={() => setPage(pg)}
                    className={`size-7 flex items-center justify-center rounded-md text-sm border transition-colors ${pg === page ? 'bg-brand border-brand text-white' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                    {pg + 1}
                  </button>
                )
              })}
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="size-7 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter sheet */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-80 flex flex-col p-0">
          <SheetHeader className="px-5 py-4 border-b">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Date From</Label>
              <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Date To</Label>
              <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={filterStatus || '__all__'} onValueChange={v => setFilterStatus(v === '__all__' ? '' : v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All</SelectItem>
                  {['scheduled','confirmed','completed','cancelled','rescheduled','no_show'].map(s => (
                    <SelectItem key={s} value={s}>{s.replace('_',' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Interview Type</Label>
              <Select value={filterType || '__all__'} onValueChange={v => setFilterType(v === '__all__' ? '' : v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All</SelectItem>
                  {['Phone Screen','Video Interview','Client Interview','Technical Interview','Panel Interview','Final Interview','HR Interview','Manager Interview'].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Round</Label>
              <Select value={filterRound || '__all__'} onValueChange={v => setFilterRound(v === '__all__' ? '' : v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All</SelectItem>
                  {['Round 1','Round 2','Round 3','Final','HR Screen','Technical Screen'].map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter className="px-5 py-4 border-t gap-2 flex-row">
            <Button variant="outline" className="flex-1" onClick={() => { setFilterStatus(''); setFilterType(''); setFilterRound(''); setFilterDateFrom(''); setFilterDateTo('') }}>Clear</Button>
            <Button className="flex-1" onClick={() => setDrawerOpen(false)}>Apply</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ScheduleWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </>
  )
}
