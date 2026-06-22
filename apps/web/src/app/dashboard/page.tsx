import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-app)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '16px',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{
        width: '48px', height: '48px',
        background: 'var(--accent-primary)',
        borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '24px', fontWeight: '800', color: '#fff',
      }}>
        G
      </div>
      <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
        Welcome to God Recruiter
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
        Your workspace is ready. The full dashboard is coming soon.
      </p>
      <div style={{
        marginTop: '8px',
        padding: '12px 20px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: '8px',
        fontSize: '13px',
        color: 'var(--text-secondary)',
      }}>
        Signed in as <strong style={{ color: 'var(--text-primary)' }}>{user.email}</strong>
      </div>
    </div>
  )
}
