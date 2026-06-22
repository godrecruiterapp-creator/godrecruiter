'use client'

import Link from 'next/link'

interface AuthCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
    }}>
      {/* Left panel — branding */}
      <div style={{
        display: 'none',
        width: '420px',
        minWidth: '420px',
        background: 'var(--color-primary)',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px',
      }} className="auth-panel">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '64px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', fontWeight: '800', color: '#fff',
            }}>G</div>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#fff', letterSpacing: '-0.02em' }}>
              God Recruiter
            </span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', lineHeight: '1.3', marginBottom: '16px', letterSpacing: '-0.02em' }}>
            Hire smarter,<br />faster, together.
          </h2>
          <p style={{ fontSize: '15px', color: '#94A3B8', lineHeight: '1.6' }}>
            The all-in-one ATS built for modern recruiting teams across India.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { metric: '10x', label: 'faster hiring pipeline' },
            { metric: '500+', label: 'agencies trust us' },
            { metric: '99.9%', label: 'uptime guaranteed' },
          ].map(({ metric, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#fff', minWidth: '60px' }}>{metric}</span>
              <span style={{ fontSize: '13px', color: '#64748B' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        overflowY: 'auto',
      }}>
        {/* Mobile logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px', textDecoration: 'none' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '9px',
            background: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '17px', fontWeight: '800', color: '#fff',
          }}>G</div>
          <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            God Recruiter
          </span>
        </Link>

        {/* Card */}
        <div style={{
          width: '100%',
          maxWidth: '420px',
          background: '#fff',
          borderRadius: '16px',
          padding: '36px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{
              fontSize: '22px', fontWeight: '700',
              color: 'var(--text-primary)',
              letterSpacing: '-0.025em', marginBottom: '6px',
            }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {subtitle}
              </p>
            )}
          </div>
          {children}
        </div>

        {footer && (
          <div style={{ marginTop: '24px', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 900px) {
          .auth-panel { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
