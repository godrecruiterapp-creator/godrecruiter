import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ProfileForm } from './profile-form'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const [membershipRes, profileRes] = await Promise.all([
    admin.from('platform_user_tenants')
      .select('role, tenants(name)')
      .eq('platform_user_id', user.id)
      .eq('is_active', true)
      .single(),
    admin.from('platform_users')
      .select('full_name')
      .eq('id', user.id)
      .single(),
  ])

  const fullName = profileRes.data?.full_name
    ?? user.user_metadata?.full_name
    ?? user.email?.split('@')[0]
    ?? 'User'

  const tenantName = (membershipRes.data?.tenants as any)?.name ?? null
  const role       = (membershipRes.data as any)?.role ?? null
  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page header */}
      <div className="px-6 lg:px-8 py-5 border-b bg-background shrink-0">
        <h1 className="text-lg font-semibold tracking-tight">My Profile</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Manage your personal information and account security</p>
      </div>

      <ProfileForm
        fullName={fullName}
        email={user.email ?? ''}
        tenantName={tenantName}
        role={role}
        memberSince={memberSince}
      />
    </div>
  )
}
