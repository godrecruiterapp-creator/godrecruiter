'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { GripVertical, ChevronDown, ChevronUp } from 'lucide-react'

const STEPS = ['Info', 'Trigger', 'Data Sources', 'Filters', 'AI Objective', 'Actions', 'Schedule', 'Notifications', 'Review']

const TRIGGER_TYPES = ['Manual', 'Run Once', 'Hourly', 'Daily', 'Weekly', 'Monthly', 'Custom Schedule', 'Event Based']
const EVENT_TYPES = ['New Job Created', 'Resume Uploaded', 'Candidate Applied', 'Candidate Replied', 'Candidate Stage Changed', 'Interview Scheduled', 'Offer Sent', 'Job Closed', 'Document Uploaded']
const DATA_SOURCES = ['ATS Candidates', 'Jobs', 'CRM', 'Emails', 'Calendar', 'Activities', 'Notes', 'Documents', 'LinkedIn', 'Dice', 'Monster', 'Indeed', 'Career Site', 'API']
const EXAMPLE_PROMPTS = [
  'Find Java Developers with Spring Boot and AWS',
  'Monitor expiring licenses',
  'Identify candidates with 90% match score',
  'Send follow-up emails after 48 hours',
  'Monitor jobs with no submissions',
]
const DEFAULT_ACTIONS = ['Search Candidates', 'AI Match', 'Rank Candidates']
const AVAILABLE_ACTIONS = ['Shortlist Candidates', 'Generate Resume Summary', 'Generate Submission Notes', 'Generate Outreach Email', 'Generate Boolean Search', 'Send Email', 'Send SMS', 'Notify Recruiter', 'Create Task', 'Create Reminder', 'Update Candidate Stage', 'Add Note', 'Assign Recruiter', 'Export Report', 'Wait', 'Condition', 'Loop', 'Webhook']
const NOTIF_CHANNELS = ['In-App', 'Email', 'SMS', 'Microsoft Teams', 'Slack', 'Webhook']
const NOTIF_EVENTS = ['Success', 'Failure', 'Candidate Found', 'Job Updated', 'Agent Completed']

type WizardState = {
  name: string; description: string; category: string
  trigger: string; events: string[]
  sources: string[]
  job: string; skills: string; experience: string; location: string; state: string; country: string; workAuth: string; status: string; stage: string; payMin: string; payMax: string; matchScore: string
  objective: string; advancedPrompt: string
  actions: string[]
  endCondition: string; endDate: string; execCount: string; businessHours: boolean; weekdaysOnly: boolean; timezone: string; concurrency: string
  channels: string[]; notifyOn: string[]
}

const INIT: WizardState = {
  name: '', description: '', category: '',
  trigger: '', events: [],
  sources: [],
  job: '', skills: '', experience: '', location: '', state: '', country: '', workAuth: '', status: '', stage: '', payMin: '', payMax: '', matchScore: '',
  objective: '', advancedPrompt: '',
  actions: [...DEFAULT_ACTIONS],
  endCondition: 'forever', endDate: '', execCount: '', businessHours: false, weekdaysOnly: false, timezone: 'EST', concurrency: '1',
  channels: ['In-App', 'Email'], notifyOn: ['Success', 'Failure'],
}

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
}

