import { getPlatformOwnersAction } from './actions'
import { OwnersManager } from './owners-manager'
import { PageHeader } from '@/app/dashboard/settings/_components'

export default async function PlatformOwnersPage() {
  const result = await getPlatformOwnersAction()

  return (
    <>
      <PageHeader title="Platform Owners" description="Global admins who manage every tenant on God Recruiter." />
      {'error' in result ? (
        <p className="text-sm text-destructive">{result.error}</p>
      ) : (
        <OwnersManager initialOwners={result.owners} />
      )}
    </>
  )
}
