'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Settings2, GripVertical, Check, ExternalLink, Trash2, Users } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

export type CandidateRow = {
  id: string
  first_name: string | null; last_name: string | null
  current_title: string | null; current_company: string | null
  email: string; phone: string | null; location: string | null
  candidate_type: string | null; notice_period: string | null
  expected_ctc: number | null
  source: string | null
  created_at: string; updated_at: string
}

type ColKey =
  | 'select' | 'name' | 'job_title' | 'stage' | 'experience' | 'skills'
  | 'email' | 'phone' | 'city' | 'state' | 'work_auth' | 'availability'
  | 'pay' | 'recruiter' | 'last_activity' | 'created' | 'actions'

const COL_META: Record<ColKey, { label: string; width: string }> = {
  select:        { label: 'Select',             width: '48px'  },
  name:          { label: 'Candidate Name',     width: '200px' },
  job_title:     { label: 'Job Title',          width: '150px' },
  stage:         { label: 'Stage',              width: '110px' },
  experience:    { label: 'Experience',         width: '110px' },
  skills:        { label: 'Skills',             width: '180px' },
  email:         { label: 'Email',              width: '200px' },
  phone:         { label: 'Phone',              width: '140px' },
  city:          { label: 'City',               width: '120px' },
  state:         { label: 'State',              width: '90px'  },
  work_auth:     { label: 'Work Authorization', width: '155px' },
  availability:  { label: 'Availability',       width: '120px' },
  pay:           { label: 'Pay Expectation',    width: '135px' },
  recruiter:     { label: 'Recruiter',          width: '130px' },
  last_activity: { label: 'Last Activity',      width: '120px' },
  created:       { label: 'Created',            width: '110px' },
  actions:       { label: 'Actions',            width: '64px'  },
}

const DEFAULT_COLS: ColKey[] = [
  'select', 'name', 'job_title', 'stage', 'experience', 'skills',
  'email', 'phone', 'city', 'state', 'work_auth', 'availability',
  'pay', 'recruiter', 'last_activity', 'created', 'actions',
]

const WORK_AUTH: Record<string, string> = {
  permanent: 'Citizen / PR',
  contract:  'Work Visa',
  temp:      'Temp / OPT',
  unknown:   'Unknown',
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
  if (ctc >= 1_000)   return `₹${(ctc / 1_000).toFixed(0)}K`
  return `₹${ctc}`
}

// ── Column picker ─────────────────────────────────────────────────────────────

