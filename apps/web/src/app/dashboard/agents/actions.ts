'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getOpenAIClient, OPENAI_MODEL, friendlyOpenAIError } from '@/lib/openai'
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

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return d < 30 ? `${d}d ago` : new Date(iso).toLocaleDateString()
}

// Per-agent run summary derived from agent_runs.
type RunSummary = { last_run: string; success_rate: number | null }

function toAgent(r: AgentRow, runs?: RunSummary): Agent {
  return {
    id: r.id,
    name: r.name,
    category: r.category ?? 'Custom',
    status: r.status,
    trigger: r.trigger ?? 'Manual',
    last_run: runs?.last_run ?? 'Never',
    next_run: nextRun(r.status, r.trigger),
    success_rate: runs?.success_rate ?? null,
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
  const [{ data: agents }, { data: runs }] = await Promise.all([
    admin.from('agents').select(COLS).eq('tenant_id', ctx.tenant_id).is('deleted_at', null).order('created_at', { ascending: false }),
    // ponytail: naive full scan of this tenant's runs, aggregated in JS. Swap for a
    // per-agent aggregate view if run volume ever makes this slow.
    admin.from('agent_runs').select('agent_id, status, started_at').eq('tenant_id', ctx.tenant_id).neq('status', 'running').order('started_at', { ascending: false }),
  ])
  const summary = new Map<string, RunSummary>()
  const counts = new Map<string, { ok: number; total: number }>()
  for (const run of (runs ?? []) as { agent_id: string; status: string; started_at: string }[]) {
    const c = counts.get(run.agent_id) ?? { ok: 0, total: 0 }
    c.total++; if (run.status === 'success') c.ok++
    counts.set(run.agent_id, c)
    if (!summary.has(run.agent_id)) summary.set(run.agent_id, { last_run: relativeTime(run.started_at), success_rate: null })
  }
  for (const [id, c] of counts) summary.get(id)!.success_rate = Math.round((c.ok / c.total) * 100)
  return (agents as AgentRow[] | null)?.map(r => toAgent(r, summary.get(r.id))) ?? []
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

// =============================================================================
// Execution engine (on-demand). A single generic runner: it feeds the agent's
// objective plus a slice of the tenant's real ATS data to the AI and records
// the result as an agent_runs row. No scheduler yet — this is the "Run Now" path.
// =============================================================================

export type AgentRunItem = { title: string; detail: string }
export type AgentRunOutput = { summary: string; items: AgentRunItem[] }
export type AgentRun = {
  id: string; agent_id: string; agent_name?: string; status: 'running' | 'success' | 'failed'
  output: AgentRunOutput | null; error: string | null; started_at: string; finished_at: string | null
}

async function loadTenantData(admin: ReturnType<typeof createAdminClient>, tenantId: string) {
  const [{ data: candidates }, { data: jobs }] = await Promise.all([
    admin.from('candidates')
      .select('first_name, last_name, current_title, current_company, location, source, candidate_type, notes')
      .eq('tenant_id', tenantId).is('deleted_at', null).order('created_at', { ascending: false }).limit(40),
    admin.from('jobs')
      .select('title, department, location, work_mode, job_type, status, openings, requirements')
      .eq('tenant_id', tenantId).is('deleted_at', null).order('created_at', { ascending: false }).limit(20),
  ])
  return { candidates: candidates ?? [], jobs: jobs ?? [] }
}

export async function runAgentAction(agentId: string): Promise<{ run: AgentRun } | { error: string }> {
  const ctx = await getUserContext()
  if (!ctx) return { error: 'Not authenticated.' }

  const admin = createAdminClient()
  const { data: agent } = await admin
    .from('agents')
    .select('id, name, description, category, trigger, config')
    .eq('id', agentId).eq('tenant_id', ctx.tenant_id).is('deleted_at', null).single()
  if (!agent) return { error: 'Agent not found.' }
  const { id: agentId_, name: agentName } = agent

  const client = getOpenAIClient()
  if (!client) return { error: 'AI features are not configured. Add OPENAI_API_KEY to run agents.' }

  const config = (agent.config ?? {}) as Record<string, unknown>
  const objective = String(config.objective || agent.description || agentName)

  // Open the run row first so a failure is still recorded.
  const runId = ulid()
  const { error: insertErr } = await admin.from('agent_runs').insert({
    id: runId, agent_id: agentId_, tenant_id: ctx.tenant_id,
    status: 'running', trigger: agent.trigger ?? 'Manual', created_by: ctx.user.id,
  })
  if (insertErr) return { error: `Couldn't start the run: ${insertErr.message}. (Has migration 0022_agent_runs been applied?)` }

  async function finish(fields: { status: 'success' | 'failed'; output?: AgentRunOutput; error?: string }): Promise<AgentRun> {
    const finished_at = new Date().toISOString()
    await admin.from('agent_runs').update({ ...fields, output: fields.output ?? null, error: fields.error ?? null, finished_at }).eq('id', runId)
    revalidatePath('/dashboard/agents/my-agents')
    revalidatePath('/dashboard/agents/history')
    return { id: runId, agent_id: agentId_, agent_name: agentName, status: fields.status, output: fields.output ?? null, error: fields.error ?? null, started_at: finished_at, finished_at }
  }

  const { candidates, jobs } = await loadTenantData(admin, ctx.tenant_id)

  try {
    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      max_tokens: 1200,
      tools: [{
        type: 'function',
        function: {
          name: 'report',
          description: 'Report the agent run result',
          parameters: {
            type: 'object',
            properties: {
              summary: { type: 'string', description: '1-2 sentence plain-English summary of what the agent found or did.' },
              items: {
                type: 'array', description: 'Specific findings, matched candidates, flagged jobs, or recommended actions. Empty if nothing relevant.',
                items: {
                  type: 'object',
                  properties: { title: { type: 'string' }, detail: { type: 'string' } },
                  required: ['title', 'detail'],
                },
              },
            },
            required: ['summary', 'items'],
          },
        },
      }],
      tool_choice: { type: 'function', function: { name: 'report' } },
      messages: [{
        role: 'user',
        content: `You are "${agent.name}", an AI recruiting agent for an ATS. Category: ${agent.category}.\n\nObjective: ${objective}\n\n`
          + `Work ONLY from the recruiter's real data below — never invent candidates, jobs, or facts. If the data doesn't support the objective, say so honestly in the summary and return an empty items list.\n\n`
          + `CANDIDATES (${candidates.length}):\n${JSON.stringify(candidates)}\n\nJOBS (${jobs.length}):\n${JSON.stringify(jobs)}`,
      }],
    })

    const toolCall = completion.choices[0]?.message.tool_calls?.[0]
    if (!toolCall || toolCall.type !== 'function') {
      return { run: await finish({ status: 'failed', error: 'The AI returned no result. Try running again.' }) }
    }
    const parsed = JSON.parse(toolCall.function.arguments) as AgentRunOutput
    const output: AgentRunOutput = { summary: String(parsed.summary ?? ''), items: Array.isArray(parsed.items) ? parsed.items : [] }
    return { run: await finish({ status: 'success', output }) }
  } catch (err) {
    console.error('[runAgentAction] failed:', err)
    return { run: await finish({ status: 'failed', error: friendlyOpenAIError(err) }) }
  }
}

export async function getAgentRunsAction(agentId?: string): Promise<AgentRun[]> {
  const ctx = await getUserContext()
  if (!ctx) return []
  const admin = createAdminClient()
  let q = admin.from('agent_runs')
    .select('id, agent_id, status, output, error, started_at, finished_at, agents(name)')
    .eq('tenant_id', ctx.tenant_id).order('started_at', { ascending: false }).limit(100)
  if (agentId) q = q.eq('agent_id', agentId)
  const { data } = await q
  return ((data ?? []) as unknown as (Omit<AgentRun, 'agent_name'> & { agents: { name: string } | null })[])
    .map(({ agents, ...r }) => agents?.name ? { ...r, agent_name: agents.name } : r)
}
