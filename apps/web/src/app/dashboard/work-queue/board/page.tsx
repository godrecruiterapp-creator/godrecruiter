'use client'

// ponytail: native HTML5 drag-drop; add @dnd-kit if animated reordering is needed
import { useState } from 'react'
import { Clock, Zap, Star } from 'lucide-react'
import { WQ_JOBS, RECRUITERS, type WQJob } from '../_data'
import { cn } from '@/lib/utils'

const PRIORITY_DOT: Record<string, string> = {
  Urgent: 'bg-red-500', High: 'bg-orange-500', Medium: 'bg-blue-500', Low: 'bg-slate-400',
}

function slaColor(h: number) {
  if (h <= 0) return 'text-red-600'
  if (h <= 4) return 'text-amber-600'
  return 'text-muted-foreground'
}

export default function BoardPage() {
  const [jobAssignments, setJobAssignments] = useState<Record<string, string | null>>(
    Object.fromEntries(WQ_JOBS.map(j => [j.id, j.assignedTo]))
  )
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  const columns = [
    { id: 'unassigned', label: 'Unassigned', color: 'bg-amber-500' },
    ...RECRUITERS.map(r => ({ id: r.id, label: r.name, color: 'bg-violet-500', recruiter: r })),
  ]

  function getJobsForColumn(colId: string): WQJob[] {
    if (colId === 'unassigned') {
      return WQ_JOBS.filter(j => !jobAssignments[j.id])
    }
    const recruiter = RECRUITERS.find(r => r.id === colId)
    if (!recruiter) return []
    return WQ_JOBS.filter(j => jobAssignments[j.id] === recruiter.name)
  }

  function handleDrop(colId: string) {
    if (!draggingId) return
    const recruiter = RECRUITERS.find(r => r.id === colId)
    setJobAssignments(prev => ({ ...prev, [draggingId]: recruiter?.name ?? null }))
    setDraggingId(null)
    setDragOver(null)
  }

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="px-4 py-2.5 border-b shrink-0 flex items-center gap-3">
        <p className="text-xs text-muted-foreground">Drag jobs between columns to assign. System logs all assignment history.</p>
        <span className="ml-auto text-xs text-muted-foreground">{WQ_JOBS.length} total jobs</span>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-3 h-full p-4" style={{ minWidth: `${columns.length * 220}px` }}>
          {columns.map(col => {
            const colJobs = getJobsForColumn(col.id)
            const recruiter = 'recruiter' in col ? col.recruiter : null
            const isDragTarget = dragOver === col.id

            return (
              <div
                key={col.id}
                className={cn(
                  'flex flex-col w-52 shrink-0 rounded-xl border border-border bg-muted/20 transition-colors',
                  isDragTarget && 'border-foreground bg-accent/20'
                )}
                onDragOver={e => { e.preventDefault(); setDragOver(col.id) }}
                onDragLeave={() => setDragOver(null)}
                onDrop={() => handleDrop(col.id)}
              >
                {/* column header */}
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/50">
                  <div className={cn('size-2 rounded-full', col.color)} />
                  <span className="text-xs font-semibold flex-1 truncate">{col.label}</span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{colJobs.length}</span>
                </div>

                {/* capacity bar for recruiters */}
                {recruiter && (
                  <div className="px-3 py-2 border-b border-border/30">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                      <span>{recruiter.currentJobs}/{recruiter.maxJobs} assigned</span>
                      <span className={cn(
                        recruiter.availability === 'at_capacity' ? 'text-red-600' :
                        recruiter.availability === 'available' ? 'text-emerald-600' : 'text-amber-600'
                      )}>
                        {recruiter.availability === 'at_capacity' ? 'Full' :
                         recruiter.availability === 'available' ? 'Available' : 'Busy'}
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-border overflow-hidden">
                      <div
                        className={cn('h-1 rounded-full', recruiter.currentJobs >= recruiter.maxJobs ? 'bg-red-500' : recruiter.currentJobs >= recruiter.maxJobs * 0.75 ? 'bg-amber-500' : 'bg-emerald-500')}
                        style={{ width: `${Math.min(100, (recruiter.currentJobs / recruiter.maxJobs) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* jobs */}
                <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
                  {colJobs.length === 0 && (
                    <div className={cn(
                      'flex items-center justify-center h-16 rounded-lg border-2 border-dashed text-[10px] text-muted-foreground transition-colors',
                      isDragTarget ? 'border-foreground text-foreground bg-accent/30' : 'border-border/50'
                    )}>
                      Drop job here
                    </div>
                  )}
                  {colJobs.map(job => (
                    <div
                      key={job.id}
                      draggable
                      onDragStart={() => setDraggingId(job.id)}
                      onDragEnd={() => setDraggingId(null)}
                      className={cn(
                        'rounded-lg border border-border bg-background p-2.5 cursor-grab active:cursor-grabbing select-none transition-all',
                        draggingId === job.id && 'opacity-50 scale-95'
                      )}
                    >
                      <div className="flex items-start gap-1.5 mb-1.5">
                        <div className={cn('size-1.5 rounded-full shrink-0 mt-1', PRIORITY_DOT[job.priority] ?? 'bg-slate-400')} />
                        <p className="text-[11px] font-medium leading-tight flex-1">{job.title}</p>
                        {job.priority === 'Urgent' && <Zap className="size-2.5 text-orange-500 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground">{job.client}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] text-muted-foreground">{job.billRate}</span>
                        <div className={cn('flex items-center gap-0.5 text-[10px]', slaColor(job.slaHoursLeft))}>
                          <Clock className="size-2.5" />
                          {job.slaHoursLeft <= 0 ? 'Overdue' : `${job.slaHoursLeft}h`}
                        </div>
                      </div>
                      {job.aiScore >= 90 && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-600">
                          <Star className="size-2.5 fill-amber-500" />
                          <span>AI Score {job.aiScore}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
