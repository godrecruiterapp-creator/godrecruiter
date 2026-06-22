'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    label: 'Jobs',
    href: '/dashboard/jobs',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
    ),
  },
  {
    label: 'Candidates',
    href: '/dashboard/candidates',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.85"/>
      </svg>
    ),
  },
  {
    label: 'Pipeline',
    href: '/dashboard/pipeline',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="5" height="18" rx="1"/>
        <rect x="10" y="3" width="5" height="12" rx="1"/>
        <rect x="17" y="3" width="5" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    label: 'Interviews',
    href: '/dashboard/interviews',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    label: 'Reports',
    href: '/dashboard/reports',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const width = collapsed ? '52px' : '216px'

  return (
    <aside style={{
      width, minWidth: width,
      height: '100vh',
      background: '#FFFFFF',
      borderRight: '1px solid #EBEBEB',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      transition: 'width 0.18s ease, min-width 0.18s ease',
    }}>

      {/* Logo row */}
      <div style={{
        height: '52px', minHeight: '52px',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? '0' : '0 14px',
        borderBottom: '1px solid #EBEBEB',
      }}>
        {!collapsed && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '6px',
                background: '#0A0A0A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: '700', color: '#fff', flexShrink: 0,
              }}>G</div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#0A0A0A', letterSpacing: '-0.01em' }}>
                God Recruiter
              </span>
            </div>
            <button onClick={() => setCollapsed(true)} aria-label="Collapse sidebar" style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#BBBBBB', padding: '4px', borderRadius: '4px',
              display: 'flex', alignItems: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          </>
        )}
        {collapsed && (
          <button onClick={() => setCollapsed(false)} aria-label="Expand sidebar" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '28px', height: '28px',
          }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '6px',
              background: '#0A0A0A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: '700', color: '#fff',
            }}>G</div>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: '1px', overflowY: 'auto' }}>
        {NAV.map(({ label, href, icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} title={collapsed ? label : undefined} style={{
              display: 'flex', alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: '8px',
              padding: collapsed ? '8px' : '7px 8px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: active ? '500' : '400',
              color: active ? '#0A0A0A' : '#777777',
              background: active ? '#F5F5F5' : 'transparent',
              textDecoration: 'none',
              transition: 'background 0.1s, color 0.1s',
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#F9F9F9'; e.currentTarget.style.color = '#0A0A0A' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#777777' } }}
            >
              <span style={{ flexShrink: 0, display: 'flex' }}>{icon}</span>
              {!collapsed && label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div style={{ padding: '8px 8px', borderTop: '1px solid #EBEBEB' }}>
        <a href="/auth/logout" title={collapsed ? 'Sign out' : undefined} style={{
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: '8px', padding: collapsed ? '8px' : '7px 8px',
          borderRadius: '6px', fontSize: '13px',
          color: '#AAAAAA', textDecoration: 'none',
          transition: 'background 0.1s, color 0.1s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F9F9F9'; e.currentTarget.style.color = '#0A0A0A' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#AAAAAA' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {!collapsed && 'Sign out'}
        </a>
      </div>
    </aside>
  )
}
