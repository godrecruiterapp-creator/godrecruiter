'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check, Plus, Star, Mail, MessageSquare, Calendar, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

const CANDIDATES = [
  { id: '1', name: 'Sarah Johnson', role: 'Senior Java Developer', email: 'sarah@email.com', availability: 'Available' },
  { id: '2', name: 'James Martinez', role: 'RN – ICU', email: 'james@email.com', availability: 'Immediate' },
  { id: '3', name: 'Emily Chen', role: 'DevOps Engineer', email: 'emily@email.com', availability: '2 weeks' },
  { id: '4', name: 'Lisa Thompson', role: 'Data Scientist', email: 'lisa@email.com', availability: '1 month' },
]

const JOBS = [
  { id: '1', title: 'Senior Java Developer', client: 'TechCorp Inc', status: 'Open', priority: 'High Priority' },
  { id: '2', title: 'RN – ICU', client: 'Metro Health', status: 'Open', priority: 'Critical' },
  { id: '3', title: 'DevOps Engineer', client: 'CloudBase', status: 'Open', priority: 'Medium Priority' },
  { id: '4', title: 'Data Scientist', client: 'Analytics Co', status: 'Open', priority: 'High Priority' },
]

const STEPS = ['Candidate', 'Job', 'Details', 'Participants', 'Meeting', 'Communication', 'Review']

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={cn('size-6', n <= value ? 'text-amber-400' : 'text-muted-foreground/30')}>
          <Star className="size-full fill-current" />
        </button>
      ))}
    </div>
  )
}

