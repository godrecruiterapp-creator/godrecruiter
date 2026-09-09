'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, Plus, X, MoreHorizontal, Pencil, Trash2, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toggleAutomationAction, deleteAutomationAction, type Automation } from '../actions'

const CATEGORIES = ['All', 'Communication', 'Interviews', 'Compliance', 'Placements', 'AI', 'Custom']

export function MyAutomationsClient({ automations }: { automations: Automation[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('All')
  // Optimistic status so the toggle feels instant; server is source of truth on refresh.
  const [override, setOverride] = useState<Record<string, 'on' | 'off'>>({})
  const [, startAction] = useTransition()

  const withStatus = automations.map(a => ({ ...a, status: override[a.id] ?? a.status }))

  const filtered = useMemo(() => {
    return withStatus.filter(a => {
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false
      if (status !== 'all' && a.status !== status) return false
      if (category !== 'All' && a.category !== category) return false
      return true
    })
  }, [withStatus, search, status, category])

  function toggle(a: Automation) {
    const next = (override[a.id] ?? a.status) === 'on' ? 'off' : 'on'
    setOverride(o => ({ ...o, [a.id]: next }))
    startAction(async () => {
      const res = await toggleAutomationAction(a.id, next)
      if (res?.error) { toast.error(res.error); setOverride(o => ({ ...o, [a.id]: a.status })); return }
      router.refresh()
    })
  }

  function remove(a: Automation) {
    startAction(async () => {
      const res = await deleteAutomationAction(a.id)
      if (res?.error) { toast.error(res.error); return }
      toast.success(`Deleted "${a.name}".`)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col h-full p-6 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-4 shrink-0 gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search automations…" className="h-8 w-52 pl-8 pr-7 text-sm" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-8 w-28 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="on">On</SelectItem>
                <SelectItem value="off">Off</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-8 w-36 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c === 'All' ? 'All Categories' : c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" className="h-8 shrink-0" onClick={() => router.push('/dashboard/automation/new')}>
            <Plus className="size-3.5 mr-1.5" />Create Automation
          </Button>
        </div>

        {/* Cards grid */}
        <div className="flex-1 overflow-y-auto">
          {automations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Zap className="size-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No automations yet</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Create your first automation to get started.</p>
              <Button size="sm" className="h-8 text-sm" onClick={() => router.push('/dashboard/automation/new')}>
                <Plus className="size-3.5 mr-1.5" />Create Automation
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Zap className="size-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No automations match your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map(a => (
                <AutomationCard key={a.id} automation={a} onToggle={() => toggle(a)} onDelete={() => remove(a)} />
              ))}
            </div>
          )}
        </div>
    </div>
  )
}

function AutomationCard({ automation: a, onToggle, onDelete }: { automation: Automation; onToggle: () => void; onDelete: () => void }) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-background hover:shadow-sm transition-shadow">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{a.name}</p>
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-muted/80 text-muted-foreground mt-0.5">
              {a.category}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Toggle */}
          <button
            onClick={onToggle}
            className={cn(
              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
              a.status === 'on' ? 'bg-emerald-500' : 'bg-muted-foreground/30'
            )}
          >
            <span className={cn(
              'pointer-events-none inline-block size-3.5 translate-y-px rounded-full bg-white shadow ring-0 transition-transform',
              a.status === 'on' ? 'translate-x-4' : 'translate-x-0.5'
            )} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="size-7 flex items-center justify-center rounded-md hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem disabled><Pencil className="size-3.5 mr-2" />Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={onDelete}>
                <Trash2 className="size-3.5 mr-2" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 min-h-[2.5rem] capitalize">{a.summary || '—'}</p>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border">
        <div>
          <p className="text-[10px] text-muted-foreground">Runs Today</p>
          <p className="text-sm font-semibold tabular-nums">{a.runsToday}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">This Month</p>
          <p className="text-sm font-semibold tabular-nums">{a.runsMonth}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Last Run</p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{a.lastRun}</p>
        </div>
      </div>

      {/* Status badge */}
      <div className="flex items-center justify-between">
        <span className={cn(
          'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
          a.status === 'on'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-muted text-muted-foreground border-border'
        )}>
          {a.status === 'on' ? '● ON' : '○ OFF'}
        </span>
        <span className="text-[10px] text-muted-foreground">by {a.createdBy}</span>
      </div>
    </div>
  )
}
