'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ulid } from 'ulid'
import { redirect } from 'next/navigation'
import { mapContactRow, mapFacilityRow } from './_data'

async function getUserContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const [{ data: membership }, { data: profile }] = await Promise.all([
    admin.from('platform_user_tenants').select('tenant_id').eq('platform_user_id', user.id).eq('is_active', true).single(),
    admin.from('platform_users').select('full_name').eq('id', user.id).single(),
  ])
  if (!membership) return null
  return { user, tenant_id: membership.tenant_id, name: profile?.full_name || user.email || 'Unknown' }
}

async function logActivity(admin: ReturnType<typeof createAdminClient>, clientId: string, tenantId: string, actorId: string, actorName: string, action: string) {
  await admin.from('client_activity').insert({
    id: ulid(), client_id: clientId, tenant_id: tenantId, actor_id: actorId, actor_name: actorName, action,
  })
}

// ── Client CRUD ───────────────────────────────────────────────────────────────

export async function createClientAction(formData: FormData) {
  const ctx = await getUserContext()
  if (!ctx) return { success: false as const, error: 'Not authenticated.' }

  const name = formData.get('name') as string
  if (!name?.trim()) return { success: false as const, error: 'Company name is required.' }

  const admin = createAdminClient()
  const id = ulid()
  const tags = (formData.get('tags') as string || '').split(',').map(t => t.trim()).filter(Boolean)

  const { error } = await admin.from('clients').insert({
    id,
    tenant_id: ctx.tenant_id,
    name,
    display_name: (formData.get('display_name') as string) || name,
    legal_name: (formData.get('legal_name') as string) || null,
    industry: (formData.get('industry') as string) || 'Other',
    company_type: (formData.get('company_type') as string) || 'direct',
    status: (formData.get('status') as string) || 'prospect',
    website: (formData.get('website') as string) || null,
    tax_id: (formData.get('tax_id') as string) || null,
    company_size: (formData.get('company_size') as string) || null,
    city: (formData.get('city') as string) || null,
    state: (formData.get('state') as string) || null,
    country: (formData.get('country') as string) || 'USA',
    zip: (formData.get('zip') as string) || null,
    timezone: (formData.get('timezone') as string) || null,
    account_owner: (formData.get('account_owner') as string) || null,
    recruitment_manager: (formData.get('recruitment_manager') as string) || null,
    primary_recruiter: (formData.get('primary_recruiter') as string) || null,
    preferred_communication: (formData.get('preferred_communication') as string) || 'Email',
    preferred_submission_method: (formData.get('preferred_submission_method') as string) || 'Email',
    preferred_resume_format: (formData.get('preferred_resume_format') as string) || 'PDF',
    preferred_interview_process: (formData.get('preferred_interview_process') as string) || null,
    special_instructions: (formData.get('special_instructions') as string) || null,
    tags,
    created_by: ctx.user.id,
  })

  if (error) return { success: false as const, error: `Failed to create client: ${error.message}` }

  await logActivity(admin, id, ctx.tenant_id, ctx.user.id, ctx.name, 'created this client')

  redirect(`/dashboard/clients/${id}`)
}

export async function updateClientInfoAction(clientId: string, formData: FormData) {
  const ctx = await getUserContext()
  if (!ctx) return { success: false as const, error: 'Not authenticated.' }

  const admin = createAdminClient()
  const { error } = await admin.from('clients').update({
    display_name: formData.get('display_name') as string,
    legal_name: formData.get('legal_name') as string,
    website: formData.get('website') as string,
    tax_id: formData.get('tax_id') as string,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    special_instructions: formData.get('special_instructions') as string,
  }).eq('id', clientId).eq('tenant_id', ctx.tenant_id)

  if (error) return { success: false as const, error: error.message }

  await logActivity(admin, clientId, ctx.tenant_id, ctx.user.id, ctx.name, 'updated client info')
  return { success: true as const }
}

// ── Contacts ───────────────────────────────────────────────────────────────────

export async function addClientContactAction(clientId: string, formData: FormData) {
  const ctx = await getUserContext()
  if (!ctx) return { success: false as const, error: 'Not authenticated.' }
  const name = formData.get('name') as string
  if (!name?.trim()) return { success: false as const, error: 'Contact name is required.' }

  const admin = createAdminClient()
  const { count } = await admin.from('client_contacts').select('id', { count: 'exact', head: true }).eq('client_id', clientId)

  const id = ulid()
  const { data: row, error } = await admin.from('client_contacts').insert({
    id, client_id: clientId, tenant_id: ctx.tenant_id,
    name,
    title: (formData.get('title') as string) || null,
    department: (formData.get('department') as string) || null,
    email: (formData.get('email') as string) || null,
    phone: (formData.get('phone') as string) || null,
    decision_maker: formData.get('decision_maker') === 'on',
    is_primary: !count,
  }).select().single()

  if (error) return { success: false as const, error: error.message }
  await logActivity(admin, clientId, ctx.tenant_id, ctx.user.id, ctx.name, `added contact ${name}`)
  return { success: true as const, contact: mapContactRow(row) }
}

// ── Facilities ─────────────────────────────────────────────────────────────────

