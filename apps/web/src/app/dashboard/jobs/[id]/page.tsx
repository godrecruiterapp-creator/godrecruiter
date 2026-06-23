import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { deleteJobAction, updateJobStatusAction } from '../actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Pencil } from 'lucide-react'

const STATUS_CHIP: Record<string, { label: string; className: string }> = {
  open:    { label: 'Open',    className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  on_hold: { label: 'On Hold', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  closed:  { label: 'Closed',  className: 'bg-slate-100 text-slate-600 border-slate-200' },
  filled:  { label: 'Filled',  className: 'bg-blue-50 text-blue-700 border-blue-200' },
}
const PRIORITY_CHIP: Record<string, { label: string; className: string }> = {
  high:   { label: 'High',   className: 'bg-red-50 text-red-700 border-red-200' },
  medium: { label: 'Medium', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  low:    { label: 'Low',    className: 'bg-slate-100 text-slate-500 border-slate-200' },
}
const EMP_LABELS: Record<string, string> = {
  contract: 'Contract', full_time: 'Full-Time', cth: 'CTH',
  direct_hire: 'Direct Hire', remote: 'Remote', hybrid: 'Hybrid',
}
const WORK_MODE_LABELS: Record<string, string> = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site' }

function Chip({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-muted-foreground w-36 shrink-0">{label}</span>
      <span className="text-foreground">{String(value)}</span>
    </div>
  )
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const { data: job } = await admin
    .from('jobs')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!job) notFound()

  const status   = STATUS_CHIP[job.status as string]   ?? STATUS_CHIP['open']!
  const priority = PRIORITY_CHIP[job.priority as string] ?? PRIORITY_CHIP['medium']!

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/jobs">
            <ArrowLeft className="size-3.5 mr-1.5" />
            Back
          </Link>
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/jobs/${id}/edit`}>
              <Pencil className="size-3.5 mr-1.5" />
              Edit
            </Link>
          </Button>

          {job.status === 'on_hold' || job.status === 'closed' ? (
            <form action={async () => { 'use server'; await updateJobStatusAction(id, 'open') }}>
              <Button type="submit" size="sm">Reopen</Button>
            </form>
          ) : job.status === 'open' ? (
            <form action={async () => { 'use server'; await updateJobStatusAction(id, 'on_hold') }}>
              <Button type="submit" variant="outline" size="sm">Put on Hold</Button>
            </form>
          ) : null}

          {job.status !== 'filled' && (
            <form action={async () => { 'use server'; await updateJobStatusAction(id, 'filled') }}>
              <Button type="submit" variant="outline" size="sm">Mark Filled</Button>
            </form>
          )}

          <form action={async () => { 'use server'; await deleteJobAction(id) }}>
            <Button type="submit" variant="destructive" size="sm">Delete</Button>
          </form>
        </div>
      </div>

      {/* title + meta */}
      <Card>
        <CardContent className="pt-5 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {job.display_id && (
                  <span className="text-xs font-medium text-muted-foreground">{job.display_id}</span>
                )}
              </div>
              <h1 className="text-lg font-semibold tracking-tight">{job.title}</h1>
              {job.client && <p className="text-sm text-muted-foreground mt-0.5">{job.client}</p>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Chip label={status.label} className={status.className} />
              <Chip label={priority.label} className={priority.className} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {job.city        && <span className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-md">{job.city}{job.state ? `, ${job.state}` : ''}</span>}
            {job.employment_type && <span className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-md">{EMP_LABELS[job.employment_type as string] ?? job.employment_type}</span>}
            {job.work_mode   && <span className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-md">{WORK_MODE_LABELS[job.work_mode as string] ?? job.work_mode}</span>}
            {job.client_type && <span className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-md">{job.client_type === 'vms' ? 'VMS' : 'Direct Client'}</span>}
            <span className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-md">
              {job.openings ?? 1} opening{(job.openings ?? 1) > 1 ? 's' : ''}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* details grid */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Details</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <InfoRow label="Recruiter"   value={job.recruiter_name} />
          <InfoRow label="Department"  value={job.department} />
          <InfoRow label="Salary min"  value={job.salary_min  ? `₹${(job.salary_min  / 100).toLocaleString('en-IN')}` : null} />
          <InfoRow label="Salary max"  value={job.salary_max  ? `₹${(job.salary_max  / 100).toLocaleString('en-IN')}` : null} />
          <InfoRow label="Created"     value={job.created_at  ? new Date(job.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null} />
          <InfoRow label="Last updated" value={job.updated_at ? new Date(job.updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null} />
        </CardContent>
      </Card>

      {job.description && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Description</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </CardContent>
        </Card>
      )}

      {job.requirements && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Requirements</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
