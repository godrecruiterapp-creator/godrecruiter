import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getTenantMemberContext } from '@/lib/tenant/permissions'

export default async function SettingsLayout({ children }: { children: ReactNode }) {
  const ctx = await getTenantMemberContext()
  if (!ctx || !ctx.is_system_role) redirect('/dashboard')

  return <div className="h-full overflow-y-auto bg-background">{children}</div>
}
