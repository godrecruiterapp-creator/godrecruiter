'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CalendarCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScheduleWizard } from '../schedule-wizard'

type ViewMode = 'month' | 'week' | 'day' | 'agenda'

// June 2026 calendar data
const DAYS_IN_JUNE = 30
const JUNE_STARTS_ON = 0 // Monday (0=Mon...6=Sun)

type Event = { date: number; month: 'prev' | 'curr' | 'next'; label: string; color: string }

const EVENTS: Record<number, { label: string; color: string }[]> = {
  27: [
    { label: '9AM Robert Kim', color: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' },
    { label: '9:30AM Sandra Davis', color: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300' },
    { label: '3:30PM Lisa Thompson', color: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' },
  ],
  28: [
    { label: '10AM Sarah Johnson', color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300' },
    { label: '2PM James Martinez', color: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300' },
  ],
  29: [
    { label: '11AM Emily Chen', color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300' },
  ],
  30: [
    { label: '1PM David Park', color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300' },
  ],
}

// July events shown in last row
const JULY_EVENTS: Record<number, { label: string; color: string }[]> = {
  1: [{ label: '11:30AM Amy Wilson', color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300' }],
  2: [{ label: '4PM Chris Lee', color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300' }],
  3: [{ label: '10AM Tom Anderson', color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300' }],
}

const VIEW_MODES: ViewMode[] = ['Day', 'Week', 'Month', 'Agenda'] as unknown as ViewMode[]
const VIEW_LABELS = ['Day', 'Week', 'Month', 'Agenda']

// Build 6-week grid for June 2026
// June 1 = Monday (col 0)
function buildGrid() {
  const cells: { day: number; month: 'prev' | 'curr' | 'next' }[] = []
  // May 2026: 31 days. June starts on Mon. So no prev-month days needed (starts on col 0)
  // But let's handle generically: June 1 2026 = Monday
  for (let d = 1; d <= 30; d++) cells.push({ day: d, month: 'curr' })
  // Fill remaining to 42 (6 rows × 7 cols)
  let july = 1
  while (cells.length < 42) { cells.push({ day: july++, month: 'next' }) }
  return cells
}

const GRID = buildGrid()
const TODAY = 27 // June 27 2026

const LEGEND = [
  { label: 'Scheduled', color: 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700' },
  { label: 'Confirmed', color: 'bg-emerald-100 dark:bg-emerald-900 border-emerald-300 dark:border-emerald-700' },
  { label: 'Completed', color: 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600' },
  { label: 'Rescheduled', color: 'bg-amber-100 dark:bg-amber-900 border-amber-300 dark:border-amber-700' },
  { label: 'Cancelled', color: 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700' },
]

export default function CalendarPage() {
  const [view, setView] = useState<'Day' | 'Week' | 'Month' | 'Agenda'>('Month')
  const [wizardOpen, setWizardOpen] = useState(false)

  return (
    <div className="flex flex-col h-full p-6 gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-semibold">Interview Calendar</h1>
          <p className="text-sm text-muted-foreground">June 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md overflow-hidden">
            {VIEW_LABELS.map(v => (
              <button key={v} onClick={() => setView(v as typeof view)}
                className={`h-8 px-3 text-xs transition-colors ${view === v ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-muted'}`}>
                {v}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => setWizardOpen(true)}>
            <CalendarCheck className="size-3.5 mr-1.5" />Schedule Interview
          </Button>
        </div>
      </div>

      {view !== 'Month' && (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground border rounded-lg bg-muted/20">
          Switch to Month view for full calendar
        </div>
      )}

      {view === 'Month' && (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden border rounded-lg">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b shrink-0">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 flex-1 overflow-y-auto" style={{ gridTemplateRows: 'repeat(6, minmax(90px, 1fr))' }}>
            {GRID.map((cell, i) => {
              const isToday = cell.month === 'curr' && cell.day === TODAY
              const isOtherMonth = cell.month !== 'curr'
              const events = cell.month === 'curr'
                ? (EVENTS[cell.day] ?? [])
                : cell.month === 'next'
                ? (JULY_EVENTS[cell.day] ?? [])
                : []

              return (
                <div key={i}
                  className={cn(
                    'border border-border p-1.5 min-h-[90px] flex flex-col gap-1',
                    isToday && 'bg-brand-muted/40',
                    isOtherMonth && 'bg-muted/20'
                  )}>
                  <span className={cn(
                    'text-xs self-end font-medium',
                    isToday ? 'size-5 flex items-center justify-center rounded-full bg-brand text-white' : '',
                    isOtherMonth && 'text-muted-foreground/50'
                  )}>
                    {cell.day}
                  </span>
                  {events.slice(0, 3).map((ev, ei) => (
                    <div key={ei}
                      className={`text-[10px] px-1.5 py-0.5 rounded truncate ${ev.color}`}>
                      {ev.label}
                    </div>
                  ))}
                  {events.length > 3 && (
                    <span className="text-[10px] text-muted-foreground px-1">+{events.length - 3} more</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      {view === 'Month' && (
        <div className="flex items-center gap-4 shrink-0">
          {LEGEND.map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={`size-3 rounded border ${l.color}`} />
              <span className="text-xs text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      )}

      <ScheduleWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  )
}
