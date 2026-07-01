'use client'

import { useState, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, Plus, SlidersHorizontal, Settings2, GripVertical, Check, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, X, MoreHorizontal, Play, Pause, Pencil, Copy, FileText, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CreateAgentWizard } from '../create-agent-wizard'

type Agent = {
  id: string; name: string; category: string; status: string; trigger: string
  last_run: string; next_run: string; success_rate: number; owner: string
}

const AGENTS: Agent[] = [
  { id: '1', name: 'Java Developer Sourcer',  category: 'Recruiting',    status: 'running',   trigger: 'Daily',  last_run: '2 hours ago',  next_run: 'Tomorrow 9 AM', success_rate: 94,  owner: 'Arun Kumar' },
  { id: '2', name: 'License Expiry Monitor',  category: 'Compliance',    status: 'scheduled', trigger: 'Weekly', last_run: '3 days ago',   next_run: 'Mon 8 AM',      success_rate: 100, owner: 'Arun Kumar' },
  { id: '3', name: 'Candidate Follow-up',     category: 'Communication', status: 'running',   trigger: 'Event',  last_run: '30 min ago',   next_run: 'On trigger',    success_rate: 88,  owner: 'Arun Kumar' },
  { id: '4', name: 'Job Health Monitor',      category: 'Job',           status: 'paused',    trigger: 'Daily',  last_run: '1 day ago',    next_run: 'Paused',        success_rate: 76,  owner: 'Arun Kumar' },
  { id: '5', name: 'Resume Watcher',          category: 'Recruiting',    status: 'scheduled', trigger: 'Hourly', last_run: '1 hour ago',   next_run: 'In 1 hour',     success_rate: 91,  owner: 'Arun Kumar' },
  { id: '6', name: 'Interview Reminder',      category: 'Communication', status: 'completed', trigger: 'Event',  last_run: 'Today 8 AM',   next_run: 'On trigger',    success_rate: 100, owner: 'Arun Kumar' },
  { id: '7', name: 'Pipeline Analytics',      category: 'Analytics',     status: 'running',   trigger: 'Daily',  last_run: '4 hours ago',  next_run: 'Tomorrow 6 AM', success_rate: 97,  owner: 'Arun Kumar' },
  { id: '8', name: 'Missing Documents Alert', category: 'Compliance',    status: 'failed',    trigger: 'Daily',  last_run: '1 hour ago',   next_run: 'Retry in 2h',   success_rate: 60,  owner: 'Arun Kumar' },
]

const STATUS_BADGE: Record<string, string> = {
  running:   'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  scheduled: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  paused:    'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  completed: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  failed:    'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
}

function rateColor(r: number) {
  return r >= 90 ? 'text-emerald-600 dark:text-emerald-400' : r >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
}

type ColKey = 'select' | 'name' | 'category' | 'status' | 'trigger' | 'last_run' | 'next_run' | 'success_rate' | 'owner' | 'actions'

const COL_META: Record<ColKey, { label: string; width: number; sortable?: boolean }> = {
  select:       { label: '',            width: 48 },
  name:         { label: 'Agent Name',  width: 220, sortable: true },
  category:     { label: 'Category',    width: 130, sortable: true },
  status:       { label: 'Status',      width: 110 },
  trigger:      { label: 'Trigger',     width: 110 },
  last_run:     { label: 'Last Run',    width: 130 },
  next_run:     { label: 'Next Run',    width: 140 },
  success_rate: { label: 'Success %',   width: 95, sortable: true },
  owner:        { label: 'Owner',       width: 120, sortable: true },
  actions:      { label: '',            width: 50 },
}

const DEFAULT_COLS: ColKey[] = ['select', 'name', 'category', 'status', 'trigger', 'last_run', 'next_run', 'success_rate', 'owner', 'actions']

const PAGE_SIZES = [25, 50, 100] as const

