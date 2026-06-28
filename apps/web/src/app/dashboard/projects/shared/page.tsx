'use client'

import Link from 'next/link'
import { FolderKanban, Users } from 'lucide-react'
import { PROJECTS } from '../_data'
import { cn } from '@/lib/utils'

const SHARED = PROJECTS.filter(p => p.visibility !== 'private' && p.owner !== 'Arun Kumar')

const STATUS_CFG = {
  active:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  paused:    'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  archived:  'bg-muted text-muted-foreground border-border',
}

export default function SharedProjectsPage() {
  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto">
      <div className="mb-4">
        <h1 className="text-base font-semibold">Shared Projects</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Projects your teammates have shared with you.</p>
      </div>
      {SHARED.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <FolderKanban className="size-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No shared projects</p>
          <p className="text-xs text-muted-foreground mt-1">When teammates share projects with you, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {SHARED.map(p => (
            <Link key={p.id} href={`/dashboard/projects/${p.id}`}
              className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-background hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{p.name}</p>
                  <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold mt-0.5', STATUS_CFG[p.status])}>{p.status}</span>
                </div>
                <div className="size-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                  {p.owner.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{p.description}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
                <span className="flex items-center gap-1"><Users className="size-3" />{p.candidateCount} candidates</span>
                <span>by {p.owner}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
