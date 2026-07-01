'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  X, ChevronRight, ChevronLeft, Plus, Trash2, Sparkles, Check,
  UserPlus, RefreshCw, Send, XCircle, Trophy, Calendar, CalendarX,
  FileText, AlertCircle, Clock, Repeat, Star, Briefcase, Mail,
  MessageSquare, Phone, Bell, UserCheck, ClipboardList, StickyNote,
  MoveRight, Tag, Archive, Upload, Share2, Bot, Zap, Gift,
} from 'lucide-react'

// ─── Data ────────────────────────────────────────────────────────────────────

const TRIGGERS = [
  { id: 'candidate_added',       label: 'Candidate Added',          icon: UserPlus },
  { id: 'candidate_updated',     label: 'Candidate Updated',        icon: RefreshCw },
  { id: 'candidate_submitted',   label: 'Candidate Submitted',      icon: Send },
  { id: 'candidate_rejected',    label: 'Candidate Rejected',       icon: XCircle },
  { id: 'candidate_hired',       label: 'Candidate Hired',          icon: Trophy },
  { id: 'candidate_starts',      label: 'Candidate Starts',         icon: Star },
  { id: 'interview_scheduled',   label: 'Interview Scheduled',      icon: Calendar },
  { id: 'interview_cancelled',   label: 'Interview Cancelled',      icon: CalendarX },
  { id: 'offer_accepted',        label: 'Offer Accepted',           icon: Check },
  { id: 'offer_declined',        label: 'Offer Declined',           icon: XCircle },
  { id: 'job_created',           label: 'Job Created',              icon: Briefcase },
  { id: 'job_closed',            label: 'Job Closed',               icon: XCircle },
  { id: 'job_filled',            label: 'Job Filled',               icon: Check },
  { id: 'new_email',             label: 'New Email Received',       icon: Mail },
  { id: 'document_uploaded',     label: 'Document Uploaded',        icon: Upload },
  { id: 'compliance_missing',    label: 'Compliance Missing',       icon: AlertCircle },
  { id: 'credential_expiring',   label: 'Credential Expiring',      icon: Clock },
  { id: 'timesheet_approved',    label: 'Timesheet Approved',       icon: FileText },
  { id: 'vendor_responded',      label: 'Vendor Responded',         icon: MessageSquare },
  { id: 'no_activity',           label: 'No Activity',              icon: Clock },
  { id: 'birthday',              label: 'Birthday',                 icon: Gift },
  { id: 'work_anniversary',      label: 'Work Anniversary',         icon: Star },
  { id: 'recruiter_assigned',    label: 'Recruiter Assigned',       icon: UserCheck },
  { id: 'new_applicant',         label: 'New Applicant',            icon: UserPlus },
  { id: 'resume_parsed',         label: 'Resume Parsed',            icon: FileText },
  { id: 'candidate_applied',     label: 'Candidate Applied',        icon: Send },
  { id: 'candidate_withdrawn',   label: 'Candidate Withdrawn',      icon: XCircle },
  { id: 'candidate_available',   label: 'Candidate Available',      icon: UserCheck },
  { id: 'placement_created',     label: 'Placement Created',        icon: Trophy },
  { id: 'placement_end_near',    label: 'Placement End Date Near',  icon: Clock },
  { id: 'bg_check_complete',     label: 'Background Check Complete',icon: Check },
  { id: 'drug_test_complete',    label: 'Drug Test Complete',       icon: Check },
  { id: 'reference_complete',    label: 'Reference Check Complete', icon: Check },
]

const TIMING_OPTIONS = [
  'Immediately',
  'After 30 minutes',
  'After 1 hour',
  'After 1 day',
  'After 3 days',
  'Every morning',
  'Every evening',
  'Every Monday',
  'Choose a date',
  'Choose a time',
]

