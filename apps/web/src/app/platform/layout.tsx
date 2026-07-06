import { redirect } from 'next/navigation'
import { getPlatformOwnerContext } from '@/lib/platform/owner'
import { logoutAction } from '@/app/(auth)/actions'
import { Toaster } from '@/components/ui/sonner'
import { PlatformNav } from './nav'

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getPlatformOwnerContext()
  if (!ctx) redirect('/auth/unauthorized')

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="flex items-center justify-between px-6 h-14 border-b border-border bg-background">
        <div className="flex items-center gap-2.5">
          <img src="/logo-icon-square.png" alt="" className="size-6 object-contain" />
          <span className="text-sm font-semibold tracking-tight">God Recruiter — Platform</span>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sign out
          </button>
        </form>
      </header>
      <PlatformNav />
      <main className="p-6 max-w-4xl mx-auto">{children}</main>
      <Toaster position="bottom-right" />
    </div>
  )
}
