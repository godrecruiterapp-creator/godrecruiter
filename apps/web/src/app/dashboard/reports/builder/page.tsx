'use client'

import { useState } from 'react'
import { X, Plus, Save, Download, CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/button'

const DATA_SOURCES: Record<string, string[]> = {
  Candidates: ['ID', 'Name', 'Email', 'Phone', 'Location', 'Source', 'Stage', 'Status', 'Skills', 'Experience', 'Work Auth', 'Pay Expectation', 'Created Date', 'Updated Date'],
  Jobs: ['Job ID', 'Title', 'Client', 'Status', 'Priority', 'Days Open', 'Recruiter', 'Bill Rate', 'Pay Rate', 'Location', 'Created Date'],
  Submissions: ['Date', 'Candidate', 'Job', 'Recruiter', 'Stage', 'Status', 'Submitted Date', 'Interview Date'],
  Clients: ['Client ID', 'Name', 'Industry', 'Active Jobs', 'Placements', 'Revenue', 'Status', 'Account Owner'],
  Recruiters: ['Name', 'Email', 'Department', 'Active Jobs', 'Submissions', 'Placements', 'Score', 'Hire Date'],
  Placements: ['Placement ID', 'Candidate', 'Job', 'Client', 'Start Date', 'Bill Rate', 'Pay Rate', 'Recruiter'],
  Activities: ['Date', 'Type', 'Subject', 'Recruiter', 'Candidate', 'Job', 'Duration', 'Notes'],
}

const CHART_TYPES = ['None', 'Line', 'Bar', 'Pie', 'Donut', 'Area', 'Funnel', 'KPI Cards']

const OPERATORS = ['equals', 'not equals', 'contains', 'greater than', 'less than', 'is empty', 'is not empty']

const MOCK_ROWS = [
  { ID: 'C-1001', Name: 'Maria Lopez', Email: 'maria@email.com', Source: 'LinkedIn', Stage: 'Interview', Status: 'Active' },
  { ID: 'C-1002', Name: 'Thomas Reed', Email: 'thomas@email.com', Source: 'Job Boards', Stage: 'Submitted', Status: 'Active' },
  { ID: 'C-1003', Name: 'Priya Singh', Email: 'priya@email.com', Source: 'Referral', Stage: 'Offer', Status: 'Active' },
  { ID: 'C-1004', Name: 'James Carter', Email: 'james@email.com', Source: 'Direct', Stage: 'Rejected', Status: 'Inactive' },
  { ID: 'C-1005', Name: 'Susan Kim', Email: 'susan@email.com', Source: 'LinkedIn', Stage: 'Submitted', Status: 'Active' },
]

interface Filter { field: string; operator: string; value: string }

export default function ReportBuilder() {
  const [source, setSource] = useState('Candidates')
  const [selected, setSelected] = useState<string[]>(['ID', 'Name', 'Email', 'Source', 'Stage', 'Status'])
  const [filters, setFilters] = useState<Filter[]>([])
  const [groupBy, setGroupBy] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [sortDir, setSortDir] = useState('ASC')
  const [chartType, setChartType] = useState('None')

  const cols = DATA_SOURCES[source] ?? []

  function toggleCol(col: string) {
    setSelected((prev) => prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col])
  }

  function addFilter() {
    setFilters((prev) => [...prev, { field: cols[0] ?? '', operator: 'equals', value: '' }])
  }

  function updateFilter(i: number, patch: Partial<Filter>) {
    setFilters((prev) => prev.map((f, idx) => idx === i ? { ...f, ...patch } : f))
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Panel */}
      <div className="w-64 shrink-0 border-r bg-background flex flex-col overflow-y-auto">
        <div className="p-3 border-b">
          <p className="text-xs font-semibold mb-2">Data Source</p>
          <div className="flex flex-col gap-0.5">
            {Object.keys(DATA_SOURCES).map((s) => (
              <label key={s} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer text-xs">
                <input type="radio" name="source" value={s} checked={source === s} onChange={() => { setSource(s); setSelected([]) }} className="size-3" />
                {s}
              </label>
            ))}
          </div>
        </div>
        <div className="p-3 flex-1">
          <p className="text-xs font-semibold mb-2">Available Columns</p>
          <div className="flex flex-col gap-0.5">
            {cols.map((col) => (
              <label key={col} className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted cursor-pointer text-xs">
                <input type="checkbox" checked={selected.includes(col)} onChange={() => toggleCol(col)} className="size-3" />
                {col}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Center Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b bg-background shrink-0">
          <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs">
            <Save className="size-3" />Save
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs">
            <CalendarClock className="size-3" />Schedule
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs">
            <Download className="size-3" />Export
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {/* Selected Columns */}
          <div>
            <p className="text-xs font-semibold mb-2">Selected Columns</p>
            {selected.length === 0 ? (
              <p className="text-xs text-muted-foreground">No columns selected — check columns from the left panel</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {selected.map((col) => (
                  <span key={col} className="flex items-center gap-1 px-2.5 py-1 text-xs bg-accent rounded-md border cursor-grab">
                    {col}
                    <button onClick={() => toggleCol(col)}><X className="size-2.5 text-muted-foreground hover:text-foreground" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Filters */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold">Filters</p>
              <button onClick={addFilter} className="flex items-center gap-1 h-6 px-2 text-[10px] border rounded hover:bg-muted transition-colors">
                <Plus className="size-2.5" />Add Filter
              </button>
            </div>
            {filters.map((f, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <select className="h-7 text-xs border rounded-md px-1.5 bg-background" value={f.field} onChange={(e) => updateFilter(i, { field: e.target.value })}>
                  {cols.map((c) => <option key={c}>{c}</option>)}
                </select>
                <select className="h-7 text-xs border rounded-md px-1.5 bg-background" value={f.operator} onChange={(e) => updateFilter(i, { operator: e.target.value })}>
                  {OPERATORS.map((o) => <option key={o}>{o}</option>)}
                </select>
                <input className="flex-1 h-7 px-2 text-xs border rounded-md bg-background" value={f.value} onChange={(e) => updateFilter(i, { value: e.target.value })} placeholder="Value" />
                <button onClick={() => setFilters((prev) => prev.filter((_, idx) => idx !== i))}><X className="size-3.5 text-muted-foreground" /></button>
              </div>
            ))}
          </div>

          {/* Group By / Sort By */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium whitespace-nowrap">Group By</p>
              <select className="h-7 text-xs border rounded-md px-1.5 bg-background" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                <option value="">None</option>
                {cols.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium whitespace-nowrap">Sort By</p>
              <select className="h-7 text-xs border rounded-md px-1.5 bg-background" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="">None</option>
                {cols.map((c) => <option key={c}>{c}</option>)}
              </select>
              <select className="h-7 text-xs border rounded-md px-1.5 bg-background" value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
                <option>ASC</option>
                <option>DESC</option>
              </select>
            </div>
          </div>

          {/* Preview Table */}
          <div>
            <p className="text-xs font-semibold mb-2">Preview (5 rows)</p>
            {selected.length === 0 ? (
              <div className="h-24 rounded-lg border bg-muted/30 flex items-center justify-center text-xs text-muted-foreground">Select columns to preview data</div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-muted-foreground border-b bg-muted/30">
                      {selected.map((col) => (
                        <th key={col} className="py-2 px-3 text-left font-medium whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_ROWS.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                        {selected.map((col) => (
                          <td key={col} className="py-2 px-3 text-muted-foreground whitespace-nowrap">
                            {(row as Record<string, string>)[col] ?? '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-56 shrink-0 border-l bg-background flex flex-col overflow-y-auto p-3 gap-4">
        <div>
          <p className="text-xs font-semibold mb-2">Chart Type</p>
          <div className="grid grid-cols-2 gap-1">
            {CHART_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                className={`h-8 text-xs rounded-md border transition-colors ${chartType === t ? 'bg-accent text-accent-foreground border-brand/40 font-medium' : 'hover:bg-muted text-muted-foreground'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {chartType !== 'None' && (
          <div>
            <p className="text-xs font-semibold mb-2">Preview</p>
            <div className="h-32 rounded-lg border bg-muted/40 flex items-center justify-center text-[10px] text-muted-foreground text-center px-2">
              {chartType} chart preview coming soon
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
