'use client'

interface Props {
  userName: string
  userEmail: string
}

export function Header({ userName, userEmail }: Props) {
  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <header style={{
      height: '52px', minHeight: '52px',
      borderBottom: '1px solid #EBEBEB',
      background: '#FFFFFF',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
    }}>
      {/* Left: search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        background: '#F9F9F9', border: '1px solid #EBEBEB',
        borderRadius: '6px', padding: '0 10px', height: '32px', width: '220px',
        cursor: 'text',
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <span style={{ fontSize: '13px', color: '#AAAAAA' }}>Search…</span>
      </div>

      {/* Right: user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '1px', height: '20px', background: '#EBEBEB' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 6px', borderRadius: '6px' }}
          onMouseEnter={e => e.currentTarget.style.background = '#F9F9F9'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{
            width: '28px', height: '28px', borderRadius: '6px',
            background: '#0A0A0A', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: '600', flexShrink: 0, letterSpacing: '0.02em',
          }}>
            {initials}
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#0A0A0A', lineHeight: 1.2 }}>{userName}</p>
            <p style={{ fontSize: '11px', color: '#999999', lineHeight: 1.2 }}>{userEmail}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
