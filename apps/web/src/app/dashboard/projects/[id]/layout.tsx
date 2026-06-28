'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronLeft, Share2, Settings, MoreHorizontal, Users, Briefcase } from 'lucide-react'
import { PROJECTS, PROJECT_FALLBACK } from '../_data'

const TABS = [
  { label: 'Overview',   href: '' },
  { label: 'Candidates', href: '/candidates' },
  { label: 'Jobs',       href: '/jobs' },
  { label: 'Tasks',      href: '/tasks' },
  { label: 'Notes',      href: '/notes' },
  { label: 'Activity',   href: '/activity' },
  { label: 'Documents',  href: '/documents' },
  { label: 'Emails',     href: '/emails' },
  { label: 'Analytics',  href: '/analytics' },
  { label: 'AI',         href: '/ai' },
  { label: 'Settings',   href: '/settings' },
]

const STATUS_CFG = {
  active:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  paused:    'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  archived:  'bg-muted text-muted-foreground border-border',
}

export default function ProjectDetailLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ id: string }>()
  const pathname = usePathname()
  const project = PROJECTS.find(p => p.id === params.id) ?? PROJECT_FALLBACK
  const base = `/dashboard/projects/${params.id}`

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Project header */}
      <div className="border-b bg-background shrink-0">
        <div className="flex items-start justify-between gap-4 px-6 pt-4 pb-3">
          <div className="min-w-0 flex-1">
            <Link href="/dashboard/projects/my-projects"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2">
              <ChevronLeft className="size-3" />Projects
            </Link>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-lg font-semibold">{project.name}</h1>
              <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold', STATUS_CFG[project.status])}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </span>
              <span className="text-xs text-muted-foreground">{project.type}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">{project.description}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-3 text-xs text-muted-foreground border-r pr-3">
              <span className="flex items-center gap-1"><Users className="size-3" />{project.candidateCount} candidates</span>
              <span className="flex items-center gap-1"><Briefcase className="size-3" />{project.openJobs} jobs</span>
            </div>
            <button className="h-8 px-3 flex items-center gap-1.5 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors">
              <Share2 className="size-3.5" />Share
            </button>
            <button className="h-8 px-3 flex items-center gap-1.5 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors">
              <Settings className="size-3.5" />Manage
            </button>
            <button className="size-8 flex items-center justify-center rounded-md border border-border hover:bg-muted/60 transition-colors text-muted-foreground">
              <MoreHorizontal className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex items-center gap-0.5 px-4 overflow-x-auto">
          {TABS.map(t => {
            const href = `${base}${t.href}`
            const active = t.href === '' ? pathname === base : pathname.startsWith(href)
            return (
              <Link key={t.href} href={href}
                className={cn(
                  'px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors',
                  active
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                )}>
                {t.label}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
