import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { mapClientRow, mapContactRow, mapFacilityRow, type Client, type ClientContact, type ClientFacility } from '../_data'
import { ClientWorkspaceClient } from './client-workspace-client'

export const revalidate = 0

export type WorkspaceJob = {
  id: string; title: string; status: string; openings: number | null; recruiter_name: string | null
}
export type WorkspaceCandidate = {
  submissionId: string; candidateId: string; name: string; jobTitle: string; stage: string; submittedAt: string
}
export type WorkspaceDoc = { id: string; name: string; category: string; size: number; uploadedAt: string; uploaderName: string; url: string }
export type WorkspaceActivity = { id: string; actor: string; action: string; time: string }
export type WorkspaceNote = { id: string; author: string; text: string; time: string }

export default async function ClientWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: clientRow } = await admin
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', membership.tenant_id)
    .is('deleted_at', null)
    .single()
  if (!clientRow) notFound()

  const client: Client = mapClientRow(clientRow)

  let jobs: WorkspaceJob[] = []
  let candidates: WorkspaceCandidate[] = []
  let contacts: ClientContact[] = []
  let facilities: ClientFacility[] = []
  let documents: WorkspaceDoc[] = []
  let activity: WorkspaceActivity[] = []
  let notes: WorkspaceNote[] = []

  try {
    const [
      { data: jobRows }, { data: submissionRows },
      { data: contactRows }, { data: facilityRows },
      { data: docRows }, { data: activityRows }, { data: noteRows },
    ] = await Promise.all([
      admin.from('jobs').select('id, title, status, openings, recruiter_name')
        .eq('tenant_id', membership.tenant_id).eq('client', client.name).is('deleted_at', null)
        .order('created_at', { ascending: false }),
      admin.from('job_candidates').select('id, stage, created_at, candidates(id, first_name, last_name), jobs!inner(title, client)')
        .eq('jobs.client', client.name).order('created_at', { ascending: false }),
      admin.from('client_contacts').select('*').eq('client_id', id).order('created_at'),
      admin.from('client_facilities').select('*').eq('client_id', id).order('created_at'),
      admin.from('client_documents').select('*').eq('client_id', id).order('created_at', { ascending: false }),
      admin.from('client_activity').select('*').eq('client_id', id).order('created_at', { ascending: false }).limit(50),
      admin.from('client_notes').select('*').eq('client_id', id).order('created_at', { ascending: false }),
    ])

    jobs = (jobRows ?? []) as WorkspaceJob[]
    candidates = (submissionRows ?? []).map((r: any) => ({
      submissionId: r.id,
      candidateId: r.candidates?.id ?? '',
      name: [r.candidates?.first_name, r.candidates?.last_name].filter(Boolean).join(' ') || 'Unnamed',
      jobTitle: r.jobs?.title ?? '',
      stage: r.stage ?? '',
      submittedAt: r.created_at,
    }))
    contacts = (contactRows ?? []).map(mapContactRow)
    facilities = (facilityRows ?? []).map(mapFacilityRow)
    documents = (docRows ?? []).map((d: any) => ({
      id: d.id, name: d.name, category: d.category, size: d.size ?? 0, uploadedAt: d.created_at, uploaderName: d.uploader_name,
      url: d.storage_path ? admin.storage.from('client-documents').getPublicUrl(d.storage_path).data.publicUrl : '',
    }))
    activity = (activityRows ?? []).map((a: any) => ({ id: a.id, actor: a.actor_name, action: a.action, time: a.created_at }))
    notes = (noteRows ?? []).map((n: any) => ({ id: n.id, author: n.author_name, text: n.text, time: n.created_at }))
  } catch (err) {
    console.error('Client workspace fetch error:', err)
  }

  return (
    <ClientWorkspaceClient
      client={client}
      contacts={contacts}
      facilities={facilities}
      jobs={jobs}
      candidates={candidates}
      documents={documents}
      activity={activity}
      notes={notes}
    />
  )
}
