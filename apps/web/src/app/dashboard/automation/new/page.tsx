'use client'

import { useState, useId } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  ChevronLeft, Plus, X, Sparkles, Check, Zap, Clock, Filter,
  UserPlus, RefreshCw, Send, XCircle, Trophy, Calendar, CalendarX,
  Star, Briefcase, Mail, MessageSquare, Phone, Bell, UserCheck,
  ClipboardList, StickyNote, MoveRight, Tag, Archive, Upload,
  Share2, Bot, Gift, FileText, AlertCircle, Repeat, Trash2,
} from 'lucide-react'

// ─── Data ────────────────────────────────────────────────────────────────────

const TRIGGERS = [
  { id: 'candidate_applied',     label: 'Candidate Applied',          icon: Send },
  { id: 'candidate_added',       label: 'Candidate Added',            icon: UserPlus },
  { id: 'candidate_updated',     label: 'Candidate Updated',          icon: RefreshCw },
  { id: 'candidate_submitted',   label: 'Candidate Submitted',        icon: Send },
  { id: 'candidate_rejected',    label: 'Candidate Rejected',         icon: XCircle },
  { id: 'candidate_hired',       label: 'Candidate Hired',            icon: Trophy },
  { id: 'candidate_starts',      label: 'Candidate Starts',           icon: Star },
  { id: 'candidate_available',   label: 'Candidate Available',        icon: UserCheck },
  { id: 'candidate_withdrawn',   label: 'Candidate Withdrawn',        icon: XCircle },
  { id: 'interview_scheduled',   label: 'Interview Scheduled',        icon: Calendar },
  { id: 'interview_cancelled',   label: 'Interview Cancelled',        icon: CalendarX },
  { id: 'offer_accepted',        label: 'Offer Accepted',             icon: Check },
  { id: 'offer_declined',        label: 'Offer Declined',             icon: XCircle },
  { id: 'job_created',           label: 'Job Created',                icon: Briefcase },
  { id: 'job_closed',            label: 'Job Closed',                 icon: XCircle },
  { id: 'job_filled',            label: 'Job Filled',                 icon: Check },
  { id: 'new_email',             label: 'New Email Received',         icon: Mail },
  { id: 'document_uploaded',     label: 'Document Uploaded',          icon: Upload },
  { id: 'compliance_missing',    label: 'Compliance Missing',         icon: AlertCircle },
  { id: 'credential_expiring',   label: 'Credential Expiring',        icon: Clock },
  { id: 'timesheet_approved',    label: 'Timesheet Approved',         icon: FileText },
  { id: 'vendor_responded',      label: 'Vendor Responded',           icon: MessageSquare },
  { id: 'no_activity',           label: 'No Activity',                icon: Clock },
  { id: 'birthday',              label: 'Birthday',                   icon: Gift },
  { id: 'work_anniversary',      label: 'Work Anniversary',           icon: Star },
  { id: 'recruiter_assigned',    label: 'Recruiter Assigned',         icon: UserCheck },
  { id: 'new_applicant',         label: 'New Applicant',              icon: UserPlus },
  { id: 'resume_parsed',         label: 'Resume Parsed',              icon: FileText },
  { id: 'placement_created',     label: 'Placement Created',          icon: Trophy },
  { id: 'placement_end_near',    label: 'Placement End Date Near',    icon: Clock },
  { id: 'bg_check_complete',     label: 'Background Check Complete',  icon: Check },
  { id: 'drug_test_complete',    label: 'Drug Test Complete',         icon: Check },
  { id: 'reference_complete',    label: 'Reference Check Complete',   icon: Check },
]

const TIMING_OPTIONS = [
  'Immediately',
  'After 30 minutes',
  'After 1 hour',
  'After 4 hours',
  'After 1 day',
  'After 3 days',
  'After 1 week',
  'Every morning',
  'Every evening',
  'Every Monday',
]

const CONDITION_SUGGESTIONS = [
  'Job is Healthcare', 'Recruiter is John', 'Vendor is Favorite',
  'Candidate status is Available', 'State is Texas', 'Experience more than 5 years',
  'Pay Rate above $60', 'Candidate has Email', 'Phone number exists',
  'Compliance is Missing', 'Interview is Tomorrow', 'No response for 3 days',
  'Document not uploaded', 'Certification expires within 30 days',
  'Visa is H1B', 'Work Authorization is USC', 'Placement is Active',
  'Candidate Source is Indeed', 'Job Priority is High', 'Drug Test Passed',
]

