'use client'

import { useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight,
  CalendarCheck, MoreHorizontal, X, Mail, RefreshCw, XCircle, Trash2, UserCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScheduleWizard } from '../schedule-wizard'

type ColKey = 'select' | 'interview_id' | 'candidate' | 'job' | 'client' |
  'type' | 'round' | 'date' | 'time' | 'interviewer' | 'status' | 'feedback' | 'actions'

const COL_META: Record<ColKey, { label: string; width: number; sortable?: boolean }> = {
  select:       { label: '',             width: 48 },
  interview_id: { label: 'Interview ID', width: 110, sortable: true },
  candidate:    { label: 'Candidate',    width: 180, sortable: true },
  job:          { label: 'Job',          width: 160 },
  client:       { label: 'Client',       width: 140 },
  type:         { label: 'Type',         width: 140 },
  round:        { label: 'Round',        width: 90 },
  date:         { label: 'Date',         width: 100, sortable: true },
  time:         { label: 'Time',         width: 90 },
  interviewer:  { label: 'Interviewer',  width: 140 },
  status:       { label: 'Status',       width: 110, sortable: true },
  feedback:     { label: 'Feedback',     width: 100 },
  actions:      { label: '',             width: 48 },
}

const DEFAULT_COLS: ColKey[] = ['select','interview_id','candidate','job','client','type','round','date','time','interviewer','status','feedback','actions']

const MOCK_INTERVIEWS = [
  { id:'1', interview_id:'INT-0001', candidate:'Sarah Johnson', job:'Senior Java Developer', client:'TechCorp Inc', type:'Technical Interview', round:'Round 2', date:'2026-06-28', time:'10:00 AM', interviewer:'Mike Chen', status:'scheduled', feedback:'pending' },
  { id:'2', interview_id:'INT-0002', candidate:'James Martinez', job:'RN – ICU', client:'Metro Health', type:'Client Interview', round:'Round 1', date:'2026-06-28', time:'2:00 PM', interviewer:'Dr. Smith', status:'confirmed', feedback:'pending' },
  { id:'3', interview_id:'INT-0003', candidate:'Emily Chen', job:'DevOps Engineer', client:'CloudBase', type:'Video Interview', round:'Round 1', date:'2026-06-29', time:'11:00 AM', interviewer:'Tom Wilson', status:'scheduled', feedback:'pending' },
  { id:'4', interview_id:'INT-0004', candidate:'Robert Kim', job:'Project Manager', client:'BuildRight', type:'Panel Interview', round:'Final', date:'2026-06-27', time:'9:00 AM', interviewer:'Panel', status:'completed', feedback:'submitted' },
  { id:'5', interview_id:'INT-0005', candidate:'Lisa Thompson', job:'Data Scientist', client:'Analytics Co', type:'Phone Screen', round:'Round 1', date:'2026-06-27', time:'3:30 PM', interviewer:'HR Team', status:'completed', feedback:'pending' },
  { id:'6', interview_id:'INT-0006', candidate:'David Park', job:'Software Architect', client:'FinTech Ltd', type:'Technical Interview', round:'Round 3', date:'2026-06-30', time:'1:00 PM', interviewer:'CTO Office', status:'scheduled', feedback:'pending' },
  { id:'7', interview_id:'INT-0007', candidate:'Maria Garcia', job:'Physical Therapist', client:'RehabCare', type:'HR Interview', round:'Round 1', date:'2026-06-26', time:'10:00 AM', interviewer:'HR Director', status:'cancelled', feedback:'pending' },
  { id:'8', interview_id:'INT-0008', candidate:'Kevin Brown', job:'Network Engineer', client:'NetSec Corp', type:'Technical Interview', round:'Round 2', date:'2026-06-25', time:'2:00 PM', interviewer:'Tech Lead', status:'no_show', feedback:'pending' },
  { id:'9', interview_id:'INT-0009', candidate:'Amy Wilson', job:'UX Designer', client:'Creative Labs', type:'Client Interview', round:'Round 2', date:'2026-07-01', time:'11:30 AM', interviewer:'Design Head', status:'scheduled', feedback:'pending' },
  { id:'10', interview_id:'INT-0010', candidate:'Chris Lee', job:'ML Engineer', client:'AI Startup', type:'Video Interview', round:'Round 1', date:'2026-07-02', time:'4:00 PM', interviewer:'Tech Team', status:'scheduled', feedback:'pending' },
  { id:'11', interview_id:'INT-0011', candidate:'Sandra Davis', job:'LPN – Acute Care', client:'City Hospital', type:'Final Interview', round:'Final', date:'2026-06-27', time:'9:30 AM', interviewer:'Nurse Manager', status:'rescheduled', feedback:'pending' },
  { id:'12', interview_id:'INT-0012', candidate:'Tom Anderson', job:'Sales Manager', client:'RetailCo', type:'Manager Interview', round:'Round 1', date:'2026-07-03', time:'10:00 AM', interviewer:'VP Sales', status:'scheduled', feedback:'pending' },
]

