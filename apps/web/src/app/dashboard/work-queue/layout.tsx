'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Sparkles, Users2 } from 'lucide-react'

const TABS = [
  { label: 'Overview',       href: '/dashboard/work-queue' },
  { label: 'Queue',          href: '/dashboard/work-queue/queue' },
  { label: 'Board',          href: '/dashboard/work-queue/board' },
  { label: 'Analytics',      href: '/dashboard/work-queue/analytics' },
  { label: 'Recruiter View', href: '/dashboard/work-queue/recruiter' },
]

export default function WorkQueueLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="border-b bg-background shrink-0 px-6 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Work Queue</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Distribute, monitor, and rebalance recruiting work</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-8 px-3 text-xs rounded-lg border border-border hover:bg-muted/60 transition-colors flex items-center gap-1.5">
              <Users2 className="size-3.5" />Bulk Assign
            </button>
            <button className="h-8 px-3 text-xs rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors flex items-center gap-1.5">
              <Sparkles className="size-3.5" />Auto-Assign AI
            </button>
          </div>
        </div>
        <div className="flex items-center gap-0.5 overflow-x-auto">
          {TABS.map(t => {
            const active = t.href === '/dashboard/work-queue'
              ? pathname === t.href
              : pathname.startsWith(t.href)
            return (
              <Link key={t.href} href={t.href}
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
