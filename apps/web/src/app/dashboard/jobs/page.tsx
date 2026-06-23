export const revalidate = 30

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus, Briefcase } from 'lucide-react'

// ── badge configs ────────────────────────────────────────────
const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  open:    { label: 'Open',    className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  on_hold: { label: 'On Hold', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  closed:  { label: 'Closed',  className: 'bg-slate-100 text-slate-600 border-slate-200' },
  filled:  { label: 'Filled',  className: 'bg-blue-50 text-blue-700 border-blue-200' },
}

const PRIORITY_BADGE: Record<string, { label: string; className: string }> = {
  high:   { label: 'High',   className: 'bg-red-50 text-red-700 border-red-200' },
  medium: { label: 'Medium', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  low:    { label: 'Low',    className: 'bg-slate-100 text-slate-500 border-slate-200' },
}

const EMPLOYMENT_LABELS: Record<string, string> = {
  contract:    'Contract',
  full_time:   'Full-Time',
  cth:         'CTH',
  direct_hire: 'Direct Hire',
  remote:      'Remote',
  hybrid:      'Hybrid',
}

function Chip({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${className}`}>
      {label}
    </span>
  )
}

function fmt(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
}

type Job = Record<string, string | number | null>

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  let jobs: Job[] = []
  try {
    const admin = createAdminClient()
    const { data: membership } = await admin
      .from('platform_user_tenants')
      .select('tenant_id')
      .eq('platform_user_id', user.id)
      .eq('is_active', true)
      .single()

    if (membership) {
      const { data } = await admin
        .from('jobs')
        .select('id, display_id, job_number, title, client, city, state, employment_type, status, priority, recruiter_name, openings, created_at, updated_at')
        .eq('tenant_id', membership.tenant_id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      jobs = (data ?? []) as Job[]
    }
  } catch (err) {
    console.error('Jobs fetch error:', err)
  }

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Jobs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard/jobs/new">
            <Plus className="size-3.5 mr-1.5" />
            Post a job
          </Link>
        </Button>
      </div>

      {/* empty state */}
      {jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center">
              <Briefcase className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">No jobs yet</p>
              <p className="text-sm text-muted-foreground mt-1">Post your first job to start receiving applications.</p>
            </div>
            <Button asChild size="sm" className="mt-1">
              <Link href="/dashboard/jobs/new">Post a job</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[90px] whitespace-nowrap">Job ID</TableHead>
                  <TableHead className="min-w-[180px]">Job Title</TableHead>
                  <TableHead className="min-w-[140px]">Client</TableHead>
                  <TableHead className="min-w-[100px]">City</TableHead>
                  <TableHead className="min-w-[100px]">State</TableHead>
                  <TableHead className="min-w-[110px] whitespace-nowrap">Emp. Type</TableHead>
                  <TableHead className="min-w-[90px]">Status</TableHead>
                  <TableHead className="min-w-[90px]">Priority</TableHead>
                  <TableHead className="min-w-[130px]">Recruiter</TableHead>
                  <TableHead className="text-center w-[80px]">Openings</TableHead>
                  <TableHead className="text-center w-[85px]">Submitted</TableHead>
                  <TableHead className="text-center w-[85px]">Interviews</TableHead>
                  <TableHead className="text-center w-[70px]">Offers</TableHead>
                  <TableHead className="min-w-[100px] whitespace-nowrap">Created</TableHead>
                  <TableHead className="min-w-[100px] whitespace-nowrap">Modified</TableHead>
                  <TableHead className="text-center w-[70px]">Aging</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => {
                  const status   = STATUS_BADGE[String(job.status ?? 'open')] ?? STATUS_BADGE['open']!
                  const priority = PRIORITY_BADGE[String(job.priority ?? 'medium')] ?? PRIORITY_BADGE['medium']!
                  const empType  = EMPLOYMENT_LABELS[String(job.employment_type ?? '')] ?? '—'
                  const jobIdShort = String(job.display_id ?? job.id ?? '').slice(-8).toUpperCase()
                  const aging = job.created_at
                    ? Math.floor((Date.now() - new Date(String(job.created_at)).getTime()) / 86_400_000)
                    : null

                  return (
                    <TableRow key={String(job.id)} className="group cursor-pointer hover:bg-muted/30">
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        <Link href={`/dashboard/jobs/${job.id}`} className="hover:text-foreground hover:underline">
                          {job.display_id ? String(job.display_id) : `…${jobIdShort}`}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/dashboard/jobs/${job.id}`} className="hover:underline line-clamp-1">
                          {String(job.title ?? '—')}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{String(job.client ?? '—')}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{String(job.city ?? '—')}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{String(job.state ?? '—')}</TableCell>
                      <TableCell><span className="text-xs text-muted-foreground">{empType}</span></TableCell>
                      <TableCell><Chip label={status.label} className={status.className} /></TableCell>
                      <TableCell><Chip label={priority.label} className={priority.className} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{String(job.recruiter_name ?? '—')}</TableCell>
                      <TableCell className="text-center text-sm">{String(job.openings ?? 1)}</TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">0</TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">0</TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">0</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmt(String(job.created_at ?? ''))}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmt(String(job.updated_at ?? ''))}</TableCell>
                      <TableCell className="text-center text-sm">
                        {aging !== null ? (
                          <span className={aging > 30 ? 'text-red-600 font-medium' : aging > 14 ? 'text-amber-600' : 'text-muted-foreground'}>
                            {aging}d
                          </span>
                        ) : '—'}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  )
}
