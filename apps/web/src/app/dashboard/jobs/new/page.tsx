'use client'

import { useState, useTransition, useMemo, useRef } from 'react'
import Link from 'next/link'
import { createJobAction } from '../actions'
import {
  ArrowLeft, Sparkles, Users, Building2, MapPin,
  DollarSign, FileText, User, Plus, X, CheckCircle2,
  Briefcase, Clock, GraduationCap, Shield, AlertCircle,
  Copy, ChevronDown, Zap, Star, RefreshCw, Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Static data ──────────────────────────────────────────────────────────────

const RECENT_CLIENTS  = ['JPMorgan Chase', 'Houston Methodist', 'Shell', 'Chevron', 'AT&T', 'Dell Technologies', 'Amazon Logistics', 'Memorial Hermann']
const RECENT_TITLES   = ['Travel RN (ICU)', 'Senior Java Developer', 'Cloud Architect', 'DevOps Engineer', 'Staff RN', 'Project Manager', 'Data Engineer', 'SAP Consultant']
const RECENT_RECRUITERS = ['Arun Kumar', 'Priya Sharma', 'James Wilson', 'Sarah Chen']
const DURATIONS       = ['1 month', '3 months', '6 months', '12 months', '18 months', '24 months', 'Ongoing']
const EDUCATION_OPTS  = ['High School / GED', 'Associate Degree', "Bachelor's Degree", "Master's Degree", 'PhD', 'RN / BSN', 'No preference']

const SKILL_SUGGESTIONS: Record<string, string[]> = {
  rn:     ['RN License', 'BLS', 'ACLS', 'ICU Experience', 'Epic EMR', 'Med-Surg', 'NIHSS', 'Telemetry'],
  java:   ['Java', 'Spring Boot', 'Microservices', 'REST APIs', 'SQL', 'AWS', 'Maven', 'JUnit'],
  cloud:  ['AWS', 'Azure', 'GCP', 'Terraform', 'Kubernetes', 'Docker', 'CI/CD', 'Linux'],
  devops: ['CI/CD', 'Docker', 'Kubernetes', 'Jenkins', 'AWS', 'Git', 'Ansible', 'Python'],
  data:   ['Python', 'SQL', 'Spark', 'Databricks', 'ETL', 'Azure', 'dbt', 'Airflow'],
  sap:    ['SAP S/4HANA', 'SAP FI/CO', 'SAP MM', 'ABAP', 'SAP BW', 'SAP Basis'],
  default:['Communication', 'Problem Solving', 'Teamwork', 'MS Office'],
}

const VISA_OPTIONS = ['US Citizen', 'Green Card', 'H1B Transfer', 'OPT / CPT', 'TN Visa', 'EAD', 'Any']

const CLIENT_AUTOFILL: Record<string, { city: string; state: string; hiringManager: string; clientType: string }> = {
  'Houston Methodist':  { city:'Houston',    state:'TX', hiringManager:'Dr. Sarah Kim',   clientType:'direct' },
  'JPMorgan Chase':     { city:'New York',   state:'NY', hiringManager:'Mike Torres',      clientType:'vms'    },
  'Shell':              { city:'Houston',    state:'TX', hiringManager:'Linda Park',        clientType:'direct' },
  'Chevron':            { city:'Houston',    state:'TX', hiringManager:'Greg Adams',        clientType:'direct' },
  'AT&T':              { city:'Dallas',     state:'TX', hiringManager:'Rachel Brown',       clientType:'vms'    },
  'Dell Technologies':  { city:'Austin',     state:'TX', hiringManager:'James O\'Brien',   clientType:'direct' },
  'Amazon Logistics':   { city:'Seattle',    state:'WA', hiringManager:'Priya Nair',        clientType:'vms'    },
  'Memorial Hermann':   { city:'Houston',    state:'TX', hiringManager:'Dr. Kevin Walsh',   clientType:'direct' },
}

const SIMILAR_JOBS_MOCK = [
  { title:'Travel RN — ICU', client:'Houston Methodist', daysOpen:5,  id:'j1' },
  { title:'Travel RN (Step-Down)', client:'Memorial Hermann', daysOpen:12, id:'j2' },
]

// ─── Types ────────────────────────────────────────────────────────────────────

type JobType  = 'contract' | 'direct_hire' | 'cth'
type WorkMode = 'onsite'   | 'hybrid'      | 'remote'
type TaxTerm  = 'w2'       | 'c2c'         | '1099'   | ''
type Priority = 'high'     | 'medium'      | 'low'

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
      'w-full h-9 px-3 text-sm rounded-lg border border-border bg-background',
      'focus:outline-none focus:ring-2 focus:ring-[#dd7456]/20 focus:border-[#dd7456]',
      'placeholder:text-muted-foreground transition-colors',
      className
    )} />
  )
}

