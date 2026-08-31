'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ulid } from 'ulid'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type { Project } from './_data'

// Project type id (from the New Project wizard) → human label stored in the DB.
const TYPE_LABELS: Record<string, string> = {
  campaign: 'Hiring Campaign',
  pool:     'Talent Pool',
  future:   'Future Hiring',
  redeploy: 'Redeployment',
  pipeline: 'Pipeline',
  client:   'Client Specific',
  internal: 'Internal',
  custom:   'Custom',
}

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

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'Just now'
  if (min < 60) return `${min} min ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} hour${hr > 1 ? 's' : ''} ago`
  const day = Math.floor(hr / 24)
  return `${day} day${day > 1 ? 's' : ''} ago`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// DB row → the camelCase Project shape the existing UI already renders.
type ProjectRow = {
  id: string; name: string; description: string | null; type: string | null
  status: Project['status']; visibility: Project['visibility']
  owner_name: string | null; team: string[]; health_score: number
  created_at: string; updated_at: string
}

function toProject(r: ProjectRow): Project {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? '',
    type: r.type ?? 'Custom',
    status: r.status,
    owner: r.owner_name ?? 'Unknown',
    team: Array.isArray(r.team) ? r.team : [],
    candidateCount: 0,   // TODO: real count once project↔candidate links exist
    openJobs: 0,         // TODO: real count once project↔job links exist
    createdAt: formatDate(r.created_at),
    lastActivity: relativeTime(r.updated_at),
    healthScore: r.health_score,
    visibility: r.visibility,
  }
}

const COLS = 'id, name, description, type, status, visibility, owner_name, team, health_score, created_at, updated_at'

export type NewProjectInput = {
  name: string
  description: string
  type: string        // wizard type id
  visibility: string
  team: string[]
}

export async function createProjectAction(input: NewProjectInput) {
  const ctx = await getUserContext()
  if (!ctx) return { error: 'Not authenticated.' }

  const name = input.name?.trim()
  if (!name) return { error: 'Project name is required.' }

  const validVis = ['private', 'team', 'organization']
  const visibility = validVis.includes(input.visibility) ? input.visibility : 'team'

  const admin = createAdminClient()
  const id = ulid()
  const { error } = await admin.from('projects').insert({
    id,
    tenant_id: ctx.tenant_id,
    name,
    description: input.description?.trim() || null,
    type: TYPE_LABELS[input.type] ?? 'Custom',
    status: 'active',
    visibility,
    owner_name: ctx.name,
    team: Array.isArray(input.team) ? input.team : [],
    health_score: 50,
    created_by: ctx.user.id,
  })

  if (error) return { error: `Failed to create project: ${error.message}` }

  redirect(`/dashboard/projects/${id}?created=1`)
}

export async function getProjectsAction(): Promise<Project[]> {
  const ctx = await getUserContext()
  if (!ctx) return []
  const admin = createAdminClient()
  const { data } = await admin
    .from('projects')
    .select(COLS)
    .eq('tenant_id', ctx.tenant_id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  return (data as ProjectRow[] | null)?.map(toProject) ?? []
}

export async function getProjectAction(id: string): Promise<Project | null> {
  const ctx = await getUserContext()
  if (!ctx) return null
  const admin = createAdminClient()
  const { data } = await admin
    .from('projects')
    .select(COLS)
    .eq('tenant_id', ctx.tenant_id)
    .eq('id', id)
    .is('deleted_at', null)
    .single()
  return data ? toProject(data as ProjectRow) : null
}

export async function archiveProjectAction(id: string) {
  const ctx = await getUserContext()
  if (!ctx) return { error: 'Not authenticated.' }
  const admin = createAdminClient()
  const { error } = await admin.from('projects')
    .update({ status: 'archived' })
    .eq('id', id).eq('tenant_id', ctx.tenant_id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/projects/my-projects')
  return { success: true as const }
}

export async function deleteProjectAction(id: string) {
  const ctx = await getUserContext()
  if (!ctx) return { error: 'Not authenticated.' }
  const admin = createAdminClient()
  const { error } = await admin.from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id).eq('tenant_id', ctx.tenant_id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/projects/my-projects')
  return { success: true as const }
}
