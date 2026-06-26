'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { label: 'Dashboard',         href: '/dashboard/agents' },
  { label: 'My Agents',         href: '/dashboard/agents/my-agents' },
  { label: 'Templates',         href: '/dashboard/agents/templates' },
  { label: 'Marketplace',       href: '/dashboard/agents/marketplace' },
  { label: 'Execution History', href: '/dashboard/agents/history' },
  { label: 'Analytics',         href: '/dashboard/agents/analytics' },
  { label: 'Settings',          href: '/dashboard/agents/settings' },
]

function AgentSubNav() {
  const pathname = usePathname()
  return (
    <div className="flex items-center gap-1 px-6 py-2 border-b bg-background shrink-0 overflow-x-auto">
      {TABS.map(t => {
        const active = t.href === '/dashboard/agents'
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

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AgentSubNav />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