const CONDITION_SUGGESTIONS = [
  'Job is Healthcare',
  'Recruiter is John',
  'Vendor is Favorite',
  'Candidate status is Available',
  'State is Texas',
  'Experience more than 5 years',
  'Pay Rate above $60',
  'Candidate has Email',
  'Phone number exists',
  'Compliance is Missing',
  'Interview is Tomorrow',
  'No response for 3 days',
  'Document not uploaded',
  'Certification expires within 30 days',
  'Visa is H1B',
  'Work Authorization is USC',
  'Placement is Active',
  'Candidate Source is Indeed',
  'Client is Enterprise',
  'Job Priority is High',
  'Offer Accepted',
  'Drug Test Passed',
]

const ACTIONS = [
  { id: 'send_email',          label: 'Send Email',                 icon: Mail },
  { id: 'send_sms',            label: 'Send SMS',                   icon: MessageSquare },
  { id: 'call_candidate',      label: 'Call Candidate',             icon: Phone },
  { id: 'send_teams',          label: 'Send Teams Message',         icon: MessageSquare },
  { id: 'notify_recruiter',    label: 'Notify Recruiter',           icon: Bell },
  { id: 'notify_manager',      label: 'Notify Manager',             icon: Bell },
  { id: 'assign_recruiter',    label: 'Assign Recruiter',           icon: UserCheck },
  { id: 'assign_onboarding',   label: 'Assign Onboarding',         icon: UserCheck },
  { id: 'create_task',         label: 'Create Task',                icon: ClipboardList },
  { id: 'create_note',         label: 'Create Note',                icon: StickyNote },
  { id: 'schedule_interview',  label: 'Schedule Interview',         icon: Calendar },
  { id: 'move_candidate',      label: 'Move Candidate',             icon: MoveRight },
  { id: 'update_status',       label: 'Update Status',              icon: RefreshCw },
  { id: 'gen_submission',      label: 'Generate Submission Notes',  icon: Bot },
  { id: 'gen_summary',         label: 'Generate Candidate Summary', icon: Bot },
  { id: 'gen_questions',       label: 'Generate Interview Questions',icon: Bot },
  { id: 'gen_boolean',         label: 'Generate Boolean Search',    icon: Bot },
  { id: 'gen_email',           label: 'Generate Email',             icon: Bot },
  { id: 'gen_offer',           label: 'Generate Offer Letter',      icon: Bot },
  { id: 'gen_checklist',       label: 'Generate Checklist',         icon: Bot },
  { id: 'gen_ai_summary',      label: 'Generate AI Summary',        icon: Bot },
  { id: 'gen_match_score',     label: 'Generate Candidate Match Score', icon: Bot },
  { id: 'gen_resume_rewrite',  label: 'Generate Resume Rewrite',   icon: Bot },
  { id: 'add_tags',            label: 'Add Tags',                   icon: Tag },
  { id: 'remove_tags',         label: 'Remove Tags',                icon: Tag },
  { id: 'upload_document',     label: 'Upload Document',            icon: Upload },
  { id: 'request_documents',   label: 'Request Documents',          icon: FileText },
  { id: 'send_reminder',       label: 'Send Reminder',              icon: Bell },
  { id: 'share_candidate',     label: 'Share Candidate',            icon: Share2 },
  { id: 'share_job',           label: 'Share Job',                  icon: Share2 },
  { id: 'duplicate_job',       label: 'Duplicate Job',              icon: Briefcase },
  { id: 'close_job',           label: 'Close Job',                  icon: XCircle },
  { id: 'archive_candidate',   label: 'Archive Candidate',          icon: Archive },
  { id: 'reject_candidate',    label: 'Reject Candidate',           icon: XCircle },
  { id: 'shortlist_candidate', label: 'Shortlist Candidate',        icon: Star },
  { id: 'submit_candidate',    label: 'Submit Candidate',           icon: Send },
  { id: 'create_placement',    label: 'Create Placement',           icon: Trophy },
  { id: 'start_compliance',    label: 'Start Compliance',           icon: AlertCircle },
  { id: 'request_references',  label: 'Request References',         icon: UserCheck },
  { id: 'start_bg_check',      label: 'Start Background Check',     icon: Check },
  { id: 'generate_invoice',    label: 'Generate Invoice',           icon: FileText },
  { id: 'send_survey',         label: 'Send Survey',                icon: MessageSquare },
  { id: 'create_followup',     label: 'Create Follow-up',           icon: Repeat },
  { id: 'wait',                label: 'Wait',                       icon: Clock },
  { id: 'end',                 label: 'End Automation',             icon: XCircle },
]

