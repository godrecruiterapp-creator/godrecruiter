'use client'

import { cn } from '@/lib/utils'
import { UserPlus, UserMinus, Mail, Calendar, CheckSquare, StickyNote, Briefcase, RefreshCw, Upload, Bot } from 'lucide-react'

const EVENTS = [
  { time: 'Today 10:42 AM', text: 'Maria Lopez moved to Submitted',           type: 'stage',     actor: 'Arun Kumar' },
  { time: 'Today 09:30 AM', text: 'Interview scheduled with James Wilson',     type: 'interview', actor: 'Sarah M.' },
  { time: 'Today 08:15 AM', text: 'AI Summary generated for 5 candidates',     type: 'ai',        actor: 'System' },
  { time: 'Yesterday 4:00 PM', text: 'Linda Torres moved to Offer',            type: 'stage',     actor: 'Arun Kumar' },
  { time: 'Yesterday 2:30 PM', text: 'Note added by Sarah M.',                 type: 'note',      actor: 'Sarah M.' },
  { time: 'Yesterday 11:00 AM', text: 'Bulk email sent to 14 candidates',      type: 'email',     actor: 'Arun Kumar' },
  { time: 'Jun 25 3:00 PM',   text: 'Anna Kim added to project',              type: 'add',       actor: 'Emily T.' },
  { time: 'Jun 25 2:15 PM',   text: 'Carlos Rivera added to project',         type: 'add',       actor: 'Emily T.' },
  { time: 'Jun 24 10:00 AM',  text: 'Job #1023 ICU RN linked to project',     type: 'job',       actor: 'Arun Kumar' },
  { time: 'Jun 24 09:00 AM',  text: 'Task "Call top 10 candidates" created',  type: 'task',      actor: 'Arun Kumar' },
  { time: 'Jun 23 4:00 PM',   text: 'Document "Rate Card Q3" uploaded',       type: 'upload',    actor: 'Arun Kumar' },
  { time: 'Jun 22 11:00 AM',  text: 'Raj Patel removed from project',         type: 'remove',    actor: 'Sarah M.' },
]

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
