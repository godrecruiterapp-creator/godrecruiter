import { redirect } from 'next/navigation'
import { createClient }      from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { WorkspaceList } from './workspace-list'

export default async function SelectWorkspacePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Fetch all workspaces this user belongs to
  const admin = createAdminClient()
  const { data: memberships } = await admin
    .from('platform_user_tenants')
    .select(`
      joined_at,
      tenant_roles ( name ),
      tenants (
        id,
        name,
        slug,
        logo_url,
        status,
        plan_id
      )
    `)
    .eq('platform_user_id', user.id)
    .eq('is_active', true)
    .order('joined_at', { ascending: false })

  type TenantRow = { id: string; name: string; slug: string; logo_url: string | null; status: string; plan_id: string }
  const workspaces = (memberships ?? [])
    .filter((m) => m.tenants)
    .map((m) => {
      const t = (m.tenants as unknown) as TenantRow
      const role = (m.tenant_roles as unknown as { name: string } | null)?.name ?? ''
      return { ...t, role }
    })

  // If user has exactly one workspace, skip the picker and go straight in
  if (workspaces.length === 1) {
    redirect('/dashboard')
  }

  // No workspaces — companies are onboarded by God Recruiter, not self-serve
  if (workspaces.length === 0) {
    redirect('/auth/unauthorized')
  }

  const fullName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email

  return <WorkspaceList workspaces={workspaces} userName={fullName} />
}
