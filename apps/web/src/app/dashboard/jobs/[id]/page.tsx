import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { deleteJobAction, updateJobStatusAction } from '../actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary', published: 'default', paused: 'outline', closed: 'destructive',
}
const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft', published: 'Published', paused: 'Paused', closed: 'Closed',
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

  const workModeLabel: Record<string, string> = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site' }
  const jobTypeLabel: Record<string, string>  = { full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', internship: 'Internship' }

  const chips = [
    job.department, job.location,
    workModeLabel[job.work_mode], jobTypeLabel[job.job_type],
    `${job.openings ?? 1} opening${(job.openings ?? 1) > 1 ? 's' : ''}`,
  ].filter(Boolean)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/jobs">
            <ArrowLeft className="size-3.5 mr-1.5" />
            Back
          </Link>
        </Button>
        <div className="flex gap-2">
          {job.status !== 'published' && (
            <form action={async () => { 'use server'; await updateJobStatusAction(id, 'published') }}>
              <Button type="submit" size="sm">Publish</Button>
            </form>
          )}
          {job.status === 'published' && (
            <form action={async () => { 'use server'; await updateJobStatusAction(id, 'paused') }}>
              <Button type="submit" variant="outline" size="sm">Pause</Button>
            </form>
          )}
          <form action={async () => { 'use server'; await deleteJobAction(id) }}>
            <Button type="submit" variant="destructive" size="sm">Delete</Button>
          </form>
        </div>
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-lg font-semibold tracking-tight">{job.title}</h1>
            <Badge variant={STATUS_BADGE[job.status as string] ?? 'secondary'} className="flex-shrink-0">
              {STATUS_LABEL[job.status as string] ?? 'Draft'}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {chips.map((val) => (
              <span key={String(val)} className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-md">
                {String(val)}
              </span>
            ))}
          </div>
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
