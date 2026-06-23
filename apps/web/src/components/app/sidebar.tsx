'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Briefcase, Users, Kanban,
  CalendarCheck, BarChart3, Settings, LogOut,
} from 'lucide-react'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem,
} from '@/components/ui/sidebar'

const NAV = [
  { label: 'Dashboard',   href: '/dashboard',            icon: LayoutDashboard },
  { label: 'Jobs',        href: '/dashboard/jobs',        icon: Briefcase },
  { label: 'Candidates',  href: '/dashboard/candidates',  icon: Users },
  { label: 'Pipeline',    href: '/dashboard/pipeline',    icon: Kanban },
  { label: 'Interviews',  href: '/dashboard/interviews',  icon: CalendarCheck },
  { label: 'Reports',     href: '/dashboard/reports',     icon: BarChart3 },
  { label: 'Settings',    href: '/dashboard/settings',    icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-md bg-foreground flex items-center justify-center text-background font-bold text-xs flex-shrink-0">G</div>
          <span className="font-semibold text-sm tracking-tight">God Recruiter</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map(({ label, href, icon: Icon }) => {
                const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link href={href}>
                        <Icon className="size-4" />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/auth/logout">
                <LogOut className="size-4" />
                <span>Sign out</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
