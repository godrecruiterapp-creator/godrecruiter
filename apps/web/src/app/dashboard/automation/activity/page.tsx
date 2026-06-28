'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X, Download, CheckCircle2, AlertCircle, SkipForward } from 'lucide-react'
import { cn } from '@/lib/utils'

type Run = {
  id: string
  automation: string
  startedBy: string
  date: string
  steps: number
  total: number
  time: string
  result: 'success' | 'failed' | 'partial'
  errors?: string
}

const RUNS: Run[] = [
  { id: '1',  automation: 'Auto Welcome Candidate',       startedBy: 'System',     date: 'Today 10:42 AM', steps: 3, total: 3, time: '1.2s',  result: 'success' },
  { id: '2',  automation: 'AI Candidate Summary',         startedBy: 'System',     date: 'Today 10:38 AM', steps: 1, total: 1, time: '3.4s',  result: 'success' },
  { id: '3',  automation: 'Missing Documents Alert',      startedBy: 'System',     date: 'Today 10:00 AM', steps: 2, total: 2, time: '0.8s',  result: 'success' },
  { id: '4',  automation: 'Interview Reminder',           startedBy: 'System',     date: 'Today 09:15 AM', steps: 2, total: 3, time: '1.1s',  result: 'partial', errors: 'SMS delivery failed — candidate phone missing.' },
  { id: '5',  automation: 'Placement Ending Soon',        startedBy: 'Arun Kumar', date: 'Today 09:00 AM', steps: 3, total: 3, time: '2.0s',  result: 'success' },
  { id: '6',  automation: 'Credential Expiration Alert',  startedBy: 'System',     date: 'Yesterday 4:00 PM', steps: 1, total: 1, time: '0.5s', result: 'success' },
  { id: '7',  automation: 'Rejected Candidate Follow-up', startedBy: 'System',     date: 'Yesterday 2:30 PM', steps: 0, total: 2, time: '0.2s', result: 'failed', errors: 'Candidate email address not found.' },
  { id: '8',  automation: 'Auto Welcome Candidate',       startedBy: 'System',     date: 'Yesterday 11:20 AM', steps: 3, total: 3, time: '1.4s', result: 'success' },
]

const RESULT_CONFIG = {
  success: { label: 'Success', icon: CheckCircle2, cls: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  failed:  { label: 'Failed',  icon: AlertCircle,  cls: 'text-red-600',     badge: 'bg-red-50 text-red-700 border-red-200' },
  partial: { label: 'Partial', icon: SkipForward,  cls: 'text-amber-600',   badge: 'bg-amber-50 text-amber-700 border-amber-200' },
}

export default function ActivityPage() {
  const [search, setSearch] = useState('')
  const [result, setResult] = useState('all')

  const filtered = RUNS.filter(r => {
    if (result !== 'all' && r.result !== result) return false
    if (search && !r.automation.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="flex flex-col h-full p-6 overflow-hidden">
      <div className="flex items-center justify-between pb-4 shrink-0 flex-wrap gap-3">
        <div>
          <h1 className="text-base font-semibold">Activity</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Every automation run, who triggered it, and what happened.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search…" className="h-8 w-48 pl-8 pr-7 text-xs" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <Select value={result} onValueChange={setResult}>
            <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Results</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Download className="size-3.5" />Export
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden border border-border rounded-lg">
        <div className="overflow-auto h-full">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
              <tr className="border-b border-border">
                {['Automation', 'Started By', 'Date & Time', 'Steps Completed', 'Time Taken', 'Result'].map(h => (
                  <th key={h} className="h-9 px-4 text-left align-middle">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const cfg = RESULT_CONFIG[r.result]
                const Icon = cfg.icon
                return (
                  <tr key={r.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 align-middle">
                      <span className="text-sm font-medium">{r.automation}</span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className="text-xs text-muted-foreground">{r.startedBy}</span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{r.date}</span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                          <div className={cn('h-full rounded-full', r.result === 'success' ? 'bg-emerald-500' : r.result === 'partial' ? 'bg-amber-400' : 'bg-red-400')}
                            style={{ width: `${(r.steps / r.total) * 100}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums">{r.steps}/{r.total}</span>
                      </div>
                      {r.errors && <p className="text-[10px] text-red-600 mt-0.5 max-w-xs">{r.errors}</p>}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className="text-xs text-muted-foreground tabular-nums">{r.time}</span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', cfg.badge)}>
                        <Icon className="size-3" />
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
