'use server'

import { createClient }      from '@/lib/supabase/server'
import { provisionTenant }   from '@/lib/tenant/provision'
import { createTenantSchema } from '@god-recruiter/validators/tenant'

interface CreateWorkspaceInput {
  name: string
  slug: string
}

export async function createWorkspaceAction(
  input: CreateWorkspaceInput
): Promise<{ error?: string; redirectTo?: string }> {
  // Validate input
  const parsed = createTenantSchema.safeParse({ ...input, region: 'us-east-1' })
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? 'Invalid workspace details.'
    return { error: msg }
  }

  // Get current user
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) return { error: 'You must be signed in to create a workspace.' }

  const fullName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split('@')[0] ??
    'Team Owner'

  try {
    const tenant = await provisionTenant(
      parsed.data,
      user.id,
      user.email!,
      fullName
    )
    return { redirectTo: `https://${tenant.slug}.godrecruiter.com/dashboard` }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'

    if (message.includes('unique') || message.includes('slug')) {
      return { error: 'This workspace URL is already taken. Choose a different one.' }
    }

    console.error('Workspace creation error:', message)
    return { error: 'Could not create workspace. Please try again.' }
  }
}
