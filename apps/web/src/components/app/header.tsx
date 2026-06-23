'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ChevronRight } from 'lucide-react'

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
    if (!label) continue // skip raw IDs (ULIDs / slugs)
    crumbs.push({ label, href: '/' + segments.slice(0, i + 1).join('/') })
  }
  return crumbs
}

export function Header({ userName, userEmail }: Props) {
  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const crumbs = useBreadcrumbs()

  return (
    <header className="flex h-11 shrink-0 items-center border-b bg-background px-4 gap-3">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 flex-1 min-w-0">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1
          return (
            <span key={crumb.href} className="flex items-center gap-1 min-w-0">
              {i > 0 && <ChevronRight className="size-3 text-muted-foreground/40 shrink-0" />}
              {isLast ? (
                <span className="text-sm font-medium text-foreground truncate">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors truncate"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          )
        })}
      </nav>

      {/* User */}
      <div className="flex items-center gap-3 shrink-0">
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
