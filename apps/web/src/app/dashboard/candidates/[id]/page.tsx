import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { deleteCandidateAction } from '../actions'

export default async function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const { data: candidate } = await admin
    .from('candidates')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!candidate) notFound()

  const name = [candidate.first_name, candidate.last_name].filter(Boolean).join(' ')
  const initials = [candidate.first_name?.[0], candidate.last_name?.[0]].filter(Boolean).join('').toUpperCase()

  const typeLabel: Record<string, string> = {
    permanent: 'Permanent', contract: 'Contract', temp: 'Temp', unknown: 'Unknown',
  }

  const chips = [
    candidate.current_title,
    candidate.current_company,
    candidate.location,
    typeLabel[candidate.candidate_type] !== 'Unknown' ? typeLabel[candidate.candidate_type] : null,
    candidate.notice_period ? `${candidate.notice_period} notice` : null,
  ].filter(Boolean)

  const formatCTC = (val: number | null) => val ? `₹${(val / 100000).toFixed(1)}L` : null

  return (
    <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/dashboard/candidates" style={{
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
        <form action={async () => { 'use server'; await deleteCandidateAction(id) }}>
          <button type="submit" style={{
            padding: '7px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '500',
            background: '#FFFFFF', color: '#DC2626', cursor: 'pointer',
            border: '1px solid #FECACA', fontFamily: 'inherit',
          }}>
            Delete
          </button>
        </form>
      </div>

      {/* Profile header */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: '8px', padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: '#F0F0F0', color: '#555555', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: '600',
          }}>
            {initials || '?'}
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#0A0A0A', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
              {name}
            </h1>
            {candidate.email && (
              <p style={{ fontSize: '13px', color: '#777777', margin: 0 }}>{candidate.email}</p>
            )}
          </div>
        </div>

        {chips.length > 0 && (
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
        )}
      </div>

      {/* Contact & links */}
      <InfoSection title="Contact">
        <InfoRow label="Email" value={candidate.email} href={`mailto:${candidate.email}`} />
        <InfoRow label="Phone" value={candidate.phone} href={candidate.phone ? `tel:${candidate.phone}` : null} />
        <InfoRow label="LinkedIn" value={candidate.linkedin_url ? 'View profile' : null} href={candidate.linkedin_url} external />
        <InfoRow label="Source" value={candidate.source ? capitalise(candidate.source) : null} />
      </InfoSection>

      {/* Compensation */}
      {(candidate.current_ctc || candidate.expected_ctc) && (
        <InfoSection title="Compensation">
          <InfoRow label="Current CTC" value={formatCTC(candidate.current_ctc as unknown as number)} />
          <InfoRow label="Expected CTC" value={formatCTC(candidate.expected_ctc as unknown as number)} />
        </InfoSection>
      )}

      {/* Notes */}
      {candidate.notes && (
        <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{
            padding: '12px 18px', borderBottom: '1px solid #EBEBEB',
            fontSize: '13px', fontWeight: '500', color: '#0A0A0A',
            background: '#FAFAFA',
          }}>
            Notes
          </div>
          <div style={{ padding: '18px' }}>
            <p style={{ fontSize: '14px', color: '#333333', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-wrap' }}>
              {candidate.notes}
            </p>
          </div>
        </div>
      )}

    </div>
  )
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{
        padding: '12px 18px', borderBottom: '1px solid #EBEBEB',
        fontSize: '13px', fontWeight: '500', color: '#0A0A0A',
        background: '#FAFAFA',
      }}>
        {title}
      </div>
      <div style={{ padding: '4px 0' }}>
        {children}
      </div>
    </div>
  )
}

function InfoRow({ label, value, href, external }: {
  label: string; value: string | null | undefined; href?: string | null; external?: boolean
}) {
  if (!value) return null
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '120px 1fr',
      padding: '10px 18px', borderBottom: '1px solid #F5F5F5',
      alignItems: 'center',
    }}>
      <span style={{ fontSize: '12px', color: '#999999' }}>{label}</span>
      {href ? (
        <a
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          style={{ fontSize: '13px', color: '#0A0A0A', textDecoration: 'none' }}
        >
          {value}
        </a>
      ) : (
        <span style={{ fontSize: '13px', color: '#0A0A0A' }}>{value}</span>
      )}
    </div>
  )
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
