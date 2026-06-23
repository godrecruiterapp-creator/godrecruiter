'use client'

import { useState, useMemo, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub,
  DropdownMenuSubTrigger, DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
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

// ── filter select ─────────────────────────────────────────────
function FilterSelect({
  label, value, onChange, options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-8 rounded-md border border-input bg-background px-2.5 pr-7 text-xs text-foreground shadow-sm appearance-none focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
      >
        <option value="">{label}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
    </div>
  )
}

// ── main component ────────────────────────────────────────────
export function JobsTableClient({ jobs }: { jobs: Job[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // ── filter state
  const [fStatus,     setFStatus]     = useState('')
  const [fClient,     setFClient]     = useState('')
  const [fRecruiter,  setFRecruiter]  = useState('')
  const [fEmpType,    setFEmpType]    = useState('')
  const [fPriority,   setFPriority]   = useState('')
  const [fClientType, setFClientType] = useState('')
  const [fWorkMode,   setFWorkMode]   = useState('')
  const [fAgingMin,   setFAgingMin]   = useState('')
  const [fDateFrom,   setFDateFrom]   = useState('')
  const [fDateTo,     setFDateTo]     = useState('')

  // ── selection state
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // ── derived filter options (unique values from data)
  const clients    = useMemo(() => [...new Set(jobs.map(j => j.client).filter(Boolean))].sort() as string[], [jobs])
  const recruiters = useMemo(() => [...new Set(jobs.map(j => j.recruiter_name).filter(Boolean))].sort() as string[], [jobs])

  // ── filtered jobs
  const filtered = useMemo(() => {
    return jobs.filter(j => {
      if (fStatus     && j.status !== fStatus) return false
      if (fClient     && j.client !== fClient) return false
      if (fRecruiter  && j.recruiter_name !== fRecruiter) return false
      if (fEmpType    && j.employment_type !== fEmpType) return false
      if (fPriority   && j.priority !== fPriority) return false
      if (fClientType && j.client_type !== fClientType) return false
      if (fWorkMode   && j.work_mode !== fWorkMode) return false
      if (fAgingMin   && aging(j.created_at) < parseInt(fAgingMin)) return false
      if (fDateFrom   && new Date(j.created_at) < new Date(fDateFrom)) return false
      if (fDateTo     && new Date(j.created_at) > new Date(fDateTo + 'T23:59:59')) return false
      return true
    })
  }, [jobs, fStatus, fClient, fRecruiter, fEmpType, fPriority, fClientType, fWorkMode, fAgingMin, fDateFrom, fDateTo])

  const activeFilters = [fStatus, fClient, fRecruiter, fEmpType, fPriority, fClientType, fWorkMode, fAgingMin, fDateFrom, fDateTo].filter(Boolean).length

  function clearFilters() {
    setFStatus(''); setFClient(''); setFRecruiter(''); setFEmpType('')
    setFPriority(''); setFClientType(''); setFWorkMode(''); setFAgingMin('')
    setFDateFrom(''); setFDateTo('')
  }

  // ── selection helpers
  const allIds = filtered.map(j => j.id)
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id))
  const someSelected = allIds.some(id => selected.has(id))
  const selectedInView = allIds.filter(id => selected.has(id))

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

  // ── bulk actions
  async function handleBulkStatus(status: string) {
    startTransition(async () => {
      await bulkUpdateJobsAction([...selected], { status })
      setSelected(new Set())
      router.refresh()
    })
  }
  async function handleBulkPriority(priority: string) {
    startTransition(async () => {
      await bulkUpdateJobsAction([...selected], { priority })
      setSelected(new Set())
      router.refresh()
    })
  }
  async function handleBulkDelete() {
    if (!confirm(`Delete ${selected.size} job(s)? This cannot be undone.`)) return
    startTransition(async () => {
      await bulkDeleteJobsAction([...selected])
      setSelected(new Set())
      router.refresh()
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
    <div className="space-y-3">
      {/* ── filter bar ── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <SlidersHorizontal className="size-3.5" />
          <span className="font-medium">Filters</span>
        </div>

        <FilterSelect label="Status" value={fStatus} onChange={setFStatus} options={[
          { value: 'open', label: 'Open' }, { value: 'on_hold', label: 'On Hold' },
          { value: 'closed', label: 'Closed' }, { value: 'filled', label: 'Filled' },
        ]} />

        {clients.length > 0 && (
          <FilterSelect label="Client" value={fClient} onChange={setFClient}
            options={clients.map(c => ({ value: c, label: c }))} />
        )}

        {recruiters.length > 0 && (
          <FilterSelect label="Recruiter" value={fRecruiter} onChange={setFRecruiter}
            options={recruiters.map(r => ({ value: r, label: r }))} />
        )}

        <FilterSelect label="Job Type" value={fEmpType} onChange={setFEmpType} options={[
          { value: 'full_time', label: 'Full-Time' }, { value: 'contract', label: 'Contract' },
          { value: 'cth', label: 'CTH' }, { value: 'direct_hire', label: 'Direct Hire' },
          { value: 'remote', label: 'Remote' }, { value: 'hybrid', label: 'Hybrid' },
        ]} />

        <FilterSelect label="Priority" value={fPriority} onChange={setFPriority} options={[
          { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' },
        ]} />

        <FilterSelect label="Client Type" value={fClientType} onChange={setFClientType} options={[
          { value: 'direct', label: 'Direct Client' }, { value: 'vms', label: 'VMS' },
        ]} />

        <FilterSelect label="Work Mode" value={fWorkMode} onChange={setFWorkMode} options={[
          { value: 'remote', label: 'Remote' }, { value: 'hybrid', label: 'Hybrid' }, { value: 'onsite', label: 'Onsite' },
        ]} />

        {/* Aging */}
        <div className="relative">
          <select
            value={fAgingMin}
            onChange={e => setFAgingMin(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2.5 pr-7 text-xs text-foreground shadow-sm appearance-none focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
          >
            <option value="">Aging</option>
            <option value="7">7+ days</option>
            <option value="14">14+ days</option>
            <option value="30">30+ days</option>
            <option value="60">60+ days</option>
            <option value="90">90+ days</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
        </div>

        {/* Date range */}
        <div className="flex items-center gap-1">
          <input
            type="date"
            value={fDateFrom}
            onChange={e => setFDateFrom(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            title="Created from"
          />
          <span className="text-xs text-muted-foreground">–</span>
          <input
            type="date"
            value={fDateTo}
            onChange={e => setFDateTo(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            title="Created to"
          />
        </div>

        {activeFilters > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 h-8 px-2.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent border border-dashed border-muted-foreground/30 transition-colors"
          >
            <X className="size-3" /> Clear {activeFilters}
          </button>
        )}

        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} of {jobs.length}
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
                  {['open','on_hold','closed','filled'].map(s => (
                    <DropdownMenuItem key={s} onClick={() => handleBulkStatus(s)}>
                      {STATUS_BADGE[s]?.label ?? s}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Change priority</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {['high','medium','low'].map(p => (
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
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
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
                <TableHead className="w-[100px] font-medium text-xs">Job ID</TableHead>
                <TableHead className="min-w-[180px] font-medium text-xs">Job Title</TableHead>
                <TableHead className="min-w-[130px] font-medium text-xs">Client</TableHead>
                <TableHead className="min-w-[100px] font-medium text-xs">City</TableHead>
                <TableHead className="min-w-[100px] font-medium text-xs">State</TableHead>
                <TableHead className="min-w-[110px] font-medium text-xs">Emp. Type</TableHead>
                <TableHead className="min-w-[90px] font-medium text-xs">Status</TableHead>
                <TableHead className="min-w-[90px] font-medium text-xs">Priority</TableHead>
                <TableHead className="min-w-[130px] font-medium text-xs">Recruiter</TableHead>
                <TableHead className="text-center w-[75px] font-medium text-xs">Openings</TableHead>
                <TableHead className="text-center w-[80px] font-medium text-xs">Submitted</TableHead>
                <TableHead className="text-center w-[80px] font-medium text-xs">Interviews</TableHead>
                <TableHead className="text-center w-[70px] font-medium text-xs">Offers</TableHead>
                <TableHead className="min-w-[95px] font-medium text-xs">Created</TableHead>
                <TableHead className="min-w-[95px] font-medium text-xs">Modified</TableHead>
                <TableHead className="text-center w-[65px] font-medium text-xs">Aging</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={17} className="text-center py-10 text-sm text-muted-foreground">
                    No jobs match the current filters.
                  </TableCell>
                </TableRow>
              ) : filtered.map((job) => {
                const status   = STATUS_BADGE[job.status]   ?? STATUS_BADGE['open']!
                const priority = PRIORITY_BADGE[job.priority] ?? PRIORITY_BADGE['medium']!
                const empType  = EMP_LABELS[job.employment_type ?? ''] ?? '—'
                const days     = aging(job.created_at)
                const isSelected = selected.has(job.id)

                return (
                  <TableRow
                    key={job.id}
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/30'}`}
                  >
                    <TableCell className="w-10 px-3" onClick={e => { e.stopPropagation() }}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOne(job.id)}
                        aria-label={`Select ${job.title}`}
                      />
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground whitespace-nowrap">
                      <Link href={`/dashboard/jobs/${job.id}`} className="hover:underline">
                        {job.display_id ?? `…${job.id.slice(-6).toUpperCase()}`}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      <Link href={`/dashboard/jobs/${job.id}`} className="hover:underline line-clamp-1">
                        {job.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{job.client ?? '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{job.city ?? '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{job.state ?? '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{empType}</TableCell>
                    <TableCell><Chip label={status.label} className={status.className} /></TableCell>
                    <TableCell><Chip label={priority.label} className={priority.className} /></TableCell>
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
    </div>
  )
}
