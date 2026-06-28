'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SETTINGS_NAV, ALL_ITEMS } from './_nav'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return null
    const q = search.toLowerCase()
    return ALL_ITEMS.filter(i => i.label.toLowerCase().includes(q))
  }, [search])

  return (
    <div className="flex h-full overflow-hidden">
      {/* Settings left nav */}
      <aside className="w-56 shrink-0 border-r flex flex-col overflow-hidden bg-background">
        {/* Search */}
        <div className="p-3 border-b shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search settings…"
              className="w-full h-8 pl-8 pr-3 text-xs rounded-md border border-input bg-muted/40 focus:outline-none focus:ring-1 focus:ring-ring focus:bg-background transition-colors"
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          {filtered ? (
            /* search results */
            filtered.length === 0 ? (
              <p className="px-4 py-3 text-xs text-muted-foreground">No results</p>
            ) : (
              <div className="px-2 space-y-0.5">
                {filtered.map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setSearch('')}
                    className={cn(
                      'block px-2.5 py-2 text-xs rounded-md transition-colors',
                      pathname.startsWith(item.href)
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    )}>
                    {item.label}
                  </Link>
                ))}
              </div>
            )
          ) : (
            /* grouped nav */
            SETTINGS_NAV.map(group => (
              <div key={group.group} className="mb-1">
                <p className="px-4 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                  {group.group}
                </p>
                <div className="px-2 space-y-0.5">
                  {group.items.map(item => (
                    <Link key={item.href} href={item.href}
                      className={cn(
                        'block px-2.5 py-2 text-xs rounded-md transition-colors',
                        pathname.startsWith(item.href)
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                      )}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
