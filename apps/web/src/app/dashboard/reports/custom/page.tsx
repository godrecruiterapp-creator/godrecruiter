'use client'

import { useState } from 'react'
import { Plus, BarChart3, Edit, Play, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const CUSTOM = [
  { name: 'High-Value Candidate Tracker', desc: 'Candidates with 5+ years experience and active availability', category: 'Candidate', lastRun: 'Jun 25, 2026' },
  { name: 'Hot Jobs Without Submissions', desc: 'Priority jobs with zero submissions in the last 7 days', category: 'Job', lastRun: 'Jun 24, 2026' },
  { name: 'Monthly Client Activity Rollup', desc: 'All client touchpoints and job orders in a given month', category: 'Client', lastRun: 'Jun 1, 2026' },
  { name: 'Recruiter Submission Rate Drop', desc: 'Recruiters whose submission rate fell more than 20% this week', category: 'Recruiter', lastRun: 'Jun 22, 2026' },
]

export default function CustomReports() {
  const [notice, setNotice] = useState(false)

  return (
    <div className="flex flex-col h-full p-6 gap-4 overflow-y-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Custom Reports</h1>
          <p className="text-sm text-muted-foreground">Your user-created custom report views</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setNotice(true)}>
          <Plus className="size-3.5" />
          Create Custom Report
        </Button>
      </div>

      {notice && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 text-blue-800 text-sm px-4 py-3 flex items-center justify-between">
          Use the Report Builder tab to create custom reports.
          <button onClick={() => setNotice(false)} className="text-blue-600 hover:text-blue-800 text-sm underline ml-4">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {CUSTOM.map((r) => (
          <div key={r.name} className="rounded-lg border bg-card p-4 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                <BarChart3 className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{r.name}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{r.desc}</p>
                <span className="inline-block mt-2 px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">{r.category}</span>
                <p className="text-[10px] text-muted-foreground mt-1">Last run: {r.lastRun}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 pt-3 border-t">
              <button className="flex items-center gap-1 h-6 px-2 text-[10px] border rounded hover:bg-muted transition-colors">
                <Edit className="size-2.5" />Edit
              </button>
              <button className="flex items-center gap-1 h-6 px-2 text-[10px] border rounded hover:bg-muted transition-colors">
                <Play className="size-2.5" />Run
              </button>
              <button className="flex items-center gap-1 h-6 px-2 text-[10px] border rounded text-red-600 hover:bg-red-50 transition-colors ml-auto">
                <Trash2 className="size-2.5" />Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
