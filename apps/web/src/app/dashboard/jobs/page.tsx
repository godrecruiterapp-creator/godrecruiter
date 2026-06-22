export const revalidate = 30

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
      .eq('platform_user_id', user!.id)
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

  const statusBadge: Record<string, { label: string; color: string; bg: string }> = {
    draft:     { label: 'Draft',     color: '#555555', bg: '#F5F5F5' },
    published: { label: 'Published', color: '#16A34A', bg: '#F0FDF4' },
    paused:    { label: 'Paused',    color: '#CA8A04', bg: '#FEFCE8' },
    closed:    { label: 'Closed',    color: '#DC2626', bg: '#FFF1F1' },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '880px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#0A0A0A', margin: 0, letterSpacing: '-0.02em' }}>
            Jobs
          </h1>
          <p style={{ fontSize: '13px', color: '#777777', margin: '3px 0 0' }}>
            {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
          </p>
        </div>
        <Link href="/dashboard/jobs/new" style={{
          padding: '8px 14px',
          background: '#0A0A0A', color: '#FFFFFF',
          borderRadius: '6px', fontSize: '13px', fontWeight: '500',
          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Post a job
        </Link>
      </div>

      {/* Empty state */}
      {jobs.length === 0 && (
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #EBEBEB',
          borderRadius: '8px',
          padding: '60px 24px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#0A0A0A', margin: '0 0 6px' }}>No jobs yet</p>
          <p style={{ fontSize: '13px', color: '#999999', margin: '0 0 20px' }}>
            Post your first job to start receiving applications.
          </p>
          <Link href="/dashboard/jobs/new" style={{
            display: 'inline-block', padding: '8px 16px',
            background: '#0A0A0A', color: '#FFFFFF',
            borderRadius: '6px', fontSize: '13px', fontWeight: '500', textDecoration: 'none',
          }}>
            Post a job
          </Link>
        </div>
      )}

      {/* Jobs table */}
      {jobs.length > 0 && (
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #EBEBEB',
          borderRadius: '8px',
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto auto',
            padding: '10px 20px',
            borderBottom: '1px solid #EBEBEB',
            background: '#F9F9F9',
          }}>
            <span style={{ fontSize: '11px', fontWeight: '500', color: '#999999', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Job</span>
            <span style={{ fontSize: '11px', fontWeight: '500', color: '#999999', textTransform: 'uppercase', letterSpacing: '0.04em', width: '90px', textAlign: 'center' }}>Status</span>
            <span style={{ width: '16px' }} />
          </div>

          {jobs.map((job: Record<string, string | null>, i) => {
            const badge = statusBadge[job.status ?? ''] ?? { label: 'Draft', color: '#555555', bg: '#F5F5F5' }
            const meta = [job.department, job.location, job.work_mode?.replace('_', ' ')].filter(Boolean).join(' · ')
            return (
              <Link key={job.id} href={`/dashboard/jobs/${job.id}`} style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                alignItems: 'center',
                padding: '14px 20px',
                borderBottom: i < jobs.length - 1 ? '1px solid #F5F5F5' : 'none',
                textDecoration: 'none',
                transition: 'background 0.1s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAFAFA'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#0A0A0A', margin: '0 0 2px' }}>
                    {job.title}
                  </p>
                  {meta && <p style={{ fontSize: '12px', color: '#AAAAAA', margin: 0 }}>{meta}</p>}
                </div>
                <span style={{
                  padding: '3px 10px', borderRadius: '4px',
                  fontSize: '11px', fontWeight: '500',
                  background: badge.bg, color: badge.color,
                  width: '90px', textAlign: 'center', display: 'block',
                }}>
                  {badge.label}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}>
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
