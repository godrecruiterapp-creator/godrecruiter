'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, X, CheckCircle2, AlertCircle, SkipForward, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AutomationRun } from '../actions'

const RESULT_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; badge: string; bar: string }> = {
  success: { label: 'Success', icon: CheckCircle2, badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500' },
  partial: { label: 'Partial', icon: SkipForward,  badge: 'bg-amber-50 text-amber-700 border-amber-200',       bar: 'bg-amber-400' },
  skipped: { label: 'Skipped', icon: SkipForward,  badge: 'bg-muted text-muted-foreground border-border',      bar: 'bg-muted-foreground/40' },
  failed:  { label: 'Failed',  icon: AlertCircle,  badge: 'bg-red-50 text-red-700 border-red-200',             bar: 'bg-red-400' },
}

export function ActivityClient({ runs }: { runs: AutomationRun[] }) {
  const [search, setSearch] = useState('')
  const [result, setResult] = useState('all')

  const rows = runs.map(r => {
    const done = r.steps.filter(s => s.status === 'done').length
    const problems = r.steps.filter(s => s.status !== 'done').map(s => s.detail)
    return {
      id: r.id, automation: r.automation_name ?? 'Automation', subject: r.subject_label ?? '—',
      date: new Date(r.created_at).toLocaleString(), done, total: r.steps.length, result: r.status,
      errors: problems.length ? problems.join(' · ') : undefined,
    }
  })

  const filtered = rows.filter(r => {
    if (result !== 'all' && r.result !== result) return false
    if (search && !r.automation.toLowerCase().includes(search.toLowerCase()) && !r.subject.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="flex flex-col h-full p-6 overflow-hidden">
      <div className="flex items-center justify-between pb-4 shrink-0 flex-wrap gap-3">
        <div>
          <h1 className="text-base font-semibold">Activity</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Every automation run and what happened.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search…" className="h-8 w-48 pl-8 pr-7 text-sm" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <Select value={result} onValueChange={setResult}>
            <SelectTrigger className="h-8 w-28 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Results</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="skipped">Skipped</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {runs.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Zap className="size-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No activity yet</p>
          <p className="text-sm text-muted-foreground mt-1">Runs appear here the moment an automation fires.</p>
        </div>
      ) : (
      <div className="flex-1 overflow-hidden border border-border rounded-lg">
        <div className="overflow-auto h-full">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
              <tr className="border-b border-border">
                {['Automation', 'Candidate', 'Date & Time', 'Steps Completed', 'Result'].map(h => (
                  <th key={h} className="h-9 px-4 text-left align-middle">
                    <span className="table-header-cell whitespace-nowrap">{h}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const cfg = RESULT_CONFIG[r.result] ?? RESULT_CONFIG.success!
                const Icon = cfg.icon
                return (
                  <tr key={r.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 align-middle"><span className="table-cell-primary">{r.automation}</span></td>
                    <td className="px-4 py-3 align-middle"><span className="table-cell-secondary">{r.subject}</span></td>
                    <td className="px-4 py-3 align-middle"><span className="table-cell-secondary whitespace-nowrap">{r.date}</span></td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                          <div className={cn('h-full rounded-full', cfg.bar)} style={{ width: `${r.total ? (r.done / r.total) * 100 : 0}%` }} />
                        </div>
                        <span className="table-cell-secondary tabular-nums">{r.done}/{r.total}</span>
                      </div>
                      {r.errors && <p className="text-[10px] text-amber-600 mt-0.5 max-w-xs truncate">{r.errors}</p>}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium capitalize', cfg.badge)}>
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
      )}
    </div>
  )
}
