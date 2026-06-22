export const revalidate = 60

export default function DashboardPage() {
  const stats = [
    {
      label: 'Active Jobs',
      value: '0',
      sub: 'Post your first job',
      color: '#0369A1',
      bg: '#EFF6FF',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2"/>
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        </svg>
      ),
    },
    {
      label: 'Total Candidates',
      value: '0',
      sub: 'No candidates yet',
      color: '#7C3AED',
      bg: '#F5F3FF',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
        </svg>
      ),
    },
    {
      label: 'Interviews Today',
      value: '0',
      sub: 'Nothing scheduled',
      color: '#D97706',
      bg: '#FFFBEB',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
    },
    {
      label: 'Offers Pending',
      value: '0',
      sub: 'All clear',
      color: '#059669',
      bg: '#F0FDF4',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px' }}>

      {/* Page header */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.025em' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
          Welcome back. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {stats.map(({ label, value, sub, color, bg, icon }) => (
          <div key={label} style={{
            background: '#fff',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>{label}</span>
              <div style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color,
              }}>
                {icon}
              </div>
            </div>
            <div>
              <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '6px 0 0' }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Getting started */}
      <div style={{
        background: '#fff',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '28px 32px',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: '#EFF6FF', color: '#0369A1',
            fontSize: '11px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase',
            padding: '4px 10px', borderRadius: '20px', marginBottom: '12px',
          }}>
            Getting started
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Your workspace is ready
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
            Start by posting your first job opening. Candidates can apply and you&apos;ll manage everything from here.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
          <a href="/dashboard/jobs/new" style={{
            padding: '10px 20px', borderRadius: '8px',
            fontSize: '14px', fontWeight: '600',
            textDecoration: 'none',
            background: 'var(--color-primary)', color: '#fff',
            transition: 'background 0.15s',
          }}>
            Post a job
          </a>
          <a href="/dashboard/candidates/new" style={{
            padding: '10px 20px', borderRadius: '8px',
            fontSize: '14px', fontWeight: '600',
            textDecoration: 'none',
            background: 'var(--bg-subtle)', color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
          }}>
            Add candidate
          </a>
        </div>
      </div>

    </div>
  )
}
