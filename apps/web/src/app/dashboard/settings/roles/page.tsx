import { getTenantMemberContext, hasPermission } from '@/lib/tenant/permissions'
import { Breadcrumb, PageHeader } from '../_components'
import { getRolesAction } from './actions'
import { RolesManager } from './roles-manager'

export default async function RolesPage() {
  const ctx = await getTenantMemberContext()
  const allowed = ctx ? await hasPermission(ctx, 'settings', 'view') : false

  if (!allowed) {
    return (
      <div className="px-8 py-10">
        <Breadcrumb />
        <PageHeader title="Roles & Permissions" description="Control what each role can see and do across God Recruiter." />
        <p className="text-sm text-muted-foreground">You don't have permission to view this page.</p>
      </div>
    )
  }

  const result = await getRolesAction()

  return (
    <div className="px-8 py-10">
      <Breadcrumb />
      <PageHeader title="Roles & Permissions" description="Control what each role can see and do across God Recruiter." />
      {'error' in result ? (
        <p className="text-sm text-destructive">{result.error}</p>
      ) : (
        <RolesManager initialRoles={result.roles} />
      )}
    </div>
  )
}
