'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface Props {
  userName: string
  userEmail: string
}

export function Header({ userName, userEmail }: Props) {
  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <div className="flex flex-1 items-center justify-end gap-3">
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
