'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getOpenAIClient, OPENAI_MODEL } from '@/lib/openai'
import { ulid } from 'ulid'
import { revalidatePath } from 'next/cache'

// ─── Shared builder types (mirror automation/new/page.tsx Block) ──────────────

export type Block =
  | { id: string; type: 'trigger';   value: string | null }
  | { id: string; type: 'condition'; values: string[]; input?: string }
  | { id: string; type: 'timing';    value: string }
  | { id: string; type: 'action';    value: string | null }

export type Automation = {
  id: string; name: string; status: 'on' | 'off'; category: string
  trigger: string | null; summary: string; createdBy: string
  runsToday: number; runsMonth: number; lastRun: string
}

export type RunStep = { action: string; status: 'done' | 'skipped' | 'failed'; detail: string }
export type AutomationRun = {
  id: string; automation_id: string; automation_name?: string; trigger: string | null
  subject_label: string | null; status: 'success' | 'partial' | 'skipped' | 'failed'
  steps: RunStep[]; created_at: string
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

function triggerOf(blocks: Block[]): string | null {
  return blocks.find(b => b.type === 'trigger')?.value ?? null
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export type NewAutomationInput = { name: string; category?: string; summary: string; blocks: Block[] }

export async function createAutomationAction(input: NewAutomationInput) {
  const ctx = await getUserContext()
  if (!ctx) return { error: 'Not authenticated.' }
  const name = input.name?.trim()
  if (!name) return { error: 'Automation name is required.' }
  const trigger = triggerOf(input.blocks)
  if (!trigger) return { error: 'Add a trigger before saving.' }

  const admin = createAdminClient()
  const id = ulid()
  const { error } = await admin.from('automations').insert({
    id, tenant_id: ctx.tenant_id, name, status: 'on',
    category: input.category || 'Custom', trigger, summary: input.summary || '',
    config: { blocks: input.blocks }, owner_name: ctx.name, created_by: ctx.user.id,
  })
  if (error) return { error: `Couldn't save automation: ${error.message}. (Has migration 0023_automations been applied?)` }
  revalidatePath('/dashboard/automation/my-automations')
  return { success: true as const, id }
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m} min ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`
  const d = Math.floor(h / 24)
  return d < 30 ? `${d} day${d > 1 ? 's' : ''} ago` : new Date(iso).toLocaleDateString()
}

export async function getAutomationsAction(): Promise<Automation[]> {
  const ctx = await getUserContext()
  if (!ctx) return []
  const admin = createAdminClient()
  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0)
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0)

  const [{ data: rows }, { data: runs }] = await Promise.all([
    admin.from('automations').select('id, name, status, category, trigger, summary, owner_name')
      .eq('tenant_id', ctx.tenant_id).is('deleted_at', null).order('created_at', { ascending: false }),
    // ponytail: naive full scan of this month's runs, aggregated in JS. Swap for a
    // per-automation aggregate if run volume ever makes this slow.
    admin.from('automation_runs').select('automation_id, created_at')
      .eq('tenant_id', ctx.tenant_id).gte('created_at', startOfMonth.toISOString()),
  ])

  const today = new Map<string, number>(), month = new Map<string, number>(), last = new Map<string, string>()
  for (const r of (runs ?? []) as { automation_id: string; created_at: string }[]) {
    month.set(r.automation_id, (month.get(r.automation_id) ?? 0) + 1)
    if (new Date(r.created_at) >= startOfDay) today.set(r.automation_id, (today.get(r.automation_id) ?? 0) + 1)
    if (!last.has(r.automation_id)) last.set(r.automation_id, r.created_at)
    else if (new Date(r.created_at) > new Date(last.get(r.automation_id)!)) last.set(r.automation_id, r.created_at)
  }

  return ((rows ?? []) as {
    id: string; name: string; status: 'on' | 'off'; category: string | null; trigger: string | null; summary: string | null; owner_name: string | null
  }[]).map(r => ({
    id: r.id, name: r.name, status: r.status, category: r.category ?? 'Custom', trigger: r.trigger,
    summary: r.summary ?? '', createdBy: r.owner_name ?? 'Unknown',
    runsToday: today.get(r.id) ?? 0, runsMonth: month.get(r.id) ?? 0,
    lastRun: last.has(r.id) ? relativeTime(last.get(r.id)!) : 'Never',
  }))
}

export async function toggleAutomationAction(id: string, status: 'on' | 'off') {
  const ctx = await getUserContext()
  if (!ctx) return { error: 'Not authenticated.' }
  const admin = createAdminClient()
  const { error } = await admin.from('automations').update({ status }).eq('id', id).eq('tenant_id', ctx.tenant_id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/automation/my-automations')
  return { success: true as const }
}

export async function deleteAutomationAction(id: string) {
  const ctx = await getUserContext()
  if (!ctx) return { error: 'Not authenticated.' }
  const admin = createAdminClient()
  const { error } = await admin.from('automations').update({ deleted_at: new Date().toISOString() }).eq('id', id).eq('tenant_id', ctx.tenant_id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/automation/my-automations')
  return { success: true as const }
}

export async function getAutomationRunsAction(automationId?: string): Promise<AutomationRun[]> {
  const ctx = await getUserContext()
  if (!ctx) return []
  const admin = createAdminClient()
  let q = admin.from('automation_runs')
    .select('id, automation_id, trigger, subject_label, status, steps, created_at, automations(name)')
    .eq('tenant_id', ctx.tenant_id).order('created_at', { ascending: false }).limit(200)
  if (automationId) q = q.eq('automation_id', automationId)
  const { data } = await q
  return ((data ?? []) as unknown as (Omit<AutomationRun, 'automation_name'> & { automations: { name: string } | null })[])
    .map(({ automations, ...r }) => automations?.name ? { ...r, automation_name: automations.name } : r)
}

// ─── Realtime execution engine ───────────────────────────────────────────────
// Actions we can actually perform today. Everything else is logged as skipped so
// nothing is faked — see the AskUserQuestion decision.
const NOTIFY_ACTIONS = new Set(['notify_recruiter', 'notify_manager', 'send_reminder', 'create_followup'])

const ACTION_LABELS: Record<string, string> = {
  send_email: 'Send Email', send_sms: 'Send SMS', send_teams: 'Send Teams Message', call_candidate: 'Call Candidate',
  notify_recruiter: 'Notify Recruiter', notify_manager: 'Notify Manager', send_reminder: 'Send Reminder',
  create_followup: 'Create Follow-up', create_note: 'Create Note', gen_summary: 'Generate AI Summary',
}
const actionLabel = (id: string) => ACTION_LABELS[id] ?? id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

export type DispatchSubject = {
  kind: 'candidate'
  id: string
  label: string
  recipientId: string | null      // who to notify (e.g. the creator/recruiter)
  data: Record<string, unknown>   // fields for AI summary
}

/**
 * Fire every "on" automation whose trigger matches `event`, in realtime.
 * Called from the server action that produced the event (fire-and-forget: it
 * must never throw back into the caller). Records one automation_runs row each.
 */
export async function dispatchEvent(tenantId: string, event: string, subject: DispatchSubject): Promise<void> {
  try {
    const admin = createAdminClient()
    const { data: autos } = await admin.from('automations')
      .select('id, name, config')
      .eq('tenant_id', tenantId).eq('trigger', event).eq('status', 'on').is('deleted_at', null)
    if (!autos?.length) return

    for (const auto of autos as { id: string; name: string; config: { blocks?: Block[] } }[]) {
      await runAutomation(admin, tenantId, auto, subject)
    }
  } catch (err) {
    console.error('[dispatchEvent] failed:', err)
  }
}

async function runAutomation(
  admin: ReturnType<typeof createAdminClient>, tenantId: string,
  auto: { id: string; name: string; config: { blocks?: Block[] } }, subject: DispatchSubject,
) {
  const blocks = auto.config?.blocks ?? []
  const steps: RunStep[] = []

  // Timing gate: only "Immediately" fires live. Anything scheduled waits for the scheduler.
  const timing = blocks.find(b => b.type === 'timing') as Extract<Block, { type: 'timing' }> | undefined
  if (timing && timing.value !== 'Immediately') {
    await writeRun(admin, tenantId, auto, subject, 'skipped', [{ action: 'timing', status: 'skipped', detail: `"${timing.value}" needs the scheduler (not built yet).` }])
    return
  }

  // Conditions aren't evaluated yet — record honestly if present.
  const conditions = blocks.filter(b => b.type === 'condition') as Extract<Block, { type: 'condition' }>[]
  if (conditions.some(c => c.values.length)) {
    steps.push({ action: 'condition', status: 'skipped', detail: 'Conditions are not enforced yet — actions ran regardless.' })
  }

  const actions = blocks.filter(b => b.type === 'action' && b.value) as Extract<Block, { type: 'action' }>[]
  for (const a of actions) {
    const id = a.value as string
    try {
      if (NOTIFY_ACTIONS.has(id)) {
        if (!subject.recipientId) { steps.push({ action: id, status: 'skipped', detail: 'No recipient to notify.' }); continue }
        await admin.from('notifications').insert({
          id: ulid(), tenant_id: tenantId, recipient_id: subject.recipientId, actor_name: `Automation · ${auto.name}`,
          type: 'automation', title: auto.name, body: `${actionLabel(id)} — ${subject.label}`, link: `/dashboard/candidates/${subject.id}`,
        })
        steps.push({ action: id, status: 'done', detail: `Notified about ${subject.label}.` })
      } else if (id === 'create_note') {
        await admin.from('candidate_notes').insert({
          id: ulid(), candidate_id: subject.id, tenant_id: tenantId, author_name: `Automation · ${auto.name}`,
          text: `Automation "${auto.name}" ran.`,
        })
        steps.push({ action: id, status: 'done', detail: 'Note added.' })
      } else if (id === 'gen_summary') {
        const summary = await generateSummary(subject)
        if (!summary) { steps.push({ action: id, status: 'skipped', detail: 'AI is not configured (OPENAI_API_KEY).' }); continue }
        await admin.from('candidate_notes').insert({
          id: ulid(), candidate_id: subject.id, tenant_id: tenantId, author_name: `Automation · ${auto.name}`,
          text: `AI Summary:\n${summary}`,
        })
        steps.push({ action: id, status: 'done', detail: 'AI summary saved as a note.' })
      } else {
        steps.push({ action: id, status: 'skipped', detail: `${actionLabel(id)} isn't wired to a service yet.` })
      }
    } catch (err) {
      console.error(`[runAutomation] action ${id} failed:`, err)
      steps.push({ action: id, status: 'failed', detail: 'Action errored.' })
    }
  }

  const done = steps.filter(s => s.status === 'done').length
  const failed = steps.some(s => s.status === 'failed')
  const status: AutomationRun['status'] = failed ? 'failed' : done === 0 ? 'skipped' : steps.some(s => s.status === 'skipped') ? 'partial' : 'success'
  await writeRun(admin, tenantId, auto, subject, status, steps)
}

async function writeRun(
  admin: ReturnType<typeof createAdminClient>, tenantId: string,
  auto: { id: string; name: string }, subject: DispatchSubject,
  status: AutomationRun['status'], steps: RunStep[],
) {
  await admin.from('automation_runs').insert({
    id: ulid(), automation_id: auto.id, tenant_id: tenantId, trigger: subject.kind,
    subject_label: subject.label, status, steps,
  })
}

async function generateSummary(subject: DispatchSubject): Promise<string | null> {
  const client = getOpenAIClient()
  if (!client) return null
  const completion = await client.chat.completions.create({
    model: OPENAI_MODEL, max_tokens: 200,
    messages: [{ role: 'user', content: `Write a 2-3 sentence professional summary of this candidate using ONLY the data given. Do not invent facts.\n\n${JSON.stringify(subject.data)}` }],
  })
  return completion.choices[0]?.message.content?.trim() || null
}
