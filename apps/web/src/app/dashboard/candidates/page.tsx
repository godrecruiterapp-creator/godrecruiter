export const revalidate = 30

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CandidatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  let candidates: Record<string, string | null>[] = []
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
        .from('candidates')
        .select('*')
        .eq('tenant_id', membership.tenant_id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      candidates = data ?? []
    }
  } catch (err) {
    console.error('Candidates fetch error:', err)
  }

  const typeLabel: Record<string, string> = {
    permanent: 'Permanent',
    contract: 'Contract',
    temp: 'Temp',
    unknown: '',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '880px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#0A0A0A', margin: 0, letterSpacing: '-0.02em' }}>
            Candidates
          </h1>
          <p style={{ fontSize: '13px', color: '#777777', margin: '3px 0 0' }}>
            {candidates.length} {candidates.length === 1 ? 'candidate' : 'candidates'}
          </p>
        </div>
        <Link href="/dashboard/candidates/new" style={{
          padding: '8px 14px',
          background: '#0A0A0A', color: '#FFFFFF',
          borderRadius: '6px', fontSize: '13px', fontWeight: '500',
          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add candidate
        </Link>
      </div>

      {/* Empty state */}
      {candidates.length === 0 && (
        <div style={{
          background: '#FFFFFF', border: '1px solid #EBEBEB',
          borderRadius: '8px', padding: '60px 24px', textAlign: 'center',
        }}>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#0A0A0A', margin: '0 0 6px' }}>No candidates yet</p>
          <p style={{ fontSize: '13px', color: '#999999', margin: '0 0 20px' }}>
            Add your first candidate to start building your talent pool.
          </p>
          <Link href="/dashboard/candidates/new" style={{
            display: 'inline-block', padding: '8px 16px',
            background: '#0A0A0A', color: '#FFFFFF',
            borderRadius: '6px', fontSize: '13px', fontWeight: '500', textDecoration: 'none',
          }}>
            Add candidate
          </Link>
        </div>
      )}

      {/* Candidates list */}
      {candidates.length > 0 && (
        <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 130px 20px',
            padding: '10px 20px', borderBottom: '1px solid #EBEBEB', background: '#F9F9F9',
          }}>
            <span style={{ fontSize: '11px', fontWeight: '500', color: '#999999', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Candidate</span>
            <span style={{ fontSize: '11px', fontWeight: '500', color: '#999999', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Type</span>
            <span />
          </div>

          {candidates.map((c: Record<string, string | null>, i) => {
            const name = [c.first_name, c.last_name].filter(Boolean).join(' ')
            const initials = [c.first_name?.[0], c.last_name?.[0]].filter(Boolean).join('').toUpperCase()
            const meta = [c.current_title, c.current_company, c.location].filter(Boolean).join(' · ')
            const type = typeLabel[c.candidate_type ?? ''] ?? ''

            return (
              <Link
                key={c.id}
                href={`/dashboard/candidates/${c.id}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 130px 20px',
                  alignItems: 'center',
                  padding: '12px 20px',
                  borderBottom: i < candidates.length - 1 ? '1px solid #F5F5F5' : 'none',
                  textDecoration: 'none',
                  background: 'transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: '#F0F0F0', color: '#555555',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: '600', flexShrink: 0,
                  }}>
                    {initials || '?'}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#0A0A0A', margin: '0 0 2px' }}>{name}</p>
                    {meta && <p style={{ fontSize: '12px', color: '#AAAAAA', margin: 0 }}>{meta}</p>}
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: '#777777' }}>{type || '—'}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
