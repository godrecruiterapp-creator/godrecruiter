'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ChevronRight, Search, User, Briefcase, X } from 'lucide-react'
import { globalSearchAction, type SearchResult } from '@/app/dashboard/search-action'

interface Props {
  userName: string
  userEmail: string
}

const SEGMENT_LABELS: Record<string, string> = {
  dashboard:  'Dashboard',
  jobs:       'Jobs',
  candidates: 'Candidates',
  settings:   'Settings',
  new:        'New',
  edit:       'Edit',
  pipeline:   'Pipeline',
}

function useBreadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  const crumbs: { label: string; href: string }[] = []
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    const label = SEGMENT_LABELS[seg as keyof typeof SEGMENT_LABELS]
    if (!label) continue
    crumbs.push({ label, href: '/' + segments.slice(0, i + 1).join('/') })
  }
  return crumbs
}

const STATUS_DOT: Record<string, string> = {
  open: 'bg-emerald-500', on_hold: 'bg-amber-500', filled: 'bg-blue-500', closed: 'bg-zinc-400',
}

export function Header({ userName, userEmail }: Props) {
  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const crumbs = useBreadcrumbs()
  const router = useRouter()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cmd/Ctrl+K shortcut
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
      if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Click outside to close
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleChange(val: string) {
    setQuery(val)
    setActiveIdx(-1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!val.trim()) { setResults(null); setOpen(false); return }
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const res = await globalSearchAction(val)
        setResults(res)
        setOpen(true)
      })
    }, 200)
  }

  const allItems: { href: string; label: string }[] = [
    ...(results?.candidates ?? []).map(c => ({ href: `/dashboard/candidates/${c.id}`, label: c.name })),
    ...(results?.jobs ?? []).map(j => ({ href: `/dashboard/jobs/${j.id}`, label: j.title })),
  ]

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, allItems.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && activeIdx >= 0) {
      const item = allItems[activeIdx]
      if (item) { router.push(item.href); setOpen(false); setQuery(''); setResults(null) }
    }
  }

  function navigate(href: string) {
    router.push(href)
    setOpen(false)
    setQuery('')
    setResults(null)
  }

  const hasResults = (results?.candidates.length ?? 0) + (results?.jobs.length ?? 0) > 0

  return (
    <header className="flex h-11 shrink-0 items-center border-b bg-background px-4 gap-3">

      {/* Breadcrumbs — left */}
      <nav className="flex items-center gap-1 w-[220px] shrink-0 min-w-0">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1
          return (
            <span key={crumb.href} className="flex items-center gap-1 min-w-0">
              {i > 0 && <ChevronRight className="size-3 text-muted-foreground/40 shrink-0" />}
              {isLast ? (
                <span className="text-sm font-medium text-foreground truncate">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors truncate">
                  {crumb.label}
                </Link>
              )}
            </span>
          )
        })}
      </nav>

      {/* Search — center */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md" ref={boxRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => handleChange(e.target.value)}
            onFocus={() => { if (hasResults) setOpen(true) }}
            onKeyDown={handleKeyDown}
            placeholder="Search candidates, jobs… ⌘K"
            className="w-full h-7 pl-8 pr-8 text-sm bg-muted/60 border border-border rounded-md placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand focus:bg-background transition-colors"
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults(null); setOpen(false) }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="size-3.5" />
            </button>
          )}

          {/* Dropdown */}
          {open && (
            <div className="absolute top-full mt-1.5 left-0 right-0 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
              {!hasResults ? (
                <p className="text-sm text-muted-foreground text-center py-6">No results for "{query}"</p>
              ) : (
                <>
                  {(results?.candidates.length ?? 0) > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-4 pt-3 pb-1.5">Candidates</p>
                      {results!.candidates.map((c, i) => {
                        const idx = i
                        return (
                          <button key={c.id} onClick={() => navigate(`/dashboard/candidates/${c.id}`)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${activeIdx === idx ? 'bg-brand-muted' : 'hover:bg-muted/60'}`}>
                            <div className="size-6 rounded-full bg-brand-muted flex items-center justify-center shrink-0">
                              <User className="size-3 text-brand" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                              {c.title && <p className="text-xs text-muted-foreground truncate">{c.title}</p>}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {(results?.jobs.length ?? 0) > 0 && (
                    <div className={(results?.candidates.length ?? 0) > 0 ? 'border-t border-border' : ''}>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-4 pt-3 pb-1.5">Jobs</p>
                      {results!.jobs.map((j, i) => {
                        const idx = (results?.candidates.length ?? 0) + i
                        return (
                          <button key={j.id} onClick={() => navigate(`/dashboard/jobs/${j.id}`)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${activeIdx === idx ? 'bg-brand-muted' : 'hover:bg-muted/60'}`}>
                            <div className="size-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                              <Briefcase className="size-3 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0 flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground truncate">{j.title}</p>
                              {j.client && <p className="text-xs text-muted-foreground truncate shrink-0">{j.client}</p>}
                            </div>
                            <span className={`size-1.5 rounded-full shrink-0 ${STATUS_DOT[j.status] ?? 'bg-zinc-400'}`} />
                          </button>
                        )
                      })}
                    </div>
                  )}
                  <div className="border-t border-border px-4 py-2">
                    <p className="text-xs text-muted-foreground">↑↓ navigate · Enter to open · Esc to close</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User — right */}
      <div className="flex items-center gap-3 shrink-0 w-[220px] justify-end">
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-2.5">
          <Avatar className="size-7 rounded-md">
            <AvatarFallback className="rounded-md bg-foreground text-background text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-tight">{userName}</p>
            <p className="text-xs text-muted-foreground leading-tight">{userEmail}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
