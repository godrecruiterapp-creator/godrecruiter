'use client'

interface Props {
  userName: string
  userEmail: string
}

export function Header({ userName, userEmail }: Props) {
  return (
    <header style={{
      height: '56px',
      minHeight: '56px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--bg-app)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
    }}>
      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
        Dashboard
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px', height: '32px',
          background: 'var(--accent-primary)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: '700', color: '#fff',
          cursor: 'pointer',
          flexShrink: 0,
        }}
          title={userEmail}
        >
          {userName.charAt(0).toUpperCase()}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {userName}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.2 }}>
            {userEmail}
          </span>
        </div>
      </div>
    </header>
  )
}
