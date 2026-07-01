'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, ChevronRight, Check, FolderKanban, Users, Lock, Globe, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = ['Name', 'Description', 'Type', 'Visibility', 'Team', 'Review']

const PROJECT_TYPES = [
  { id: 'campaign',   label: 'Hiring Campaign',  desc: 'Time-bound initiative targeting a specific role or market' },
  { id: 'pool',       label: 'Talent Pool',       desc: 'Ongoing collection of qualified candidates for future roles' },
  { id: 'future',     label: 'Future Hiring',     desc: 'Pipeline for positions not yet open' },
  { id: 'redeploy',   label: 'Redeployment',      desc: 'Candidates ending contracts ready for new placements' },
  { id: 'pipeline',   label: 'Pipeline',          desc: 'Active recruiting pipeline for multiple openings' },
  { id: 'client',     label: 'Client Specific',   desc: 'Dedicated project for a single client or account' },
  { id: 'internal',   label: 'Internal',          desc: 'Internal hiring or HR initiative' },
  { id: 'custom',     label: 'Custom',            desc: 'Fully customized project for your workflow' },
]

const VISIBILITY = [
  { id: 'private',      label: 'Private',       desc: 'Only you can see this project', icon: Lock },
  { id: 'team',         label: 'Team',          desc: 'Visible to assigned team members', icon: Users },
  { id: 'organization', label: 'Organization',  desc: 'Visible to everyone in your company', icon: Building2 },
]

const TEAM_OPTIONS = ['Sarah M.', 'James R.', 'Emily T.', 'David K.', 'Lisa P.', 'Tom H.']

const EXAMPLE_NAMES = [
  'Texas ICU Nurses', 'Senior Java Developers', 'Redeployment Candidates',
  'Healthcare Pipeline', 'Travel Nurses — Summer', 'Bench Candidates',
  'Priority Sales Hiring', 'Direct Hire Pipeline', 'Future Contractors',
]

type State = { name: string; description: string; type: string; visibility: string; team: string[] }
const INIT: State = { name: '', description: '', type: '', visibility: 'team', team: [] }