// ─── Types ───────────────────────────────────────────────────────────────────

type WizardState = {
  name: string
  trigger: string
  timing: string
  conditions: string[]
  conditionInput: string
  actions: string[]
}

const INIT: WizardState = {
  name: '',
  trigger: '',
  timing: 'Immediately',
  conditions: [],
  conditionInput: '',
  actions: [],
}

// ─── Step components ─────────────────────────────────────────────────────────

function StepDot({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div className={cn(
      'size-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors',
      done  ? 'bg-foreground border-foreground text-background' :
      active ? 'bg-background border-foreground text-foreground' :
               'bg-muted border-border text-muted-foreground'
    )}>
      {done ? <Check className="size-3.5" strokeWidth={3} /> : n}
    </div>
  )
}

function StepBar({ step }: { step: number }) {
  const labels = ['Name', 'Trigger', 'Timing', 'Only if…', 'Actions']
  return (
    <div className="flex items-center gap-0 mb-8">
      {labels.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <StepDot n={i + 1} active={step === i} done={step > i} />
            <span className={cn('text-[10px] whitespace-nowrap', step === i ? 'text-foreground font-medium' : 'text-muted-foreground')}>{label}</span>
          </div>
          {i < labels.length - 1 && (
            <div className={cn('h-px w-12 mb-4 mx-1', step > i ? 'bg-foreground' : 'bg-border')} />
          )}
        </div>
      ))}
    </div>
  )
}

// Natural language summary
function NLSummary({ state }: { state: WizardState }) {
  const trigger = TRIGGERS.find(t => t.id === state.trigger)
  const actions = state.actions.map(id => ACTIONS.find(a => a.id === id)?.label).filter(Boolean)
  if (!trigger && !actions.length) return null
  const timing = state.timing !== 'Immediately' ? `, ${state.timing.toLowerCase()}` : ''
  const conditions = state.conditions.length
    ? `, but only if: ${state.conditions.join(', ')}`
    : ''
  const actionText = actions.length ? `, then: ${actions.join(', ')}` : ''
  return (
    <div className="mt-6 p-4 rounded-lg bg-muted/60 border border-border">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Plain English Summary</p>
      <p className="text-sm text-foreground leading-relaxed">
        {trigger ? `When "${trigger.label}" happens` : ''}
        {timing}{conditions}{actionText}.
      </p>
    </div>
  )
}