function ColPicker({
  cols, allCols, onChange,
}: {
  cols: ColKey[]
  allCols: ColKey[]
  onChange: (cols: ColKey[]) => void
}) {
  const [open, setOpen] = useState(false)
  const dragKey = useRef<ColKey | null>(null)
  const hidden = allCols.filter(k => !cols.includes(k))

  function toggle(key: ColKey) {
    if (cols.includes(key)) {
      onChange(cols.filter(k => k !== key))
    } else {
      const last = cols[cols.length - 1]
      onChange(last ? [...cols.slice(0, -1), key, last] : [...cols, key])
    }
  }

  function onDragStart(key: ColKey) { dragKey.current = key }
  function onDrop(targetKey: ColKey) {
    if (!dragKey.current || dragKey.current === targetKey) return
    const next = [...cols]
    const from = next.indexOf(dragKey.current)
    const to   = next.indexOf(targetKey)
    next.splice(from, 1)
    next.splice(to, 0, dragKey.current)
    onChange(next)
    dragKey.current = null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`h-9 flex items-center gap-2 px-3 rounded-md border text-sm transition-colors ${
          open ? 'border-brand bg-brand-muted text-brand' : 'border-border bg-background text-foreground hover:bg-muted'
        }`}
      >
        <Settings2 className="size-3.5" />
        Columns
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-60 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
            <div className="px-4 py-2.5 border-b flex items-center justify-between">
              <span className="text-sm font-semibold">Columns</span>
              <button onClick={() => onChange(DEFAULT_COLS)} className="text-xs text-brand hover:underline">Reset</button>
            </div>

            {/* Visible + reorderable */}
            <div className="px-2 py-2 border-b max-h-72 overflow-y-auto">
              <p className="text-xs text-muted-foreground px-2 pb-1.5 font-medium">Visible</p>
              {cols.map(key => (
                <div
                  key={key}
                  draggable
                  onDragStart={() => onDragStart(key)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => onDrop(key)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/60 cursor-grab active:cursor-grabbing group"
                >
                  <GripVertical className="size-3.5 text-muted-foreground/40 shrink-0" />
                  <span className={`size-4 rounded border flex items-center justify-center shrink-0 transition-colors bg-brand border-brand`}>
                    <Check className="size-2.5 text-white" strokeWidth={3} />
                  </span>
                  <span className="text-sm flex-1">{COL_META[key].label}</span>
                  <button onClick={() => toggle(key)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs">✕</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Hidden columns */}
            {hidden.length > 0 && (
              <div className="px-2 py-2 max-h-48 overflow-y-auto">
                <p className="text-xs text-muted-foreground px-2 pb-1.5 font-medium">Hidden</p>
                {hidden.map(key => (
                  <button
                    key={key}
                    onClick={() => toggle(key)}
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-muted/60 text-left"
                  >
                    <div className="size-3.5 shrink-0" />
                    <span className="size-4 rounded border border-border flex items-center justify-center shrink-0" />
                    <span className="text-sm text-muted-foreground">{COL_META[key].label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── Row actions menu ──────────────────────────────────────────────────────────

function RowActions({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(o => !o)}
        className="size-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors"
      >
        <MoreHorizontal className="size-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-50 w-36 bg-popover border border-border rounded-lg shadow-lg overflow-hidden py-1">
            <Link href={`/dashboard/candidates/${id}`}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted w-full text-left">
              <ExternalLink className="size-3.5" /> View
            </Link>
            <Link href={`/dashboard/candidates/${id}/edit`}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted w-full text-left">
              Edit
            </Link>
            <div className="border-t my-1" />
            <button className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-destructive w-full text-left">
              <Trash2 className="size-3.5" /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ── Table ─────────────────────────────────────────────────────────────────────

export function CandidatesTable({ candidates }: { candidates: CandidateRow[] }) {
  const [cols, setCols] = useState<ColKey[]>(DEFAULT_COLS)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const allSelected = candidates.length > 0 && candidates.every(c => selected.has(c.id))
  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(candidates.map(c => c.id)))
  }
  function toggleRow(id: string) {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  function renderHeader(key: ColKey) {
    if (key === 'select') return (
      <input type="checkbox" checked={allSelected} onChange={toggleAll}
        className="size-4 rounded accent-brand cursor-pointer" />
    )
    if (key === 'actions') return null
    return COL_META[key].label
  }

  function renderCell(key: ColKey, c: CandidateRow) {
    const name = [c.first_name, c.last_name].filter(Boolean).join(' ') || 'Unnamed'
    const initials = [c.first_name?.[0], c.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?'
    switch (key) {
      case 'select':
        return (
          <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleRow(c.id)}
            className="size-4 rounded accent-brand cursor-pointer" />
        )
      case 'name':
        return (
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="size-7 shrink-0">
              <AvatarFallback className="text-xs font-medium bg-brand-muted text-brand">{initials}</AvatarFallback>
            </Avatar>
            <Link href={`/dashboard/candidates/${c.id}`} className="font-medium text-sm truncate hover:text-brand transition-colors">
              {name}
            </Link>
          </div>
        )
      case 'job_title':     return <span className="text-sm truncate">{c.current_title ?? '—'}</span>
      case 'stage':         return <span className="text-sm text-muted-foreground">—</span> // ponytail: no job_candidates table yet
      case 'experience':    return <span className="text-sm text-muted-foreground">—</span> // ponytail: no experience column in candidates
      case 'skills':        return <span className="text-sm text-muted-foreground">—</span> // ponytail: no skills column in candidates
      case 'email':         return <span className="text-sm text-muted-foreground truncate">{c.email}</span>
      case 'phone':         return <span className="text-sm text-muted-foreground">{c.phone ?? '—'}</span>
      case 'city':          return <span className="text-sm text-muted-foreground truncate">{c.location ?? '—'}</span> // ponytail: location is combined city+state
      case 'state':         return <span className="text-sm text-muted-foreground">—</span> // ponytail: no separate state field
      case 'work_auth':     return <span className="text-sm text-muted-foreground">{WORK_AUTH[c.candidate_type ?? ''] ?? '—'}</span>
      case 'availability':  return <span className="text-sm text-muted-foreground">{c.notice_period ?? '—'}</span>
      case 'pay':           return <span className="text-sm text-muted-foreground">{c.expected_ctc ? formatCtc(c.expected_ctc) : '—'}</span>
      case 'recruiter':     return <span className="text-sm text-muted-foreground">—</span> // ponytail: no recruiter field on candidates yet
      case 'last_activity': return <span className="text-sm text-muted-foreground">{relTime(c.updated_at)}</span>
      case 'created':       return <span className="text-sm text-muted-foreground">{relTime(c.created_at)}</span>
      case 'actions':       return <RowActions id={c.id} />
    }
  }

  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="size-10 rounded-full bg-muted flex items-center justify-center">
          <Users className="size-4 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No candidates yet</p>
        <p className="text-sm text-muted-foreground">Add your first candidate to build your talent pool.</p>
        <Button asChild size="sm" className="mt-1">
          <Link href="/dashboard/candidates/new">Add candidate</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-1 pb-3 shrink-0">
        <span className="text-sm text-muted-foreground">
          {selected.size > 0 ? `${selected.size} selected` : `${candidates.length} candidates`}
        </span>
        <ColPicker cols={cols} allCols={DEFAULT_COLS} onChange={setCols} />
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-auto flex-1">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur-sm">
            <tr>
              {cols.map(key => (
                <th
                  key={key}
                  style={{ width: COL_META[key].width, minWidth: COL_META[key].width }}
                  className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap border-b border-border"
                >
                  {renderHeader(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {candidates.map(c => (
              <tr
                key={c.id}
                className={`group transition-colors hover:bg-muted/30 ${selected.has(c.id) ? 'bg-brand-muted' : ''}`}
              >
                {cols.map(key => (
                  <td
                    key={key}
                    style={{ width: COL_META[key].width, minWidth: COL_META[key].width }}
                    className="px-3 py-2.5 overflow-hidden"
                  >
                    {renderCell(key, c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
