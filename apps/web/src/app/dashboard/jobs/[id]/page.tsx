import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { deleteJobAction, updateJobStatusAction } from '../actions'

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

  const statusColor: Record<string, string> = {
    draft: 'var(--text-tertiary)', published: 'var(--status-success)',
    paused: 'var(--status-warning)', closed: 'var(--status-danger)',
  }
  const statusBg: Record<string, string> = {
    draft: 'var(--bg-subtle)', published: '#dcfce7', paused: '#fef9c3', closed: '#fee2e2',
  }

  const salary = job.salary_min || job.salary_max
    ? `${job.salary_currency ?? 'USD'} ${job.salary_min ? `$${(job.salary_min / 100).toLocaleString()}` : ''}${job.salary_min && job.salary_max ? ' – ' : ''}${job.salary_max ? `$${(job.salary_max / 100).toLocaleString()}` : ''}`
    : null

  return (
    <div style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Back + actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/dashboard/jobs" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
          ← Back to jobs
        </Link>
        <div style={{ display: 'flex', gap: '8px' }}>
          {job.status !== 'published' && (
            <form action={async () => { 'use server'; await updateJobStatusAction(id, 'published') }}>
              <button type="submit" style={btnStyle('var(--status-success)', '#fff')}>Publish</button>
            </form>
          )}
          {job.status === 'published' && (
            <form action={async () => { 'use server'; await updateJobStatusAction(id, 'paused') }}>
              <button type="submit" style={btnStyle('var(--bg-subtle)', 'var(--text-primary)', true)}>Pause</button>
            </form>
          )}
          <form action={async () => { 'use server'; await deleteJobAction(id) }}>
            <button type="submit" style={btnStyle('#fee2e2', 'var(--status-danger)')}>Delete</button>
          </form>
        </div>
      </div>

      {/* Header card */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-default)',
        borderRadius: '10px', padding: '24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{job.title}</h1>
          <span style={{
            padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
            background: statusBg[job.status] ?? 'var(--bg-subtle)',
            color: statusColor[job.status] ?? 'var(--text-tertiary)',
            textTransform: 'capitalize',
          }}>{job.status}</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {[
            job.department,
            job.location,
            workModeLabel[job.work_mode],
            jobTypeLabel[job.job_type],
            salary,
            job.openings > 1 ? `${job.openings} openings` : '1 opening',
          ].filter(Boolean).map((val) => (
            <span key={val} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{val}</span>
          ))}
        </div>
      </div>

      {/* Description */}
      {job.description && (
        <Section title="Description">
          <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
            {job.description}
          </p>
        </Section>
      )}

      {/* Requirements */}
      {job.requirements && (
        <Section title="Requirements">
          <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
            {job.requirements}
          </p>
        </Section>
      )}

    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
        {title}
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  )
}

function btnStyle(bg: string, color: string, bordered = false): React.CSSProperties {
  return {
    padding: '7px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
    background: bg, color, border: bordered ? '1px solid var(--border-default)' : 'none', cursor: 'pointer',
  }
}
