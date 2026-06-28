'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  Search, Plus, X, MoreHorizontal, LayoutList, Kanban, Mail, MessageSquare,
  UserCheck, Trash2, Send, Star, Bot, Sparkles, ChevronDown, SlidersHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PROJECT_CANDIDATES, KANBAN_STAGES } from '../../_data'

const STAGE_COLORS: Record<string, string> = {
  New:         'bg-muted text-muted-foreground border-border',
  Reviewed:    'bg-sky-50 text-sky-700 border-sky-200',
  Contacted:   'bg-blue-50 text-blue-700 border-blue-200',
  Interested:  'bg-violet-50 text-violet-700 border-violet-200',
  Submitted:   'bg-amber-50 text-amber-700 border-amber-200',
  Interview:   'bg-purple-50 text-purple-700 border-purple-200',
  Offer:       'bg-orange-50 text-orange-700 border-orange-200',
  Placed:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  Future:      'bg-teal-50 text-teal-700 border-teal-200',
  Rejected:    'bg-red-50 text-red-700 border-red-200',
}

function scoreColor(s: number) {
  return s >= 90 ? 'text-emerald-600' : s >= 75 ? 'text-amber-500' : 'text-red-500'
}

export default function ProjectCandidatesPage() {
  const [view, setView] = useState<'table' | 'kanban'>('table')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const candidates = useMemo(() => {
    if (!search) return PROJECT_CANDIDATES
    const q = search.toLowerCase()
    return PROJECT_CANDIDATES.filter(c =>
      c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) ||
      c.skills.some(s => s.toLowerCase().includes(q))
    )
  }, [search])

  const allSel = candidates.length > 0 && candidates.every(c => selected.has(c.id))
  const someSel = candidates.some(c => selected.has(c.id)) && !allSel
  function toggleAll(v: boolean) { setSelected(v ? new Set(candidates.map(c => c.id)) : new Set()) }
  function toggleRow(id: string, v: boolean) { const n = new Set(selected); v ? n.add(id) : n.delete(id); setSelected(n) }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b shrink-0 flex-wrap bg-background">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search candidates…" className="h-8 w-52 pl-8 pr-7 text-xs" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="size-3.5" /></button>}
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <SlidersHorizontal className="size-3.5" />Filters
          </Button>
          {/* Smart filters */}
          {['Available Today', 'No Contact 7d', 'Healthcare', 'Top Match'].map(f => (
            <button key={f} className="h-7 px-2.5 text-xs border border-dashed border-border rounded-full text-muted-foreground hover:border-foreground hover:text-foreground transition-colors whitespace-nowrap">
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center border border-border rounded-lg p-0.5 gap-0.5">
            <button onClick={() => setView('table')} className={cn('size-7 flex items-center justify-center rounded-md transition-colors', view === 'table' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground')}>
              <LayoutList className="size-3.5" />
            </button>
            <button onClick={() => setView('kanban')} className={cn('size-7 flex items-center justify-center rounded-md transition-colors', view === 'kanban' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground')}>
              <Kanban className="size-3.5" />
            </button>
          </div>
          <Button size="sm" className="h-8 text-xs gap-1.5">
            <Plus className="size-3.5" />Add Candidates
          </Button>
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 px-5 py-2 bg-accent/60 border-b shrink-0 flex-wrap">
          <span className="text-xs font-semibold">{selected.size} selected</span>
          <div className="w-px h-4 bg-border mx-1" />
          {[
            { label: 'Email',    icon: Mail },
            { label: 'SMS',      icon: MessageSquare },
            { label: 'Assign',   icon: UserCheck },
          ].map(a => (
            <Button key={a.label} size="sm" variant="outline" className="h-7 text-xs gap-1"><a.icon className="size-3" />{a.label}</Button>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1">More <ChevronDown className="size-3" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem><Send className="size-3.5 mr-2" />Move Stage</DropdownMenuItem>
              <DropdownMenuItem><Star className="size-3.5 mr-2" />Shortlist</DropdownMenuItem>
              <DropdownMenuItem><Bot className="size-3.5 mr-2" />Generate AI Summary</DropdownMenuItem>
              <DropdownMenuItem><Sparkles className="size-3.5 mr-2" />Generate Submission Notes</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive"><Trash2 className="size-3.5 mr-2" />Remove from Project</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button onClick={() => setSelected(new Set())} className="ml-auto size-6 flex items-center justify-center text-muted-foreground hover:text-foreground rounded transition-colors">
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {view === 'table' ? (
        <TableView candidates={candidates} selected={selected} allSel={allSel} someSel={someSel} toggleAll={toggleAll} toggleRow={toggleRow} />
      ) : (
        <KanbanView candidates={candidates} />
      )}
    </div>
  )
}

function TableView({ candidates, selected, allSel, someSel, toggleAll, toggleRow }: {
  candidates: typeof PROJECT_CANDIDATES
  selected: Set<string>
  allSel: boolean
  someSel: boolean
  toggleAll: (v: boolean) => void
  toggleRow: (id: string, v: boolean) => void
}) {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
          <tr className="border-b border-border">
            <th className="h-9 w-10 px-3"><Checkbox checked={allSel} data-state={someSel ? 'indeterminate' : undefined} onCheckedChange={toggleAll} /></th>
            {['Candidate', 'Stage', 'Title / Company', 'Skills', 'Location', 'Auth', 'Recruiter', 'Last Contact', 'AI Score', ''].map(h => (
              <th key={h} className="h-9 px-3 text-left align-middle whitespace-nowrap">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {candidates.map(c => {
            const isSel = selected.has(c.id)
            return (
              <tr key={c.id} className={cn('border-b border-border transition-colors', isSel ? 'bg-accent/40' : 'hover:bg-muted/30')}>
                <td className="px-3 py-2 w-10"><Checkbox checked={isSel} onCheckedChange={v => toggleRow(c.id, !!v)} onClick={e => e.stopPropagation()} /></td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                      {c.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-xs font-semibold whitespace-nowrap">{c.name}</p>
                      <div className="flex gap-1 mt-0.5">
                        {c.tags.map(t => (
                          <span key={t} className={cn('text-[9px] px-1.5 py-px rounded-full font-medium border', t === 'Hot' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-muted text-muted-foreground border-border')}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap', STAGE_COLORS[c.stage] ?? '')}>{c.stage}</span>
                </td>
                <td className="px-3 py-2">
                  <p className="text-xs font-medium whitespace-nowrap">{c.title}</p>
                  <p className="text-[10px] text-muted-foreground">{c.company}</p>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {c.skills.slice(0, 2).map(s => (
                      <span key={s} className="text-[10px] px-1.5 py-px rounded-full bg-muted/80 text-foreground font-medium">{s}</span>
                    ))}
                    {c.skills.length > 2 && <span className="text-[10px] text-muted-foreground">+{c.skills.length - 2}</span>}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap"><span className="text-xs text-muted-foreground">{c.location}</span></td>
                <td className="px-3 py-2">
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', c.auth === 'USC' || c.auth === 'GC' ? 'bg-emerald-50 text-emerald-700' : c.auth === 'H1B' ? 'bg-amber-50 text-amber-700' : 'bg-muted text-muted-foreground')}>
                    {c.auth}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap"><span className="text-xs text-muted-foreground">{c.recruiter}</span></td>
                <td className="px-3 py-2 whitespace-nowrap"><span className="text-xs text-muted-foreground">{c.lastContact}</span></td>
                <td className="px-3 py-2">
                  <span className={cn('text-xs font-bold tabular-nums', scoreColor(c.aiScore))}>{c.aiScore}</span>
                </td>
                <td className="px-3 py-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="size-7 flex items-center justify-center rounded-md hover:bg-muted/60 transition-colors" onClick={e => e.stopPropagation()}>
                        <MoreHorizontal className="size-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem>Open Profile</DropdownMenuItem>
                      <DropdownMenuItem>Move Stage</DropdownMenuItem>
                      <DropdownMenuItem><Mail className="size-3.5 mr-2" />Send Email</DropdownMenuItem>
                      <DropdownMenuItem><MessageSquare className="size-3.5 mr-2" />Send SMS</DropdownMenuItem>
                      <DropdownMenuItem>Schedule Interview</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem><Bot className="size-3.5 mr-2" />Generate AI Summary</DropdownMenuItem>
                      <DropdownMenuItem><Sparkles className="size-3.5 mr-2" />Generate Submission Notes</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive"><Trash2 className="size-3.5 mr-2" />Remove from Project</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function KanbanView({ candidates }: { candidates: typeof PROJECT_CANDIDATES }) {
  const byStage = KANBAN_STAGES.reduce<Record<string, typeof PROJECT_CANDIDATES>>((acc, stage) => {
    acc[stage] = candidates.filter(c => c.stage === stage)
    return acc
  }, {})

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden">
      <div className="flex gap-3 h-full p-4 w-max">
        {KANBAN_STAGES.map(stage => (
          <div key={stage} className="flex flex-col gap-2 w-56 shrink-0 h-full">
            <div className="flex items-center justify-between px-1 shrink-0">
              <div className="flex items-center gap-2">
                <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold', STAGE_COLORS[stage] ?? 'bg-muted text-muted-foreground border-border')}>{stage}</span>
              </div>
              <span className="text-xs text-muted-foreground font-medium">{byStage[stage]?.length ?? 0}</span>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-16 rounded-xl bg-muted/30 border border-dashed border-border p-2">
              {(byStage[stage] ?? []).map(c => (
                <div key={c.id} className="bg-background rounded-lg border border-border p-3 cursor-pointer hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <p className="text-xs font-semibold leading-tight">{c.name}</p>
                    <span className={cn('text-[10px] font-bold tabular-nums shrink-0', scoreColor(c.aiScore))}>{c.aiScore}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{c.title}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {c.skills.slice(0, 2).map(s => (
                      <span key={s} className="text-[9px] px-1.5 py-px rounded-full bg-muted/80 text-foreground font-medium">{s}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[9px] text-muted-foreground">{c.lastContact}</span>
                    <span className={cn('text-[9px] px-1.5 py-px rounded font-medium', c.auth === 'USC' || c.auth === 'GC' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>{c.auth}</span>
                  </div>
                </div>
              ))}
              {byStage[stage].length === 0 && (
                <div className="flex items-center justify-center h-12 text-[10px] text-muted-foreground/60">Drop candidates here</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
