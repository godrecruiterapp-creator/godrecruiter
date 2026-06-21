'use client'

import Link from 'next/link'
import { logoutAction } from '@/app/(auth)/actions'

interface Workspace {
  id: string
  name: string
  slug: string
  logo_url: string | null
  status: string
  plan_id: string
  role: string
}

interface Props {
  workspaces: Workspace[]
  userName: string
}

const ROLE_LABELS: Record<string, string> = {
  tenant_owner:    'Owner',
  admin:           'Admin',
  senior_recruiter:'Senior Recruiter',
  recruiter:       'Recruiter',
  sourcer:         'Sourcer',
  interviewer:     'Interviewer',
  client_portal:   'Client',
}

export function WorkspaceList({ workspaces, userName }: Props) {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-app)', padding: '24px 16px',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'var(--accent-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: '700', fontSize: '16px',
        }}>G</div>
        <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          God Recruiter
        </span>
      </div>

      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            Your workspaces
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Signed in as <strong style={{ color: 'var(--text-primary)' }}>{userName}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {workspaces.map((ws) => (
            <a
              key={ws.id}
              href={`https://${ws.slug}.godrecruiter.com/dashboard`}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 16px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                textDecoration: 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* Workspace avatar */}
              <div style={{
                width: '40px', height: '40px', borderRadius: '8px', flexShrink: 0,
                background: ws.logo_url ? 'transparent' : 'var(--accent-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', fontWeight: '700', color: 'var(--accent-primary)',
                border: '1px solid var(--border-subtle)', overflow: 'hidden',
              }}>
                {ws.logo_url
                  ? <img src={ws.logo_url} alt={ws.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : ws.name.charAt(0).toUpperCase()
                }
              </div>

              {/* Workspace info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>
                  {ws.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {ROLE_LABELS[ws.role] ?? ws.role} · {ws.slug}.godrecruiter.com
                </div>
              </div>

              {/* Plan badge */}
              <div style={{
                fontSize: '9px', fontWeight: '700', padding: '2px 7px',
                borderRadius: '3px', letterSpacing: '0.04em',
                background: ws.plan_id === 'enterprise' ? 'rgba(245,158,11,0.12)' : 'rgba(139,92,246,0.1)',
                color: ws.plan_id === 'enterprise' ? '#b45309' : 'var(--accent-primary)',
                textTransform: 'uppercase',
              }}>
                {ws.plan_id}
              </div>

              {/* Arrow */}
              <span style={{ fontSize: '16px', color: 'var(--text-tertiary)', flexShrink: 0 }}>›</span>
            </a>
          ))}
        </div>

        {/* Create new workspace */}
        <Link
          href="/onboarding"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '10px 16px',
            border: '1px dashed var(--border-default)',
            borderRadius: '10px',
            fontSize: '13px', fontWeight: '500',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-primary)'
            e.currentTarget.style.color = 'var(--accent-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-default)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          + Create a new workspace
        </Link>

        {/* Sign out */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <form action={logoutAction}>
            <button
              type="submit"
              style={{
                background: 'none', border: 'none',
                fontSize: '12px', color: 'var(--text-tertiary)',
                cursor: 'pointer',
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
