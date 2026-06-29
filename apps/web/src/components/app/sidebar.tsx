'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, Briefcase, Users,
  CalendarCheck, BarChart3, Settings, ChevronLeft, ChevronRight, Bot, Zap, FolderKanban, ListTodo, UserCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type NavItem = { label: string; href: string; icon: React.ComponentType<{ className?: string }> } | 'divider'

const NAV: NavItem[] = [
  { label: 'Dashboard',   href: '/dashboard',              icon: LayoutDashboard },
  { label: 'Work Queue',  href: '/dashboard/work-queue',   icon: ListTodo },
  { label: 'Jobs',        href: '/dashboard/jobs',         icon: Briefcase },
  { label: 'Candidates',  href: '/dashboard/candidates',   icon: Users },
  { label: 'Interviews',  href: '/dashboard/interviews',   icon: CalendarCheck },
  { label: 'Placements',  href: '/dashboard/placements',   icon: UserCheck },
  { label: 'Projects',    href: '/dashboard/projects',     icon: FolderKanban },
  { label: 'Reports',     href: '/dashboard/reports',      icon: BarChart3 },
  'divider',
  { label: 'AI Agent Hub',href: '/dashboard/agents',       icon: Bot },
  { label: 'Automation',  href: '/dashboard/automation',   icon: Zap },
  'divider',
  { label: 'Settings',    href: '/dashboard/settings',     icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={cn(
        'flex flex-col flex-shrink-0 h-screen border-r bg-sidebar transition-[width] duration-200 ease-linear overflow-hidden',
        collapsed ? 'w-14' : 'w-56'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between h-12 border-b px-3 flex-shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-7 rounded-md bg-foreground flex items-center justify-center text-background font-bold text-xs flex-shrink-0">G</div>
              <span className="font-semibold text-sm tracking-tight truncate">God Recruiter</span>
            </div>
          )}
          {collapsed && (
            <div className="size-7 rounded-md bg-foreground flex items-center justify-center text-background font-bold text-xs mx-auto">G</div>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="flex items-center justify-center size-6 rounded-md text-[#636f7a] hover:text-foreground hover:bg-accent transition-colors flex-shrink-0"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="size-3.5" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {NAV.map((entry, i) => {
            if (entry === 'divider') {
              return <div key={`divider-${i}`} className={cn('border-t border-border/60', collapsed ? 'mx-1 my-1' : 'mx-1 my-1')} />
            }
            const { label, href, icon: Icon } = entry
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            const item = (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 rounded-md text-sm transition-colors',
                  collapsed ? 'justify-center px-0 py-2' : 'px-2.5 py-2',
                  active
                    ? 'bg-[#ededed] text-[#181818] font-semibold'
                    : 'text-[#636f7a] font-medium hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="size-4 flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            )
            if (collapsed) {
              return (
                <Tooltip key={href}>
                  <TooltipTrigger asChild>{item}</TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              )
            }
            return item
          })}
        </nav>

        {/* Footer — collapse toggle only */}
        {collapsed && (
          <div className="border-t px-2 py-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setCollapsed(false)}
                  className="flex items-center justify-center w-full py-2 rounded-md text-[#636f7a] hover:bg-accent hover:text-foreground transition-colors"
                  aria-label="Expand sidebar"
                >
                  <ChevronRight className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand</TooltipContent>
            </Tooltip>
          </div>
        )}
      </aside>
    </TooltipProvider>
  )
}
