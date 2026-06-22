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
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FFFFFF',
      padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '36px' }}>
          <div style={{
            width: '26px', height: '26px', borderRadius: '6px',
            background: '#0A0A0A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: '700', color: '#fff',
          }}>G</div>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#0A0A0A', letterSpacing: '-0.01em' }}>
            God Recruiter
          </span>
        </Link>

        {/* Heading */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontSize: '20px', fontWeight: '600',
            color: '#0A0A0A', letterSpacing: '-0.02em', margin: '0 0 6px',
            lineHeight: 1.25,
          }}>{title}</h1>
          {subtitle && (
            <p style={{ fontSize: '14px', color: '#777777', lineHeight: 1.5, margin: 0 }}>{subtitle}</p>
          )}
        </div>

        {/* Form */}
        {children}

        {/* Footer */}
        {footer && (
          <div style={{ marginTop: '20px', fontSize: '13px', color: '#777777', textAlign: 'center' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