// Visual workflow preview
function WorkflowPreview({ state }: { state: WizardState }) {
  const trigger = TRIGGERS.find(t => t.id === state.trigger)
  const actions = state.actions.map(id => ACTIONS.find(a => a.id === id)).filter(Boolean)
  const steps: { label: string; sub?: string; icon?: React.ComponentType<{ className?: string }> }[] = []
  if (trigger) steps.push({ label: trigger.label, icon: trigger.icon })
  if (state.conditions.length) steps.push({ label: 'Only if', sub: state.conditions.join(', ') })
  if (state.timing !== 'Immediately') steps.push({ label: state.timing, icon: Clock })
  actions.forEach(a => a && steps.push({ label: a.label, icon: a.icon }))
  if (!steps.length) return null
  return (
    <div className="mt-6">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Workflow Preview</p>
      <div className="flex flex-col gap-0 w-64">
        {steps.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="flex flex-col items-start">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium w-full">
                {Icon && <Icon className="size-3.5 text-muted-foreground shrink-0" />}
                <div className="min-w-0">
                  <div className="truncate">{s.label}</div>
                  {s.sub && <div className="text-sm text-muted-foreground truncate">{s.sub}</div>}
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="ml-5 w-px h-4 bg-border" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main wizard ─────────────────────────────────────────────────────────────

export function CreateAutomationWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [state, setState] = useState<WizardState>(INIT)
  const [aiInput, setAiInput] = useState('')
  const [showAI, setShowAI] = useState(false)

  function reset() { setStep(0); setState(INIT); setAiInput(''); setShowAI(false) }
  function close() { reset(); onClose() }

  const set = (patch: Partial<WizardState>) => setState(s => ({ ...s, ...patch }))

  const canNext = [
    state.name.trim().length > 0,
    !!state.trigger,
    !!state.timing,
    true, // conditions optional
    state.actions.length > 0,
  ]

  function toggleAction(id: string) {
    set({ actions: state.actions.includes(id) ? state.actions.filter(a => a !== id) : [...state.actions, id] })
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) close() }}>
      <DialogContent className="max-w-4xl w-full p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-muted-foreground" />
            <span className="font-semibold text-sm">New Automation</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1.5 text-sm h-8" onClick={() => setShowAI(v => !v)}>
              <Sparkles className="size-3.5" />
              Build with AI
            </Button>
            <button onClick={close} className="size-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* AI bar */}
        {showAI && (
          <div className="px-6 py-3 border-b bg-muted/40 shrink-0">
            <p className="text-sm text-muted-foreground mb-2">Describe your automation in plain English and we'll build it for you.</p>
            <div className="flex gap-2">
              <Input
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                placeholder='e.g. "When a nurse applies from Indeed, send an email, assign Sarah, create a follow-up tomorrow."'
                className="h-8 text-sm flex-1"
              />
              <Button size="sm" className="h-8 text-sm shrink-0">
                <Sparkles className="size-3 mr-1.5" />Build It
              </Button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Main content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <StepBar step={step} />

            {/* Step 0: Name */}
            {step === 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-1">Name your automation</h2>
                <p className="text-sm text-muted-foreground mb-4">Give it a clear name so you can find it later.</p>
                <Input
                  autoFocus
                  value={state.name}
                  onChange={e => set({ name: e.target.value })}
                  placeholder="e.g. Auto Submit Candidate, Interview Reminder…"
                  className="max-w-md text-sm"
                  onKeyDown={e => e.key === 'Enter' && canNext[0] && setStep(1)}
                />
              </div>
            )}

            {/* Step 1: Trigger */}
            {step === 1 && (
              <div>
                <h2 className="text-lg font-semibold mb-1">What starts this automation?</h2>
                <p className="text-sm text-muted-foreground mb-4">Choose the event that kicks everything off.</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {TRIGGERS.map(t => {
                    const Icon = t.icon
                    const sel = state.trigger === t.id
                    return (
                      <button
                        key={t.id}
                        onClick={() => set({ trigger: t.id })}
                        className={cn(
                          'flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left text-sm transition-colors',
                          sel
                            ? 'border-foreground bg-accent text-accent-foreground font-medium'
                            : 'border-border hover:border-muted-foreground hover:bg-muted/40 text-foreground'
                        )}
                      >
                        <Icon className={cn('size-4 shrink-0', sel ? 'text-foreground' : 'text-muted-foreground')} />
                        <span className="leading-snug">{t.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Timing */}
            {step === 2 && (
              <div>
                <h2 className="text-lg font-semibold mb-1">When should this happen?</h2>
                <p className="text-sm text-muted-foreground mb-4">Choose how quickly the automation should respond.</p>
                <div className="grid grid-cols-2 gap-2.5 max-w-lg">
                  {TIMING_OPTIONS.map(opt => {
                    const sel = state.timing === opt
                    return (
                      <button
                        key={opt}
                        onClick={() => set({ timing: opt })}
                        className={cn(
                          'px-4 py-3 rounded-lg border text-left text-sm transition-colors',
                          sel
                            ? 'border-foreground bg-accent text-accent-foreground font-medium'
                            : 'border-border hover:border-muted-foreground hover:bg-muted/40 text-foreground'
                        )}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Conditions */}
            {step === 3 && (
              <div>
                <h2 className="text-lg font-semibold mb-1">Only if… <span className="text-muted-foreground font-normal text-base">(optional)</span></h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Add checks that must be true before the automation runs. Skip this if you want it to always run.
                </p>

                {/* Active conditions as pills */}
                {state.conditions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {state.conditions.map(c => (
                      <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-accent border border-border">
                        {c}
                        <button onClick={() => set({ conditions: state.conditions.filter(x => x !== c) })} className="text-muted-foreground hover:text-destructive transition-colors">
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Custom input */}
                <div className="flex gap-2 mb-4 max-w-md">
                  <Input
                    value={state.conditionInput}
                    onChange={e => set({ conditionInput: e.target.value })}
                    placeholder="Type a check, e.g. Job is Healthcare…"
                    className="h-8 text-sm"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && state.conditionInput.trim()) {
                        set({ conditions: [...state.conditions, state.conditionInput.trim()], conditionInput: '' })
                      }
                    }}
                  />
                  <Button size="sm" variant="outline" className="h-8 text-sm shrink-0"
                    disabled={!state.conditionInput.trim()}
                    onClick={() => {
                      if (state.conditionInput.trim()) {
                        set({ conditions: [...state.conditions, state.conditionInput.trim()], conditionInput: '' })
                      }
                    }}>
                    <Plus className="size-3.5 mr-1" />Add
                  </Button>
                </div>

                {/* Suggestions */}
                <p className="text-sm text-muted-foreground mb-2">Or pick from common checks:</p>
                <div className="flex flex-wrap gap-2">
                  {CONDITION_SUGGESTIONS.filter(s => !state.conditions.includes(s)).map(s => (
                    <button
                      key={s}
                      onClick={() => set({ conditions: [...state.conditions, s] })}
                      className="px-3 py-1 rounded-full text-sm border border-dashed border-border hover:border-muted-foreground hover:bg-muted/40 transition-colors text-muted-foreground hover:text-foreground"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Actions */}
            {step === 4 && (
              <div>
                <h2 className="text-lg font-semibold mb-1">What should happen?</h2>
                <p className="text-sm text-muted-foreground mb-4">Choose one or more actions. They run in order.</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {ACTIONS.map(a => {
                    const Icon = a.icon
                    const sel = state.actions.includes(a.id)
                    return (
                      <button
                        key={a.id}
                        onClick={() => toggleAction(a.id)}
                        className={cn(
                          'flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left text-sm transition-colors',
                          sel
                            ? 'border-foreground bg-accent text-accent-foreground font-medium'
                            : 'border-border hover:border-muted-foreground hover:bg-muted/40 text-foreground'
                        )}
                      >
                        <Icon className={cn('size-4 shrink-0', sel ? 'text-foreground' : 'text-muted-foreground')} />
                        <span className="leading-snug">{a.label}</span>
                        {sel && <Check className="size-3.5 ml-auto shrink-0 text-foreground" strokeWidth={3} />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Preview panel */}
          {(state.trigger || state.actions.length > 0) && (
            <div className="w-64 shrink-0 border-l bg-muted/20 overflow-y-auto px-4 py-6">
              <WorkflowPreview state={state} />
              <NLSummary state={state} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t shrink-0 bg-background">
          <Button variant="ghost" size="sm" className="text-sm h-8" onClick={() => step === 0 ? close() : setStep(s => s - 1)}>
            <ChevronLeft className="size-3.5 mr-1" />
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Step {step + 1} of 5</span>
            {step < 4 ? (
              <Button size="sm" className="h-8 text-sm" disabled={!canNext[step]} onClick={() => setStep(s => s + 1)}>
                Next <ChevronRight className="size-3.5 ml-1" />
              </Button>
            ) : (
              <Button size="sm" className="h-8 text-sm" disabled={!canNext[4]} onClick={() => { close() }}>
                Save Automation <Check className="size-3.5 ml-1" strokeWidth={3} />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
