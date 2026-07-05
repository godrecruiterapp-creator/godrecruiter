import { Breadcrumb, PageHeader } from '../_components'
import { getUsersPageDataAction } from './actions'
import { UsersManager } from './users-manager'
import { LegacySettingsSections } from './legacy-sections'

export default async function UsersPage() {
  const result = await getUsersPageDataAction()

  return (
    <div className="px-8 py-10">
      <Breadcrumb />
      <PageHeader title="Users & Teams" description="Manage team members, roles, and recruiter capacity limits." />

      <div className="space-y-4">
        {'error' in result ? (
          <p className="text-sm text-destructive">{result.error}</p>
        ) : (
          <UsersManager initialMembers={result.members} initialRoles={result.roles} />
        )}
        <LegacySettingsSections />
      </div>
    </div>
  )
}