function Step1({ s, set }: { s: WizardState; set: (p: Partial<WizardState>) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Agent Name</Label>
        <Input value={s.name} onChange={e => set({ name: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea value={s.description} onChange={e => set({ description: e.target.value })} rows={3} />
      </div>
      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select value={s.category} onValueChange={v => set({ category: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {['Recruiting','Candidate','Job','Communication','Compliance','Productivity','Analytics','Custom'].map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function Step2({ s, set }: { s: WizardState; set: (p: Partial<WizardState>) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {TRIGGER_TYPES.map(t => (
          <button key={t} onClick={() => set({ trigger: t })}
            className={cn('rounded-lg border p-3 text-xs font-medium text-left transition-colors',
              s.trigger === t ? 'border-brand bg-brand-muted text-brand' : 'hover:bg-muted/60')}>
            {t}
          </button>
        ))}
      </div>
      {s.trigger === 'Event Based' && (
        <div className="space-y-2">
          <Label className="text-xs">Trigger on events</Label>
          <div className="grid grid-cols-2 gap-2">
            {EVENT_TYPES.map(ev => (
              <label key={ev} className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={s.events.includes(ev)} onCheckedChange={() => set({ events: toggle(s.events, ev) })} />
                <span className="text-xs">{ev}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Step3({ s, set }: { s: WizardState; set: (p: Partial<WizardState>) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground mb-3">Select data sources this agent can access.</p>
      <div className="grid grid-cols-3 gap-2">
        {DATA_SOURCES.map(src => (
          <label key={src} className="flex items-center gap-2 cursor-pointer p-2 rounded-md border hover:bg-muted/40 transition-colors">
            <Checkbox checked={s.sources.includes(src)} onCheckedChange={() => set({ sources: toggle(s.sources, src) })} />
            <span className="text-xs">{src}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function Step4({ s, set }: { s: WizardState; set: (p: Partial<WizardState>) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <Label>Job</Label>
        <Select value={s.job || '__all__'} onValueChange={v => set({ job: v === '__all__' ? '' : v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="__all__">Any Job</SelectItem><SelectItem value="java">Java Developer</SelectItem><SelectItem value="pm">Project Manager</SelectItem></SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Skills</Label>
        <Input value={s.skills} onChange={e => set({ skills: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Experience</Label>
        <Select value={s.experience || '__all__'} onValueChange={v => set({ experience: v === '__all__' ? '' : v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Any</SelectItem>
            {['0-2','3-5','5-8','8-10','10+'].map(e => <SelectItem key={e} value={e}>{e} years</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Location</Label>
        <Input value={s.location} onChange={e => set({ location: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>State</Label>
        <Input value={s.state} onChange={e => set({ state: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Country</Label>
        <Select value={s.country || '__all__'} onValueChange={v => set({ country: v === '__all__' ? '' : v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Any</SelectItem>
            {['USA','Canada','UK'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Work Authorization</Label>
        <Select value={s.workAuth || '__all__'} onValueChange={v => set({ workAuth: v === '__all__' ? '' : v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Any</SelectItem>
            {['Citizen/PR','H1B','OPT','Any'].map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select value={s.status || '__all__'} onValueChange={v => set({ status: v === '__all__' ? '' : v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Any</SelectItem>
            {['Active','Passive','Do Not Contact'].map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Pay Rate Min ($)</Label>
        <Input type="number" value={s.payMin} onChange={e => set({ payMin: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Pay Rate Max ($)</Label>
        <Input type="number" value={s.payMax} onChange={e => set({ payMax: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Match Score Min (%)</Label>
        <Input type="number" value={s.matchScore} onChange={e => set({ matchScore: e.target.value })} />
      </div>
    </div>
  )
}

function Step5({ s, set }: { s: WizardState; set: (p: Partial<WizardState>) => void }) {
  const [showAdv, setShowAdv] = useState(false)
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>AI Objective</Label>
        <Textarea value={s.objective} onChange={e => set({ objective: e.target.value })}
          rows={4} placeholder="e.g. Find Java Developers with Spring Boot and AWS experience in Texas" />
      </div>
      <div className="flex flex-wrap gap-2">
        {EXAMPLE_PROMPTS.map(p => (
          <button key={p} onClick={() => set({ objective: p })}
            className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors">
            {p}
          </button>
        ))}
      </div>
      <button onClick={() => setShowAdv(x => !x)}
        className="flex items-center gap-1 text-xs text-brand hover:underline">
        Advanced Prompt {showAdv ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
      </button>
      {showAdv && (
        <Textarea value={s.advancedPrompt} onChange={e => set({ advancedPrompt: e.target.value })}
          rows={4} placeholder="Additional instructions for the AI model..." />
      )}
    </div>
  )
}

function Step6({ s, set }: { s: WizardState; set: (p: Partial<WizardState>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Workflow Steps</Label>
        <div className="mt-2 space-y-2">
          {s.actions.map((a, i) => (
            <div key={a} className="flex items-center gap-2 p-3 rounded-lg border bg-muted/20">
              <GripVertical className="size-4 text-muted-foreground/40 shrink-0" />
              <span className="size-5 flex items-center justify-center text-xs font-bold text-muted-foreground">{i + 1}</span>
              <span className="text-sm flex-1">{a}</span>
              <button onClick={() => set({ actions: s.actions.filter(x => x !== a) })}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors">✕</button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Add Actions</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {AVAILABLE_ACTIONS.filter(a => !s.actions.includes(a)).map(a => (
            <button key={a} onClick={() => set({ actions: [...s.actions, a] })}
              className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs hover:bg-accent hover:text-accent-foreground transition-colors">
              + {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Step7({ s, set }: { s: WizardState; set: (p: Partial<WizardState>) => void }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>End Condition</Label>
        <div className="flex flex-col gap-2">
          {['forever', 'until_date', 'exec_count'].map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={s.endCondition === opt} onChange={() => set({ endCondition: opt })} className="accent-brand" />
              <span className="text-sm">{opt === 'forever' ? 'Run Forever' : opt === 'until_date' ? 'Run Until Date' : 'Number of Executions'}</span>
            </label>
          ))}
        </div>
        {s.endCondition === 'until_date' && (
          <Input type="date" value={s.endDate} onChange={e => set({ endDate: e.target.value })} className="mt-2" />
        )}
        {s.endCondition === 'exec_count' && (
          <Input type="number" value={s.execCount} onChange={e => set({ execCount: e.target.value })} placeholder="e.g. 10" className="mt-2" />
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={s.businessHours} onChange={e => set({ businessHours: e.target.checked })} className="accent-brand" />
          <span className="text-sm">Business Hours Only</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={s.weekdaysOnly} onChange={e => set({ weekdaysOnly: e.target.checked })} className="accent-brand" />
          <span className="text-sm">Weekdays Only</span>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Time Zone</Label>
          <Select value={s.timezone} onValueChange={v => set({ timezone: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {['UTC','EST','CST','MST','PST'].map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Concurrency Limit</Label>
          <Input type="number" value={s.concurrency} onChange={e => set({ concurrency: e.target.value })} min={1} />
        </div>
      </div>
    </div>
  )
}

function Step8({ s, set }: { s: WizardState; set: (p: Partial<WizardState>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Channels</Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {NOTIF_CHANNELS.map(c => (
            <label key={c} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={s.channels.includes(c)} onCheckedChange={() => set({ channels: toggle(s.channels, c) })} />
              <span className="text-sm">{c}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notify On</Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {NOTIF_EVENTS.map(ev => (
            <label key={ev} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={s.notifyOn.includes(ev)} onCheckedChange={() => set({ notifyOn: toggle(s.notifyOn, ev) })} />
              <span className="text-sm">{ev}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

function Step9({ s }: { s: WizardState }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
        <Row label="Agent Name" value={s.name || '—'} />
        <Row label="Category" value={s.category || '—'} />
        <Row label="Trigger" value={s.trigger || '—'} />
        <Row label="Data Sources" value={s.sources.length ? `${s.sources.length} selected` : '—'} />
        <Row label="Filters" value={[s.skills, s.location, s.experience].filter(Boolean).length ? 'Configured' : 'None'} />
        <Row label="AI Objective" value={s.objective ? s.objective.slice(0, 60) + (s.objective.length > 60 ? '…' : '') : '—'} />
        <div>
          <span className="text-xs font-medium text-muted-foreground">Workflow Steps</span>
          <div className="mt-1 flex flex-col gap-0.5">
            {s.actions.map((a, i) => (
              <span key={a} className="text-xs">{i + 1}. {a}</span>
            ))}
          </div>
        </div>
        <Row label="Schedule" value={s.endCondition === 'forever' ? 'Run Forever' : s.endCondition === 'until_date' ? `Until ${s.endDate || '—'}` : `${s.execCount || '—'} executions`} />
        <Row label="Notifications" value={s.channels.join(', ') || '—'} />
      </div>
      <div className="rounded-lg border p-4 grid grid-cols-3 gap-4 bg-brand-muted/40">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Est. Runtime</p>
          <p className="text-sm font-semibold mt-0.5">~5 min</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Est. AI Cost</p>
          <p className="text-sm font-semibold mt-0.5">$0.12</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Time Saved</p>
          <p className="text-sm font-semibold mt-0.5">2 hrs/week</p>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs font-medium text-right">{value}</span>
    </div>
  )
}

const STEP_COMPONENTS = [Step1, Step2, Step3, Step4, Step5, Step6, Step7, Step8, Step9]

export function CreateAgentWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [state, setState] = useState<WizardState>(INIT)
  const set = (p: Partial<WizardState>) => setState(s => ({ ...s, ...p }))
  const StepComp = STEP_COMPONENTS[step - 1]!

  function handleClose() { setStep(1); setState(INIT); onClose() }

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) handleClose() }}>
      <SheetContent side="right" style={{ width: '65vw', maxWidth: '65vw' }} className="flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle>Create Agent</SheetTitle>
            <span className="text-xs text-muted-foreground">Step {step} of {STEPS.length}</span>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <Progress value={(step / STEPS.length) * 100} className="flex-1 h-1.5" />
            <span className="text-xs font-medium text-brand shrink-0">{STEPS[step - 1]}</span>
          </div>
          {/* Step pills */}
          <div className="flex gap-1 flex-wrap pt-1">
            {STEPS.map((s, i) => (
              <button key={s} onClick={() => setStep(i + 1)}
                className={cn('px-2 py-0.5 rounded text-xs transition-colors',
                  i + 1 === step ? 'bg-brand text-white' : i + 1 < step ? 'bg-brand-muted text-brand' : 'text-muted-foreground hover:bg-muted/60')}>
                {s}
              </button>
            ))}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <StepComp s={state} set={set} />
        </div>

        <div className="px-6 py-4 border-t shrink-0 flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={step === 1} onClick={() => setStep(s => s - 1)}>Back</Button>
          {step < STEPS.length ? (
            <Button size="sm" onClick={() => setStep(s => s + 1)}>Next</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleClose}>Save Draft</Button>
              <Button size="sm" onClick={handleClose}>Activate Agent</Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