function ColPicker({ cols, onChange }: { cols: ColKey[]; onChange: (c: ColKey[]) => void }) {
  const drag = useRef<ColKey | null>(null)
  const fixed: ColKey[] = ['select', 'actions']
  const hidden = DEFAULT_COLS.filter(k => !cols.includes(k) && !fixed.includes(k))

  function toggle(key: ColKey) {
    if (fixed.includes(key)) return
    if (cols.includes(key)) { onChange(cols.filter(k => k !== key)); return }
    onChange([...cols.filter(k => k !== 'actions'), key, 'actions'])
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
      <PopoverContent align="end" className="w-56 p-0">
        <div className="px-4 py-2.5 border-b flex items-center justify-between">
          <span className="text-sm font-semibold">Columns</span>
          <button onClick={() => onChange(DEFAULT_COLS)} className="text-sm text-brand hover:underline">Reset</button>
        </div>
        <div className="px-2 py-2 max-h-64 overflow-y-auto">
          {cols.filter(k => !fixed.includes(k)).map(key => (
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
          <div className="px-2 py-2 border-t max-h-40 overflow-y-auto">
            {hidden.map(key => (
              <button key={key} onClick={() => toggle(key)} className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-muted/60 text-left">
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

export default function MyAgentsPage() {
  const [cols, setCols] = useState<ColKey[]>(DEFAULT_COLS)
  const [colWidths, setColWidths] = useState<Partial<Record<ColKey, number>>>({})
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<ColKey | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState<25 | 50 | 100>(25)
  const [wizardOpen, setWizardOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!search) return AGENTS
    const q = search.toLowerCase()
    return AGENTS.filter(a => a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q))
  }, [search])

  const sorted = useMemo(() => sortKey ? [...filtered].sort((a, b) => {
    const get = (ag: Agent): string => {
      if (sortKey === 'name') return ag.name
      if (sortKey === 'category') return ag.category
      if (sortKey === 'owner') return ag.owner
      if (sortKey === 'success_rate') return String(ag.success_rate)
      return ''
    }
    const cmp = get(a).localeCompare(get(b), undefined, { numeric: true })
    return sortDir === 'asc' ? cmp : -cmp
  }) : filtered, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated = sorted.slice(page * pageSize, (page + 1) * pageSize)
  const allSel = paginated.length > 0 && paginated.every(a => selected.has(a.id))
  const someSel = paginated.some(a => selected.has(a.id)) && !allSel
  function toggleAll(v: boolean) { setSelected(v ? new Set(paginated.map(a => a.id)) : new Set()) }
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
      <button onClick={() => handleSort(key)} className={cn('flex items-center w-full text-left', COL_META[key].sortable ? 'cursor-pointer' : 'cursor-default')}>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{COL_META[key].label}</span>
        <SortChevron k={key} />
      </button>
    )
  }

  function renderCell(key: ColKey, a: Agent) {
    switch (key) {
      case 'select': return <Checkbox checked={selected.has(a.id)} onCheckedChange={v => toggleRow(a.id, !!v)} onClick={e => e.stopPropagation()} />
      case 'name': return <span className="text-sm font-medium">{a.name}</span>
      case 'category': return (
        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-muted/60 text-foreground border-border">{a.category}</span>
      )
      case 'status': return (
        <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize', STATUS_BADGE[a.status] ?? '')}>{a.status}</span>
      )
      case 'trigger': return <span className="text-sm text-muted-foreground">{a.trigger}</span>
      case 'last_run': return <span className="text-xs text-muted-foreground">{a.last_run}</span>
      case 'next_run': return <span className="text-sm text-muted-foreground">{a.next_run}</span>
      case 'success_rate': return <span className={cn('text-sm font-semibold tabular-nums', rateColor(a.success_rate))}>{a.success_rate}%</span>
      case 'owner': return <span className="text-sm text-muted-foreground">{a.owner}</span>
      case 'actions': return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="size-7 flex items-center justify-center rounded-md hover:bg-muted/60 transition-colors" onClick={e => e.stopPropagation()}>
              <MoreHorizontal className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem><Play className="size-3.5 mr-2" />Run Now</DropdownMenuItem>
            {a.status === 'paused'
              ? <DropdownMenuItem><Play className="size-3.5 mr-2" />Resume</DropdownMenuItem>
              : <DropdownMenuItem><Pause className="size-3.5 mr-2" />Pause</DropdownMenuItem>
            }
            <DropdownMenuItem><Pencil className="size-3.5 mr-2" />Edit</DropdownMenuItem>
            <DropdownMenuItem><Copy className="size-3.5 mr-2" />Duplicate</DropdownMenuItem>
            <DropdownMenuItem><FileText className="size-3.5 mr-2" />View Logs</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive"><Trash2 className="size-3.5 mr-2" />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }

  return (
    <>
      <div className="flex flex-col h-full p-6 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-3 shrink-0 gap-3">
          <div className="relative shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
              placeholder="Search agents…" className="h-8 w-52 pl-8 pr-7 text-sm" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-sm"><SlidersHorizontal className="size-3.5" />Filters</Button>
            <ColPicker cols={cols} onChange={setCols} />
            <Button size="sm" className="h-8" onClick={() => setWizardOpen(true)}><Plus className="size-3.5 mr-1.5" />Create Agent</Button>
          </div>
        </div>

        {/* Bulk bar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 mb-2.5 bg-brand-muted border border-brand/20 rounded-lg shrink-0">
            <span className="text-sm font-semibold text-brand">{selected.size} selected</span>
            <div className="w-px h-4 bg-brand/20 mx-1" />
            <Button size="sm" variant="outline" className="h-7 text-sm"><Play className="size-3 mr-1" />Run All</Button>
            <Button size="sm" variant="outline" className="h-7 text-sm"><Pause className="size-3 mr-1" />Pause All</Button>
            <Button size="sm" variant="outline" className="h-7 text-sm text-destructive hover:text-destructive"><Trash2 className="size-3 mr-1" />Delete</Button>
            <button onClick={() => setSelected(new Set())} className="ml-auto size-6 flex items-center justify-center text-muted-foreground hover:text-foreground rounded transition-colors">
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
                {paginated.map(agent => {
                  const isSel = selected.has(agent.id)
                  return (
                    <tr key={agent.id} className={cn('group border-b border-border transition-colors', isSel ? 'bg-brand-muted/50' : 'hover:bg-muted/40')}>
                      {cols.map(key => (
                        <td key={key} style={{ width: colW(key), minWidth: colW(key) }} className="px-3 py-2 align-middle overflow-hidden">
                          {renderCell(key, agent)}
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
            <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v) as 25 | 50 | 100); setPage(0) }}>
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
                    className={cn('size-7 flex items-center justify-center rounded-md text-sm border transition-colors',
                      pg === page ? 'bg-brand border-brand text-white' : 'border-border text-muted-foreground hover:bg-muted')}>
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

      <CreateAgentWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </>
  )
}
