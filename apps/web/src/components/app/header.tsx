'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ChevronRight, Search, User, Briefcase, X, LogOut, Sun, Moon, Bell } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from 'next-themes'
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
  const { resolvedTheme, setTheme } = useTheme()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50)
  }, [searchOpen])

  // Cmd/Ctrl+K shortcut
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') { setOpen(false); setSearchOpen(false); inputRef.current?.blur() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Click outside to close
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearchOpen(false)
      }
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
      if (item) { router.push(item.href); setOpen(false); setSearchOpen(false); setQuery(''); setResults(null) }
    }
  }

  function navigate(href: string) {
    router.push(href)
    setOpen(false)
    setSearchOpen(false)
    setQuery('')
    setResults(null)
  }

  const hasResults = (results?.candidates.length ?? 0) + (results?.jobs.length ?? 0) > 0

  return (
    <header className="flex h-12 shrink-0 items-center border-b bg-background px-4 gap-3">

      {/* Breadcrumbs — left */}
      <nav className="flex items-center gap-1 flex-1 min-w-0">
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

      {/* Right actions */}
      <div className="flex items-center gap-1 shrink-0">

        {/* Search icon */}
        <button
          onClick={() => setSearchOpen(true)}
          className="size-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Search"
        >
          <Search className="size-4" />
        </button>

        {/* Search modal */}
        {searchOpen && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
            style={{ animation: 'fadeIn 150ms ease' }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              onClick={() => { setSearchOpen(false); setOpen(false); setQuery(''); setResults(null) }}
            />
            {/* Panel */}
            <div
              ref={boxRef}
              className="relative w-full max-w-lg mx-4 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden"
              style={{ animation: 'slideDown 150ms ease' }}
            >
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className="size-4 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => handleChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search candidates, jobs…"
                  className="flex-1 text-sm bg-transparent placeholder:text-muted-foreground focus:outline-none"
                />
                {query ? (
                  <button onClick={() => { setQuery(''); setResults(null); setOpen(false) }}
                    className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="size-4" />
                  </button>
                ) : (
                  <kbd className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">Esc</kbd>
                )}
              </div>

              {/* Results */}
              {open && (
                <div className="max-h-80 overflow-y-auto">
                  {!hasResults ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No results for &ldquo;{query}&rdquo;</p>
                  ) : (
                    <>
                      {(results?.candidates.length ?? 0) > 0 && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-4 pt-3 pb-1.5">Candidates</p>
                          {results!.candidates.map((c, i) => (
                            <button key={c.id} onClick={() => navigate(`/dashboard/candidates/${c.id}`)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${activeIdx === i ? 'bg-brand-muted' : 'hover:bg-muted/60'}`}>
                              <div className="size-6 rounded-full bg-brand-muted flex items-center justify-center shrink-0">
                                <User className="size-3 text-brand" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                                  <span className="text-xs text-muted-foreground shrink-0">{c.candidateId}</span>
                                </div>
                                {c.title && <p className="text-xs text-muted-foreground truncate">{c.title}</p>}
                              </div>
                            </button>
                          ))}
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
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-foreground truncate">{j.title}</p>
                                    {j.display_id && <span className="text-xs text-muted-foreground shrink-0">{j.display_id}</span>}
                                  </div>
                                  {j.client && <p className="text-xs text-muted-foreground truncate">{j.client}</p>}
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

              {!query && (
                <p className="text-xs text-muted-foreground text-center py-6">Type to search candidates or jobs</p>
              )}
            </div>
          </div>
        )}

        <style>{`
          @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
          @keyframes slideDown { from { opacity: 0; transform: translateY(-8px) scale(0.98) } to { opacity: 1; transform: translateY(0) scale(1) } }
        `}</style>

        {/* Bell */}
        <button
          className="size-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
        </button>

        <Separator orientation="vertical" className="h-4 mx-1" />

        {/* Avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-md hover:bg-muted px-1.5 py-1 transition-colors outline-none">
              <Avatar className="size-7 rounded-md shrink-0">
                <AvatarFallback className="rounded-md bg-foreground text-background text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <p className="hidden sm:block text-sm font-medium leading-tight truncate max-w-[120px]">{userName}</p>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <div className="px-3 py-2 border-b">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="cursor-pointer">
                <User className="size-3.5 mr-2" />My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="cursor-pointer"
            >
              {resolvedTheme === 'dark'
                ? <><Sun className="size-3.5 mr-2" />Light mode</>
                : <><Moon className="size-3.5 mr-2" />Dark mode</>}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/auth/logout" className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="size-3.5 mr-2" />Sign out
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