const ACTIONS = [
  { id: 'send_email',          label: 'Send Email',                  icon: Mail },
  { id: 'send_sms',            label: 'Send SMS',                    icon: MessageSquare },
  { id: 'call_candidate',      label: 'Call Candidate',              icon: Phone },
  { id: 'send_teams',          label: 'Send Teams Message',          icon: MessageSquare },
  { id: 'notify_recruiter',    label: 'Notify Recruiter',            icon: Bell },
  { id: 'notify_manager',      label: 'Notify Manager',              icon: Bell },
  { id: 'assign_recruiter',    label: 'Assign Recruiter',            icon: UserCheck },
  { id: 'assign_onboarding',   label: 'Assign Onboarding',          icon: UserCheck },
  { id: 'create_task',         label: 'Create Task',                 icon: ClipboardList },
  { id: 'create_note',         label: 'Create Note',                 icon: StickyNote },
  { id: 'schedule_interview',  label: 'Schedule Interview',          icon: Calendar },
  { id: 'move_candidate',      label: 'Move Candidate',              icon: MoveRight },
  { id: 'update_status',       label: 'Update Status',               icon: RefreshCw },
  { id: 'gen_summary',         label: 'Generate AI Summary',         icon: Bot },
  { id: 'gen_submission',      label: 'Generate Submission Notes',   icon: Bot },
  { id: 'gen_questions',       label: 'Generate Interview Questions',icon: Bot },
  { id: 'gen_email',           label: 'Generate Email',              icon: Bot },
  { id: 'gen_offer',           label: 'Generate Offer Letter',       icon: Bot },
  { id: 'gen_match_score',     label: 'Generate Match Score',        icon: Bot },
  { id: 'gen_resume_rewrite',  label: 'Generate Resume Rewrite',     icon: Bot },
  { id: 'add_tags',            label: 'Add Tags',                    icon: Tag },
  { id: 'remove_tags',         label: 'Remove Tags',                 icon: Tag },
  { id: 'upload_document',     label: 'Upload Document',             icon: Upload },
  { id: 'request_documents',   label: 'Request Documents',           icon: FileText },
  { id: 'send_reminder',       label: 'Send Reminder',               icon: Bell },
  { id: 'share_candidate',     label: 'Share Candidate',             icon: Share2 },
  { id: 'archive_candidate',   label: 'Archive Candidate',           icon: Archive },
  { id: 'reject_candidate',    label: 'Reject Candidate',            icon: XCircle },
  { id: 'shortlist_candidate', label: 'Shortlist Candidate',         icon: Star },
  { id: 'submit_candidate',    label: 'Submit Candidate',            icon: Send },
  { id: 'create_placement',    label: 'Create Placement',            icon: Trophy },
  { id: 'start_compliance',    label: 'Start Compliance',            icon: AlertCircle },
  { id: 'request_references',  label: 'Request References',          icon: UserCheck },
  { id: 'start_bg_check',      label: 'Start Background Check',      icon: Check },
  { id: 'create_followup',     label: 'Create Follow-up',            icon: Repeat },
  { id: 'send_survey',         label: 'Send Survey',                 icon: MessageSquare },
  { id: 'wait',                label: 'Wait',                        icon: Clock },
  { id: 'end',                 label: 'End Automation',              icon: XCircle },
]

// ─── Block types ──────────────────────────────────────────────────────────────

type BlockType = 'trigger' | 'condition' | 'timing' | 'action'

type Block =
  | { id: string; type: 'trigger';   value: string | null }
  | { id: string; type: 'condition'; values: string[]; input: string }
  | { id: string; type: 'timing';    value: string }
  | { id: string; type: 'action';    value: string | null }

function makeBlock(type: BlockType): Block {
  const id = Math.random().toString(36).slice(2)
  if (type === 'trigger')   return { id, type: 'trigger', value: null }
  if (type === 'condition') return { id, type: 'condition', values: [], input: '' }
  if (type === 'timing')    return { id, type: 'timing', value: 'Immediately' }
  return { id, type: 'action', value: null }
}

// ─── Block colours / labels ───────────────────────────────────────────────────

