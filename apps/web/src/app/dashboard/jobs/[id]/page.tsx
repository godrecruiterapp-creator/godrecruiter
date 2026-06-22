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

  const statusBadge: Record<string, { label: string; color: string; bg: string }> = {
    draft:     { label: 'Draft',     color: '#555555', bg: '#F5F5F5' },
    published: { label: 'Published', color: '#16A34A', bg: '#F0FDF4' },
    paused:    { label: 'Paused',    color: '#CA8A04', bg: '#FEFCE8' },
    closed:    { label: 'Closed',    color: '#DC2626', bg: '#FFF1F1' },
  }

  const badge = statusBadge[job.status as string] ?? { label: 'Draft', color: '#555555', bg: '#F5F5F5' }

  const chips = [
    job.department,
    job.location,
    workModeLabel[job.work_mode],
    jobTypeLabel[job.job_type],
    `${job.openings ?? 1} opening${(job.openings ?? 1) > 1 ? 's' : ''}`,
  ].filter(Boolean)

  return (
    <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/dashboard/jobs" style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '13px', color: '#777777', textDecoration: 'none',
          padding: '6px 10px', borderRadius: '6px', border: '1px solid #E0E0E0',
          background: '#FFFFFF',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </Link>
        <div style={{ display: 'flex', gap: '6px' }}>
          {job.status !== 'published' && (
            <form action={async () => { 'use server'; await updateJobStatusAction(id, 'published') }}>
              <button type="submit" style={actionBtn('#0A0A0A', '#FFFFFF')}>Publish</button>
            </form>
          )}
          {job.status === 'published' && (
            <form action={async () => { 'use server'; await updateJobStatusAction(id, 'paused') }}>
              <button type="submit" style={actionBtn('#FFFFFF', '#555555', true)}>Pause</button>
            </form>
          )}
          <form action={async () => { 'use server'; await deleteJobAction(id) }}>
            <button type="submit" style={{ ...actionBtn('#FFFFFF', '#DC2626', true), borderColor: '#FECACA' }}>
              Delete
            </button>
          </form>
        </div>
      </div>

      {/* Job header */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: '8px', padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '14px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#0A0A0A', margin: 0, letterSpacing: '-0.02em' }}>
            {job.title}
          </h1>
          <span style={{
            padding: '3px 10px', borderRadius: '4px',
            fontSize: '11px', fontWeight: '500', flexShrink: 0,
            background: badge.bg, color: badge.color,
          }}>
            {badge.label}
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {chips.map((val) => (
            <span key={String(val)} style={{
              fontSize: '12px', color: '#555555',
              background: '#F5F5F5', borderRadius: '4px',
              padding: '3px 10px',
            }}>
              {String(val)}
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      {job.description && (
        <TextSection title="Description" body={job.description} />
      )}

      {/* Requirements */}
      {job.requirements && (
        <TextSection title="Requirements" body={job.requirements} />
      )}

    </div>
  )
}

function TextSection({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{
        padding: '12px 18px', borderBottom: '1px solid #EBEBEB',
        fontSize: '13px', fontWeight: '500', color: '#0A0A0A',
        background: '#FAFAFA',
      }}>
        {title}
      </div>
      <div style={{ padding: '18px' }}>
        <p style={{ fontSize: '14px', color: '#333333', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-wrap' }}>
          {body}
        </p>
      </div>
    </div>
  )
}

function actionBtn(bg: string, color: string, bordered = false): React.CSSProperties {
  return {
    padding: '7px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '500',
    background: bg, color, cursor: 'pointer',
    border: bordered ? '1px solid #E0E0E0' : 'none',
    fontFamily: 'inherit',
  }
}
