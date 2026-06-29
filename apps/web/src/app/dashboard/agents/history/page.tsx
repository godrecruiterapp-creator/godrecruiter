'use client'

import { useState, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, SlidersHorizontal, Download, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, X, MoreHorizontal, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

type Run = {
  id: string; date: string; agent: string; status: string; duration: string; records: number; actions_performed: number; errors: number
}

const RUNS: Run[] = [
  { id: '1',  date: 'Jun 26, 9:02 AM',  agent: 'Java Developer Sourcer',   status: 'completed', duration: '4m 12s', records: 14, actions_performed: 42, errors: 0 },
  { id: '2',  date: 'Jun 26, 8:15 AM',  agent: 'Interview Reminder',        status: 'completed', duration: '0m 48s', records: 3,  actions_performed: 9,  errors: 0 },
  { id: '3',  date: 'Jun 26, 7:30 AM',  agent: 'Missing Documents Alert',   status: 'failed',    duration: '1m 05s', records: 0,  actions_performed: 2,  errors: 1 },
  { id: '4',  date: 'Jun 25, 6:00 PM',  agent: 'Pipeline Analytics',        status: 'completed', duration: '2m 33s', records: 28, actions_performed: 14, errors: 0 },
  { id: '5',  date: 'Jun 25, 12:00 PM', agent: 'Candidate Follow-up',       status: 'completed', duration: '1m 52s', records: 7,  actions_performed: 21, errors: 0 },
  { id: '6',  date: 'Jun 25, 9:00 AM',  agent: 'Resume Watcher',            status: 'completed', duration: '0m 22s', records: 2,  actions_performed: 4,  errors: 0 },
  { id: '7',  date: 'Jun 24, 4:00 PM',  agent: 'License Expiry Monitor',    status: 'completed', duration: '3m 10s', records: 5,  actions_performed: 15, errors: 0 },
  { id: '8',  date: 'Jun 24, 10:00 AM', agent: 'Java Developer Sourcer',    status: 'running',   duration: '—',      records: 0,  actions_performed: 0,  errors: 0 },
  { id: '9',  date: 'Jun 24, 9:00 AM',  agent: 'Job Health Monitor',        status: 'failed',    duration: '0m 15s', records: 0,  actions_performed: 1,  errors: 2 },
  { id: '10', date: 'Jun 23, 6:00 PM',  agent: 'Pipeline Analytics',        status: 'completed', duration: '2m 18s', records: 31, actions_performed: 12, errors: 0 },
]

const STATUS_BADGE: Record<string, string> = {
  completed: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  running:   'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  failed:    'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
}

type ColKey = 'select' | 'date' | 'agent' | 'status' | 'duration' | 'records' | 'actions_performed' | 'errors' | 'actions'

const COL_META: Record<ColKey, { label: string; width: number; sortable?: boolean }> = {
  select:            { label: '',              width: 48 },
  date:              { label: 'Date',          width: 160, sortable: true },
  agent:             { label: 'Agent',         width: 200, sortable: true },
  status:            { label: 'Status',        width: 110 },
  duration:          { label: 'Duration',      width: 100 },
  records:           { label: 'Records',       width: 90,  sortable: true },
  actions_performed: { label: 'Actions',       width: 90 },
  errors:            { label: 'Errors',        width: 80 },
  actions:           { label: '',              width: 50 },
}

const DEFAULT_COLS: ColKey[] = ['select', 'date', 'agent', 'status', 'duration', 'records', 'actions_performed', 'errors', 'actions']

export default function HistoryPage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sortKey, setSortKey] = useState<ColKey | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)
  const [colWidths, setColWidths] = useState<Partial<Record<ColKey, number>>>({})

  const filtered = useMemo(() => {
    if (!search) return RUNS
    const q = search.toLowerCase()
    return RUNS.filter(r => r.agent.toLowerCase().includes(q) || r.status.toLowerCase().includes(q))
  }, [search])

  const sorted = useMemo(() => sortKey ? [...filtered].sort((a, b) => {
    let cmp = 0
    if (sortKey === 'date') cmp = a.date.localeCompare(b.date)
    else if (sortKey === 'agent') cmp = a.agent.localeCompare(b.agent)
    else if (sortKey === 'records') cmp = a.records - b.records
    return sortDir === 'asc' ? cmp : -cmp
  }) : filtered, [filtered, sortKey, sortDir])

  const PAGE_SIZE = 25
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const allSel = paginated.length > 0 && paginated.every(r => selected.has(r.id))
  const someSel = paginated.some(r => selected.has(r.id)) && !allSel
  function toggleAll(v: boolean) { setSelected(v ? new Set(paginated.map(r => r.id)) : new Set()) }
  function toggleRow(id: string, v: boolean) { const n = new Set(selected); v ? n.add(id) : n.delete(id); setSelected(n) }
  function handleSort(key: ColKey) {
    if (!COL_META[key].sortable) return
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
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
      <button onClick={() => handleSort(key)} className={cn('flex items-center w-full text-left', COL_META[key].sortable ? 'cursor-pointer' : 'cursor-default')}>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{COL_META[key].label}</span>
        <SortChevron k={key} />
      </button>
    )
  }

  function renderCell(key: ColKey, r: Run) {
    switch (key) {
      case 'select': return <Checkbox checked={selected.has(r.id)} onCheckedChange={v => toggleRow(r.id, !!v)} onClick={e => e.stopPropagation()} />
      case 'date': return <span className="text-xs text-muted-foreground whitespace-nowrap">{r.date}</span>
      case 'agent': return <span className="text-sm font-medium">{r.agent}</span>
      case 'status': return (
        <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize', STATUS_BADGE[r.status] ?? '')}>{r.status}</span>
      )
      case 'duration': return <span className="text-xs text-muted-foreground tabular-nums">{r.duration}</span>
      case 'records': return <span className="text-xs text-muted-foreground tabular-nums">{r.records}</span>
      case 'actions_performed': return <span className="text-xs text-muted-foreground tabular-nums">{r.actions_performed}</span>
      case 'errors': return (
        <span className={cn('text-xs tabular-nums font-medium', r.errors > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground')}>{r.errors}</span>
      )
      case 'actions': return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="size-7 flex items-center justify-center rounded-md hover:bg-muted/60 transition-colors" onClick={e => e.stopPropagation()}>
              <MoreHorizontal className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem><FileText className="size-3.5 mr-2" />View Logs</DropdownMenuItem>
            <DropdownMenuItem><Download className="size-3.5 mr-2" />Download</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }

  return (
    <div className="flex flex-col h-full p-6 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between pb-3 shrink-0 gap-3">
        <div className="relative shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
            placeholder="Search history…" className="h-8 w-52 pl-8 pr-7 text-xs" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs"><SlidersHorizontal className="size-3.5" />Filters</Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs"><Download className="size-3.5" />Download Logs</Button>
        </div>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 mb-2.5 bg-brand-muted border border-brand/20 rounded-lg shrink-0">
          <span className="text-xs font-semibold text-brand">{selected.size} selected</span>
          <div className="w-px h-4 bg-brand/20 mx-1" />
          <Button size="sm" variant="outline" className="h-7 text-xs"><Download className="size-3 mr-1" />Download Selected</Button>
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
                {DEFAULT_COLS.map(key => (
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
              {paginated.map(run => (
                <tr key={run.id} className={cn('group border-b border-border transition-colors', selected.has(run.id) ? 'bg-brand-muted/50' : 'hover:bg-muted/40')}>
                  {DEFAULT_COLS.map(key => (
                    <td key={key} style={{ width: colW(key), minWidth: colW(key) }} className="px-3 py-2 align-middle overflow-hidden">
                      {renderCell(key, run)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end pt-3 shrink-0 gap-2">
        <span className="text-xs text-muted-foreground">
          {sorted.length === 0 ? '0' : `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, sorted.length)} of ${sorted.length}`}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="size-7 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed">
            <ChevronLeft className="size-3.5" />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
            <button key={i} onClick={() => setPage(i)}
              className={cn('size-7 flex items-center justify-center rounded-md text-xs border transition-colors',
                i === page ? 'bg-brand border-brand text-white' : 'border-border text-muted-foreground hover:bg-muted')}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            className="size-7 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed">
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