function FieldSelect({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cn(
      'w-full h-9 px-3 text-sm rounded-lg border border-border bg-background',
      'focus:outline-none focus:ring-2 focus:ring-[#dd7456]/20 focus:border-[#dd7456]',
      'transition-colors appearance-none cursor-pointer',
      className
    )}>
      {children}
    </select>
  )
}

function TypeBtn({ label, sub, active, onClick }: {
  label: string; sub?: string; active: boolean; onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick}
      className={cn(
        'flex-1 py-3 px-4 rounded-xl text-sm font-medium border-2 transition-all text-center',
        active
          ? 'border-[#dd7456] bg-[#fdf0ec] dark:bg-[#2a1a15] text-[#dd7456]'
          : 'border-border bg-background text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground'
      )}>
      <span className="block font-semibold">{label}</span>
      {sub && <span className="block text-[10px] mt-0.5 opacity-70">{sub}</span>}
    </button>
  )
}

function PillToggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={cn(
        'h-8 px-3 text-sm font-medium rounded-lg border transition-all',
        active
          ? 'border-[#dd7456] bg-[#fdf0ec] dark:bg-[#2a1a15] text-[#dd7456]'
          : 'border-border bg-background text-muted-foreground hover:border-muted-foreground/50'
      )}>
      {label}
    </button>
  )
}

