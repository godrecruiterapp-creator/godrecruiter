'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ulid } from 'ulid'
import { revalidatePath } from 'next/cache'
import type { Agent, AgentStatus } from './_data'

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

type AgentRow = {
  id: string; name: string; category: string | null; status: AgentStatus
  trigger: string | null; owner_name: string | null
}

// A schedule-based trigger has a meaningful "next run"; Manual/Event do not.
const SCHEDULED_TRIGGERS = new Set(['Run Once', 'Hourly', 'Daily', 'Weekly', 'Monthly', 'Custom Schedule'])

function nextRun(status: AgentStatus, trigger: string | null): string {
  if (status === 'paused') return 'Paused'
  if (status === 'draft') return '—'
  if (trigger === 'Manual') return 'On demand'
  if (trigger === 'Event Based') return 'On trigger'
  if (trigger && SCHEDULED_TRIGGERS.has(trigger)) return 'Scheduled'
  return '—'
}

function toAgent(r: AgentRow): Agent {
  return {
    id: r.id,
    name: r.name,
    category: r.category ?? 'Custom',
    status: r.status,
    trigger: r.trigger ?? 'Manual',
    last_run: 'Never',        // no execution engine yet
    next_run: nextRun(r.status, r.trigger),
    success_rate: null,       // no runs yet
    owner: r.owner_name ?? 'Unknown',
  }
}

const COLS = 'id, name, category, status, trigger, owner_name'

// The full wizard state, persisted as-is into the config column.
export type NewAgentInput = {
  name: string
  description: string
  category: string
  trigger: string
  activate: boolean   // Activate Agent vs Save Draft
  config: Record<string, unknown>
}

export async function createAgentAction(input: NewAgentInput) {
  const ctx = await getUserContext()
  if (!ctx) return { error: 'Not authenticated.' }

  const name = input.name?.trim()
  if (!name) return { error: 'Agent name is required.' }

  const admin = createAdminClient()
  const id = ulid()
  const { error } = await admin.from('agents').insert({
    id,
    tenant_id: ctx.tenant_id,
    name,
    description: input.description?.trim() || null,
    category: input.category || 'Custom',
    status: input.activate ? 'active' : 'draft',
    trigger: input.trigger || 'Manual',
    config: input.config ?? {},
    owner_name: ctx.name,
    created_by: ctx.user.id,
  })

  if (error) return { error: `Failed to create agent: ${error.message}` }
  revalidatePath('/dashboard/agents/my-agents')
  revalidatePath('/dashboard/agents')
  return { success: true as const, id }
}

export async function getAgentsAction(): Promise<Agent[]> {
  const ctx = await getUserContext()
  if (!ctx) return []
  const admin = createAdminClient()
  const { data } = await admin
    .from('agents')
    .select(COLS)
    .eq('tenant_id', ctx.tenant_id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  return (data as AgentRow[] | null)?.map(toAgent) ?? []
}

export type AgentStats = { total: number; active: number; paused: number; draft: number }

export async function getAgentStatsAction(): Promise<AgentStats> {
  const ctx = await getUserContext()
  const empty = { total: 0, active: 0, paused: 0, draft: 0 }
  if (!ctx) return empty
  const admin = createAdminClient()
  const { data } = await admin
    .from('agents')
    .select('status')
    .eq('tenant_id', ctx.tenant_id)
    .is('deleted_at', null)
  if (!data) return empty
  return data.reduce((acc, r: { status: AgentStatus }) => {
    acc.total++
    acc[r.status]++
    return acc
  }, { ...empty })
}