export function ScheduleWizard({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [step, setStep] = useState(0)
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [interviewers, setInterviewers] = useState<string[]>([''])
  const [toggles, setToggles] = useState({ email: true, sms: false, calendar: false, reminder: true })
  const [ratings, setRatings] = useState<Record<string, number>>({})

  const pct = ((step + 1) / 7) * 100

  function next() { setStep(s => Math.min(6, s + 1)) }
  function back() { setStep(s => Math.max(0, s - 1)) }

  const candidate = CANDIDATES.find(c => c.id === selectedCandidate)
  const job = JOBS.find(j => j.id === selectedJob)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" style={{ width: '60vw', maxWidth: '60vw' }} className="flex flex-col p-0 overflow-hidden">
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle>Schedule Interview</SheetTitle>
            <span className="text-xs text-muted-foreground">Step {step + 1} of 7</span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
            <div className="h-full bg-brand rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>
          {/* Step pills */}
          <div className="flex gap-1 mt-2">
            {STEPS.map((s, i) => (
              <span key={s} className={cn(
                'text-[10px] px-2 py-0.5 rounded-full transition-colors',
                i === step ? 'bg-brand text-white font-medium' :
                i < step ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
              )}>{s}</span>
            ))}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* Step 1 — Candidate */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold">Select Candidate</h2>
              <Input placeholder="Search candidates…" className="h-9" />
              <div className="grid grid-cols-1 gap-3">
                {CANDIDATES.map(c => (
                  <button key={c.id} type="button" onClick={() => setSelectedCandidate(c.id)}
                    className={cn(
                      'flex items-center gap-4 p-3 rounded-lg border text-left transition-colors',
                      selectedCandidate === c.id ? 'border-brand bg-brand-muted/30' : 'border-border hover:bg-muted/50'
                    )}>
                    <div className="size-9 rounded-full bg-brand/10 flex items-center justify-center text-brand font-semibold text-sm shrink-0">
                      {c.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.role} · {c.email}</p>
                    </div>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full border',
                      c.availability === 'Available' || c.availability === 'Immediate'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    )}>{c.availability}</span>
                    {selectedCandidate === c.id && <Check className="size-4 text-brand shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Job */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold">Select Job</h2>
              <div className="grid grid-cols-1 gap-3">
                {JOBS.map(j => (
                  <button key={j.id} type="button" onClick={() => setSelectedJob(j.id)}
                    className={cn(
                      'flex items-center gap-4 p-3 rounded-lg border text-left transition-colors',
                      selectedJob === j.id ? 'border-brand bg-brand-muted/30' : 'border-border hover:bg-muted/50'
                    )}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{j.title}</p>
                      <p className="text-xs text-muted-foreground">{j.client}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">{j.status}</span>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full border',
                      j.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                      j.priority === 'High Priority' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-slate-100 text-slate-600 border-slate-200'
                    )}>{j.priority}</span>
                    {selectedJob === j.id && <Check className="size-4 text-brand shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Details */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold">Interview Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Interview Type</Label>
                  <Select>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {['Phone Screen','Video Interview','Client Interview','Technical Interview','Panel Interview','Final Interview','HR Interview','Manager Interview','Onsite Interview'].map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Interview Round</Label>
                  <Select>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select round" /></SelectTrigger>
                    <SelectContent>
                      {['Round 1','Round 2','Round 3','Final','HR Screen','Technical Screen'].map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Date</Label>
                  <input type="date" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Start Time</Label>
                  <input type="time" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">End Time</Label>
                  <input type="time" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Duration</Label>
                  <Select>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select duration" /></SelectTrigger>
                    <SelectContent>
                      {['15 min','30 min','45 min','1 hour','1.5 hours','2 hours'].map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Time Zone</Label>
                  <Select>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select timezone" /></SelectTrigger>
                    <SelectContent>
                      {['EST','CST','MST','PST','GMT','IST'].map(tz => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Interview Mode</Label>
                  <Select>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select mode" /></SelectTrigger>
                    <SelectContent>
                      {['Phone','Zoom','Microsoft Teams','Google Meet','In Person','Other'].map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — Participants */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold">Participants</h2>
              {[
                { label: 'Recruiter', placeholder: 'Recruiter name', default: 'Arun Kumar' },
                { label: 'Hiring Manager', placeholder: 'Hiring manager name', default: '' },
                { label: 'Client Contact', placeholder: 'Client contact name', default: '' },
              ].map(f => (
                <div key={f.label} className="space-y-1.5">
                  <Label className="text-xs">{f.label}</Label>
                  <Input defaultValue={f.default} placeholder={f.placeholder} className="h-9" />
                </div>
              ))}
              <div className="space-y-1.5">
                <Label className="text-xs">Interviewer(s)</Label>
                {interviewers.map((v, i) => (
                  <Input key={i} value={v} placeholder="Interviewer name" className="h-9 mb-2"
                    onChange={e => { const n = [...interviewers]; n[i] = e.target.value; setInterviewers(n) }} />
                ))}
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs"
                  onClick={() => setInterviewers([...interviewers, ''])}>
                  <Plus className="size-3.5" />Add Interviewer
                </Button>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Additional Participants</Label>
                <Input placeholder="Additional participants" className="h-9" />
              </div>
            </div>
          )}

          {/* Step 5 — Meeting */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold">Meeting Details</h2>
              {[
                { label: 'Meeting Link', placeholder: 'https://zoom.us/j/...' },
                { label: 'Meeting Password', placeholder: 'Password (if any)' },
                { label: 'Location / Address', placeholder: 'Office address or location' },
                { label: 'Conference Room', placeholder: 'Room name or number' },
              ].map(f => (
                <div key={f.label} className="space-y-1.5">
                  <Label className="text-xs">{f.label}</Label>
                  <Input placeholder={f.placeholder} className="h-9" />
                </div>
              ))}
              <div className="space-y-1.5">
                <Label className="text-xs">Notes to Interviewer</Label>
                <Textarea placeholder="Internal notes for the interviewer…" className="resize-none h-20 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Instructions to Candidate</Label>
                <Textarea placeholder="What should the candidate bring or prepare…" className="resize-none h-20 text-sm" />
              </div>
            </div>
          )}

          {/* Step 6 — Communication */}
          {step === 5 && (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold">Candidate Communication</h2>
              <div className="rounded-lg border p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Send Invitation</p>
                {([
                  { key: 'email', label: 'Email', icon: Mail },
                  { key: 'sms', label: 'SMS', icon: MessageSquare },
                  { key: 'calendar', label: 'Calendar Invite', icon: Calendar },
                  { key: 'reminder', label: 'Reminder (24hr before)', icon: Bell },
                ] as const).map(({ key, label, icon: Icon }) => (
                  <label key={key} className="flex items-center justify-between cursor-pointer py-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Icon className="size-3.5 text-muted-foreground" />
                      {label}
                    </div>
                    <button type="button"
                      onClick={() => setToggles(t => ({ ...t, [key]: !t[key] }))}
                      className={cn('w-9 h-5 rounded-full transition-colors relative', toggles[key] ? 'bg-brand' : 'bg-muted')}>
                      <span className={cn('absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform', toggles[key] ? 'translate-x-4' : 'translate-x-0.5')} />
                    </button>
                  </label>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Preview</p>
                <div className="rounded-lg border bg-muted/20 p-4 text-sm space-y-2">
                  <div className="text-xs text-muted-foreground border-b pb-2">
                    <p><strong>To:</strong> {candidate?.email ?? 'candidate@email.com'}</p>
                    <p><strong>Subject:</strong> Interview Invitation – {job?.title ?? 'Position'} at {job?.client ?? 'Company'}</p>
                  </div>
                  <p>Dear {candidate?.name ?? 'Candidate'},</p>
                  <p className="text-muted-foreground">We are pleased to invite you for an interview for the <strong>{job?.title ?? 'position'}</strong> role at <strong>{job?.client ?? 'our client'}</strong>.</p>
                  <p className="text-muted-foreground">Please confirm your availability at your earliest convenience. Details will be shared upon confirmation.</p>
                  <p className="text-muted-foreground">Best regards,<br />Arun Kumar<br />God Recruiter</p>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs">Customize Email</Button>
              </div>
            </div>
          )}

          {/* Step 7 — Review */}
          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold">Review & Schedule</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Candidate', value: candidate?.name ?? '—' },
                  { label: 'Job', value: job?.title ?? '—' },
                  { label: 'Client', value: job?.client ?? '—' },
                  { label: 'Interview Type', value: 'Technical Interview' },
                  { label: 'Round', value: 'Round 1' },
                  { label: 'Date', value: '—' },
                  { label: 'Time', value: '—' },
                  { label: 'Duration', value: '—' },
                  { label: 'Mode', value: '—' },
                  { label: 'Interviewer', value: interviewers[0] || '—' },
                ].map(f => (
                  <div key={f.label} className="rounded-lg border bg-card p-3">
                    <p className="text-xs text-muted-foreground">{f.label}</p>
                    <p className="text-sm font-medium mt-0.5">{f.value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-brand/20 bg-brand-muted/20 p-3 text-sm text-muted-foreground">
                An invitation email will be sent to {candidate?.email ?? 'the candidate'} upon scheduling.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t shrink-0">
          <Button variant="outline" onClick={step === 0 ? () => onOpenChange(false) : back}>
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          {step < 6 ? (
            <Button onClick={next}>Next</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline">Save Draft</Button>
              <Button>Schedule Interview</Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
