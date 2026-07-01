import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getClientById, getContactsForClient, getFacilitiesForClient } from '../_data'
import { ClientWorkspaceClient } from './client-workspace-client'

export const revalidate = 0

export type WorkspaceJob = {
  id: string; title: string; status: string; openings: number | null; recruiter_name: string | null
}
export type WorkspaceCandidate = {
  submissionId: string; candidateId: string; name: string; jobTitle: string; stage: string; submittedAt: string
}

export default async function ClientWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const client = getClientById(id)
  if (!client) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  let jobs: WorkspaceJob[] = []
  let candidates: WorkspaceCandidate[] = []

  try {
    const admin = createAdminClient()
    const { data: membership } = await admin
      .from('platform_user_tenants')
      .select('tenant_id')
      .eq('platform_user_id', user.id)
      .eq('is_active', true)
      .single()

    if (membership) {
      const { data: jobRows } = await admin
        .from('jobs')
        .select('id, title, status, openings, recruiter_name')
        .eq('tenant_id', membership.tenant_id)
        .eq('client', client.name)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      jobs = (jobRows ?? []) as WorkspaceJob[]

      const { data: submissionRows } = await admin
        .from('job_candidates')
        .select('id, stage, created_at, candidates(id, first_name, last_name), jobs!inner(title, client)')
        .eq('jobs.client', client.name)
        .order('created_at', { ascending: false })

      candidates = (submissionRows ?? []).map((r: any) => ({
        submissionId: r.id,
        candidateId: r.candidates?.id ?? '',
        name: [r.candidates?.first_name, r.candidates?.last_name].filter(Boolean).join(' ') || 'Unnamed',
        jobTitle: r.jobs?.title ?? '',
        stage: r.stage ?? '',
        submittedAt: r.created_at,
      }))
    }
  } catch (err) {
    console.error('Client workspace fetch error:', err)
  }

  const contacts = getContactsForClient(client.id)
  const facilities = getFacilitiesForClient(client.id)

  return (
    <ClientWorkspaceClient
      client={client}
      contacts={contacts}
      facilities={facilities}
      jobs={jobs}
      candidates={candidates}
    />
  )
}
