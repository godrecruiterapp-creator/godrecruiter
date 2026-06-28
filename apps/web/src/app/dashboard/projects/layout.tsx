'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { label: 'My Projects',      href: '/dashboard/projects/my-projects' },
  { label: 'Shared Projects',  href: '/dashboard/projects/shared' },
  { label: 'Templates',        href: '/dashboard/projects/templates' },
  { label: 'Archived',         href: '/dashboard/projects/archived' },
]

function ProjectsSubNav() {
  const pathname = usePathname()
  // hide the sub-nav when inside a project detail
  const isDetail = /\/dashboard\/projects\/[^/]+\//.test(pathname) || /\/dashboard\/projects\/[^/]+$/.test(pathname) && !TABS.some(t => pathname.startsWith(t.href))
  if (isDetail) return null
  return (
    <div className="flex items-center gap-1 px-6 py-2 border-b bg-background shrink-0 overflow-x-auto">
      {TABS.map(t => {
        const active = pathname.startsWith(t.href)
        return (
          <Link key={t.href} href={t.href}
            className={cn(
              'h-8 px-3 flex items-center text-xs font-medium rounded-md transition-colors whitespace-nowrap',
              active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}>
            {t.label}
          </Link>
        )
      })}
    </div>
  )
}

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ProjectsSubNav />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
