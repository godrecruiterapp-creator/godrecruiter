'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/platform', label: 'Tenants' },
  { href: '/platform/owners', label: 'Platform Owners' },
]

export function PlatformNav() {
  const pathname = usePathname()
  return (
    <nav className="flex items-center gap-1 px-6 h-11 border-b border-border bg-background">
      {TABS.map(t => (
        <Link key={t.href} href={t.href}
          className={cn(
            'px-3 h-8 flex items-center text-sm font-medium rounded-md transition-colors',
            pathname === t.href ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}>
          {t.label}
        </Link>
      ))}
    </nav>
  )
}
