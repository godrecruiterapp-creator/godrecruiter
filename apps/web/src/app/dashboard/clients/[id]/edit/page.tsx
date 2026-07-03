import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { mapClientRow } from '../../_data'
import { ClientForm } from '../../client-form'

export const revalidate = 0

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const { data: membership } = await admin
    .from('platform_user_tenants')
    .select('tenant_id')
    .eq('platform_user_id', user.id)
    .eq('is_active', true)
    .single()
  if (!membership) redirect('/auth/login')

  const { data: row } = await admin
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', membership.tenant_id)
    .is('deleted_at', null)
    .single()
  if (!row) notFound()

  return <ClientForm mode="edit" clientId={id} initial={mapClientRow(row)} />
}
