import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { JobDetailClient } from './job-detail-client'
import { BreadcrumbTitle } from '@/components/app/breadcrumb-provider'

function toInitials(name: string) {
  return name.split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2) || '??'
}

function relTime(iso: string) {
  const d = Date.now() - new Date(iso).getTime()
  if (d < 60_000) return 'Just now'
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatSize(bytes: number) {
  return bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const [
    { data: job },
    { data: rawNotes },
    { data: rawDocs },
    { data: rawActivity },
  ] = await Promise.all([
    admin.from('jobs')
      .select('id, display_id, title, client, city, state, employment_type, work_mode, client_type, status, priority, recruiter_name, openings, department, description, requirements, salary_min, salary_max, created_at, updated_at')
      .eq('id', id).is('deleted_at', null).single(),
    admin.from('job_notes')
      .select('id, author_name, text, created_at')
      .eq('job_id', id).order('created_at', { ascending: false }),
    admin.from('job_documents')
      .select('id, name, size, file_type, storage_path, uploader_name, created_at')
      .eq('job_id', id).order('created_at', { ascending: false }),
    admin.from('job_activity')
      .select('id, actor_name, action, created_at')
      .eq('job_id', id).order('created_at', { ascending: false }).limit(50),
  ])

  if (!job) notFound()

  const initialNotes = (rawNotes ?? []).map(n => ({
    id: n.id,
    author: n.author_name,
    initials: toInitials(n.author_name),
    text: n.text,
    time: relTime(n.created_at),
  }))

  const initialDocs = (rawDocs ?? []).map(d => ({
    id: d.id,
    name: d.name,
    size: d.size ? formatSize(d.size) : '—',
    type: d.name.split('.').pop() ?? 'file',
    uploadedAt: new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  }))

  const initialActivity = (rawActivity ?? []).map(a => ({
    id: a.id,
    actor: a.actor_name,
    action: a.action,
    time: relTime(a.created_at),
  }))

  return (
    <>
    <BreadcrumbTitle title={`${job.display_id} · ${job.title}`} />
    <JobDetailClient
      job={job}
      initialNotes={initialNotes}
      initialDocs={initialDocs}
      initialActivity={initialActivity}
    />
    </>
  )
}
