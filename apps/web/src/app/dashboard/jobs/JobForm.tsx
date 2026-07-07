'use client'

import { useState, useTransition, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createJobAction, updateJobAction, getJobsForCopyAction, type JobCopyRow } from './actions'
import { getClientsAutofillAction, type ClientAutofillRow } from '../clients/actions'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  ArrowLeft, Sparkles, Users, Building2, MapPin,
  DollarSign, FileText, User, Plus, X, CheckCircle2,
  Briefcase, Clock, GraduationCap, Shield, AlertCircle,
  Copy, ChevronDown, Zap, Star, RefreshCw, Search, LayoutTemplate,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type JobType, type WorkMode, type TaxTerm, type Priority, type JobStatus,
  EMPLOYMENT_TYPE_OPTIONS, WORK_MODE_OPTIONS, CLIENT_TYPE_OPTIONS, TAX_TERM_OPTIONS,
  PRIORITY_OPTIONS, STATUS_OPTIONS, US_STATES, DURATIONS, EDUCATION_OPTS,
  EXPERIENCE_OPTIONS, VISA_OPTIONS, RECENT_TITLES, RECENT_RECRUITERS,
  JOB_TEMPLATES, type JobTemplate, skillSuggestionsFor,
  parseEmploymentType, parseStatus, parsePriority, parseWorkMode,
  parseRequirements, buildRequirementsText,
} from './job-options'

const SIMILAR_JOBS_MOCK = [
  { title: 'Travel RN — ICU', client: 'Houston Methodist', daysOpen: 5, id: 'j1' },
  { title: 'Travel RN (Step-Down)', client: 'Memorial Hermann', daysOpen: 12, id: 'j2' },
]

// The one shape both the "new job" and "edit job" pages need to prefill this form from.
export type JobRecord = {
  id: string; title: string | null; client: string | null; client_job_id: string | null
  city: string | null; state: string | null; department: string | null
  employment_type: string | null; work_mode: string | null; client_type: string | null
  openings: number | null; recruiter_name: string | null; priority: string | null
  status: string | null; description: string | null; requirements: string | null
  salary_min: number | null; salary_max: number | null
}

// ─── Small components ─────────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-foreground mb-1.5">
      {children}
      {required && <span className="text-[#dd7456] ml-0.5">*</span>}
    </label>
  )
}

function FieldInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} className={cn(
      'w-full h-9 px-3 text-sm rounded-lg border border-border bg-background ring-offset-background',
      'focus-visible:outline-none focus-visible:border-[#D1D5DB]',
      'placeholder:text-muted-foreground transition-colors',
      className
    )} />
  )
}

function FieldSelect({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cn(
      'w-full h-9 px-3 text-sm rounded-lg border border-border bg-background ring-offset-background',
      'focus-visible:outline-none focus-visible:border-[#D1D5DB]',
      'transition-colors appearance-none cursor-pointer',
      className
    )}>
      {children}
    </select>
  )
}

function SectionCard({ n, icon: Icon, title, children, className }: {
  n: number; icon: React.ComponentType<{ className?: string }>; title: string
  children: React.ReactNode; className?: string
}) {
  return (
    <div className={cn('rounded-xl border border-border/60 bg-background shadow-sm overflow-hidden', className)}>
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-muted/10">
        <div className="size-6 rounded-full bg-[#dd7456]/10 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-[#dd7456]">{n}</span>
        </div>
        <Icon className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
  )
}

// ─── Skill tag input ──────────────────────────────────────────────────────────

