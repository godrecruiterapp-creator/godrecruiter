'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { label: 'Dashboard',    href: '/dashboard',             icon: '⊞' },
  { label: 'Jobs',         href: '/dashboard/jobs',        icon: '💼' },
  { label: 'Candidates',   href: '/dashboard/candidates',  icon: '👤' },
  { label: 'Pipeline',     href: '/dashboard/pipeline',    icon: '⬡' },
  { label: 'Interviews',   href: '/dashboard/interviews',  icon: '📅' },
  { label: 'Reports',      href: '/dashboard/reports',     icon: '📊' },
  { label: 'Settings',     href: '/dashboard/settings',    icon: '⚙' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: '220px',
      minWidth: '220px',
      height: '100vh',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      overflow: 'hidden',
    }}>

      {/* Logo */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{
          width: '30px', height: '30px',
          background: 'var(--accent-primary)',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '15px', fontWeight: '800', color: '#fff', flexShrink: 0,
        }}>
          G
        </div>
        <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          God Recruiter
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {NAV.map(({ label, href, icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '7px 10px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: active ? '600' : '400',
                color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                background: active ? 'var(--accent-subtle)' : 'transparent',
                textDecoration: 'none',
                transition: 'background 0.1s, color 0.1s',
              }}
            >
              <span style={{ fontSize: '14px', width: '18px', textAlign: 'center', flexShrink: 0 }}>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{
        padding: '12px 10px',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <a
          href="/auth/logout"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '7px 10px',
            borderRadius: '6px',
            fontSize: '13px',
            color: 'var(--text-tertiary)',
            textDecoration: 'none',
          }}
        >
          <span style={{ fontSize: '14px', width: '18px', textAlign: 'center' }}>↩</span>
          Sign out
        </a>
      </div>
    </aside>
  )
}
