import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function isPlatformOwner(userId: string): Promise<boolean> {
  const { data } = await createAdminClient()
    .from('platform_owners').select('platform_user_id').eq('platform_user_id', userId).single()
  return !!data
}

// ponytail: single global bootstrap — whoever logs in first (while the table
// is empty) becomes the founding Platform Owner. No-op forever after that.
export async function bootstrapFirstOwner(userId: string): Promise<void> {
  const admin = createAdminClient()
  const { count } = await admin.from('platform_owners').select('*', { count: 'exact', head: true })
  if (!count) await admin.from('platform_owners').insert({ platform_user_id: userId })
}

export type PlatformOwnerContext = { user: { id: string; email: string | undefined } }

export async function getPlatformOwnerContext(): Promise<PlatformOwnerContext | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  if (!(await isPlatformOwner(user.id))) return null
  return { user: { id: user.id, email: user.email } }
}
