'use client'

import { cn } from '@/lib/utils'
import { UserPlus, UserMinus, Mail, Calendar, CheckSquare, StickyNote, Briefcase, RefreshCw, Upload, Bot, Activity } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'

type Event = { time: string; text: string; type: string; actor: string }
const EVENTS: Event[] = []

const EVT_META: Record<string, { icon: React.ComponentType<{className?: string}>; dot: string }> = {
  stage:     { icon: RefreshCw,  dot: 'bg-blue-500' },
  interview: { icon: Calendar,   dot: 'bg-violet-500' },
  ai:        { icon: Bot,        dot: 'bg-purple-400' },
  note:      { icon: StickyNote, dot: 'bg-amber-400' },
  email:     { icon: Mail,       dot: 'bg-pink-400' },
  add:       { icon: UserPlus,   dot: 'bg-emerald-500' },
  remove:    { icon: UserMinus,  dot: 'bg-red-400' },
  job:       { icon: Briefcase,  dot: 'bg-sky-500' },
  task:      { icon: CheckSquare,dot: 'bg-orange-400' },
  upload:    { icon: Upload,     dot: 'bg-teal-400' },
}

export default function ProjectActivityPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto p-5">
      <h2 className="text-sm font-semibold mb-4 shrink-0">Activity Timeline</h2>
      {EVENTS.length === 0 && (
        <EmptyState icon={Activity} title="No activity yet"
          description="Actions on this project — candidates moved, notes added, emails sent — will show up here." />
      )}
      <div className="flex flex-col gap-0">
        {EVENTS.map((e, i) => {
          const meta = EVT_META[e.type] ?? EVT_META.note!
          const Icon = meta!.icon
          return (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={cn('size-7 rounded-full flex items-center justify-center shrink-0', meta.dot)}>
                  <Icon className="size-3.5 text-white" />
                </div>
                {i < EVENTS.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
              </div>
              <div className="pb-4 min-w-0">
                <p className="text-sm text-foreground">{e.text}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{e.actor}</span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="text-[10px] text-muted-foreground">{e.time}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