export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [s, setS] = useState<State>(INIT)

  const set = (p: Partial<State>) => setS(prev => ({ ...prev, ...p }))

  const canNext = [
    s.name.trim().length > 0,
    true,
    s.type.length > 0,
    true,
    true,
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b bg-background shrink-0">
        <Link href="/dashboard/projects/my-projects"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="size-3.5" />Projects
        </Link>
        <div className="w-px h-4 bg-border" />
        <span className="text-sm font-semibold">New Project</span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto flex items-start justify-center py-12 px-6">
        <div className="w-full max-w-xl">
          {/* Step bar */}
          <div className="flex items-center gap-0 mb-10 justify-center">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={cn(
                    'size-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors',
                    i < step  ? 'bg-foreground border-foreground text-background' :
                    i === step ? 'bg-background border-foreground text-foreground' :
                                 'bg-muted border-border text-muted-foreground'
                  )}>
                    {i < step ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                  </div>
                  <span className={cn('text-[10px] whitespace-nowrap', i === step ? 'text-foreground font-medium' : 'text-muted-foreground')}>{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn('h-px w-10 mb-4 mx-1', i < step ? 'bg-foreground' : 'bg-border')} />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <div className="min-h-64">
            {/* Step 0: Name */}
            {step === 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-1">Name your project</h2>
                <p className="text-sm text-muted-foreground mb-5">Give it a clear name that describes the hiring initiative or talent pool.</p>
                <Input value={s.name} onChange={e => set({ name: e.target.value })}
                  placeholder="e.g. Texas ICU Nurses" className="mb-4"
                  onKeyDown={e => e.key === 'Enter' && s.name.trim() && setStep(1)} autoFocus />
                <p className="text-sm text-muted-foreground mb-2">Need inspiration?</p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_NAMES.map(n => (
                    <button key={n} onClick={() => set({ name: n })}
                      className="px-3 py-1 text-sm rounded-full border border-dashed border-border hover:border-foreground hover:text-foreground text-muted-foreground transition-colors">
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Description */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-1">Add a description</h2>
                <p className="text-sm text-muted-foreground mb-5">Help your team understand what this project is about. Optional but recommended.</p>
                <Textarea value={s.description} onChange={e => set({ description: e.target.value })}
                  placeholder="Describe the goal, target candidates, client requirements, or any important context…"
                  className="min-h-32 text-sm" autoFocus />
              </div>
            )}

            {/* Step 2: Type */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-1">Project type</h2>
                <p className="text-sm text-muted-foreground mb-5">Choose the type that best describes this project.</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {PROJECT_TYPES.map(t => (
                    <button key={t.id} onClick={() => set({ type: t.id })}
                      className={cn(
                        'flex flex-col items-start gap-0.5 px-4 py-3 rounded-xl border-2 text-left transition-colors',
                        s.type === t.id ? 'border-foreground bg-accent' : 'border-border hover:border-muted-foreground hover:bg-muted/40'
                      )}>
                      <span className="text-sm font-semibold">{t.label}</span>
                      <span className="text-sm text-muted-foreground leading-snug">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Visibility */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-1">Who can see this project?</h2>
                <p className="text-sm text-muted-foreground mb-5">Control access to this project.</p>
                <div className="flex flex-col gap-3">
                  {VISIBILITY.map(v => {
                    const Icon = v.icon
                    return (
                      <button key={v.id} onClick={() => set({ visibility: v.id })}
                        className={cn(
                          'flex items-center gap-4 px-4 py-4 rounded-xl border-2 text-left transition-colors',
                          s.visibility === v.id ? 'border-foreground bg-accent' : 'border-border hover:border-muted-foreground hover:bg-muted/40'
                        )}>
                        <div className={cn('size-9 rounded-lg flex items-center justify-center shrink-0',
                          s.visibility === v.id ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
                        )}>
                          <Icon className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{v.label}</p>
                          <p className="text-sm text-muted-foreground">{v.desc}</p>
                        </div>
                        {s.visibility === v.id && <Check className="size-4 ml-auto shrink-0" strokeWidth={3} />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Team */}
            {step === 4 && (
              <div>
                <h2 className="text-xl font-semibold mb-1">Assign team members</h2>
                <p className="text-sm text-muted-foreground mb-5">Choose who will work on this project. You can add more later.</p>
                <div className="flex flex-col gap-2">
                  {TEAM_OPTIONS.map(m => {
                    const sel = s.team.includes(m)
                    return (
                      <button key={m} onClick={() => set({ team: sel ? s.team.filter(t => t !== m) : [...s.team, m] })}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-colors',
                          sel ? 'border-foreground bg-accent' : 'border-border hover:border-muted-foreground hover:bg-muted/40'
                        )}>
                        <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {m.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-medium flex-1">{m}</span>
                        {sel && <Check className="size-4 shrink-0" strokeWidth={3} />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
              <div>
                <h2 className="text-xl font-semibold mb-1">Review & create</h2>
                <p className="text-sm text-muted-foreground mb-5">Everything look good?</p>
                <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                  {[
                    { label: 'Name',        value: s.name || '—' },
                    { label: 'Description', value: s.description || 'No description' },
                    { label: 'Type',        value: PROJECT_TYPES.find(t => t.id === s.type)?.label || '—' },
                    { label: 'Visibility',  value: VISIBILITY.find(v => v.id === s.visibility)?.label || '—' },
                    { label: 'Team',        value: s.team.length ? s.team.join(', ') : 'Just you' },
                  ].map(row => (
                    <div key={row.label} className="flex items-start gap-4 px-4 py-3">
                      <span className="text-sm font-semibold text-muted-foreground w-24 shrink-0 pt-0.5">{row.label}</span>
                      <span className="text-sm text-foreground">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer nav */}
          <div className="flex items-center justify-between mt-8">
            <Button variant="ghost" size="sm" className="text-sm h-8"
              onClick={() => step === 0 ? router.push('/dashboard/projects/my-projects') : setStep(s => s - 1)}>
              <ChevronLeft className="size-3.5 mr-1" />{step === 0 ? 'Cancel' : 'Back'}
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{step + 1} / {STEPS.length}</span>
              {step < STEPS.length - 1 ? (
                <Button size="sm" className="h-8 text-sm" disabled={!canNext[step]} onClick={() => setStep(s => s + 1)}>
                  Next <ChevronRight className="size-3.5 ml-1" />
                </Button>
              ) : (
                <Button size="sm" className="h-8 text-sm" onClick={() => router.push('/dashboard/projects/1')}>
                  <FolderKanban className="size-3.5 mr-1.5" />Create Project
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
