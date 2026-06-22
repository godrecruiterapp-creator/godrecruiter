export const revalidate = 30

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
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

  const statusMeta: Record<string, { label: string; color: string; bg: string }> = {
    draft:     { label: 'Draft',     color: '#64748B', bg: '#F1F5F9' },
    published: { label: 'Published', color: '#059669', bg: '#DCFCE7' },
    paused:    { label: 'Paused',    color: '#D97706', bg: '#FEF9C3' },
    closed:    { label: 'Closed',    color: '#DC2626', bg: '#FEE2E2' },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.025em' }}>
            Jobs
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link href="/dashboard/jobs/new" style={{
          padding: '10px 18px',
          background: 'var(--color-primary)',
          color: '#fff', borderRadius: '8px',
          fontSize: '14px', fontWeight: '600',
          textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Post a job
        </Link>
      </div>

      {/* Empty state */}
      {jobs.length === 0 && (
        <div style={{
          background: '#fff',
          border: '2px dashed var(--border-default)',
          borderRadius: '12px',
          padding: '72px 24px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '12px',
            background: '#EFF6FF', color: '#0369A1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
            </svg>
          </div>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 8px' }}>
            No jobs yet
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 24px', lineHeight: '1.6' }}>
            Post your first job opening to start receiving applications from candidates.
          </p>
          <Link href="/dashboard/jobs/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '10px 20px', background: 'var(--color-primary)',
            color: '#fff', borderRadius: '8px',
            fontSize: '14px', fontWeight: '600', textDecoration: 'none',
          }}>
            Post a job
          </Link>
        </div>
      )}

      {/* Jobs list */}
      {jobs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {jobs.map((job: Record<string, string | null>) => {
            const meta = statusMeta[job.status ?? ''] ?? statusMeta.draft
            return (
              <Link key={job.id} href={`/dashboard/jobs/${job.id}`} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 22px',
                background: '#fff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                textDecoration: 'none',
                boxShadow: 'var(--shadow-card)',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-primary)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(3,105,161,0.1)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {job.title}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                    {[job.department, job.location, job.work_mode?.replace('_', ' ')].filter(Boolean).join(' · ')}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: '20px',
                    fontSize: '12px', fontWeight: '600',
                    background: meta.bg, color: meta.color,
                  }}>
                    {meta.label}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
