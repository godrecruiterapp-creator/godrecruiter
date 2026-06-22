import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()

  // Get user's tenant
  const { data: membership } = await admin
    .from('platform_user_tenants')
    .select('tenant_id')
    .eq('platform_user_id', user.id)
    .eq('is_active', true)
    .single()

  const jobs = membership ? (await admin
    .from('jobs')
    .select('*')
    .eq('tenant_id', membership.tenant_id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  ).data ?? [] : []

  const statusColor: Record<string, string> = {
    draft:     'var(--text-tertiary)',
    published: 'var(--status-success)',
    paused:    'var(--status-warning)',
    closed:    'var(--status-danger)',
  }

  const statusBg: Record<string, string> = {
    draft:     'var(--bg-subtle)',
    published: '#dcfce7',
    paused:    '#fef9c3',
    closed:    '#fee2e2',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Jobs</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link
          href="/dashboard/jobs/new"
          style={{
            padding: '8px 16px',
            background: 'var(--accent-primary)',
            color: '#fff',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            textDecoration: 'none',
          }}
        >
          + Post a job
        </Link>
      </div>

      {/* Empty state */}
      {jobs.length === 0 && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px dashed var(--border-default)',
          borderRadius: '10px',
          padding: '60px 24px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>💼</div>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 6px' }}>
            No jobs yet
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 20px' }}>
            Post your first job to start receiving applications.
          </p>
          <Link
            href="/dashboard/jobs/new"
            style={{
              padding: '8px 18px',
              background: 'var(--accent-primary)',
              color: '#fff',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            Post a job
          </Link>
        </div>
      )}

      {/* Jobs list */}
      {jobs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {jobs.map((job: Record<string, string | null>) => (
            <Link
              key={job.id}
              href={`/dashboard/jobs/${job.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '10px',
                textDecoration: 'none',
                transition: 'border-color 0.15s',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {job.title}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  {[job.department, job.location, job.work_mode?.replace('_', ' ')].filter(Boolean).join(' · ')}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '600',
                  background: statusBg[job.status ?? ''] ?? 'var(--bg-subtle)',
                  color: statusColor[job.status ?? ''] ?? 'var(--text-tertiary)',
                  textTransform: 'capitalize',
                }}>
                  {job.status}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
