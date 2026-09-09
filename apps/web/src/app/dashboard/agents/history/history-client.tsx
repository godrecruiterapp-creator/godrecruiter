'use client'

import { useState, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Search, SlidersHorizontal, Download, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, X, MoreHorizontal, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AgentRun } from '../actions'

type Run = {
  id: string; date: string; agent: string; status: string; duration: string; records: number; errors: number; run: AgentRun
}

function durationOf(r: AgentRun): string {
  if (!r.finished_at) return '—'
  const s = Math.max(0, Math.round((new Date(r.finished_at).getTime() - new Date(r.started_at).getTime()) / 1000))
  return `${s}s`
}

function toRow(r: AgentRun): Run {
  return {
    id: r.id,
    date: new Date(r.started_at).toLocaleString(),
    agent: r.agent_name ?? 'Agent',
    status: r.status === 'success' ? 'completed' : r.status,
    duration: durationOf(r),
    records: r.output?.items.length ?? 0,
    errors: r.status === 'failed' ? 1 : 0,
    run: r,
  }
}

const STATUS_BADGE: Record<string, string> = {
  completed: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  running:   'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  failed:    'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
}

type ColKey = 'select' | 'date' | 'agent' | 'status' | 'duration' | 'records' | 'errors' | 'actions'

const COL_META: Record<ColKey, { label: string; width: number; sortable?: boolean }> = {
  select:   { label: '',         width: 48 },
  date:     { label: 'Date',     width: 190, sortable: true },
  agent:    { label: 'Agent',    width: 200, sortable: true },
  status:   { label: 'Status',   width: 110 },
  duration: { label: 'Duration', width: 100 },
  records:  { label: 'Results',  width: 90,  sortable: true },
  errors:   { label: 'Errors',   width: 80 },
  actions:  { label: '',         width: 50 },
}

const DEFAULT_COLS: ColKey[] = ['select', 'date', 'agent', 'status', 'duration', 'records', 'errors', 'actions']

export function HistoryClient({ runs }: { runs: AgentRun[] }) {
  const ROWS = useMemo(() => runs.map(toRow), [runs])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sortKey, setSortKey] = useState<ColKey | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)
  const [colWidths, setColWidths] = useState<Partial<Record<ColKey, number>>>({})
  const [logs, setLogs] = useState<AgentRun | null>(null)

  const filtered = useMemo(() => {
    if (!search) return ROWS
    const q = search.toLowerCase()
    return ROWS.filter(r => r.agent.toLowerCase().includes(q) || r.status.toLowerCase().includes(q))
  }, [ROWS, search])

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
        <span className="table-header-cell whitespace-nowrap">{COL_META[key].label}</span>
        <SortChevron k={key} />
      </button>
    )
  }

  function renderCell(key: ColKey, r: Run) {
    switch (key) {
      case 'select': return <Checkbox checked={selected.has(r.id)} onCheckedChange={v => toggleRow(r.id, !!v)} onClick={e => e.stopPropagation()} />
      case 'date': return <span className="table-cell-secondary whitespace-nowrap">{r.date}</span>
      case 'agent': return <span className="table-cell-primary">{r.agent}</span>
      case 'status': return (
        <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize', STATUS_BADGE[r.status] ?? '')}>{r.status}</span>
      )
      case 'duration': return <span className="table-cell-secondary tabular-nums">{r.duration}</span>
      case 'records': return <span className="table-cell-secondary tabular-nums">{r.records}</span>
      case 'errors': return (
        <span className={cn('table-cell-secondary tabular-nums', r.errors > 0 ? 'text-red-600 dark:text-red-400' : '')}>{r.errors}</span>
      )
      case 'actions': return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="size-7 flex items-center justify-center rounded-md hover:bg-muted/60 transition-colors" onClick={e => e.stopPropagation()}>
              <MoreHorizontal className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onSelect={() => setLogs(r.run)}><FileText className="size-3.5 mr-2" />View Logs</DropdownMenuItem>
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
            placeholder="Search history…" className="h-8 w-52 pl-8 pr-7 text-sm" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-sm"><SlidersHorizontal className="size-3.5" />Filters</Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex flex-1 min-h-0 overflow-hidden border border-border rounded-lg">
        <div className="flex-1 overflow-auto">
          {ROWS.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 py-20">
              <FileText className="size-6 text-muted-foreground/30" />
              <p className="text-sm font-semibold">No execution history yet</p>
              <p className="text-sm text-muted-foreground">Run an agent from My Agents and its runs will appear here.</p>
            </div>
          ) : (
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
                <tr key={run.id} className={cn('group border-b border-border transition-colors cursor-pointer', selected.has(run.id) ? 'bg-brand-muted/50' : 'hover:bg-muted/40')}
                  onClick={() => setLogs(run.run)}>
                  {DEFAULT_COLS.map(key => (
                    <td key={key} style={{ width: colW(key), minWidth: colW(key) }} className="px-3 py-2 align-middle overflow-hidden">
                      {renderCell(key, run)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {ROWS.length > 0 && (
      <div className="flex items-center justify-end pt-3 shrink-0 gap-2">
        <span className="text-sm text-muted-foreground">
          {sorted.length === 0 ? '0' : `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, sorted.length)} of ${sorted.length}`}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="size-7 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed">
            <ChevronLeft className="size-3.5" />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
            <button key={i} onClick={() => setPage(i)}
              className={cn('size-7 flex items-center justify-center rounded-md text-sm border transition-colors',
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
      )}

      {/* Logs dialog */}
      <Dialog open={!!logs} onOpenChange={v => { if (!v) setLogs(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {logs?.status === 'failed'
                ? <AlertCircle className="size-4 text-red-600" />
                : <CheckCircle2 className="size-4 text-emerald-600" />}
              {logs?.agent_name ?? 'Agent'} — {logs && new Date(logs.started_at).toLocaleString()}
            </DialogTitle>
            <DialogDescription>{logs?.output?.summary ?? logs?.error ?? 'No output recorded.'}</DialogDescription>
          </DialogHeader>
          {logs?.output?.items && logs.output.items.length > 0 && (
            <div className="max-h-80 overflow-y-auto -mx-1 px-1 space-y-2">
              {logs.output.items.map((it, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <p className="text-sm font-semibold">{it.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{it.detail}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
