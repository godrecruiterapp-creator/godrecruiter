import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AppSidebar } from '@/components/app/sidebar'
import { Header } from '@/components/app/header'
import { Skeleton } from '@/components/ui/skeleton'
import { BreadcrumbProvider } from '@/components/app/breadcrumb-provider'
import { Toaster } from '@/components/ui/sonner'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const { data: membership } = await admin.from('platform_user_tenants')
    .select('tenants(status)').eq('platform_user_id', user.id).eq('is_active', true).single()
  const tenantStatus = (membership?.tenants as unknown as { status: string } | null)?.status
  if (tenantStatus === 'suspended' || tenantStatus === 'cancelled') redirect('/auth/suspended')

  const fullName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split('@')[0] ??
    'User'

  const { data: profile } = await admin
    .from('platform_users').select('avatar_url').eq('id', user.id).single()
  const avatarUrl = profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null

  const sidebarBehavior = (user.user_metadata?.sidebar_behavior ?? 'expanded') as 'expanded' | 'collapsed' | 'hover'

  return (
    <BreadcrumbProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <AppSidebar serverBehavior={sidebarBehavior} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header userName={fullName} userEmail={user.email ?? ''} userId={user.id} avatarUrl={avatarUrl} />
          <main className="flex-1 overflow-hidden bg-muted/30 flex flex-col">
            <Suspense fallback={<div className="p-6"><PageSkeleton /></div>}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </BreadcrumbProvider>
  )
}

function PageSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
    </div>
  )
}
