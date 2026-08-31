'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, MoreHorizontal, CheckSquare } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'

type Task = { id: string; title: string; due: string; priority: string; assignee: string; status: string; category: string }
const TASKS: Task[] = []

const PRI_CFG: Record<string, string> = {
  High:   'bg-red-50 text-red-700 border-red-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low:    'bg-muted text-muted-foreground border-border',
}

export default function ProjectTasksPage() {
  const [tasks, setTasks] = useState(TASKS)
  function toggle(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'open' : 'done' } : t))
  }
  const open = tasks.filter(t => t.status !== 'done')
  const done = tasks.filter(t => t.status === 'done')

  return (
    <div className="flex flex-col h-full overflow-hidden p-5">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-sm font-semibold">Tasks</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{open.length} open · {done.length} completed</p>
        </div>
        <Button size="sm" className="h-8 text-sm gap-1.5"><Plus className="size-3.5" />Add Task</Button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1">
        {tasks.length === 0 && (
          <EmptyState icon={CheckSquare} title="No tasks yet"
            description="Add a task to track outreach, reviews, submissions, and follow-ups for this project." />
        )}
        {open.map(t => <TaskRow key={t.id} task={t} onToggle={() => toggle(t.id)} />)}
        {done.length > 0 && (
          <>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pt-4 pb-1 px-1">Completed</p>
            {done.map(t => <TaskRow key={t.id} task={t} onToggle={() => toggle(t.id)} />)}
          </>
        )}
      </div>
    </div>
  )
}

function TaskRow({ task: t, onToggle }: { task: typeof TASKS[0]; onToggle: () => void }) {
  return (
    <div className={cn('flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-muted/30 transition-colors group', t.status === 'done' ? 'opacity-60' : t.status === 'overdue' ? 'border-red-200 bg-red-50/40' : '')}>
      <Checkbox checked={t.status === 'done'} onCheckedChange={onToggle} />
      <div className="flex-1 min-w-0">
        <span className={cn('text-sm', t.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground font-medium')}>{t.title}</span>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[10px] text-muted-foreground">{t.category}</span>
          <span className="text-[10px] text-muted-foreground">·</span>
          <span className="text-[10px] text-muted-foreground">{t.assignee}</span>
        </div>
      </div>
      <span className={cn('text-[10px] font-medium whitespace-nowrap', t.status === 'overdue' ? 'text-red-600' : 'text-muted-foreground')}>{t.due}</span>
      <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold', PRI_CFG[t.priority])}>{t.priority}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="size-7 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted/60 transition-all">
            <MoreHorizontal className="size-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Reassign</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
