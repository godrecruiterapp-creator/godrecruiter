export const revalidate = 30

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, ChevronRight, Briefcase } from 'lucide-react'

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft:     { label: 'Draft',     variant: 'secondary' },
  published: { label: 'Published', variant: 'default' },
  paused:    { label: 'Paused',    variant: 'outline' },
  closed:    { label: 'Closed',    variant: 'destructive' },
}

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  let jobs: Record<string, string | null>[] = []
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
        .select('*')
        .eq('tenant_id', membership.tenant_id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      jobs = data ?? []
    }
  } catch (err) {
    console.error('Jobs fetch error:', err)
  }

  return (
    <div className="space-y-5">
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
          <div className="divide-y">
            {jobs.map((job) => {
              const badge = STATUS_BADGE[job.status ?? ''] ?? STATUS_BADGE['draft']!
              const meta = [job.department, job.location, job.work_mode?.replace('_', ' ')].filter(Boolean).join(' · ')
              return (
                <Link
                  key={job.id}
                  href={`/dashboard/jobs/${job.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{job.title}</p>
                    {meta && <p className="text-xs text-muted-foreground mt-0.5">{meta}</p>}
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                  </div>
                </Link>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
