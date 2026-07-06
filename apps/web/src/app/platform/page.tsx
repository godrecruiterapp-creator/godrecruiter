import { getTenantsAction } from './actions'
import { TenantsManager } from './tenants-manager'
import { PageHeader } from '@/app/dashboard/settings/_components'

export default async function PlatformTenantsPage() {
  const result = await getTenantsAction()

  return (
    <>
      <PageHeader title="Tenants" description="Every company running on God Recruiter." />
      {'error' in result ? (
        <p className="text-sm text-destructive">{result.error}</p>
      ) : (
        <TenantsManager initialTenants={result.tenants} />
      )}
    </>
  )
}
