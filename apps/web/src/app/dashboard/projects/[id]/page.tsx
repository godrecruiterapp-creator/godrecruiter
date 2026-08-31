'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Users, Briefcase, Send, CalendarCheck, Trophy, XCircle, UserCheck, CheckSquare, Activity, CalendarClock } from 'lucide-react'
import { BreadcrumbTitle } from '@/components/app/breadcrumb-provider'
import { EmptyState } from '@/components/ui/empty-state'
import { PROJECT_FALLBACK } from '../_data'
import { getProjectAction } from '../actions'
import { cn } from '@/lib/utils'

export default function ProjectOverviewPage() {
  const params = useParams<{ id: string }>()
  const [project, setProject] = useState(PROJECT_FALLBACK)
  useEffect(() => {
    if (params.id) getProjectAction(params.id).then(p => { if (p) setProject(p) })
  }, [params.id])

  const healthColor = project.healthScore >= 75 ? 'text-emerald-600' : project.healthScore >= 50 ? 'text-amber-500' : 'text-red-500'
  const healthBg = project.healthScore >= 75 ? 'bg-emerald-500' : project.healthScore >= 50 ? 'bg-amber-400' : 'bg-red-400'

  const KPI = [
    { label: 'Total Candidates', value: project.candidateCount, icon: Users,        color: 'text-foreground' },
    { label: 'New This Week',    value: 0,                       icon: UserCheck,    color: 'text-emerald-600' },
    { label: 'Submitted',        value: 0,                       icon: Send,         color: 'text-blue-600' },
    { label: 'Interviewing',     value: 0,                       icon: CalendarCheck,color: 'text-violet-600' },
    { label: 'Placed',           value: 0,                       icon: Trophy,       color: 'text-amber-600' },
    { label: 'Rejected',         value: 0,                       icon: XCircle,      color: 'text-red-500' },
    { label: 'Open Jobs',        value: project.openJobs,        icon: Briefcase,    color: 'text-foreground' },
    { label: 'Open Tasks',       value: 0,                       icon: CheckSquare,  color: 'text-orange-500' },
  ]

  return (
    <div className="h-full overflow-y-auto p-6">
      <BreadcrumbTitle title={project.name} />
      <div className="max-w-6xl mx-auto space-y-6">

        {/* KPI grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {KPI.map(k => {
            const Icon = k.icon
            return (
              <div key={k.label} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm text-muted-foreground">{k.label}</p>
                  <Icon className={cn('size-4', k.color)} />
                </div>
                <p className="text-2xl font-bold tabular-nums">{k.value}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Activity */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-background p-5">
            <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
            <EmptyState icon={Activity} title="No activity yet"
              description="Actions on this project will show up here." className="py-10" />
          </div>

          <div className="flex flex-col gap-4">
            {/* Project Health */}
            <div className="rounded-xl border border-border bg-background p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Project Health</h3>
                <span className={cn('text-2xl font-bold tabular-nums', healthColor)}>{project.healthScore}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden mb-1">
                <div className={cn('h-2 rounded-full', healthBg)} style={{ width: `${project.healthScore}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground">Health updates as candidates move through the pipeline.</p>
            </div>

            {/* Upcoming Interviews */}
            <div className="rounded-xl border border-border bg-background p-5">
              <h3 className="text-sm font-semibold mb-3">Upcoming Interviews</h3>
              <EmptyState icon={CalendarClock} title="None scheduled"
                description="Scheduled interviews will appear here." className="py-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