function SkillInput({ label, skills, onChange, suggestions }: {
  label: string; skills: string[]; onChange: (s: string[]) => void
  suggestions: string[]
}) {
  const [input, setInput] = useState('')

  const add = (s: string) => {
    const t = s.trim()
    if (t && !skills.includes(t)) onChange([...skills, t])
    setInput('')
  }

  const remove = (s: string) => onChange(skills.filter(x => x !== s))

  const avail = suggestions.filter(s => !skills.includes(s))

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {skills.map(s => (
            <span key={s} className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-[#fdf0ec] dark:bg-[#2a1a15] text-[#dd7456] text-xs font-medium border border-[#dd7456]/25">
              {s}
              <button type="button" onClick={() => remove(s)} className="hover:text-[#c45e3e]">
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <FieldInput
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input) }
            if (e.key === 'Backspace' && !input && skills.length) onChange(skills.slice(0, -1))
          }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">Press Enter or comma to add</p>
      {avail.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="text-[10px] text-muted-foreground self-center mr-1">Suggest:</span>
          {avail.slice(0, 7).map(s => (
            <button key={s} type="button" onClick={() => add(s)}
              className="h-6 px-2 text-[10px] font-medium rounded-md border border-dashed border-muted-foreground/40 text-muted-foreground hover:border-[#dd7456] hover:text-[#dd7456] transition-colors">
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Dropdown with recent / search ───────────────────────────────────────────

function SmartCombobox({ value, onChange, options, onSelect }: {
  value: string; onChange: (v: string) => void; options: string[]
  onSelect?: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const filtered = options.filter(o => o.toLowerCase().includes(value.toLowerCase()))

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <FieldInput
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-background border border-border rounded-xl shadow-lg">
          {filtered.slice(0, 8).map(o => (
            <button key={o} type="button"
              onMouseDown={() => { onChange(o); onSelect?.(o); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 transition-colors">
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Smart panel ─────────────────────────────────────────────────────────────

function SmartPanel({ title, client, mustHave, jobType, payRate, billRate, workMode, city, description, recruiter }: {
  title: string; client: string; mustHave: string[]
  jobType: JobType; payRate: string; billRate: string
  workMode: WorkMode; city: string; description: string; recruiter: string
}) {
  const sections = [
    !!title,
    !!client,
    workMode === 'remote' || !!city,
    mustHave.length > 0,
    !!description,
    !!recruiter,
  ]
  const filled = sections.filter(Boolean).length
  const pct    = Math.round((filled / sections.length) * 100)

  const showSimilar    = title.toLowerCase().includes('rn') || title.toLowerCase().includes('nurse') || title.toLowerCase().includes('icu')
  const showCandidates = mustHave.length >= 2
  const margin         = payRate && billRate ? (parseFloat(billRate) - parseFloat(payRate)).toFixed(2) : null

  return (
    <div className="space-y-4 sticky top-6">

      {/* Progress */}
      <div className="rounded-xl border border-border/60 bg-background shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Progress</p>
          <span className="text-sm font-bold text-[#dd7456]">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
          <div className="h-full bg-[#dd7456] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-sm text-muted-foreground">{filled} of {sections.length} sections started</p>
      </div>

      {/* Bill rate margin */}
      {margin && parseFloat(margin) > 0 && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="size-4 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Margin preview</p>
          </div>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">${margin}<span className="text-sm font-normal">/hr</span></p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
            {billRate && payRate ? `${Math.round((parseFloat(margin) / parseFloat(billRate)) * 100)}% gross margin` : ''}
          </p>
        </div>
      )}

      {/* Similar jobs */}
      {showSimilar && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 p-4">
          <div className="flex items-start gap-2 mb-3">
            <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Similar jobs open</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">2 active jobs match this title</p>
            </div>
          </div>
          {SIMILAR_JOBS_MOCK.map(j => (
            <div key={j.id} className="flex items-center justify-between py-2 border-b border-amber-200/60 dark:border-amber-800/60 last:border-0 gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{j.title}</p>
                <p className="text-[10px] text-muted-foreground">{j.client} · {j.daysOpen}d open</p>
              </div>
              <button type="button"
                className="h-6 px-2 text-[10px] font-medium rounded-md border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1">
                <Copy className="size-2.5" />Copy
              </button>
            </div>
          ))}
          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 text-center">Or continue posting a new one below</p>
        </div>
      )}

      {/* Candidate match */}
      {showCandidates && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 p-4">
          <div className="flex items-start gap-2 mb-3">
            <Users className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">18 candidates match</p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">Already in your database</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button"
              className="flex-1 h-7 text-[11px] font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
              View Candidates
            </button>
            <button type="button"
              className="flex-1 h-7 text-[11px] font-medium rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors">
              Contact All
            </button>
          </div>
        </div>
      )}

      {/* AI suggestions */}
      <div className="rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="size-4 text-violet-500" />
          <p className="text-sm font-semibold text-violet-800 dark:text-violet-200">AI Insights</p>
        </div>
        {title ? (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-[10px] leading-relaxed text-violet-700 dark:text-violet-300">
                💰 Market pay rate: <strong>$48–$68/hr</strong> for {title} in Texas
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[10px] leading-relaxed text-violet-700 dark:text-violet-300">
                ⚡ Avg fill time: <strong>11 days</strong> for this role type
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[10px] leading-relaxed text-violet-700 dark:text-violet-300">
                📍 Top markets: Houston, Dallas, San Antonio
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-violet-600 dark:text-violet-400">Enter a job title to see AI insights.</p>
        )}
      </div>

      {/* Tips */}
      <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2.5">Quick tips</p>
        <ul className="space-y-2 text-[11px] text-muted-foreground leading-relaxed">
          <li>Select a client to auto-fill location and hiring manager</li>
          <li>Add 2+ skills to see matching candidates in your database</li>
          <li>Use "Generate with AI" to write the job description in seconds</li>
          <li>Set a bill rate to see your gross margin here</li>
        </ul>
      </div>
    </div>
  )
}

// ─── Main form ────────────────────────────────────────────────────────────────

export default function JobForm({ mode, initialJob }: { mode: 'create' | 'edit'; initialJob?: JobRecord }) {
  const [clients, setClients] = useState<ClientAutofillRow[]>([])
  useEffect(() => { getClientsAutofillAction().then(setClients) }, [])
  const recentClients = clients.map(c => c.name)
  function clientAutofill(name: string) {
    const c = clients.find(c => c.name === name)
    if (!c) return null
    return {
      city: c.city, state: c.state, hiringManager: c.hiringManager, clientType: c.companyType,
      industry: c.industry, assignedRecruiters: c.assignedRecruiters,
    }
  }

  // Existing jobs, for the "Copy Existing Job" picker
  const [existingJobs, setExistingJobs] = useState<JobCopyRow[]>([])
  useEffect(() => { getJobsForCopyAction().then(setExistingJobs) }, [])

  // Requirements blob (Hiring Manager / Tax Term / Duration / etc.) round-tripped
  // back into structured fields when editing an existing job.
  const req = useMemo(() => parseRequirements(initialJob?.requirements ?? ''), [initialJob])
  const initialJobType = useMemo(() => parseEmploymentType(initialJob?.employment_type ?? ''), [initialJob])
  const isDirectHireInitial = initialJobType === 'direct_hire'

  // ── Core fields
  const [title,         setTitle]        = useState(initialJob?.title ?? '')
  const [client,        setClient]       = useState(initialJob?.client ?? '')
  const [clientJobId,   setClientJobId]  = useState(initialJob?.client_job_id ?? '')
  const [hiringManager, setHiringManager]= useState(req.hiringManager)
  const [city,          setCity]         = useState(initialJob?.city ?? '')
  const [stateVal,      setStateVal]     = useState(initialJob?.state ?? '')
  const [department,    setDepartment]   = useState(initialJob?.department ?? '')

  // ── Job type
  const [jobType,       setJobType]      = useState<JobType>(initialJobType)
  const [workMode,      setWorkMode]     = useState<WorkMode>(parseWorkMode(initialJob?.work_mode))
  const [taxTerm,       setTaxTerm]      = useState<TaxTerm>(req.taxTerm || 'w2')
  const [duration,      setDuration]     = useState(req.duration)
  const [startDate,     setStartDate]    = useState(req.startDate)

  // ── Pay
  const [payRate,       setPayRate]      = useState(!isDirectHireInitial && initialJob?.salary_min != null ? String(initialJob.salary_min / 100) : '')
  const [billRate,      setBillRate]     = useState(!isDirectHireInitial && initialJob?.salary_max != null ? String(initialJob.salary_max / 100) : '')
  const [salaryMin,     setSalaryMin]    = useState(isDirectHireInitial && initialJob?.salary_min != null ? String(initialJob.salary_min / 100) : '')
  const [salaryMax,     setSalaryMax]    = useState(isDirectHireInitial && initialJob?.salary_max != null ? String(initialJob.salary_max / 100) : '')

  // ── Requirements
  const [experience,    setExperience]   = useState(req.experience)
  const [mustHave,      setMustHave]     = useState<string[]>(req.mustHave)
  const [niceToHave,    setNiceToHave]   = useState<string[]>(req.niceToHave)
  const [workAuth,      setWorkAuth]     = useState<string[]>(req.workAuth)
  const [education,     setEducation]    = useState(req.education)

  // ── Description
  const [description,   setDescription]  = useState(initialJob?.description ?? '')
  const [aiGenerating,  setAiGenerating] = useState(false)
  const [pasteMode,     setPasteMode]    = useState(false)
  const [pastedJD,      setPastedJD]     = useState('')

  // ── Team
  const [openings,      setOpenings]     = useState(String(initialJob?.openings ?? 1))
  const [priority,      setPriority]     = useState<Priority>(parsePriority(initialJob?.priority))
  const [recruiter,     setRecruiter]    = useState(initialJob?.recruiter_name ?? '')
  const [clientType,    setClientType]   = useState(initialJob?.client_type || 'direct')
  const [status,        setStatus]       = useState<JobStatus>(parseStatus(initialJob?.status))
  const [deadline,      setDeadline]     = useState(req.deadline)

  const [isPending,     startTransition] = useTransition()
  const [errors,        setErrors]       = useState<string[]>([])

  // ── Template / Copy pickers
  const [templateOpen,  setTemplateOpen] = useState(false)
  const [copyOpen,      setCopyOpen]     = useState(false)
  const [copyQuery,     setCopyQuery]    = useState('')

  const isContract = jobType === 'contract' || jobType === 'cth'

  // Recruiter options: the client's assigned recruiter(s) plus the static recent list,
  // so an auto-filled name always has a matching <option>.
  const recruiterOptions = useMemo(() => {
    const clientRecruiters = clientAutofill(client)?.assignedRecruiters ?? []
    return Array.from(new Set([...clientRecruiters, ...RECENT_RECRUITERS, ...(recruiter ? [recruiter] : [])]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, clients, recruiter])

  // Skill suggestions based on title
  const skillSuggestions = useMemo(() => skillSuggestionsFor(title), [title])

  // Auto-fill from client selection
  const handleClientSelect = (c: string) => {
    const fill = clientAutofill(c)
    if (fill) {
      setCity(fill.city)
      setStateVal(fill.state)
      if (fill.hiringManager) setHiringManager(fill.hiringManager)
      setClientType(fill.clientType)
      if (fill.industry) setDepartment(fill.industry)
      if (fill.assignedRecruiters.length) setRecruiter(fill.assignedRecruiters[0]!)
    }
  }

  // Apply a static job template
  const applyTemplate = (t: JobTemplate) => {
    setTitle(t.title)
    setJobType(t.jobType)
    setWorkMode(t.workMode)
    setTaxTerm(t.taxTerm)
    if (t.duration) setDuration(t.duration)
    if (t.department) setDepartment(t.department)
    if (t.education) setEducation(t.education)
    setMustHave(t.mustHave)
    setNiceToHave(t.niceToHave ?? [])
    setDescription(t.description)
    setTemplateOpen(false)
  }

  // Copy an existing job's fields onto this form
  const applyExistingJob = (job: JobCopyRow) => {
    setTitle(mode === 'create' ? `${job.title} (Copy)` : job.title)
    setClient(job.client ?? '')
    setCity(job.city ?? '')
    setStateVal(job.state ?? '')
    setDepartment(job.department ?? '')
    setClientType(job.client_type === 'vms' ? 'vms' : 'direct')
    setWorkMode(parseWorkMode(job.work_mode))
    const jt = parseEmploymentType(job.employment_type ?? '')
    setJobType(jt)
    setOpenings(String(job.openings ?? 1))
    setRecruiter(job.recruiter_name ?? '')
    setPriority(parsePriority(job.priority))
    setDescription(job.description ?? '')

    const copiedReq = parseRequirements(job.requirements ?? '')
    setHiringManager(copiedReq.hiringManager)
    setDuration(copiedReq.duration)
    setTaxTerm(copiedReq.taxTerm)
    setExperience(copiedReq.experience)
    setMustHave(copiedReq.mustHave)
    setNiceToHave(copiedReq.niceToHave)
    setWorkAuth(copiedReq.workAuth)
    setEducation(copiedReq.education)
    // Dates are job-instance specific (likely stale on an old job) — leave blank for the copy.
    setStartDate('')
    setDeadline('')

    if (jt === 'contract' || jt === 'cth') {
      setPayRate(job.salary_min != null ? String(job.salary_min / 100) : '')
      setBillRate(job.salary_max != null ? String(job.salary_max / 100) : '')
    } else {
      setSalaryMin(job.salary_min != null ? String(job.salary_min / 100) : '')
      setSalaryMax(job.salary_max != null ? String(job.salary_max / 100) : '')
    }

    setCopyOpen(false)
    setCopyQuery('')
  }

  // Pre-fill client from the Client Workspace's "Post job" quick action.
  // Re-runs once `clients` finishes loading so autofill has data to match against.
  const searchParams = useSearchParams()
  useEffect(() => {
    if (mode !== 'create') return
    const c = searchParams.get('client')
    if (c) { setClient(c); handleClientSelect(c) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients])

  // AI description generation (mock)
  const generateDescription = async () => {
    setAiGenerating(true)
    await new Promise(r => setTimeout(r, 1600))
    const loc  = city && stateVal ? ` in ${city}, ${stateVal}` : ''
    const type = jobType === 'contract' ? `${duration || '6-month'} contract${taxTerm ? ` (${taxTerm.toUpperCase()})` : ''}` : jobType === 'direct_hire' ? 'direct hire' : 'contract-to-hire'
    setDescription(
`We are seeking a skilled ${title || 'professional'} to join ${client || 'our client'}${loc} on a ${type} basis.

Key Responsibilities:
${mustHave.slice(0, 3).map(s => `• Apply expertise in ${s} to deliver high-quality results`).join('\n') || '• Collaborate with cross-functional teams to deliver results'}
• Participate in design reviews and technical discussions
• Maintain clear documentation and code standards
• Communicate proactively with stakeholders

Requirements:
${mustHave.length ? `• Must-have: ${mustHave.join(', ')}` : '• Relevant technical experience required'}
${experience ? `• ${experience}+ years of experience` : ''}
${niceToHave.length ? `• Nice to have: ${niceToHave.join(', ')}` : ''}

${workMode === 'remote' ? 'This is a fully remote position.' : workMode === 'hybrid' ? 'This position follows a hybrid schedule.' : `This position is on-site${loc}.`}`
    )
    setAiGenerating(false)
  }

  // Extract skills from pasted JD (mock)
  const extractFromPaste = () => {
    const extracted = ['5+ years experience', 'Strong communication', 'Problem solving']
    if (pastedJD.toLowerCase().includes('java'))       extracted.push('Java', 'Spring Boot')
    if (pastedJD.toLowerCase().includes('aws'))        extracted.push('AWS')
    if (pastedJD.toLowerCase().includes('kubernetes')) extracted.push('Kubernetes', 'Docker')
    if (pastedJD.toLowerCase().includes('rn') || pastedJD.toLowerCase().includes('nurse')) {
      extracted.push('RN License', 'BLS', 'ACLS')
    }
    const skills = extracted.filter(e => !e.includes('years') && !e.includes('communication') && !e.includes('solving'))
    setMustHave(prev => [...new Set([...prev, ...skills])])
    setDescription(pastedJD)
    setPasteMode(false)
    setPastedJD('')
  }

  // Form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errs: string[] = []
    if (!title.trim()) errs.push('Job title is required.')
    if (errs.length) { setErrors(errs); return }
    setErrors([])

    const fd = new FormData()
    fd.set('title',           title)
    fd.set('client',          client)
    fd.set('client_job_id',   clientJobId)
    fd.set('city',            city)
    fd.set('state',           stateVal)
    fd.set('department',      department)
    fd.set('employment_type', jobType)
    fd.set('work_mode',       workMode)
    fd.set('client_type',     clientType)
    fd.set('openings',        openings)
    fd.set('recruiter_name',  recruiter)
    fd.set('status',          status)
    fd.set('priority',        priority)
    fd.set('description',     description)
    fd.set('requirements', buildRequirementsText({
      hiringManager, isContract, taxTerm, duration, startDate, deadline,
      experience, mustHave, niceToHave, workAuth, education,
    }))

    // Pay: for contract use pay rate, for direct hire use salary
    if (isContract) {
      fd.set('salary_min', payRate  || '')
      fd.set('salary_max', billRate || '')
    } else {
      fd.set('salary_min', salaryMin || '')
      fd.set('salary_max', salaryMax || '')
    }

    startTransition(async () => {
      const res = mode === 'create'
        ? await createJobAction(fd)
        : await updateJobAction(initialJob!.id, fd)
      if (res?.error) setErrors([res.error])
    })
  }

  const cancelHref = mode === 'create' ? '/dashboard/jobs' : `/dashboard/jobs/${initialJob?.id}`

  return (
    <div className="h-full overflow-y-auto bg-muted/10">
      <div className="max-w-[1400px] mx-auto px-6 py-6 pb-24">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link href={cancelHref}
              className="size-8 rounded-lg border border-border bg-background hover:bg-muted/60 flex items-center justify-center transition-colors">
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <h1 className="text-lg font-bold tracking-tight">{mode === 'create' ? 'Post Job' : 'Edit Job'}</h1>
              <p className="text-sm text-muted-foreground">
                {mode === 'create' ? 'Fill in the details below to post a new job' : 'Update the details below and save your changes'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Popover open={templateOpen} onOpenChange={setTemplateOpen}>
              <PopoverTrigger asChild>
                <button type="button"
                  className="h-8 px-4 text-sm rounded-lg border border-border bg-background hover:bg-muted/60 transition-colors font-medium text-muted-foreground flex items-center gap-1.5">
                  <LayoutTemplate className="size-3.5" />Use Template
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-1 max-h-80 overflow-y-auto">
                {JOB_TEMPLATES.map(t => (
                  <button key={t.name} type="button" onClick={() => applyTemplate(t)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-muted/60 transition-colors">
                    <span className="block text-sm font-medium">{t.name}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {t.jobType === 'contract' ? 'Contract' : t.jobType === 'direct_hire' ? 'Direct Hire' : 'Contract to Hire'}
                      {t.department ? ` · ${t.department}` : ''}
                    </span>
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            <Popover open={copyOpen} onOpenChange={o => { setCopyOpen(o); if (!o) setCopyQuery('') }}>
              <PopoverTrigger asChild>
                <button type="button"
                  className="h-8 px-4 text-sm rounded-lg border border-border bg-background hover:bg-muted/60 transition-colors font-medium text-muted-foreground flex items-center gap-1.5">
                  <Copy className="size-3.5" />Copy Existing Job
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-2">
                <p className="text-[10px] text-muted-foreground px-1 mb-1">Search by title or client</p>
                <FieldInput
                  autoFocus
                  value={copyQuery}
                  onChange={e => setCopyQuery(e.target.value)}
                  className="mb-2"
                />
                <div className="max-h-72 overflow-y-auto space-y-0.5">
                  {existingJobs.length === 0 ? (
                    <p className="text-sm text-muted-foreground px-2 py-2">No existing jobs to copy from.</p>
                  ) : existingJobs
                      .filter(j => j.id !== initialJob?.id)
                      .filter(j => `${j.title} ${j.client ?? ''}`.toLowerCase().includes(copyQuery.toLowerCase()))
                      .slice(0, 30)
                      .map(j => (
                        <button key={j.id} type="button" onClick={() => applyExistingJob(j)}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-muted/60 transition-colors">
                          <span className="block text-sm font-medium truncate">{j.title}</span>
                          <span className="block text-[11px] text-muted-foreground truncate">{j.client || '—'}</span>
                        </button>
                      ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mb-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/60 px-4 py-3">
            {errors.map(e => (
              <div key={e} className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                <AlertCircle className="size-4 shrink-0" />{e}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-12 gap-5">

            {/* ── Left: main form ────────────────────────────────────── */}
            <div className="col-span-12 lg:col-span-8 space-y-5">

              {/* Section 1: Job & Client */}
              <SectionCard n={1} icon={Briefcase} title="Job & Client">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <FieldLabel required>Job Title</FieldLabel>
                    <SmartCombobox
                      value={title}
                      onChange={setTitle}
                      options={RECENT_TITLES}
                    />
                    {RECENT_TITLES.filter(t => !title).length > 0 && !title && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-[10px] text-muted-foreground self-center">Recent:</span>
                        {RECENT_TITLES.slice(0, 5).map(t => (
                          <button key={t} type="button" onClick={() => setTitle(t)}
                            className="h-6 px-2 text-[10px] rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <FieldLabel>Client</FieldLabel>
                    <SmartCombobox
                      value={client}
                      onChange={setClient}
                      options={recentClients}
                      onSelect={handleClientSelect}
                    />
                    {!client && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-[10px] text-muted-foreground self-center">Recent:</span>
                        {recentClients.slice(0, 4).map(c => (
                          <button key={c} type="button" onClick={() => { setClient(c); handleClientSelect(c) }}
                            className="h-6 px-2 text-[10px] rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <FieldLabel>Client Job ID</FieldLabel>
                    <FieldInput
                      value={clientJobId}
                      onChange={e => setClientJobId(e.target.value)}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">The client&apos;s own requisition/job number — separate from your internal Job ID.</p>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <FieldLabel>Hiring Manager</FieldLabel>
                    <FieldInput
                      value={hiringManager}
                      onChange={e => setHiringManager(e.target.value)}
                    />
                    {client && !hiringManager && clientAutofill(client)?.hiringManager && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Auto-filled: {clientAutofill(client)!.hiringManager}
                      </p>
                    )}
                  </div>

                  <div>
                    <FieldLabel>Account Type</FieldLabel>
                    <FieldSelect value={clientType} onChange={e => setClientType(e.target.value)}>
                      {CLIENT_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </FieldSelect>
                  </div>

                  <div>
                    <FieldLabel>Department</FieldLabel>
                    <FieldInput
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                    />
                    {client && clientAutofill(client)?.industry && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Auto-filled from {client}&apos;s industry: {clientAutofill(client)!.industry}
                      </p>
                    )}
                  </div>
                </div>
              </SectionCard>

              {/* Section 2: Location */}
              <SectionCard n={2} icon={MapPin} title="Location">
                <div>
                  <FieldLabel>Work Location</FieldLabel>
                  <FieldSelect value={workMode} onChange={e => setWorkMode(e.target.value as WorkMode)}>
                    {WORK_MODE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </FieldSelect>
                </div>
                {workMode !== 'remote' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>City</FieldLabel>
                      <FieldInput
                        value={city}
                        onChange={e => setCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <FieldLabel>State</FieldLabel>
                      <FieldSelect value={stateVal} onChange={e => setStateVal(e.target.value)}>
                        <option value="">— Select state —</option>
                        {US_STATES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </FieldSelect>
                    </div>
                  </div>
                )}
                {workMode === 'remote' && (
                  <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                    Fully remote — candidates from any US location can apply.
                  </p>
                )}
              </SectionCard>

              {/* Section 3: Job Type */}
              <SectionCard n={3} icon={Clock} title="Job Type">
                <div>
                  <FieldLabel required>Employment Type</FieldLabel>
                  <FieldSelect value={jobType} onChange={e => setJobType(e.target.value as JobType)}>
                    {EMPLOYMENT_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </FieldSelect>
                </div>

                {isContract && (
                  <div>
                    <FieldLabel>Tax Terms</FieldLabel>
                    <FieldSelect value={taxTerm} onChange={e => setTaxTerm(e.target.value as TaxTerm)}>
                      {TAX_TERM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </FieldSelect>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {isContract && (
                    <div>
                      <FieldLabel>Contract Duration</FieldLabel>
                      <FieldSelect value={duration} onChange={e => setDuration(e.target.value)}>
                        <option value="">— Select duration —</option>
                        {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                      </FieldSelect>
                    </div>
                  )}
                  <div>
                    <FieldLabel>Start Date</FieldLabel>
                    <FieldInput
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                    />
                  </div>
                </div>
              </SectionCard>

              {/* Section 4: Pay */}
              <SectionCard n={4} icon={DollarSign} title="Pay">
                {isContract ? (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Pay Rate ($/hr)</FieldLabel>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">$</span>
                          <FieldInput
                            type="number" min="0" step="0.50"
                            value={payRate}
                            onChange={e => setPayRate(e.target.value)}
                            className="pl-7"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">/hr</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">What you pay the candidate</p>
                      </div>
                      <div>
                        <FieldLabel>Bill Rate ($/hr)</FieldLabel>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">$</span>
                          <FieldInput
                            type="number" min="0" step="0.50"
                            value={billRate}
                            onChange={e => setBillRate(e.target.value)}
                            className="pl-7"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">/hr</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">What you bill the client</p>
                      </div>
                    </div>
                    {payRate && billRate && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                        <DollarSign className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">
                          Gross margin: <strong>${(parseFloat(billRate) - parseFloat(payRate)).toFixed(2)}/hr</strong>
                          {' '}({Math.round(((parseFloat(billRate) - parseFloat(payRate)) / parseFloat(billRate)) * 100)}%)
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Min Salary ($/year)</FieldLabel>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">$</span>
                        <FieldInput type="number" min="0" step="1000" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} className="pl-7" />
                      </div>
                    </div>
                    <div>
                      <FieldLabel>Max Salary ($/year)</FieldLabel>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">$</span>
                        <FieldInput type="number" min="0" step="1000" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} className="pl-7" />
                      </div>
                    </div>
                  </div>
                )}
              </SectionCard>

              {/* Section 5: Requirements */}
              <SectionCard n={5} icon={GraduationCap} title="Requirements">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Years of Experience</FieldLabel>
                    <FieldSelect value={experience} onChange={e => setExperience(e.target.value)}>
                      {EXPERIENCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </FieldSelect>
                  </div>
                  <div>
                    <FieldLabel>Education</FieldLabel>
                    <FieldSelect value={education} onChange={e => setEducation(e.target.value)}>
                      <option value="">No requirement</option>
                      {EDUCATION_OPTS.map(e => <option key={e} value={e}>{e}</option>)}
                    </FieldSelect>
                  </div>
                </div>

                <SkillInput
                  label="Must-Have Skills"
                  skills={mustHave}
                  onChange={setMustHave}
                  suggestions={skillSuggestions}
                />

                <SkillInput
                  label="Nice to Have"
                  skills={niceToHave}
                  onChange={setNiceToHave}
                  suggestions={skillSuggestions.filter(s => !mustHave.includes(s))}
                />

                <div>
                  <FieldLabel>Work Authorization</FieldLabel>
                  <FieldSelect
                    multiple
                    size={VISA_OPTIONS.length}
                    value={workAuth}
                    onChange={e => setWorkAuth(Array.from(e.target.selectedOptions, o => o.value))}
                    className="h-auto py-1"
                  >
                    {VISA_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                  </FieldSelect>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {workAuth.length === 0
                      ? 'No restriction selected — all visa types will be considered. Ctrl/Cmd-click to select multiple.'
                      : 'Ctrl/Cmd-click to select multiple.'}
                  </p>
                </div>
              </SectionCard>

              {/* Section 6: Job Description */}
              <SectionCard n={6} icon={FileText} title="Job Description">

                {/* AI generation toolbar */}
                <div className="flex flex-wrap gap-2 pb-2 border-b border-border/40">
                  <button type="button" onClick={generateDescription} disabled={aiGenerating}
                    className="h-8 px-3 text-sm rounded-lg bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900 transition-colors font-medium flex items-center gap-1.5 disabled:opacity-50">
                    <Sparkles className="size-3.5" />
                    {aiGenerating ? 'Generating…' : 'Generate with AI'}
                  </button>
                  <button type="button" onClick={() => setPasteMode(!pasteMode)}
                    className="h-8 px-3 text-sm rounded-lg border border-border bg-background hover:bg-muted/60 transition-colors font-medium flex items-center gap-1.5 text-muted-foreground">
                    <RefreshCw className="size-3.5" />
                    {pasteMode ? 'Cancel paste' : 'Paste & Extract'}
                  </button>
                  {description && (
                    <button type="button"
                      className="h-8 px-3 text-sm rounded-lg border border-border bg-background hover:bg-muted/60 transition-colors font-medium flex items-center gap-1.5 text-muted-foreground">
                      <Zap className="size-3.5" />Improve Writing
                    </button>
                  )}
                </div>

                {/* Paste mode */}
                {pasteMode && (
                  <div className="rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/30 p-4 space-y-3">
                    <p className="text-sm font-medium text-violet-800 dark:text-violet-200">Paste the client&apos;s job description below — AI will extract skills and fill in the form.</p>
                    <textarea
                      rows={6} value={pastedJD} onChange={e => setPastedJD(e.target.value)}
                      className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2.5 focus-visible:outline-none focus-visible:border-[#D1D5DB] resize-none"
                    />
                    <button type="button" onClick={extractFromPaste} disabled={!pastedJD.trim()}
                      className="h-8 px-4 text-sm font-semibold rounded-lg bg-[#dd7456] text-white hover:bg-[#c45e3e] disabled:opacity-40 transition-colors">
                      Extract Skills & Fill Form →
                    </button>
                  </div>
                )}

                {/* Description textarea */}
                {!pasteMode && (
                  <div>
                    <FieldLabel>Description</FieldLabel>
                    <textarea
                      rows={10} value={description}
                      onChange={e => setDescription(e.target.value)}
                      className={cn(
                        'w-full text-sm rounded-lg border border-border bg-background px-3 py-2.5',
                        'focus-visible:outline-none focus-visible:border-[#D1D5DB]',
                        'resize-y transition-colors',
                        aiGenerating && 'opacity-50'
                      )}
                    />
                    {aiGenerating && (
                      <p className="text-[10px] text-violet-600 dark:text-violet-400 mt-1">AI is writing your description…</p>
                    )}
                    {description && !aiGenerating && (
                      <p className="text-[10px] text-muted-foreground mt-1">{description.split(/\s+/).length} words</p>
                    )}
                  </div>
                )}
              </SectionCard>

              {/* Section 7: Team */}
              <SectionCard n={7} icon={User} title="Team & Settings">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Assigned Recruiter</FieldLabel>
                    <FieldSelect value={recruiter} onChange={e => setRecruiter(e.target.value)}>
                      <option value="">— Assign recruiter —</option>
                      {recruiterOptions.map(r => <option key={r} value={r}>{r}</option>)}
                    </FieldSelect>
                    {client && !!clientAutofill(client)?.assignedRecruiters.length && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Auto-filled from {client}&apos;s assigned recruiter
                      </p>
                    )}
                  </div>
                  <div>
                    <FieldLabel># of Openings</FieldLabel>
                    <FieldInput
                      type="number" min="1" max="99"
                      value={openings}
                      onChange={e => setOpenings(e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel>Status</FieldLabel>
                    <FieldSelect value={status} onChange={e => setStatus(e.target.value as JobStatus)}>
                      {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </FieldSelect>
                  </div>
                  <div>
                    <FieldLabel>Priority</FieldLabel>
                    <FieldSelect value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                      {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </FieldSelect>
                  </div>
                  <div>
                    <FieldLabel>Submission Deadline</FieldLabel>
                    <FieldInput
                      type="date"
                      value={deadline}
                      onChange={e => setDeadline(e.target.value)}
                    />
                  </div>
                </div>
              </SectionCard>

            </div>

            {/* ── Right: smart panel ─────────────────────────────────── */}
            <div className="col-span-12 lg:col-span-4">
              <SmartPanel
                title={title}
                client={client}
                mustHave={mustHave}
                jobType={jobType}
                payRate={payRate}
                billRate={billRate}
                workMode={workMode}
                city={city}
                description={description}
                recruiter={recruiter}
              />
            </div>
          </div>

          {/* ── Sticky footer ────────────────────────────────────────── */}
          <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur-sm px-6 py-3">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                {title ? (
                  <span>
                    <span className="font-medium text-foreground">{title}</span>
                    {client && <span> · {client}</span>}
                    {isContract && taxTerm && <span> · {taxTerm.toUpperCase()}</span>}
                    {isContract && payRate && <span> · ${payRate}/hr</span>}
                  </span>
                ) : (
                  <span>Start by entering a job title above</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Link href={cancelHref}
                  className="h-9 px-4 text-sm rounded-xl border border-border bg-background hover:bg-muted/60 transition-colors font-medium text-muted-foreground flex items-center">
                  Cancel
                </Link>
                <button type="submit"
                  disabled={!title || isPending}
                  className={cn(
                    'h-9 px-5 text-sm rounded-xl font-semibold transition-all flex items-center gap-2',
                    'bg-[#dd7456] text-white hover:bg-[#c45e3e]',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                    isPending && 'opacity-70'
                  )}>
                  {isPending ? (
                    <><RefreshCw className="size-4 animate-spin" />{mode === 'create' ? 'Posting…' : 'Saving…'}</>
                  ) : mode === 'create' ? (
                    <>Post Job <Star className="size-3.5" /></>
                  ) : (
                    <>Save Changes <Star className="size-3.5" /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
