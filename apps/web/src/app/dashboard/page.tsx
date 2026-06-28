import Link from 'next/link'
import { Briefcase, Users, CalendarCheck, Clock, Plus, UserPlus } from 'lucide-react'

export const revalidate = 60

const STATS = [
  { label: 'Active Jobs',      value: '0', sub: 'No jobs posted yet',   icon: Briefcase,    href: '/dashboard/jobs' },
  { label: 'Total Candidates', value: '0', sub: 'No candidates yet',    icon: Users,        href: '/dashboard/candidates' },
  { label: 'Interviews Today', value: '0', sub: 'Nothing scheduled',    icon: CalendarCheck,href: '/dashboard/interviews' },
  { label: 'Offers Pending',   value: '0', sub: 'All clear',            icon: Clock,        href: '/dashboard/jobs' },
]

const QUICK_ACTIONS = [
  { label: 'Post a job',      href: '/dashboard/jobs/new',        icon: Plus },
  { label: 'Add candidate',   href: '/dashboard/candidates/new',  icon: UserPlus },
]

export default function DashboardPage() {
  return (
    <div className="px-8 py-8 overflow-y-auto h-full">
      <div className="mb-8">
        <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Here&apos;s a summary of your workspace.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {STATS.map(({ label, value, sub, icon: Icon, href }) => (
          <Link key={label} href={href}
            className="rounded-xl border border-border bg-background p-5 hover:border-foreground/20 hover:shadow-sm transition-all group">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
              <Icon className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Get started */}
      <div className="rounded-xl border border-border bg-background p-6">
        <h2 className="text-sm font-semibold mb-1">Get started</h2>
        <p className="text-xs text-muted-foreground mb-4">Your workspace is ready. Post your first job to start receiving applications.</p>
        <div className="flex items-center gap-2">
          {QUICK_ACTIONS.map(({ label, href, icon: Icon }) => (
            <Link key={label} href={href}
              className="h-8 px-3 text-xs rounded-lg border border-border hover:bg-muted/60 transition-colors flex items-center gap-1.5 font-medium first:bg-foreground first:text-background first:border-foreground first:hover:bg-foreground/90">
              <Icon className="size-3.5" />{label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
