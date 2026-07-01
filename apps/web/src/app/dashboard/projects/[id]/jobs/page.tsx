'use client'

import { Button } from '@/components/ui/button'
import { Plus, Briefcase, MoreHorizontal, ExternalLink } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const JOBS = [
  { id: 'J1023', title: 'ICU RN',              client: 'Houston Methodist',  priority: 'High',   status: 'Open',   openings: 3, submissions: 8,  placements: 1, aiMatch: 94 },
  { id: 'J1024', title: 'ER Nurse',             client: 'Memorial Medical',   priority: 'High',   status: 'Open',   openings: 2, submissions: 5,  placements: 0, aiMatch: 87 },
  { id: 'J1031', title: 'OR Nurse',             client: 'St. Luke\'s',        priority: 'Medium', status: 'Open',   openings: 1, submissions: 3,  placements: 1, aiMatch: 91 },
  { id: 'J1041', title: 'Sr. Java Developer',   client: 'FinCore Inc',        priority: 'High',   status: 'Open',   openings: 2, submissions: 12, placements: 0, aiMatch: 88 },
  { id: 'J1045', title: 'Backend Engineer',     client: 'DataStream',         priority: 'Medium', status: 'Filled', openings: 1, submissions: 9,  placements: 1, aiMatch: 79 },
]

const PRI_CFG: Record<string, string> = {
  High:   'bg-red-50 text-red-700 border-red-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low:    'bg-muted text-muted-foreground border-border',
}

const STA_CFG: Record<string, string> = {
  Open:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  Filled: 'bg-blue-50 text-blue-700 border-blue-200',
  Closed: 'bg-muted text-muted-foreground border-border',
}

export default function ProjectJobsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden p-5">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-sm font-semibold">Linked Jobs</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Jobs linked to this project. Move candidates directly to any listed job.</p>
        </div>
        <Button size="sm" className="h-8 text-sm gap-1.5"><Plus className="size-3.5" />Link Job</Button>
      </div>
      <div className="flex-1 overflow-auto border border-border rounded-lg">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
            <tr className="border-b border-border">
              {['Job', 'Client', 'Priority', 'Status', 'Openings', 'Submissions', 'Placements', 'AI Match', ''].map(h => (
                <th key={h} className="h-9 px-4 text-left align-middle">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {JOBS.map(j => (
              <tr key={j.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="size-3.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">{j.title}</p>
                      <p className="text-[10px] text-muted-foreground">{j.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><span className="text-sm text-muted-foreground">{j.client}</span></td>
                <td className="px-4 py-3"><span className={cn('inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold', PRI_CFG[j.priority])}>{j.priority}</span></td>
                <td className="px-4 py-3"><span className={cn('inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold', STA_CFG[j.status])}>{j.status}</span></td>
                <td className="px-4 py-3"><span className="text-sm font-medium tabular-nums">{j.openings}</span></td>
                <td className="px-4 py-3"><span className="text-sm tabular-nums text-muted-foreground">{j.submissions}</span></td>
                <td className="px-4 py-3"><span className={cn('text-sm font-semibold tabular-nums', j.placements > 0 ? 'text-emerald-600' : 'text-muted-foreground')}>{j.placements}</span></td>
                <td className="px-4 py-3"><span className={cn('text-sm font-bold tabular-nums', j.aiMatch >= 90 ? 'text-emerald-600' : j.aiMatch >= 75 ? 'text-amber-500' : 'text-red-500')}>{j.aiMatch}</span></td>
                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="size-7 flex items-center justify-center rounded-md hover:bg-muted/60 transition-colors">
                        <MoreHorizontal className="size-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem><ExternalLink className="size-3.5 mr-2" />Open Job</DropdownMenuItem>
                      <DropdownMenuItem>Move Candidates to Job</DropdownMenuItem>
                      <DropdownMenuItem>View AI Match</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive">Unlink Job</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
