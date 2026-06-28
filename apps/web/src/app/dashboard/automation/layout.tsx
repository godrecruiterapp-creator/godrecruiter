'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { label: 'My Automations', href: '/dashboard/automation' },
  { label: 'Templates',      href: '/dashboard/automation/templates' },
  { label: 'Activity',       href: '/dashboard/automation/activity' },
  { label: 'History',        href: '/dashboard/automation/history' },
]

function AutomationSubNav() {
  const pathname = usePathname()
  return (
    <div className="flex items-center gap-1 px-6 py-2 border-b bg-background shrink-0 overflow-x-auto">
      {TABS.map(t => {
        const active = t.href === '/dashboard/automation'
          ? pathname === t.href
          : pathname.startsWith(t.href)
        return (
          <Link key={t.href} href={t.href}
            className={cn(
              'h-8 px-3 flex items-center text-xs font-medium rounded-md transition-colors whitespace-nowrap',
              active
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}>
            {t.label}
          </Link>
        )
      })}
    </div>
  )
}

export default function AutomationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AutomationSubNav />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
