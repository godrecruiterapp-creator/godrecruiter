'use client'

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
        <img src="/logo-icon-square.png" alt="" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
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
                borderRadius: '8px',
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
                  {ws.role} · {ws.slug}.godrecruiter.com
                </div>
              </div>

              {/* Plan badge */}
              <div style={{
                fontSize: '9px', fontWeight: '700', padding: '2px 7px',
                borderRadius: '9999px', letterSpacing: '0.04em',
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
