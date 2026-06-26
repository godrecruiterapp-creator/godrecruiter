'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, UserCheck, Briefcase, Users, Send, Building2,
  UsersRound, ShieldCheck, DollarSign, Crown, Bookmark, CalendarClock,
  Layers, PenSquare, LayoutTemplate, Download, Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const GROUPS = [
  {
    label: 'Overview',
    links: [
      { label: 'Dashboard', href: '/dashboard/reports', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'By Category',
    links: [
      { label: 'Recruiter', href: '/dashboard/reports/recruiter', icon: UserCheck },
      { label: 'Job', href: '/dashboard/reports/job', icon: Briefcase },
      { label: 'Candidate', href: '/dashboard/reports/candidate', icon: Users },
      { label: 'Submission', href: '/dashboard/reports/submission', icon: Send },
      { label: 'Client', href: '/dashboard/reports/client', icon: Building2 },
      { label: 'Team', href: '/dashboard/reports/team', icon: UsersRound },
      { label: 'Compliance', href: '/dashboard/reports/compliance', icon: ShieldCheck },
      { label: 'Financial', href: '/dashboard/reports/financial', icon: DollarSign },
      { label: 'Executive', href: '/dashboard/reports/executive', icon: Crown },
    ],
  },
  {
    label: 'Saved & Scheduled',
    links: [
      { label: 'Saved Reports', href: '/dashboard/reports/saved', icon: Bookmark },
      { label: 'Scheduled Reports', href: '/dashboard/reports/scheduled', icon: CalendarClock },
    ],
  },
  {
    label: 'Build',
    links: [
      { label: 'Custom Reports', href: '/dashboard/reports/custom', icon: Layers },
      { label: 'Report Builder', href: '/dashboard/reports/builder', icon: PenSquare },
      { label: 'Templates', href: '/dashboard/reports/templates', icon: LayoutTemplate },
    ],
  },
  {
    label: 'More',
    links: [
      { label: 'Export History', href: '/dashboard/reports/exports', icon: Download },
      { label: 'Settings', href: '/dashboard/reports/settings', icon: Settings },
    ],
  },
]

export function ReportsNav() {
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