const STATUS_BADGE: Record<string, string> = {
  scheduled:   'bg-blue-50 text-blue-700 border-blue-200',
  confirmed:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed:   'bg-slate-100 text-slate-600 border-slate-200',
  cancelled:   'bg-red-50 text-red-700 border-red-200',
  rescheduled: 'bg-amber-50 text-amber-700 border-amber-200',
  no_show:     'bg-red-50 text-red-700 border-red-200',
}

type Row = typeof MOCK_INTERVIEWS[number]

const PAGE_SIZES = [25, 50, 100] as const

export default function MyInterviewsPage() {
  const [selected, setSelected]   = useState<Set<string>>(new Set())
  const [search, setSearch]       = useState('')
  const [sortKey, setSortKey]     = useState<ColKey | null>(null)
  const [sortDir, setSortDir]     = useState<'asc' | 'desc'>('asc')
  const [page, setPage]           = useState(0)
  const [pageSize, setPageSize]   = useState<25|50|100>(25)
  const [wizardOpen, setWizardOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!search) return MOCK_INTERVIEWS
    const q = search.toLowerCase()
    return MOCK_INTERVIEWS.filter(r => r.candidate.toLowerCase().includes(q) || r.interview_id.toLowerCase().includes(q))
  }, [search])

  const sorted = useMemo(() => sortKey ? [...filtered].sort((a, b) => {
    const get = (r: Row) => {
      if (sortKey === 'interview_id') return r.interview_id
      if (sortKey === 'candidate')    return r.candidate
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
  }

  function SortChevron({ k }: { k: ColKey }) {
    if (!COL_META[k].sortable) return null
    if (sortKey !== k) return <ChevronsUpDown className="size-3 text-muted-foreground/30 ml-1 shrink-0" />
    return sortDir === 'asc' ? <ChevronUp className="size-3 text-brand ml-1 shrink-0" /> : <ChevronDown className="size-3 text-brand ml-1 shrink-0" />
  }

  function renderCell(key: ColKey, r: Row) {
    switch (key) {
      case 'select':        return <Checkbox checked={selected.has(r.id)} onCheckedChange={v => toggleRow(r.id, !!v)} onClick={e => e.stopPropagation()} />
      case 'interview_id':  return <Link href={`/dashboard/interviews/${r.id}`} onClick={e => e.stopPropagation()} className="text-xs text-muted-foreground font-medium tabular-nums hover:text-brand transition-colors">{r.interview_id}</Link>
      case 'candidate':     return <Link href={`/dashboard/interviews/${r.id}`} onClick={e => e.stopPropagation()} className="text-sm font-medium truncate hover:text-brand transition-colors block">{r.candidate}</Link>
      case 'job':           return <span className="text-sm text-muted-foreground truncate block">{r.job}</span>
      case 'client':        return <span className="text-sm text-muted-foreground truncate">{r.client}</span>
      case 'type':          return <span className="text-sm text-muted-foreground whitespace-nowrap">{r.type}</span>
      case 'round':         return <span className="text-sm text-muted-foreground">{r.round}</span>
      case 'date':          return <span className="text-xs text-muted-foreground whitespace-nowrap">{r.date}</span>
      case 'time':          return <span className="text-xs text-muted-foreground whitespace-nowrap">{r.time}</span>
      case 'interviewer':   return <span className="text-sm text-muted-foreground truncate">{r.interviewer}</span>
      case 'status':        return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${STATUS_BADGE[r.status] ?? ''}`}>{r.status.replace('_',' ')}</span>
      case 'feedback':      return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${r.feedback === 'submitted' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{r.feedback}</span>
      case 'actions':       return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
            <button className="size-7 flex items-center justify-center rounded hover:bg-muted transition-colors">
              <MoreHorizontal className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem asChild><Link href={`/dashboard/interviews/${r.id}`}>View</Link></DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem><Mail className="size-3.5 mr-2" />Send Reminder</DropdownMenuItem>
            <DropdownMenuItem><RefreshCw className="size-3.5 mr-2" />Reschedule</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive"><Trash2 className="size-3.5 mr-2" />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }

  return (
    <>
      <div className="flex flex-col h-full p-6 min-h-0 overflow-hidden">
        <div className="mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <UserCheck className="size-5 text-brand" />
            <h1 className="text-xl font-semibold">My Interviews</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Showing interviews assigned to you (Arun Kumar)</p>
        </div>

        <div className="flex items-center justify-between pb-3 shrink-0 gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
              placeholder="Search candidate, ID…" className="h-8 w-52 pl-8 text-sm" />
          </div>
          <Button size="sm" className="h-8" onClick={() => setWizardOpen(true)}>
            <CalendarCheck className="size-3.5 mr-1.5" />Schedule Interview
          </Button>
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 mb-2.5 bg-brand-muted border border-brand/20 rounded-lg shrink-0">
            <span className="text-sm font-semibold text-brand">{selected.size} selected</span>
            <div className="w-px h-4 bg-brand/20 mx-1" />
            {['Send Reminder','Reschedule','Cancel'].map(a => (
              <Button key={a} size="sm" variant="outline" className="h-7 text-sm">{a}</Button>
            ))}
            <button onClick={() => setSelected(new Set())} className="ml-auto size-6 flex items-center justify-center text-muted-foreground hover:text-foreground rounded">
              <X className="size-3.5" />
            </button>
          </div>
        )}

        <div className="flex flex-1 min-h-0 overflow-hidden border border-border rounded-lg">
          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                <tr className="border-b border-border">
                  {DEFAULT_COLS.map(key => (
                    <th key={key} style={{ width: COL_META[key].width, minWidth: COL_META[key].width }}
                      className="h-9 px-3 text-left align-middle select-none">
                      {key === 'select' ? (
                        <Checkbox checked={allSel} data-state={someSel ? 'indeterminate' : undefined} onCheckedChange={toggleAll} />
                      ) : key === 'actions' ? null : (
                        <button onClick={() => handleSort(key)} className={cn('flex items-center gap-0 w-full text-left', COL_META[key].sortable ? 'cursor-pointer' : 'cursor-default')}>
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{COL_META[key].label}</span>
                          <SortChevron k={key} />
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map(r => (
                  <tr key={r.id} className={`border-b border-border transition-colors ${selected.has(r.id) ? 'bg-brand-muted/50' : 'hover:bg-muted/40'}`}>
                    {DEFAULT_COLS.map(key => (
                      <td key={key} style={{ width: COL_META[key].width, minWidth: COL_META[key].width }} className="px-3 py-2 align-middle overflow-hidden">
                        {renderCell(key, r)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v) as 25|50|100); setPage(0) }}>
              <SelectTrigger className="h-7 w-16 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{PAGE_SIZES.map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{sorted.length === 0 ? '0' : `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, sorted.length)} of ${sorted.length}`}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="size-7 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft className="size-3.5" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="size-7 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ScheduleWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </>
  )
}