export async function addClientFacilityAction(clientId: string, formData: FormData) {
  const ctx = await getUserContext()
  if (!ctx) return { success: false as const, error: 'Not authenticated.' }
  const name = formData.get('name') as string
  if (!name?.trim()) return { success: false as const, error: 'Facility name is required.' }

  const admin = createAdminClient()
  const id = ulid()
  const { data: row, error } = await admin.from('client_facilities').insert({
    id, client_id: clientId, tenant_id: ctx.tenant_id,
    name,
    type: (formData.get('type') as string) || 'Hospital',
    city: (formData.get('city') as string) || null,
    state: (formData.get('state') as string) || null,
    facility_manager: (formData.get('facility_manager') as string) || null,
  }).select().single()

  if (error) return { success: false as const, error: error.message }
  await logActivity(admin, clientId, ctx.tenant_id, ctx.user.id, ctx.name, `added facility ${name}`)
  return { success: true as const, facility: mapFacilityRow(row) }
}

// ── Notes ──────────────────────────────────────────────────────────────────────

export async function addClientNoteAction(clientId: string, text: string) {
  const ctx = await getUserContext()
  if (!ctx) return { success: false as const, error: 'Not authenticated.' }
  if (!text.trim()) return { success: false as const, error: 'Note text is required.' }

  const admin = createAdminClient()
  const id = ulid()
  const created_at = new Date().toISOString()
  const { error } = await admin.from('client_notes').insert({
    id, client_id: clientId, tenant_id: ctx.tenant_id,
    author_id: ctx.user.id, author_name: ctx.name, text,
  })
  if (error) return { success: false as const, error: error.message }
  await logActivity(admin, clientId, ctx.tenant_id, ctx.user.id, ctx.name, 'added a note')
  return { success: true as const, id, author_name: ctx.name, created_at }
}

// ── Activity (also used by quick-action buttons: Call / Email / Schedule) ─────

export async function addClientActivityAction(clientId: string, action: string) {
  const ctx = await getUserContext()
  if (!ctx) return { success: false as const, error: 'Not authenticated.' }
  const admin = createAdminClient()
  const id = ulid()
  const created_at = new Date().toISOString()
  const { error } = await admin.from('client_activity').insert({
    id, client_id: clientId, tenant_id: ctx.tenant_id,
    actor_id: ctx.user.id, actor_name: ctx.name, action,
  })
  if (error) return { success: false as const, error: error.message }
  return { success: true as const, id, actor_name: ctx.name, created_at }
}

// ── Documents ──────────────────────────────────────────────────────────────────

export async function uploadClientDocumentAction(clientId: string, formData: FormData) {
  const ctx = await getUserContext()
  if (!ctx) return { success: false as const, error: 'Not authenticated.' }
  const file = formData.get('file') as File
  if (!file) return { success: false as const, error: 'No file.' }

  const admin = createAdminClient()
  const fileId = ulid()
  const ext = file.name.split('.').pop()
  const path = `${ctx.tenant_id}/${clientId}/${fileId}.${ext}`
  const { error: upErr } = await admin.storage.from('client-documents').upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type })
  if (upErr) return { success: false as const, error: upErr.message }

  const created_at = new Date().toISOString()
  const { error: dbErr } = await admin.from('client_documents').insert({
    id: fileId, client_id: clientId, tenant_id: ctx.tenant_id,
    name: file.name, size: file.size, file_type: file.type,
    storage_path: path, uploader_id: ctx.user.id, uploader_name: ctx.name,
  })
  if (dbErr) return { success: false as const, error: dbErr.message }

  await logActivity(admin, clientId, ctx.tenant_id, ctx.user.id, ctx.name, `uploaded document: ${file.name}`)
  return { success: true as const, id: fileId, name: file.name, size: file.size, file_type: file.type, uploader_name: ctx.name, created_at }
}

export async function deleteClientDocumentAction(docId: string) {
  const ctx = await getUserContext()
  if (!ctx) return { error: 'Not authenticated.' }
  const admin = createAdminClient()
  const { data: doc } = await admin.from('client_documents').select('storage_path').eq('id', docId).single()
  if (doc?.storage_path) await admin.storage.from('client-documents').remove([doc.storage_path])
  await admin.from('client_documents').delete().eq('id', docId)
  return { success: true }
}

// ── Client picker for the "New job" autofill (client name → city/state/contact) ─

export type ClientAutofillRow = {
  id: string; name: string; city: string; state: string
  companyType: 'direct' | 'vms'; hiringManager: string
}

export async function getClientsAutofillAction(): Promise<ClientAutofillRow[]> {
  const ctx = await getUserContext()
  if (!ctx) return []
  const admin = createAdminClient()

  const { data: clients } = await admin
    .from('clients')
    .select('id, name, city, state, company_type')
    .eq('tenant_id', ctx.tenant_id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (!clients?.length) return []

  const { data: contacts } = await admin
    .from('client_contacts')
    .select('client_id, name, is_primary')
    .in('client_id', clients.map(c => c.id))
    .eq('is_primary', true)

  const primaryByClient = new Map((contacts ?? []).map(c => [c.client_id, c.name]))

  return clients.map(c => ({
    id: c.id, name: c.name, city: c.city ?? '', state: c.state ?? '',
    companyType: c.company_type, hiringManager: primaryByClient.get(c.id) ?? '',
  }))
}
