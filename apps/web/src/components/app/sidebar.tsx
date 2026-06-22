'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV = [
  { label: 'Dashboard',   href: '/dashboard',            icon: '⊞' },
  { label: 'Jobs',        href: '/dashboard/jobs',       icon: '💼' },
  { label: 'Candidates',  href: '/dashboard/candidates', icon: '👤' },
  { label: 'Pipeline',    href: '/dashboard/pipeline',   icon: '⬡' },
  { label: 'Interviews',  href: '/dashboard/interviews', icon: '📅' },
  { label: 'Reports',     href: '/dashboard/reports',    icon: '📊' },
  { label: 'Settings',    href: '/dashboard/settings',   icon: '⚙' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const width = collapsed ? '56px' : '220px'

  return (
    <aside style={{
      width,
      minWidth: width,
      height: '100vh',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'width 0.2s ease, min-width 0.2s ease',
    }}>

      {/* Logo + collapse toggle */}
      <div style={{
        padding: collapsed ? '16px 0' : '20px 20px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: '10px',
        minHeight: '57px',
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '30px', height: '30px',
              background: 'var(--accent-primary)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '15px', fontWeight: '800', color: '#fff', flexShrink: 0,
            }}>G</div>
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              God Recruiter
            </span>
          </div>
        )}

        {collapsed && (
          <div style={{
            width: '30px', height: '30px',
            background: 'var(--accent-primary)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '15px', fontWeight: '800', color: '#fff',
          }}>G</div>
        )}

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-tertiary)', fontSize: '16px', padding: '2px 4px',
              borderRadius: '4px', lineHeight: 1, flexShrink: 0,
            }}
          >‹‹</button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: collapsed ? '12px 8px' : '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {NAV.map(({ label, href, icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: '10px',
                padding: collapsed ? '8px' : '7px 10px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: active ? '600' : '400',
                color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                background: active ? 'var(--accent-subtle)' : 'transparent',
                textDecoration: 'none',
                transition: 'background 0.1s, color 0.1s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{icon}</span>
              {!collapsed && label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{
        padding: collapsed ? '12px 8px' : '12px 10px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-tertiary)', fontSize: '16px', padding: '8px',
              borderRadius: '6px', width: '100%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >››</button>
        )}
        <a
          href="/auth/logout"
          title={collapsed ? 'Sign out' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '10px',
            padding: collapsed ? '8px' : '7px 10px',
            borderRadius: '6px',
            fontSize: '13px',
            color: 'var(--text-tertiary)',
            textDecoration: 'none',
          }}
        >
          <span style={{ fontSize: '16px', flexShrink: 0 }}>↩</span>
          {!collapsed && 'Sign out'}
        </a>
      </div>
    </aside>
  )
}