function SectionCard({ n, icon: Icon, title, children, className }: {
  n: number; icon: React.ComponentType<{ className?: string }>; title: string
  children: React.ReactNode; className?: string
}) {
  return (
    <div className={cn('rounded-2xl border border-border/60 bg-background shadow-sm overflow-hidden', className)}>
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

function SkillInput({ label, skills, onChange, suggestions, placeholder }: {
  label: string; skills: string[]; onChange: (s: string[]) => void
  suggestions: string[]; placeholder: string
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
          placeholder={placeholder}
        />
      </div>
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

function SmartCombobox({ value, onChange, options, placeholder, onSelect }: {
  value: string; onChange: (v: string) => void; options: string[]
  placeholder: string; onSelect?: (v: string) => void
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
          placeholder={placeholder}
        />
        <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
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

function SmartPanel({ title, client, mustHave, jobType, payRate, billRate }: {
  title: string; client: string; mustHave: string[]
  jobType: JobType; payRate: string; billRate: string
}) {
  const filled = [title, client, jobType, mustHave.length > 0].filter(Boolean).length
  const pct    = Math.round((filled / 6) * 100)

  const showSimilar    = title.toLowerCase().includes('rn') || title.toLowerCase().includes('nurse') || title.toLowerCase().includes('icu')
  const showCandidates = mustHave.length >= 2
  const margin         = payRate && billRate ? (parseFloat(billRate) - parseFloat(payRate)).toFixed(2) : null

  return (
    <div className="space-y-4 sticky top-6">

      {/* Progress */}
      <div className="rounded-2xl border border-border/60 bg-background shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Progress</p>
          <span className="text-sm font-bold text-[#dd7456]">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
          <div className="h-full bg-[#dd7456] rounded-full transition-all duration-500" style={{ width:`${pct}%` }} />
        </div>
        <p className="text-sm text-muted-foreground">{filled} of 6 sections started</p>
      </div>

      {/* Bill rate margin */}
      {margin && parseFloat(margin) > 0 && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 p-4">
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
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 p-4">
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
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 p-4">
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
      <div className="rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/60 p-4">
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
      <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function NewJobPage() {
  // ── Core fields
  const [title,         setTitle]        = useState('')
  const [client,        setClient]       = useState('')
  const [hiringManager, setHiringManager]= useState('')
  const [city,          setCity]         = useState('')
  const [stateVal,      setStateVal]     = useState('')
  const [department,    setDepartment]   = useState('')

  // ── Job type
  const [jobType,       setJobType]      = useState<JobType>('contract')
  const [workMode,      setWorkMode]     = useState<WorkMode>('onsite')
  const [taxTerm,       setTaxTerm]      = useState<TaxTerm>('w2')
  const [duration,      setDuration]     = useState('')
  const [startDate,     setStartDate]    = useState('')

  // ── Pay
  const [payRate,       setPayRate]      = useState('')
  const [billRate,      setBillRate]     = useState('')
  const [salaryMin,     setSalaryMin]    = useState('')
  const [salaryMax,     setSalaryMax]    = useState('')

  // ── Requirements
  const [experience,    setExperience]   = useState('')
  const [mustHave,      setMustHave]     = useState<string[]>([])
  const [niceToHave,    setNiceToHave]   = useState<string[]>([])
  const [workAuth,      setWorkAuth]     = useState<string[]>([])
  const [education,     setEducation]    = useState('')

  // ── Description
  const [description,   setDescription]  = useState('')
  const [aiGenerating,  setAiGenerating] = useState(false)
  const [pasteMode,     setPasteMode]    = useState(false)
  const [pastedJD,      setPastedJD]     = useState('')

  // ── Team
  const [openings,      setOpenings]     = useState('1')
  const [priority,      setPriority]     = useState<Priority>('medium')
  const [recruiter,     setRecruiter]    = useState('')
  const [clientType,    setClientType]   = useState('direct')
  const [deadline,      setDeadline]     = useState('')

  const [isPending,     startTransition] = useTransition()
  const [errors,        setErrors]       = useState<string[]>([])

  const isContract = jobType === 'contract' || jobType === 'cth'

  // Skill suggestions based on title
  const skillSuggestions = useMemo(() => {
    const t = title.toLowerCase()
    if (t.includes('rn') || t.includes('nurse') || t.includes('icu') || t.includes('cna')) return SKILL_SUGGESTIONS.rn!
    if (t.includes('java') || t.includes('spring'))  return SKILL_SUGGESTIONS.java!
    if (t.includes('cloud') || t.includes('aws'))    return SKILL_SUGGESTIONS.cloud!
    if (t.includes('devops') || t.includes('devsec'))return SKILL_SUGGESTIONS.devops!
    if (t.includes('data') || t.includes('etl'))     return SKILL_SUGGESTIONS.data!
    if (t.includes('sap'))                           return SKILL_SUGGESTIONS.sap!
    return SKILL_SUGGESTIONS.default!
  }, [title])

  // Auto-fill from client selection
  const handleClientSelect = (c: string) => {
    const fill = CLIENT_AUTOFILL[c]
    if (fill) {
      setCity(fill.city)
      setStateVal(fill.state)
      setHiringManager(fill.hiringManager)
      setClientType(fill.clientType)
    }
  }

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

    // Build FormData for createJobAction
    const fd = new FormData()
    fd.set('title',           title)
    fd.set('client',          client)
    fd.set('city',            city)
    fd.set('state',           stateVal)
    fd.set('department',      department)
    fd.set('employment_type', isContract && taxTerm ? `${jobType}_${taxTerm}` : jobType)
    fd.set('work_mode',       workMode)
    fd.set('client_type',     clientType)
    fd.set('openings',        openings)
    fd.set('recruiter_name',  recruiter)
    fd.set('status',          'open')
    fd.set('priority',        priority)
    fd.set('description',     description)

    // Encode all requirement fields into requirements text
    const reqLines: string[] = []
    if (hiringManager)  reqLines.push(`Hiring Manager: ${hiringManager}`)
    if (duration)       reqLines.push(`Duration: ${duration}`)
    if (startDate)      reqLines.push(`Start Date: ${startDate}`)
    if (deadline)       reqLines.push(`Submission Deadline: ${deadline}`)
    if (experience)     reqLines.push(`Experience Required: ${experience}+ years`)
    if (mustHave.length)    reqLines.push(`Must-Have Skills: ${mustHave.join(', ')}`)
    if (niceToHave.length)  reqLines.push(`Nice to Have: ${niceToHave.join(', ')}`)
    if (workAuth.length)    reqLines.push(`Work Authorization: ${workAuth.join(', ')}`)
    if (education)          reqLines.push(`Education: ${education}`)
    fd.set('requirements', reqLines.join('\n'))

    // Pay: for contract use pay rate, for direct hire use salary
    if (isContract) {
      fd.set('salary_min', payRate  || '')
      fd.set('salary_max', billRate || '')
    } else {
      fd.set('salary_min', salaryMin || '')
      fd.set('salary_max', salaryMax || '')
    }

    startTransition(async () => { await createJobAction(fd) })
  }

  const toggleAuth = (v: string) =>
    setWorkAuth(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])

  return (
    <div className="h-full overflow-y-auto bg-muted/10">
      <div className="max-w-[1400px] mx-auto px-6 py-6 pb-24">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/jobs"
              className="size-8 rounded-lg border border-border bg-background hover:bg-muted/60 flex items-center justify-center transition-colors">
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Post a Job</h1>
              <p className="text-sm text-muted-foreground">Fill in the details below to post a new job</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button"
              className="h-8 px-4 text-sm rounded-lg border border-border bg-background hover:bg-muted/60 transition-colors font-medium text-muted-foreground">
              Use Template
            </button>
            <button type="button"
              className="h-8 px-4 text-sm rounded-lg border border-border bg-background hover:bg-muted/60 transition-colors font-medium text-muted-foreground flex items-center gap-1.5">
              <Copy className="size-3.5" />Copy Existing Job
            </button>
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
                      placeholder="e.g. Travel RN (ICU), Senior Java Developer…"
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
                    <FieldLabel required>Client</FieldLabel>
                    <SmartCombobox
                      value={client}
                      onChange={setClient}
                      options={RECENT_CLIENTS}
                      placeholder="Search or type client name…"
                      onSelect={handleClientSelect}
                    />
                    {!client && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-[10px] text-muted-foreground self-center">Recent:</span>
                        {RECENT_CLIENTS.slice(0, 4).map(c => (
                          <button key={c} type="button" onClick={() => { setClient(c); handleClientSelect(c) }}
                            className="h-6 px-2 text-[10px] rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <FieldLabel>Hiring Manager</FieldLabel>
                    <FieldInput
                      value={hiringManager}
                      onChange={e => setHiringManager(e.target.value)}
                      placeholder={client ? 'Auto-filled from client' : 'e.g. Dr. Sarah Kim'}
                    />
                    {client && !hiringManager && CLIENT_AUTOFILL[client] && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Auto-filled: {CLIENT_AUTOFILL[client]!.hiringManager}
                      </p>
                    )}
                  </div>

                  <div>
                    <FieldLabel>Account Type</FieldLabel>
                    <div className="flex gap-2">
                      <TypeBtn label="Direct Client" active={clientType === 'direct'} onClick={() => setClientType('direct')} />
                      <TypeBtn label="VMS"           active={clientType === 'vms'}    onClick={() => setClientType('vms')}    />
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Department</FieldLabel>
                    <FieldInput
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      placeholder="e.g. ICU, Engineering, Finance"
                    />
                  </div>
                </div>
              </SectionCard>

              {/* Section 2: Location */}
              <SectionCard n={2} icon={MapPin} title="Location">
                <div>
                  <FieldLabel>Work Location</FieldLabel>
                  <div className="flex gap-2">
                    <TypeBtn label="On-site"  active={workMode === 'onsite'}  onClick={() => setWorkMode('onsite')}  />
                    <TypeBtn label="Hybrid"   active={workMode === 'hybrid'}  onClick={() => setWorkMode('hybrid')}  />
                    <TypeBtn label="Remote"   active={workMode === 'remote'}  onClick={() => setWorkMode('remote')}  />
                  </div>
                </div>
                {workMode !== 'remote' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>City</FieldLabel>
                      <FieldInput
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="e.g. Houston"
                      />
                    </div>
                    <div>
                      <FieldLabel>State</FieldLabel>
                      <FieldSelect value={stateVal} onChange={e => setStateVal(e.target.value)}>
                        <option value="">— Select state —</option>
                        {['TX','NY','CA','FL','IL','WA','GA','CO','NC','OH','PA','AZ','NV','MN','WI','MA','VA','MD','NJ','MI'].map(s => (
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
                  <div className="flex gap-2">
                    <TypeBtn label="Contract"       sub="W2 / C2C / 1099"    active={jobType === 'contract'}    onClick={() => setJobType('contract')}    />
                    <TypeBtn label="Direct Hire"    sub="Full-time permanent" active={jobType === 'direct_hire'} onClick={() => setJobType('direct_hire')} />
                    <TypeBtn label="Contract to Hire" sub="CTH"              active={jobType === 'cth'}          onClick={() => setJobType('cth')}         />
                  </div>
                </div>

                {isContract && (
                  <div>
                    <FieldLabel>Tax Terms</FieldLabel>
                    <div className="flex gap-2">
                      <TypeBtn label="W2"  sub="Through agency"   active={taxTerm === 'w2'}   onClick={() => setTaxTerm('w2')}   />
                      <TypeBtn label="C2C" sub="Corp-to-Corp"      active={taxTerm === 'c2c'}  onClick={() => setTaxTerm('c2c')}  />
                      <TypeBtn label="1099" sub="Independent"      active={taxTerm === '1099'} onClick={() => setTaxTerm('1099')} />
                    </div>
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
                            placeholder="50.00"
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
                            placeholder="65.00"
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
                        <FieldInput type="number" min="0" step="1000" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} placeholder="80,000" className="pl-7" />
                      </div>
                    </div>
                    <div>
                      <FieldLabel>Max Salary ($/year)</FieldLabel>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">$</span>
                        <FieldInput type="number" min="0" step="1000" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} placeholder="120,000" className="pl-7" />
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
                      <option value="">Any experience level</option>
                      <option value="0">Entry level (0-1 year)</option>
                      <option value="2">2+ years</option>
                      <option value="3">3+ years</option>
                      <option value="5">5+ years</option>
                      <option value="7">7+ years</option>
                      <option value="10">10+ years</option>
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
                  placeholder="Type a skill and press Enter (e.g. React, RN License, AWS…)"
                />

                <SkillInput
                  label="Nice to Have"
                  skills={niceToHave}
                  onChange={setNiceToHave}
                  suggestions={skillSuggestions.filter(s => !mustHave.includes(s))}
                  placeholder="Optional skills that would be a bonus…"
                />

                <div>
                  <FieldLabel>Work Authorization</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {VISA_OPTIONS.map(v => (
                      <PillToggle key={v} label={v} active={workAuth.includes(v)} onClick={() => toggleAuth(v)} />
                    ))}
                  </div>
                  {workAuth.length === 0 && (
                    <p className="text-[10px] text-muted-foreground mt-1">No restriction selected — all visa types will be considered</p>
                  )}
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
                      placeholder="Paste the full job description here…"
                      className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#dd7456]/20 focus:border-[#dd7456] resize-none placeholder:text-muted-foreground"
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
                      placeholder={aiGenerating ? 'AI is writing your description…' : 'Describe the role, what the candidate will be working on, and who they will work with. Or click "Generate with AI" above.'}
                      className={cn(
                        'w-full text-sm rounded-lg border border-border bg-background px-3 py-2.5',
                        'focus:outline-none focus:ring-2 focus:ring-[#dd7456]/20 focus:border-[#dd7456]',
                        'resize-y placeholder:text-muted-foreground transition-colors',
                        aiGenerating && 'opacity-50'
                      )}
                    />
                    {description && (
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
                      {RECENT_RECRUITERS.map(r => <option key={r} value={r}>{r}</option>)}
                    </FieldSelect>
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
                    <FieldLabel>Priority</FieldLabel>
                    <div className="flex gap-2">
                      {(['high', 'medium', 'low'] as Priority[]).map(p => (
                        <button key={p} type="button" onClick={() => setPriority(p)}
                          className={cn(
                            'flex-1 h-9 text-sm font-semibold rounded-lg border-2 transition-all capitalize',
                            priority === p && p === 'high'   && 'border-red-400 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300',
                            priority === p && p === 'medium' && 'border-amber-400 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
                            priority === p && p === 'low'    && 'border-slate-300 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
                            priority !== p && 'border-border bg-background text-muted-foreground hover:border-muted-foreground/50'
                          )}>
                          {p === 'high' ? '🔴' : p === 'medium' ? '🟡' : '⚪'} {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                      ))}
                    </div>
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
                <Link href="/dashboard/jobs"
                  className="h-9 px-4 text-sm rounded-xl border border-border bg-background hover:bg-muted/60 transition-colors font-medium text-muted-foreground flex items-center">
                  Cancel
                </Link>
                <button type="submit" name="status" value="draft"
                  className="h-9 px-4 text-sm rounded-xl border border-border bg-background hover:bg-muted/60 transition-colors font-medium flex items-center gap-1.5">
                  Save Draft
                </button>
                <button type="submit"
                  disabled={!title || isPending}
                  className={cn(
                    'h-9 px-5 text-sm rounded-xl font-semibold transition-all flex items-center gap-2',
                    'bg-[#dd7456] text-white hover:bg-[#c45e3e]',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                    isPending && 'opacity-70'
                  )}>
                  {isPending ? (
                    <><RefreshCw className="size-4 animate-spin" />Posting…</>
                  ) : (
                    <>Post Job <Star className="size-3.5" /></>
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
