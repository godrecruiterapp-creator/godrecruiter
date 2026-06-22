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

  const statusMeta: Record<string, { label: string; color: string; bg: string }> = {
    draft:     { label: 'Draft',     color: '#64748B', bg: '#F1F5F9' },
    published: { label: 'Published', color: '#059669', bg: '#DCFCE7' },
    paused:    { label: 'Paused',    color: '#D97706', bg: '#FEF9C3' },
    closed:    { label: 'Closed',    color: '#DC2626', bg: '#FEE2E2' },
  }

  const st = statusMeta[job.status] ?? statusMeta.draft

  const salary = job.salary_min || job.salary_max
    ? `₹${job.salary_min ? (job.salary_min / 1000).toFixed(0) + 'K' : ''}${job.salary_min && job.salary_max ? ' – ' : ''}${job.salary_max ? '₹' + (job.salary_max / 1000).toFixed(0) + 'K' : ''} / year`
    : null

  const chips = [
    job.department,
    job.location,
    workModeLabel[job.work_mode],
    jobTypeLabel[job.job_type],
    salary,
    `${job.openings ?? 1} opening${(job.openings ?? 1) > 1 ? 's' : ''}`,
  ].filter(Boolean)

  return (
    <div style={{ maxWidth: '760px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/dashboard/jobs" style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none',
          padding: '7px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)',
          background: '#fff', boxShadow: 'var(--shadow-sm)', fontWeight: '500',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to jobs
        </Link>
        <div style={{ display: 'flex', gap: '8px' }}>
          {job.status !== 'published' && (
            <form action={async () => { 'use server'; await updateJobStatusAction(id, 'published') }}>
              <button type="submit" style={{
                padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                background: '#059669', color: '#fff', border: 'none', cursor: 'pointer',
              }}>
                Publish
              </button>
            </form>
          )}
          {job.status === 'published' && (
            <form action={async () => { 'use server'; await updateJobStatusAction(id, 'paused') }}>
              <button type="submit" style={{
                padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                background: '#FEF9C3', color: '#92400E', border: '1px solid #FDE68A', cursor: 'pointer',
              }}>
                Pause
              </button>
            </form>
          )}
          <form action={async () => { 'use server'; await deleteJobAction(id) }}>
            <button type="submit" style={{
              padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
              background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', cursor: 'pointer',
            }}>
              Delete
            </button>
          </form>
        </div>
      </div>

      {/* Header card */}
      <div style={{
        background: '#fff',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '28px',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '16px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.025em' }}>
            {job.title}
          </h1>
          <span style={{
            padding: '5px 14px', borderRadius: '20px',
            fontSize: '12px', fontWeight: '600', flexShrink: 0,
            background: st.bg, color: st.color,
          }}>
            {st.label}
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {chips.map((val) => (
            <span key={String(val)} style={{
              fontSize: '13px', color: 'var(--text-secondary)',
              background: 'var(--bg-subtle)', borderRadius: '6px',
              padding: '4px 10px', fontWeight: '500',
            }}>
              {String(val)}
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      {job.description && (
        <Section title="Description">
          <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-wrap' }}>
            {job.description}
          </p>
        </Section>
      )}

      {/* Requirements */}
      {job.requirements && (
        <Section title="Requirements">
          <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-wrap' }}>
            {job.requirements}
          </p>
        </Section>
      )}

    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--border-subtle)',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-card)',
    }}>
      <div style={{
        padding: '16px 22px',
        borderBottom: '1px solid var(--border-subtle)',
        fontSize: '14px', fontWeight: '600',
        color: 'var(--text-primary)',
        background: 'var(--bg-subtle)',
      }}>
        {title}
      </div>
      <div style={{ padding: '22px' }}>{children}</div>
    </div>
  )
}
