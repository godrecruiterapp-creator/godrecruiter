'use client'

import { useState } from 'react'
import { Search, MoreHorizontal, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const SAVED = [
  { name: 'Q2 Recruiter Performance', category: 'Recruiter', created: 'Jun 10, 2026', lastRun: 'Jun 25, 2026', owner: 'Sarah Mitchell' },
  { name: 'Weekly Submission Dashboard', category: 'Submission', created: 'May 28, 2026', lastRun: 'Jun 24, 2026', owner: 'James Patel' },
  { name: 'Active Job Aging Alert', category: 'Job', created: 'May 15, 2026', lastRun: 'Jun 23, 2026', owner: 'Admin' },
  { name: 'Compliance Expiry Watch', category: 'Compliance', created: 'Apr 20, 2026', lastRun: 'Jun 22, 2026', owner: 'Admin' },
  { name: 'Monthly Revenue Summary', category: 'Financial', created: 'Apr 1, 2026', lastRun: 'Jun 1, 2026', owner: 'Admin' },
  { name: 'Candidate Source ROI', category: 'Candidate', created: 'Mar 18, 2026', lastRun: 'Jun 15, 2026', owner: 'Linda Choi' },
  { name: 'Client Pipeline Health', category: 'Client', created: 'Mar 5, 2026', lastRun: 'Jun 18, 2026', owner: 'Marcus Webb' },
  { name: 'Executive Monthly Brief', category: 'Executive', created: 'Feb 1, 2026', lastRun: 'Jun 1, 2026', owner: 'Admin' },
]

function categoryColor(cat: string) {
  const map: Record<string, string> = {
    Recruiter: 'bg-blue-100 text-blue-700',
    Submission: 'bg-violet-100 text-violet-700',
    Job: 'bg-amber-100 text-amber-700',
    Compliance: 'bg-red-100 text-red-700',
    Financial: 'bg-emerald-100 text-emerald-700',
    Candidate: 'bg-orange-100 text-orange-700',
    Client: 'bg-cyan-100 text-cyan-700',
    Executive: 'bg-purple-100 text-purple-700',
  }
  return map[cat] ?? 'bg-muted text-muted-foreground'
}

export default function SavedReports() {
  const [search, setSearch] = useState('')
  const filtered = SAVED.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex flex-col h-full p-6 gap-4 overflow-y-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Saved Reports</h1>
          <p className="text-sm text-muted-foreground">Your bookmarked and saved report views</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5"><Download className="size-3.5" />Export</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <input
          className="h-8 w-full pl-8 pr-3 text-xs border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="Search saved reports..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">No saved reports yet</div>
      ) : (
        <div className="rounded-lg border bg-card">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground border-b">
                <th className="py-3 px-4 text-left font-medium">Report Name</th>
                <th className="py-3 px-4 text-left font-medium">Category</th>
                <th className="py-3 px-4 text-left font-medium">Created</th>
                <th className="py-3 px-4 text-left font-medium">Last Run</th>
                <th className="py-3 px-4 text-left font-medium">Owner</th>
                <th className="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.name} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="py-3 px-4 font-medium">{r.name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${categoryColor(r.category)}`}>{r.category}</span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{r.created}</td>
                  <td className="py-3 px-4 text-muted-foreground">{r.lastRun}</td>
                  <td className="py-3 px-4 text-muted-foreground">{r.owner}</td>
                  <td className="py-3 px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="size-6 rounded flex items-center justify-center hover:bg-muted">
                          <MoreHorizontal className="size-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View</DropdownMenuItem>
                        <DropdownMenuItem>Rename</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem>Share</DropdownMenuItem>
                        <DropdownMenuItem>Schedule</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