const BLOCK_META: Record<BlockType, { color: string; dot: string; emptyLabel: string; icon: React.ComponentType<{className?: string}> }> = {
  trigger:   { color: 'border-violet-200 bg-violet-50/60',   dot: 'bg-violet-500',  emptyLabel: 'Choose what starts this',    icon: Zap },
  condition: { color: 'border-amber-200  bg-amber-50/60',    dot: 'bg-amber-400',   emptyLabel: 'Add a check (Only if…)',      icon: Filter },
  timing:    { color: 'border-blue-200   bg-blue-50/60',     dot: 'bg-blue-500',    emptyLabel: 'Choose timing',               icon: Clock },
  action:    { color: 'border-emerald-200 bg-emerald-50/60', dot: 'bg-emerald-500', emptyLabel: 'Choose what should happen',   icon: Zap },
}

// ─── Natural language summary ─────────────────────────────────────────────────

function buildSummary(blocks: Block[]): string {
  const parts: string[] = []
  blocks.forEach(b => {
    if (b.type === 'trigger' && b.value) {
      const t = TRIGGERS.find(t => t.id === b.value)
      if (t) parts.push(`When "${t.label}" happens`)
    }
    if (b.type === 'timing') parts.push(b.value.toLowerCase())
    if (b.type === 'condition' && b.values.length) parts.push(`only if: ${b.values.join(', ')}`)
    if (b.type === 'action' && b.value) {
      const a = ACTIONS.find(a => a.id === b.value)
      if (a) parts.push(a.label.toLowerCase())
    }
  })
  return parts.join(', ') + (parts.length ? '.' : '')
}

// ─── Block pickers ────────────────────────────────────────────────────────────

