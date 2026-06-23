import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, Users, CalendarCheck, Clock } from 'lucide-react'

export const revalidate = 60

const stats = [
  { label: 'Active Jobs',      value: '0', sub: 'No jobs posted yet',  icon: Briefcase },
  { label: 'Total Candidates', value: '0', sub: 'No candidates yet',   icon: Users },
  { label: 'Interviews Today', value: '0', sub: 'Nothing scheduled',   icon: CalendarCheck },
  { label: 'Offers Pending',   value: '0', sub: 'All clear',           icon: Clock },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Here&apos;s a summary of your workspace.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs uppercase tracking-widest font-medium">{label}</CardDescription>
                <Icon className="size-3.5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Get started</CardTitle>
          <CardDescription>Your workspace is ready. Post your first job to start receiving applications.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button asChild size="sm">
              <Link href="/dashboard/jobs/new">Post a job</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/candidates/new">Add candidate</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
