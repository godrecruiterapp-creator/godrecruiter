'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, Briefcase, Users,
  CalendarCheck, BarChart3, ChevronLeft, ChevronRight, Bot, Zap, FolderKanban, ListTodo, UserCheck, Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useSidebarBehavior } from '@/hooks/use-sidebar-behavior'

type NavItem = { label: string; href: string; icon: React.ComponentType<{ className?: string }> } | 'divider'

const NAV: NavItem[] = [
  { label: 'Dashboard',   href: '/dashboard',              icon: LayoutDashboard },
  { label: 'Work Queue',  href: '/dashboard/work-queue',   icon: ListTodo },
  { label: 'Clients',     href: '/dashboard/clients',      icon: Building2 },
  { label: 'Jobs',        href: '/dashboard/jobs',         icon: Briefcase },
  { label: 'Candidates',  href: '/dashboard/candidates',   icon: Users },
  { label: 'Interviews',  href: '/dashboard/interviews',   icon: CalendarCheck },
  { label: 'Placements',  href: '/dashboard/placements',   icon: UserCheck },
  { label: 'Projects',    href: '/dashboard/projects',     icon: FolderKanban },
  { label: 'Reports',     href: '/dashboard/reports',      icon: BarChart3 },
  'divider',
  { label: 'AI Agent Hub',href: '/dashboard/agents',       icon: Bot },
  { label: 'Automation',  href: '/dashboard/automation',   icon: Zap },
]

export function AppSidebar({ serverBehavior }: { serverBehavior?: 'expanded' | 'collapsed' | 'hover' }) {
  const pathname = usePathname()
  const { behavior } = useSidebarBehavior(serverBehavior)
  const [manualCollapsed, setManualCollapsed] = useState(false)
  const [hovered, setHovered] = useState(false)

  // Derive collapsed state from behavior
  const collapsed =
    behavior === 'expanded' ? false :
    behavior === 'collapsed' ? true :
    // hover mode: collapsed unless hovered
    !hovered

  const showToggle = behavior === 'expanded' || behavior === 'collapsed'

  // In hover mode, sidebar is always w-14 in the layout (no page shift).
  // The visual expansion is absolutely positioned on top.
  const isHoverMode = behavior === 'hover'

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'relative flex-shrink-0 h-screen',
          isHoverMode ? 'w-14' : collapsed ? 'w-14' : 'w-56'
        )}
        onMouseEnter={() => isHoverMode && setHovered(true)}
        onMouseLeave={() => isHoverMode && setHovered(false)}
      >
      <div
        className={cn(
          'flex flex-col h-full border-r bg-sidebar overflow-hidden transition-[width] duration-200 ease-linear',
          isHoverMode ? (hovered ? 'w-56 absolute inset-y-0 left-0 z-40 shadow-xl' : 'w-14') : collapsed ? 'w-14' : 'w-56'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-12 border-b px-3 flex-shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-7 rounded-md bg-foreground flex items-center justify-center text-background font-bold text-xs flex-shrink-0">G</div>
              <span className="font-semibold text-base tracking-tight truncate">God Recruiter</span>
            </div>
          )}
          {collapsed && (
            <div className="size-7 rounded-md bg-foreground flex items-center justify-center text-background font-bold text-xs mx-auto">G</div>
          )}
          {!collapsed && showToggle && (
            <button
              onClick={() => setManualCollapsed(true)}
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
              return <div key={`divider-${i}`} className="border-t border-border/60 mx-1 my-1" />
            }
            const { label, href, icon: Icon } = entry
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            const item = (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 rounded-md text-base transition-colors',
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

        {/* Footer — expand toggle (only in collapsed + manual mode) */}
        {collapsed && showToggle && (
          <div className="border-t px-2 py-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setManualCollapsed(false)}
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
      </div>
      </aside>
    </TooltipProvider>
  )
}