function TriggerPicker({ value, onChange }: { value: string | null; onChange: (v: string) => void }) {
  const [search, setSearch] = useState('')
  const list = TRIGGERS.filter(t => !search || t.label.toLowerCase().includes(search.toLowerCase()))
  return (
    <div className="pt-3">
      <Input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search triggers…" className="h-7 text-xs mb-3" autoFocus />
      <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto pr-1">
        {list.map(t => {
          const Icon = t.icon
          const sel = value === t.id
          return (
            <button key={t.id} onClick={() => onChange(t.id)}
              className={cn(
                'flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left text-xs transition-colors',
                sel ? 'border-violet-400 bg-violet-100 text-violet-900 font-medium'
                    : 'border-border hover:bg-muted/60 text-foreground'
              )}>
              <Icon className={cn('size-3.5 shrink-0', sel ? 'text-violet-600' : 'text-muted-foreground')} />
              {t.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TimingPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="pt-3 grid grid-cols-2 gap-1.5">
      {TIMING_OPTIONS.map(opt => (
        <button key={opt} onClick={() => onChange(opt)}
          className={cn(
            'px-3 py-2 rounded-lg border text-xs text-left transition-colors',
            value === opt
              ? 'border-blue-400 bg-blue-100 text-blue-900 font-medium'
              : 'border-border hover:bg-muted/60 text-foreground'
          )}>
          {opt}
        </button>
      ))}
    </div>
  )
}

function ConditionPicker({ values, input, onChange }: {
  values: string[]
  input: string
  onChange: (patch: { values?: string[]; input?: string }) => void
}) {
  function add(s: string) {
    if (s.trim() && !values.includes(s.trim())) onChange({ values: [...values, s.trim()], input: '' })
  }
  return (
    <div className="pt-3">
      <div className="flex gap-2 mb-3">
        <Input value={input} onChange={e => onChange({ input: e.target.value })}
          placeholder="Type a check, e.g. Job is Healthcare…"
          className="h-7 text-xs flex-1"
          onKeyDown={e => { if (e.key === 'Enter') add(input) }}
          autoFocus />
        <Button size="sm" variant="outline" className="h-7 text-xs shrink-0" onClick={() => add(input)} disabled={!input.trim()}>
          <Plus className="size-3 mr-1" />Add
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {values.map(v => (
            <span key={v} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
              {v}
              <button onClick={() => onChange({ values: values.filter(x => x !== v) })} className="hover:text-red-600 transition-colors">
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Quick picks</p>
      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
        {CONDITION_SUGGESTIONS.filter(s => !values.includes(s)).map(s => (
          <button key={s} onClick={() => add(s)}
            className="px-2.5 py-1 rounded-full text-xs border border-dashed border-border hover:border-amber-400 hover:bg-amber-50 hover:text-amber-800 text-muted-foreground transition-colors">
            + {s}
          </button>
        ))}
      </div>
    </div>
  )
}

function ActionPicker({ value, onChange }: { value: string | null; onChange: (v: string) => void }) {
  const [search, setSearch] = useState('')
  const list = ACTIONS.filter(a => !search || a.label.toLowerCase().includes(search.toLowerCase()))
  return (
    <div className="pt-3">
      <Input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search actions…" className="h-7 text-xs mb-3" autoFocus />
      <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto pr-1">
        {list.map(a => {
          const Icon = a.icon
          const sel = value === a.id
          return (
            <button key={a.id} onClick={() => onChange(a.id)}
              className={cn(
                'flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left text-xs transition-colors',
                sel ? 'border-emerald-400 bg-emerald-100 text-emerald-900 font-medium'
                    : 'border-border hover:bg-muted/60 text-foreground'
              )}>
              <Icon className={cn('size-3.5 shrink-0', sel ? 'text-emerald-600' : 'text-muted-foreground')} />
              {a.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Add-step menu ────────────────────────────────────────────────────────────

function AddStepMenu({ onAdd, hasTrigger }: { onAdd: (t: BlockType) => void; hasTrigger: boolean }) {
  const [open, setOpen] = useState(false)
  const options: { type: BlockType; label: string; icon: React.ComponentType<{className?: string}>; color: string }[] = [
    ...(!hasTrigger ? [{ type: 'trigger' as BlockType, label: 'Add Trigger',    icon: Zap,    color: 'text-violet-600 hover:bg-violet-50 hover:border-violet-300' }] : []),
    { type: 'condition', label: 'Add Check (Only if…)', icon: Filter, color: 'text-amber-600  hover:bg-amber-50  hover:border-amber-300'  },
    { type: 'timing',    label: 'Add Wait / Timing',    icon: Clock,  color: 'text-blue-600   hover:bg-blue-50   hover:border-blue-300'   },
    { type: 'action',    label: 'Add Action',            icon: Zap,    color: 'text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300' },
  ]
  return (
    <div className="relative flex justify-center">
      <button onClick={() => setOpen(v => !v)}
        className="size-7 rounded-full border-2 border-dashed border-border bg-background flex items-center justify-center text-muted-foreground hover:border-foreground hover:text-foreground transition-colors z-10">
        <Plus className="size-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute top-9 z-30 bg-background border border-border rounded-xl shadow-lg py-1.5 w-52 overflow-hidden">
            {options.map(o => {
              const Icon = o.icon
              return (
                <button key={o.type} onClick={() => { onAdd(o.type); setOpen(false) }}
                  className={cn('flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium border border-transparent transition-colors text-left mx-0', o.color)}>
                  <Icon className="size-3.5 shrink-0" />
                  {o.label}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Single block card ────────────────────────────────────────────────────────

function BlockCard({ block, active, onActivate, onUpdate, onDelete }: {
  block: Block
  active: boolean
  onActivate: () => void
  onUpdate: (b: Block) => void
  onDelete: () => void
}) {
  const meta = BLOCK_META[block.type]
  const Icon = meta.icon

  // Resolved display value
  let displayValue: string | null = null
  let displayIcon: React.ComponentType<{className?: string}> | null = null
  if (block.type === 'trigger' && block.value) {
    const t = TRIGGERS.find(t => t.id === block.value)
    displayValue = t?.label ?? null
    displayIcon = t?.icon ?? null
  }
  if (block.type === 'timing') {
    displayValue = block.value
    displayIcon = Clock
  }
  if (block.type === 'condition') {
    displayValue = block.values.length ? block.values.join(', ') : null
  }
  if (block.type === 'action' && block.value) {
    const a = ACTIONS.find(a => a.id === block.value)
    displayValue = a?.label ?? null
    displayIcon = a?.icon ?? null
  }

  const isConfigured = block.type === 'condition' ? block.values.length > 0 : displayValue !== null

  return (
    <div className={cn(
      'rounded-xl border-2 transition-all',
      active ? 'border-foreground shadow-md' : isConfigured ? meta.color : 'border-dashed border-border bg-muted/20',
    )}>
      {/* Header row */}
      <button className="flex items-center gap-3 w-full px-4 py-3 text-left group" onClick={onActivate}>
        <div className={cn('size-2 rounded-full shrink-0', isConfigured ? meta.dot : 'bg-border')} />

        <div className="flex-1 min-w-0">
          <p className={cn('text-[10px] font-semibold uppercase tracking-wider mb-0.5',
            block.type === 'trigger'   ? 'text-violet-600' :
            block.type === 'condition' ? 'text-amber-600'  :
            block.type === 'timing'    ? 'text-blue-600'   : 'text-emerald-600'
          )}>
            {block.type === 'trigger'   ? 'When this happens' :
             block.type === 'condition' ? 'Only if…'          :
             block.type === 'timing'    ? 'Wait'              : 'Then do this'}
          </p>

          {isConfigured ? (
            <div className="flex items-center gap-1.5">
              {displayIcon && (() => { const DI = displayIcon!; return <DI className="size-3.5 text-muted-foreground shrink-0" /> })()}
              <span className="text-sm font-medium truncate">{displayValue}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">{meta.emptyLabel}</span>
          )}
        </div>

        <button onClick={e => { e.stopPropagation(); onDelete() }}
          className="size-6 rounded-md opacity-0 group-hover:opacity-100 flex items-center justify-center text-muted-foreground hover:text-destructive transition-all shrink-0">
          <Trash2 className="size-3.5" />
        </button>
      </button>

      {/* Inline picker */}
      {active && (
        <div className="px-4 pb-4 border-t border-border/60 mt-0">
          {block.type === 'trigger' && (
            <TriggerPicker value={block.value} onChange={v => { onUpdate({ ...block, value: v }) }} />
          )}
          {block.type === 'timing' && (
            <TimingPicker value={block.value} onChange={v => onUpdate({ ...block, value: v })} />
          )}
          {block.type === 'condition' && (
            <ConditionPicker
              values={block.values}
              input={block.input}
              onChange={patch => onUpdate({ ...block, ...patch })}
            />
          )}
          {block.type === 'action' && (
            <ActionPicker value={block.value} onChange={v => onUpdate({ ...block, value: v })} />
          )}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewAutomationPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [blocks, setBlocks] = useState<Block[]>([makeBlock('trigger')])
  const [activeId, setActiveId] = useState<string | null>(blocks[0].id)
  const [aiOpen, setAiOpen] = useState(false)
  const [aiInput, setAiInput] = useState('')

  const hasTrigger = blocks.some(b => b.type === 'trigger')
  const summary = buildSummary(blocks)

  function addBlock(type: BlockType, afterIndex?: number) {
    const b = makeBlock(type)
    setBlocks(prev => {
      const next = [...prev]
      if (afterIndex !== undefined) next.splice(afterIndex + 1, 0, b)
      else next.push(b)
      return next
    })
    setActiveId(b.id)
  }

  function updateBlock(updated: Block) {
    setBlocks(prev => prev.map(b => b.id === updated.id ? updated : b))
  }

  function deleteBlock(id: string) {
    setBlocks(prev => {
      const next = prev.filter(b => b.id !== id)
      return next.length ? next : [makeBlock('trigger')]
    })
    setActiveId(null)
  }

  const canSave = name.trim().length > 0 && blocks.some(b => {
    if (b.type === 'trigger') return !!b.value
    if (b.type === 'action') return !!b.value
    return true
  })

  return (
    <div className="flex flex-col h-full overflow-hidden bg-muted/20">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-6 py-3 border-b bg-background shrink-0">
        <Link href="/dashboard/automation/my-automations"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <ChevronLeft className="size-3.5" />My Automations
        </Link>
        <div className="w-px h-4 bg-border" />
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Automation name…"
          className="h-8 w-64 text-sm font-medium border-0 bg-transparent px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
        />
        <div className="flex-1" />
        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setAiOpen(v => !v)}>
          <Sparkles className="size-3.5" />Build with AI
        </Button>
        <Button size="sm" className="h-8 text-xs" disabled={!canSave} onClick={() => router.push('/dashboard/automation/my-automations')}>
          <Check className="size-3.5 mr-1.5" strokeWidth={3} />Save Automation
        </Button>
      </div>

      {/* ── AI bar ── */}
      {aiOpen && (
        <div className="flex items-center gap-2 px-6 py-2.5 border-b bg-background shrink-0">
          <Sparkles className="size-3.5 text-muted-foreground shrink-0" />
          <Input
            value={aiInput}
            onChange={e => setAiInput(e.target.value)}
            placeholder='Describe your automation, e.g. "When a nurse applies from Indeed, send an email, assign Sarah, create a follow-up tomorrow"'
            className="h-7 text-xs flex-1 border-0 bg-transparent px-0 focus-visible:ring-0"
            autoFocus
          />
          <Button size="sm" className="h-7 text-xs shrink-0">Build It</Button>
          <button onClick={() => setAiOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Canvas ── */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-lg mx-auto flex flex-col gap-0">
            {blocks.map((block, i) => (
              <div key={block.id} className="flex flex-col gap-0">
                <BlockCard
                  block={block}
                  active={activeId === block.id}
                  onActivate={() => setActiveId(activeId === block.id ? null : block.id)}
                  onUpdate={updateBlock}
                  onDelete={() => deleteBlock(block.id)}
                />
                {/* Connector + add button */}
                <div className="flex flex-col items-center py-1">
                  <div className="w-px h-3 bg-border" />
                  <AddStepMenu hasTrigger={hasTrigger} onAdd={type => addBlock(type, i)} />
                  <div className="w-px h-3 bg-border" />
                </div>
              </div>
            ))}

            {/* End cap */}
            <div className="flex flex-col items-center gap-1 py-2">
              <div className="size-6 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                <div className="size-1.5 rounded-full bg-border" />
              </div>
              <span className="text-[10px] text-muted-foreground">End</span>
            </div>
          </div>
        </div>

        {/* ── Summary panel ── */}
        <div className="w-72 shrink-0 border-l bg-background overflow-y-auto px-5 py-6 flex flex-col gap-6">
          {/* Plain English */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Plain English</p>
            {summary ? (
              <p className="text-sm text-foreground leading-relaxed capitalize">{summary}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Your automation summary will appear here as you build.</p>
            )}
          </div>

          {/* Steps overview */}
          {blocks.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Steps</p>
              <div className="flex flex-col gap-0">
                {blocks.map((b, i) => {
                  const meta = BLOCK_META[b.type]
                  let label = meta.emptyLabel
                  if (b.type === 'trigger' && b.value)      label = TRIGGERS.find(t => t.id === b.value)?.label ?? label
                  if (b.type === 'timing')                   label = b.value
                  if (b.type === 'condition' && b.values.length) label = b.values[0] + (b.values.length > 1 ? ` +${b.values.length - 1}` : '')
                  if (b.type === 'action' && b.value)        label = ACTIONS.find(a => a.id === b.value)?.label ?? label

                  const isConfigured =
                    b.type === 'condition' ? b.values.length > 0 :
                    b.type === 'timing'    ? true :
                    b.type === 'trigger'   ? !!b.value : !!b.value

                  return (
                    <div key={b.id} className="flex gap-2.5">
                      <div className="flex flex-col items-center">
                        <div className={cn('size-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0', isConfigured ? meta.dot : 'bg-border')}>
                          {i + 1}
                        </div>
                        {i < blocks.length - 1 && <div className="w-px flex-1 bg-border my-0.5" />}
                      </div>
                      <div className="pb-3 min-w-0">
                        <p className={cn('text-[10px] font-semibold uppercase tracking-wider',
                          b.type === 'trigger'   ? 'text-violet-600' :
                          b.type === 'condition' ? 'text-amber-600'  :
                          b.type === 'timing'    ? 'text-blue-600'   : 'text-emerald-600'
                        )}>
                          {b.type === 'trigger'   ? 'Trigger'   :
                           b.type === 'condition' ? 'Only if'   :
                           b.type === 'timing'    ? 'Wait'      : 'Action'}
                        </p>
                        <p className={cn('text-xs truncate', isConfigured ? 'text-foreground' : 'text-muted-foreground')}>{label}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="rounded-lg bg-muted/60 border border-border p-3 mt-auto">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Tips</p>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li>• Click any block to configure it</li>
              <li>• Use <strong>+</strong> to add more steps</li>
              <li>• Add "Only if" checks to target specific candidates or jobs</li>
              <li>• You can add multiple actions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
