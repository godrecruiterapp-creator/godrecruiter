'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ulid } from 'ulid'
import { redirect } from 'next/navigation'

async function getTenantId(userId: string) {
  const admin = createAdminClient()
  const { data } = await admin
    .from('platform_user_tenants')
    .select('tenant_id')
    .eq('platform_user_id', userId)
    .eq('is_active', true)
    .single()
  return data?.tenant_id ?? null
}

export async function createCandidateAction(formData: FormData): Promise<{ error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const tenantId = await getTenantId(user.id)
  if (!tenantId) return { error: 'No workspace found.' }

  const first_name       = formData.get('first_name') as string
  const last_name        = formData.get('last_name') as string
  const email            = formData.get('email') as string
  const phone            = formData.get('phone') as string
  const current_title    = formData.get('current_title') as string
  const current_company  = formData.get('current_company') as string
  const location         = formData.get('location') as string
  const linkedin_url     = formData.get('linkedin_url') as string
  const candidate_type   = formData.get('candidate_type') as string
  const notice_period    = formData.get('notice_period') as string
  const source           = formData.get('source') as string
  const notes            = formData.get('notes') as string
  const current_ctc_raw  = formData.get('current_ctc') as string
  const expected_ctc_raw = formData.get('expected_ctc') as string

  if (!first_name || !last_name) return { error: 'First and last name are required.' }
  if (!email) return { error: 'Email is required.' }

  const admin = createAdminClient()
  const { data: candidate, error } = await admin.from('candidates').insert({
    id: ulid(),
    tenant_id: tenantId,
    first_name,
    last_name,
    email,
    phone: phone || null,
    current_title: current_title || null,
    current_company: current_company || null,
    location: location || null,
    linkedin_url: linkedin_url || null,
    candidate_type: candidate_type || 'unknown',
    notice_period: notice_period || null,
    source: source || null,
    notes: notes || null,
    current_ctc: current_ctc_raw ? parseInt(current_ctc_raw) : null,
    expected_ctc: expected_ctc_raw ? parseInt(expected_ctc_raw) : null,
    created_by: user.id,
  }).select('id').single()

  if (error) {
    if (error.code === '23505') return { error: 'A candidate with this email already exists.' }
    return { error: `Failed to add candidate: ${error.message}` }
  }

  redirect(`/dashboard/candidates/${candidate.id}`)
}

export async function deleteCandidateAction(candidateId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const admin = createAdminClient()
  await admin.from('candidates').update({ deleted_at: new Date().toISOString() }).eq('id', candidateId)

  redirect('/dashboard/candidates')
}
