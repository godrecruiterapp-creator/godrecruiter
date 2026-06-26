'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, List, CalendarDays, UserCheck, MessageSquare,
  FileText, BarChart3, Sparkles, Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const GROUPS = [
  {
    label: 'Overview',
    links: [
      { label: 'Dashboard', href: '/dashboard/interviews', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Interviews',
    links: [
      { label: 'All Interviews', href: '/dashboard/interviews/all', icon: List },
      { label: 'Calendar', href: '/dashboard/interviews/calendar', icon: CalendarDays },
      { label: 'My Interviews', href: '/dashboard/interviews/mine', icon: UserCheck },
      { label: 'Pending Feedback', href: '/dashboard/interviews/feedback', icon: MessageSquare },
    ],
  },
  {
    label: 'Resources',
    links: [
      { label: 'Templates', href: '/dashboard/interviews/templates', icon: FileText },
      { label: 'Reports', href: '/dashboard/interviews/reports', icon: BarChart3 },
      { label: 'AI Insights', href: '/dashboard/interviews/ai', icon: Sparkles },
    ],
  },
  {
    label: 'Config',
    links: [
      { label: 'Settings', href: '/dashboard/interviews/settings', icon: Settings },
    ],
  },
]

export function InterviewsNav() {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-0.5 w-48 shrink-0 border-r bg-background py-3 px-2 overflow-y-auto">
      {GROUPS.map((group) => (
        <div key={group.label}>
          <p className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-2 first:mt-0">
            {group.label}
          </p>
          {group.links.map((link) => {
            const active = ('exact' in link && link.exact) ? pathname === link.href : pathname.startsWith(link.href)
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors',
                  active
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="size-3.5 shrink-0" />
                {link.label}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
