'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, Plus, X, MoreHorizontal, Pencil, Copy, Trash2, Play, Zap, FlaskConical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CreateAutomationWizard } from '../create-automation-wizard'

type Automation = {
  id: string
  name: string
  status: 'on' | 'off'
  category: string
  runsToday: number
  runsMonth: number
  lastRun: string
  createdBy: string
  summary: string
}

const AUTOMATIONS: Automation[] = [
  { id: '1', name: 'Auto Welcome Candidate',     status: 'on',  category: 'Communication', runsToday: 4,  runsMonth: 87,  lastRun: '10 min ago',  createdBy: 'Arun Kumar', summary: 'When a candidate applies, send a welcome email immediately.' },
  { id: '2', name: 'Interview Reminder',         status: 'on',  category: 'Interviews',    runsToday: 2,  runsMonth: 43,  lastRun: '1 hour ago',  createdBy: 'Arun Kumar', summary: 'When an interview is scheduled, send a reminder 1 day before.' },
  { id: '3', name: 'Credential Expiration Alert',status: 'on',  category: 'Compliance',    runsToday: 1,  runsMonth: 19,  lastRun: '3 hours ago', createdBy: 'Arun Kumar', summary: 'When a credential expires within 30 days, notify the recruiter.' },
  { id: '4', name: 'Offer Follow-up',            status: 'off', category: 'Communication', runsToday: 0,  runsMonth: 12,  lastRun: '2 days ago',  createdBy: 'Arun Kumar', summary: 'When an offer is sent, follow up after 1 day if no response.' },
  { id: '5', name: 'Placement Ending Soon',      status: 'on',  category: 'Placements',    runsToday: 3,  runsMonth: 55,  lastRun: '30 min ago',  createdBy: 'Arun Kumar', summary: 'When a placement end date is within 30 days, notify the account manager.' },
  { id: '6', name: 'Missing Documents Alert',    status: 'on',  category: 'Compliance',    runsToday: 6,  runsMonth: 120, lastRun: '5 min ago',   createdBy: 'Arun Kumar', summary: 'When compliance documents are missing, send a reminder every morning.' },
  { id: '7', name: 'AI Candidate Summary',       status: 'on',  category: 'AI',            runsToday: 8,  runsMonth: 203, lastRun: '2 min ago',   createdBy: 'Arun Kumar', summary: 'When a candidate is added, generate an AI summary automatically.' },
  { id: '8', name: 'Rejected Candidate Follow-up',status:'off', category: 'Communication', runsToday: 0,  runsMonth: 8,   lastRun: '5 days ago',  createdBy: 'Arun Kumar', summary: 'When a candidate is rejected, send a kind follow-up after 3 days.' },
]

const CATEGORIES = ['All', 'Communication', 'Interviews', 'Compliance', 'Placements', 'AI']

export default function MyAutomationsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('All')
  const [wizardOpen, setWizardOpen] = useState(false)
  const [automations, setAutomations] = useState(AUTOMATIONS)

  const filtered = useMemo(() => {
    return automations.filter(a => {
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false
      if (status !== 'all' && a.status !== status) return false
      if (category !== 'All' && a.category !== category) return false
      return true
    })
  }, [automations, search, status, category])

  function toggleStatus(id: string) {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, status: a.status === 'on' ? 'off' : 'on' } : a))
  }

  return (
    <>
      <div className="flex flex-col h-full p-6 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-4 shrink-0 gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search automations…" className="h-8 w-52 pl-8 pr-7 text-xs" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-8 w-28 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="on">On</SelectItem>
                <SelectItem value="off">Off</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c === 'All' ? 'All Categories' : c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" className="h-8 shrink-0" onClick={() => setWizardOpen(true)}>
            <Plus className="size-3.5 mr-1.5" />New Automation
          </Button>
        </div>

        {/* Cards grid */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Zap className="size-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No automations found</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Create your first automation to get started.</p>
              <Button size="sm" className="h-8 text-xs" onClick={() => setWizardOpen(true)}>
                <Plus className="size-3.5 mr-1.5" />New Automation
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map(a => (
                <AutomationCard key={a.id} automation={a} onToggle={() => toggleStatus(a.id)} />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateAutomationWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </>
  )
}

function AutomationCard({ automation: a, onToggle }: { automation: Automation; onToggle: () => void }) {
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
              <DropdownMenuItem><Pencil className="size-3.5 mr-2" />Edit</DropdownMenuItem>
              <DropdownMenuItem><Copy className="size-3.5 mr-2" />Duplicate</DropdownMenuItem>
              <DropdownMenuItem><FlaskConical className="size-3.5 mr-2" />Test</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <Trash2 className="size-3.5 mr-2" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary */}
      <p className="text-xs text-muted-foreground leading-relaxed">{a.summary}</p>

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
