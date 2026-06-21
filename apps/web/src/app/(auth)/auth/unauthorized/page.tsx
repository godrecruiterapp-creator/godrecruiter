import Link from 'next/link'
import { AuthCard } from '@/components/auth/auth-card'

export default function UnauthorizedPage() {
  return (
    <AuthCard title="Access denied">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          You don't have permission to access this workspace, or your account has been deactivated.
          Contact your workspace admin for help.
        </p>
        <Link
          href="/select-workspace"
          style={{
            display: 'block',
            padding: '8px 16px',
            background: 'var(--accent-primary)',
            color: '#fff',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            textDecoration: 'none',
            textAlign: 'center',
          }}
        >
          Go to my workspaces
        </Link>
      </div>
    </AuthCard>
  )
}
