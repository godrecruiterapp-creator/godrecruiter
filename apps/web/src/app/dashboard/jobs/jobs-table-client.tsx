'use client'

import { useState, useMemo, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub,
  DropdownMenuSubTrigger, DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet'
import {
  Plus, Briefcase, ChevronDown, X, SlidersHorizontal, Trash2,
} from 'lucide-react'
import { bulkUpdateJobsAction, bulkDeleteJobsAction } from './actions'

// ── types ────────────────────────────────────────────────────
export type Job = {
  id: string
  display_id: string | null
  title: string
  client: string | null
  city: string | null
  state: string | null
  employment_type: string | null
  work_mode: string | null
  client_type: string | null
  status: string
  priority: string
  recruiter_name: string | null
  openings: number
  created_at: string
  updated_at: string
}

type Filters = {
  status: string
  client: string
  recruiter: string
  empType: string
  priority: string
  clientType: string
  workMode: string
  agingMin: string
  dateFrom: string
  dateTo: string
}

const EMPTY_FILTERS: Filters = {
  status: '', client: '', recruiter: '', empType: '',
  priority: '', clientType: '', workMode: '', agingMin: '',
  dateFrom: '', dateTo: '',
}

// ── badge configs ────────────────────────────────────────────
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

// ── filter select (inside drawer) ────────────────────────────
const selClass = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"

function DrawerSelect({
  id, label, value, onChange, options, placeholder = '— All —',
}: {
  id: string; label: string; value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium">{label}</Label>
      <select id={id} value={value} onChange={e => onChange(e.target.value)} className={selClass}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ── main component ────────────────────────────────────────────
export function JobsTableClient({ jobs }: { jobs: Job[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // drawer open state
  const [drawerOpen, setDrawerOpen] = useState(false)

  // draft filters (inside drawer, not yet applied)
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS)

  // applied filters (used to filter the table)
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS)

  // selection
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function setDraftField<K extends keyof Filters>(key: K, value: string) {
    setDraft(prev => ({ ...prev, [key]: value }))
  }

  function openDrawer() {
    setDraft(applied) // seed draft with currently applied values
    setDrawerOpen(true)
  }

  function applyFilters() {
    setApplied(draft)
    setDrawerOpen(false)
  }

  function clearDraft() {
    setDraft(EMPTY_FILTERS)
  }

  function clearApplied() {
    setApplied(EMPTY_FILTERS)
    setDraft(EMPTY_FILTERS)
  }

  // unique values for dynamic options
  const clients    = useMemo(() => [...new Set(jobs.map(j => j.client).filter(Boolean))].sort() as string[], [jobs])
  const recruiters = useMemo(() => [...new Set(jobs.map(j => j.recruiter_name).filter(Boolean))].sort() as string[], [jobs])
  const cities     = useMemo(() => [...new Set(jobs.map(j => j.city).filter(Boolean))].sort() as string[], [jobs])

  // filtered jobs (using applied filters)
  const filtered = useMemo(() => {
    const f = applied
    return jobs.filter(j => {
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

  const activeCount = Object.values(applied).filter(Boolean).length

  // selection
  const allIds = filtered.map(j => j.id)
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id))
  const someSelected = allIds.some(id => selected.has(id))

  function toggleAll() {
    if (allSelected) {
      setSelected(prev => { const s = new Set(prev); allIds.forEach(id => s.delete(id)); return s })
    } else {
      setSelected(prev => new Set([...prev, ...allIds]))
    }
  }
  function toggleOne(id: string) {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  // bulk actions
  async function handleBulkStatus(status: string) {
    startTransition(async () => {
      await bulkUpdateJobsAction([...selected], { status })
      setSelected(new Set()); router.refresh()
    })
  }
  async function handleBulkPriority(priority: string) {
    startTransition(async () => {
      await bulkUpdateJobsAction([...selected], { priority })
      setSelected(new Set()); router.refresh()
    })
  }
  async function handleBulkDelete() {
    if (!confirm(`Delete ${selected.size} job(s)? This cannot be undone.`)) return
    startTransition(async () => {
      await bulkDeleteJobsAction([...selected])
      setSelected(new Set()); router.refresh()
    })
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="size-10 rounded-full bg-muted flex items-center justify-center">
            <Briefcase className="size-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-sm">No jobs yet</p>
            <p className="text-sm text-muted-foreground mt-1">Post your first job to start receiving applications.</p>
          </div>
          <Button asChild size="sm" className="mt-1">
            <Link href="/dashboard/jobs/new">Post a job</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* ── toolbar ── */}
      <div className="flex items-center gap-3">
        {/* Filter button */}
        <Button variant="outline" size="sm" onClick={openDrawer} className="gap-1.5">
          <SlidersHorizontal className="size-3.5" />
          Filters
          {activeCount > 0 && (
            <span className="flex items-center justify-center size-4 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
              {activeCount}
            </span>
          )}
        </Button>

        {/* Active filter chips */}
        {activeCount > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
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
            <button onClick={clearApplied} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 ml-1">
              Clear all
            </button>
          </div>
        )}

        <span className="ml-auto text-xs text-muted-foreground shrink-0">
          {filtered.length} of {jobs.length} jobs
        </span>
      </div>

      {/* ── selection action bar ── */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-primary/5 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="h-4 w-px bg-border" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="default" disabled={isPending}>
                Manage <ChevronDown className="size-3.5 ml-1.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Change status</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {(['open','on_hold','closed','filled'] as const).map(s => (
                    <DropdownMenuItem key={s} onClick={() => handleBulkStatus(s)}>
                      {STATUS_BADGE[s]?.label ?? s}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Change priority</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {(['high','medium','low'] as const).map(p => (
                    <DropdownMenuItem key={p} onClick={() => handleBulkPriority(p)}>
                      {PRIORITY_BADGE[p]?.label ?? p}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleBulkDelete}>
                <Trash2 className="size-3.5 mr-2" /> Delete jobs
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* ── table ── */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-10 px-3">
                  <Checkbox
                    checked={allSelected}
                    data-state={someSelected && !allSelected ? 'indeterminate' : undefined}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-[105px] text-xs font-medium">Job ID</TableHead>
                <TableHead className="min-w-[180px] text-xs font-medium">Job Title</TableHead>
                <TableHead className="min-w-[130px] text-xs font-medium">Client</TableHead>
                <TableHead className="min-w-[100px] text-xs font-medium">City</TableHead>
                <TableHead className="min-w-[100px] text-xs font-medium">State</TableHead>
                <TableHead className="min-w-[110px] text-xs font-medium">Emp. Type</TableHead>
                <TableHead className="min-w-[90px] text-xs font-medium">Status</TableHead>
                <TableHead className="min-w-[90px] text-xs font-medium">Priority</TableHead>
                <TableHead className="min-w-[130px] text-xs font-medium">Recruiter</TableHead>
                <TableHead className="text-center w-[75px] text-xs font-medium">Openings</TableHead>
                <TableHead className="text-center w-[80px] text-xs font-medium">Submitted</TableHead>
                <TableHead className="text-center w-[80px] text-xs font-medium">Interviews</TableHead>
                <TableHead className="text-center w-[70px] text-xs font-medium">Offers</TableHead>
                <TableHead className="min-w-[95px] text-xs font-medium">Created</TableHead>
                <TableHead className="min-w-[95px] text-xs font-medium">Modified</TableHead>
                <TableHead className="text-center w-[65px] text-xs font-medium">Aging</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={17} className="text-center py-10 text-sm text-muted-foreground">
                    No jobs match the current filters.{' '}
                    <button onClick={clearApplied} className="underline underline-offset-2">Clear filters</button>
                  </TableCell>
                </TableRow>
              ) : filtered.map((job) => {
                const st  = STATUS_BADGE[job.status]    ?? STATUS_BADGE['open']!
                const pri = PRIORITY_BADGE[job.priority] ?? PRIORITY_BADGE['medium']!
                const emp = EMP_LABELS[job.employment_type ?? ''] ?? '—'
                const days = aging(job.created_at)
                const isSel = selected.has(job.id)

                return (
                  <TableRow key={job.id} className={`cursor-pointer transition-colors ${isSel ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/30'}`}>
                    <TableCell className="w-10 px-3" onClick={e => e.stopPropagation()}>
                      <Checkbox checked={isSel} onCheckedChange={() => toggleOne(job.id)} aria-label={`Select ${job.title}`} />
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground whitespace-nowrap">
                      <Link href={`/dashboard/jobs/${job.id}`} className="hover:underline">
                        {job.display_id ?? `…${job.id.slice(-6).toUpperCase()}`}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      <Link href={`/dashboard/jobs/${job.id}`} className="hover:underline line-clamp-1">{job.title}</Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{job.client ?? '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{job.city ?? '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{job.state ?? '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{emp}</TableCell>
                    <TableCell><Chip label={st.label} className={st.className} /></TableCell>
                    <TableCell><Chip label={pri.label} className={pri.className} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{job.recruiter_name ?? '—'}</TableCell>
                    <TableCell className="text-center text-sm">{job.openings}</TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">0</TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">0</TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">0</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmt(job.created_at)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmt(job.updated_at)}</TableCell>
                    <TableCell className="text-center text-sm">
                      <span className={days > 30 ? 'text-red-600 font-medium' : days > 14 ? 'text-amber-600' : 'text-muted-foreground'}>
                        {days}d
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ── filter drawer ── */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-80 sm:w-96 flex flex-col p-0">
          <SheetHeader className="px-5 py-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base">Filters</SheetTitle>
              {Object.values(draft).some(Boolean) && (
                <button onClick={clearDraft} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
                  Clear all
                </button>
              )}
            </div>
          </SheetHeader>

          {/* scrollable filter body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

            <DrawerSelect id="f-status" label="Status" value={draft.status} onChange={v => setDraftField('status', v)} options={[
              { value: 'open', label: 'Open' }, { value: 'on_hold', label: 'On Hold' },
              { value: 'closed', label: 'Closed' }, { value: 'filled', label: 'Filled' },
            ]} />

            <DrawerSelect id="f-client" label="Client" value={draft.client} onChange={v => setDraftField('client', v)}
              options={clients.map(c => ({ value: c, label: c }))}
              placeholder={clients.length ? '— All clients —' : '— No clients yet —'}
            />

            <DrawerSelect id="f-recruiter" label="Recruiter" value={draft.recruiter} onChange={v => setDraftField('recruiter', v)}
              options={recruiters.map(r => ({ value: r, label: r }))}
              placeholder={recruiters.length ? '— All recruiters —' : '— No recruiters yet —'}
            />

            <DrawerSelect id="f-emptype" label="Job Type / Employment" value={draft.empType} onChange={v => setDraftField('empType', v)} options={[
              { value: 'full_time', label: 'Full-Time' }, { value: 'contract', label: 'Contract' },
              { value: 'cth', label: 'CTH (Contract to Hire)' }, { value: 'direct_hire', label: 'Direct Hire' },
              { value: 'remote', label: 'Remote' }, { value: 'hybrid', label: 'Hybrid' },
            ]} />

            <DrawerSelect id="f-priority" label="Priority" value={draft.priority} onChange={v => setDraftField('priority', v)} options={[
              { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' },
            ]} />

            <DrawerSelect id="f-clienttype" label="VMS / Direct Client" value={draft.clientType} onChange={v => setDraftField('clientType', v)} options={[
              { value: 'direct', label: 'Direct Client' }, { value: 'vms', label: 'VMS' },
            ]} />

            <DrawerSelect id="f-workmode" label="Remote / Hybrid / Onsite" value={draft.workMode} onChange={v => setDraftField('workMode', v)} options={[
              { value: 'remote', label: 'Remote' }, { value: 'hybrid', label: 'Hybrid' }, { value: 'onsite', label: 'Onsite' },
            ]} />

            <DrawerSelect id="f-aging" label="Aging (days open)" value={draft.agingMin} onChange={v => setDraftField('agingMin', v)} options={[
              { value: '7', label: '7+ days' }, { value: '14', label: '14+ days' },
              { value: '30', label: '30+ days' }, { value: '60', label: '60+ days' },
              { value: '90', label: '90+ days' },
            ]} />

            {/* Date range */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Created date range</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <span className="text-[11px] text-muted-foreground">From</span>
                  <input
                    type="date"
                    value={draft.dateFrom}
                    onChange={e => setDraftField('dateFrom', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <span className="text-[11px] text-muted-foreground">To</span>
                  <input
                    type="date"
                    value={draft.dateTo}
                    onChange={e => setDraftField('dateTo', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* sticky footer */}
          <SheetFooter className="px-5 py-4 border-t gap-2 flex-row">
            <Button variant="outline" className="flex-1" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={applyFilters}>
              Apply filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}

// ── small active-filter chip ──────────────────────────────────
function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 h-6 pl-2 pr-1 rounded-full border border-primary/30 bg-primary/5 text-xs text-foreground">
      {label}
      <button onClick={onRemove} className="flex items-center justify-center size-3.5 rounded-full hover:bg-primary/10 transition-colors" aria-label="Remove filter">
        <X className="size-2.5" />
      </button>
    </span>
  )
}
