'use client'

import { useState, useTransition, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { createCandidateAction } from '../actions'
import {
  ArrowLeft, Upload, FileText, Link2, Mail, Phone,
  Sparkles, Users, Briefcase, MapPin, DollarSign,
  Shield, GraduationCap, User, Tag, X, Plus, CheckCircle2,
  AlertCircle, Copy, RefreshCw, ChevronRight, Star,
  Clock, Globe, Search, Check, Zap, Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Static data ──────────────────────────────────────────────────────────────

const WORK_AUTH_OPTIONS = ['US Citizen', 'Green Card', 'H1B', 'OPT', 'CPT', 'EAD', 'TN Visa', 'GC EAD', 'H4 EAD', 'Any / Open']
const CLEARANCE_OPTIONS = ['None', 'Public Trust', 'Secret', 'Top Secret', 'TS/SCI', 'TS/SCI + Poly']
const AVAILABILITY_OPTIONS = ['Immediately', 'Within 1 week', '2 weeks', '1 month', 'After specific date', 'Not actively looking']
const WORK_MODE_OPTS = ['Remote', 'Hybrid', 'On-site', 'Open to all']
const SHIFT_OPTIONS = ['Day (7a–3p)', 'Evening (3p–11p)', 'Night (11p–7a)', 'Flexible / Any']
const SOURCE_OPTIONS = [
  'LinkedIn', 'Dice', 'Indeed', 'ZipRecruiter', 'CareerBuilder', 'Monster',
  'Internal Database', 'Employee Referral', 'Job Fair', 'Campus Recruiting',
  'Cold Outreach', 'Walk-in', 'Agency Partner', 'Client Referral', 'Other',
]
const CANDIDATE_STATUS_OPTIONS = [
  { value: 'active',   label: 'Active',          desc: 'Actively looking for a job' },
  { value: 'passive',  label: 'Open to offers',  desc: 'Employed but open to the right opportunity' },
  { value: 'placed',   label: 'Placed',           desc: 'Currently on an assignment' },
  { value: 'inactive', label: 'Not looking',      desc: 'Not interested at this time' },
]
const EMPLOYMENT_PREFS = ['Contract (W2)', 'Contract (C2C)', 'Contract (1099)', 'Direct Hire', 'Contract to Hire', 'Any']
const RECENT_RECRUITERS = ['Arun Kumar', 'Priya Sharma', 'James Wilson', 'Sarah Chen']

const SKILL_SUGGESTIONS: Record<string, string[]> = {
  java:     ['Java', 'Spring Boot', 'Microservices', 'REST APIs', 'SQL', 'AWS', 'JUnit', 'Maven'],
  react:    ['React', 'TypeScript', 'Next.js', 'CSS', 'GraphQL', 'Node.js', 'Redux', 'Jest'],
  devops:   ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Jenkins', 'Python', 'Linux'],
  nurse:    ['RN License', 'BLS', 'ACLS', 'ICU', 'Epic EMR', 'Med-Surg', 'Telemetry', 'NIHSS'],
  sap:      ['SAP S/4HANA', 'ABAP', 'SAP FI/CO', 'SAP MM', 'SAP BW', 'SAP SD', 'SAP Basis'],
  data:     ['Python', 'SQL', 'Spark', 'Databricks', 'Azure', 'dbt', 'ETL', 'Airflow'],
  pm:       ['PMP', 'Agile', 'Scrum', 'JIRA', 'Stakeholder Management', 'Risk Management'],
}

const MATCHING_JOBS_MOCK = [
  { title: 'Senior Java Developer', client: 'JPMorgan Chase', payRate: '$65/hr', id: 'j1' },
  { title: 'Cloud Architect',       client: 'Shell',          payRate: '$85/hr', id: 'j2' },
  { title: 'Java + Spring Boot',    client: 'AT&T',           payRate: '$60/hr', id: 'j3' },
]

// ─── Mock resume extraction result ────────────────────────────────────────────
function mockExtract(fileName: string) {
  const isNurse = /rn|nurse|icu|cna/i.test(fileName)
  const isJava  = /java|spring|backend/i.test(fileName)
  return {
    first_name:      isNurse ? 'Sarah'   : 'Michael',
    last_name:       isNurse ? 'Johnson' : 'Chen',
    email:           isNurse ? 'sarah.johnson@email.com' : 'michael.chen@email.com',
    phone:           '(713) 555-0192',
    current_title:   isNurse ? 'Staff RN — ICU'         : 'Senior Java Developer',
    current_company: isNurse ? 'Houston Methodist'       : 'TechCorp Inc',
    location:        isNurse ? 'Houston, TX'             : 'Austin, TX',
    experience:      isNurse ? '6'                       : '8',
    work_auth:       isNurse ? 'US Citizen'              : 'H1B',
    skills:          isNurse ? ['RN License','BLS','ACLS','ICU','Epic EMR'] : ['Java','Spring Boot','AWS','Microservices','SQL'],
    education:       isNurse ? 'BSN — University of Texas (2018)' : "B.S. Computer Science — UT Austin (2016)",
    certifications:  isNurse ? ['BLS','ACLS','NIHSS'] : ['AWS Solutions Architect'],
    linkedin_url:    '',
    summary:         isNurse
      ? 'Experienced ICU nurse with 6 years of critical care experience. Proficient in Epic EMR, hemodynamic monitoring, and ventilator management.'
      : 'Full-stack Java developer with 8 years building distributed microservices on AWS. Led teams of 5+ engineers at multiple Fortune 500 companies.',
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'intake' | 'form'
type DupeState = 'idle' | 'checking' | 'found' | 'clear'

interface ExtractedData {
  first_name: string; last_name: string; email: string; phone: string
  current_title: string; current_company: string; location: string
  experience: string; work_auth: string; skills: string[]
  education: string; certifications: string[]; linkedin_url: string; summary: string
}

// ─── Small components ─────────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-foreground mb-1.5">
      {children}{required && <span className="text-[#dd7456] ml-0.5">*</span>}
    </label>
  )
}

function FInput({ className, highlighted, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { highlighted?: boolean }) {
  return (
    <input {...props} className={cn(
      'w-full h-9 px-3 text-sm rounded-lg border bg-background',
      'focus:outline-none focus:ring-2 focus:ring-[#dd7456]/20 focus:border-[#dd7456]',
      'placeholder:text-muted-foreground transition-colors',
      highlighted ? 'border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20' : 'border-border',
      className
    )} />
  )
}

function FSelect({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cn(
      'w-full h-9 px-3 text-sm rounded-lg border border-border bg-background appearance-none cursor-pointer',
      'focus:outline-none focus:ring-2 focus:ring-[#dd7456]/20 focus:border-[#dd7456] transition-colors',
      className
    )}>{children}</select>
  )
}

function SectionCard({ n, icon: Icon, title, badge, children }: {
  n: number; icon: React.ComponentType<{ className?: string }>; title: string
  badge?: string | undefined; children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-muted/10">
        <div className="size-6 rounded-full bg-[#dd7456]/10 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-[#dd7456]">{n}</span>
        </div>
        <Icon className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">{title}</h2>
        {badge && <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">{badge}</span>}
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
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
      {active && <Check className="size-3 inline mr-1" />}{label}
    </button>
  )
}

function SkillTags({ skills, onChange, suggestions, placeholder }: {
  skills: string[]; onChange: (s: string[]) => void; suggestions?: string[]; placeholder: string
}) {
  const [input, setInput] = useState('')
  const add = (s: string) => { const t = s.trim(); if (t && !skills.includes(t)) onChange([...skills, t]); setInput('') }
  const remove = (s: string) => onChange(skills.filter(x => x !== s))
  const avail = (suggestions ?? []).filter(s => !skills.includes(s) && s.toLowerCase().includes(input.toLowerCase()))

  return (
    <div>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {skills.map(s => (
            <span key={s} className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-[#fdf0ec] dark:bg-[#2a1a15] text-[#dd7456] text-xs font-medium border border-[#dd7456]/25">
              {s}<button type="button" onClick={() => remove(s)} className="hover:text-[#c45e3e]"><X className="size-3" /></button>
            </span>
          ))}
        </div>
      )}
      <FInput
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input) }
          if (e.key === 'Backspace' && !input && skills.length) onChange(skills.slice(0, -1))
        }}
        placeholder={placeholder}
      />
      {avail.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="text-[10px] text-muted-foreground self-center">Suggest:</span>
          {avail.slice(0, 6).map(s => (
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

// ─── Step 1: Resume intake screen ─────────────────────────────────────────────

function IntakeScreen({ onExtracted, onSkip }: {
  onExtracted: (data: ExtractedData, fileName: string) => void
  onSkip: () => void
}) {
  const [dragging,    setDragging]   = useState(false)
  const [processing,  setProcessing] = useState(false)
  const [quickInput,  setQuickInput] = useState('')
  const [quickMode,   setQuickMode]  = useState<'email' | 'paste' | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const processFile = async (file: File) => {
    setProcessing(true)
    await new Promise(r => setTimeout(r, 1800))
    onExtracted(mockExtract(file.name), file.name)
    setProcessing(false)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  if (processing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="size-20 rounded-2xl bg-[#fdf0ec] dark:bg-[#2a1a15] flex items-center justify-center">
          <Sparkles className="size-10 text-[#dd7456] animate-pulse" />
        </div>
        <div className="text-center">
          <p className="text-lg font-bold">Reading resume…</p>
          <p className="text-sm text-muted-foreground mt-1">AI is extracting name, contact, skills, experience, and work authorization.</p>
        </div>
        <div className="w-48 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-[#dd7456] rounded-full animate-[progress_1.8s_ease-in-out_forwards]"
            style={{ animation: 'width 1.8s ease-out forwards', width: '0%' }} />
        </div>
        <style>{`@keyframes progress { from{width:0%} to{width:100%} }`}</style>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onClick={() => fileRef.current?.click()}
        className={cn(
          'relative rounded-2xl border-2 border-dashed cursor-pointer transition-all p-12 text-center mb-6',
          dragging
            ? 'border-[#dd7456] bg-[#fdf0ec]/60 dark:bg-[#2a1a15]/60 scale-[1.01]'
            : 'border-border bg-muted/10 hover:border-[#dd7456]/50 hover:bg-[#fdf0ec]/20 dark:hover:bg-[#2a1a15]/20'
        )}>
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleFile} />
        <div className="size-16 rounded-xl bg-[#fdf0ec] dark:bg-[#2a1a15] flex items-center justify-center mx-auto mb-4">
          <Upload className="size-8 text-[#dd7456]" />
        </div>
        <p className="text-lg font-bold mb-1">Drop resume here</p>
        <p className="text-sm text-muted-foreground mb-4">PDF, Word, or plain text — AI will extract all fields automatically</p>
        <span className="inline-flex items-center h-9 px-5 rounded-xl bg-[#dd7456] text-white text-sm font-semibold hover:bg-[#c45e3e] transition-colors">
          Browse Resume
        </span>
      </div>

      {/* Alternate intake methods */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button type="button" onClick={() => setQuickMode('paste')}
          className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background hover:bg-muted/40 transition-colors text-left">
          <FileText className="size-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm font-semibold">Paste resume text</p>
            <p className="text-[11px] text-muted-foreground">Copy-paste the full resume</p>
          </div>
        </button>
        <button type="button" onClick={() => setQuickMode('email')}
          className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background hover:bg-muted/40 transition-colors text-left">
          <Mail className="size-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm font-semibold">Search by email / phone</p>
            <p className="text-[11px] text-muted-foreground">Check if candidate already exists</p>
          </div>
        </button>
        <a href="https://www.linkedin.com" target="_blank" rel="noreferrer"
          className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background hover:bg-muted/40 transition-colors text-left">
          <Link2 className="size-5 text-blue-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Paste LinkedIn URL</p>
            <p className="text-[11px] text-muted-foreground">Import from LinkedIn profile</p>
          </div>
        </a>
        <button type="button" onClick={onSkip}
          className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background hover:bg-muted/40 transition-colors text-left">
          <User className="size-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm font-semibold">Enter manually</p>
            <p className="text-[11px] text-muted-foreground">Fill the form yourself</p>
          </div>
        </button>
      </div>

      {/* Quick input panel */}
      {quickMode === 'email' && (
        <div className="rounded-xl border border-border bg-background p-4 space-y-3">
          <p className="text-sm font-semibold">Search existing candidates</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={quickInput}
              onChange={e => setQuickInput(e.target.value)}
              placeholder="Enter email or phone number…"
              className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#dd7456]/20 focus:border-[#dd7456]"
              autoFocus
            />
          </div>
          {quickInput.length > 4 && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Candidate may already exist</p>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">Michael Chen · michael.chen@email.com · Added 14 days ago by Arun Kumar</p>
              <div className="flex gap-2">
                <button type="button" className="h-7 px-3 text-sm font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors">View Profile</button>
                <button type="button" className="h-7 px-3 text-sm font-medium rounded-lg border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors">Merge</button>
                <button type="button" onClick={onSkip} className="h-7 px-3 text-sm font-medium rounded-lg border border-border text-muted-foreground hover:bg-muted/60 transition-colors">Continue Anyway</button>
              </div>
            </div>
          )}
        </div>
      )}

      {quickMode === 'paste' && (
        <div className="rounded-xl border border-border bg-background p-4 space-y-3">
          <p className="text-sm font-semibold">Paste resume text</p>
          <textarea
            value={quickInput}
            onChange={e => setQuickInput(e.target.value)}
            placeholder="Paste the full resume text here…"
            rows={8}
            className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#dd7456]/20 focus:border-[#dd7456] resize-none placeholder:text-muted-foreground"
            autoFocus
          />
          <button
            type="button"
            disabled={!quickInput.trim()}
            onClick={async () => {
              setQuickMode(null)
              setProcessing(true)
              await new Promise(r => setTimeout(r, 1500))
              onExtracted(mockExtract(quickInput), 'pasted-resume.txt')
              setProcessing(false)
            }}
            className="h-8 px-4 text-sm font-semibold rounded-lg bg-[#dd7456] text-white hover:bg-[#c45e3e] disabled:opacity-40 transition-colors">
            Extract with AI →
          </button>
        </div>
      )}

      <p className="text-center text-[11px] text-muted-foreground mt-4">
        Resume data is never shared outside your workspace.
      </p>
    </div>
  )
}

// ─── Smart panel ──────────────────────────────────────────────────────────────

function SmartPanel({ extracted, firstName, lastName, skills, workAuth, experience, status }: {
  extracted: boolean; firstName: string; lastName: string; skills: string[]
  workAuth: string; experience: string; status: string
}) {
  const filled   = [firstName, lastName, skills.length > 0, workAuth, experience].filter(Boolean).length
  const pct      = Math.round((filled / 8) * 100)
  const showJobs = skills.length >= 2 && (skills.some(s => /java|spring/i.test(s)))

  return (
    <div className="space-y-4 sticky top-6">

      {/* Extraction success */}
      {extracted && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Resume parsed successfully</p>
          </div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-300">All fields pre-filled from resume. Review and correct anything highlighted in green.</p>
        </div>
      )}

      {/* Progress */}
      <div className="rounded-2xl border border-border/60 bg-background shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Profile strength</p>
          <span className="text-sm font-bold text-[#dd7456]">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
          <div className="h-full bg-[#dd7456] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="space-y-1.5">
          {[
            { done: !!firstName && !!lastName, label: 'Name' },
            { done: skills.length > 0,          label: 'Skills' },
            { done: !!workAuth,                  label: 'Work Authorization' },
            { done: !!experience,                label: 'Experience' },
            { done: extracted,                   label: 'Resume uploaded' },
          ].map(({ done, label }) => (
            <div key={label} className="flex items-center gap-2 text-[11px]">
              {done
                ? <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                : <div className="size-3.5 rounded-full border-2 border-muted-foreground/30 shrink-0" />}
              <span className={done ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Matching jobs */}
      {showJobs && (
        <div className="rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/60 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="size-4 text-violet-500" />
            <p className="text-sm font-semibold text-violet-800 dark:text-violet-200">3 matching jobs</p>
          </div>
          {MATCHING_JOBS_MOCK.map(j => (
            <div key={j.id} className="flex items-center justify-between py-2 border-b border-violet-200/60 dark:border-violet-800/40 last:border-0 gap-2">
              <div className="min-w-0">
                <p className="text-[11px] font-medium truncate">{j.title}</p>
                <p className="text-[10px] text-muted-foreground">{j.client} · {j.payRate}</p>
              </div>
              <button type="button" className="h-6 px-2 text-[10px] font-semibold rounded-md bg-violet-600 text-white hover:bg-violet-700 transition-colors whitespace-nowrap shrink-0">
                Submit
              </button>
            </div>
          ))}
        </div>
      )}

      {/* AI panel */}
      <div className="rounded-2xl border border-border/60 bg-background shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="size-4 text-[#dd7456]" />
          <p className="text-sm font-semibold">AI Insights</p>
        </div>
        {extracted ? (
          <div className="space-y-2 text-[11px] text-muted-foreground leading-relaxed">
            <p>💼 Market pay: <strong className="text-foreground">$60–$75/hr</strong> for this profile in Houston</p>
            <p>⚡ 3 open jobs match their skill set right now</p>
            <p>📋 Work auth appears to be USC — no sponsorship needed</p>
            <p>🏆 Top 15% of Java profiles in your database</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Upload a resume to see AI insights about this candidate.</p>
        )}
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Quick tips</p>
        <ul className="space-y-1.5 text-[11px] text-muted-foreground leading-relaxed">
          <li>Work Authorization is the most important field for US Staffing</li>
          <li>Add 3+ skills to unlock job matching</li>
          <li>Mark candidate status so your team knows where to focus</li>
          <li>Upload resume first — AI fills 90% of the form for you</li>
        </ul>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function NewCandidatePage() {
  const [step,       setStep]       = useState<Step>('intake')
  const [extracted,  setExtracted]  = useState(false)
  const [resumeName, setResumeName] = useState('')

  // Basic
  const [firstName,       setFirstName]       = useState('')
  const [lastName,        setLastName]        = useState('')
  const [email,           setEmail]           = useState('')
  const [phone,           setPhone]           = useState('')
  // Professional
  const [title,           setTitle]           = useState('')
  const [company,         setCompany]         = useState('')
  const [experience,      setExperience]      = useState('')
  const [skills,          setSkills]          = useState<string[]>([])
  const [certifications,  setCertifications]  = useState<string[]>([])
  const [education,       setEducation]       = useState('')
  const [summary,         setSummary]         = useState('')
  // Location & Prefs
  const [currentLocation, setCurrentLocation] = useState('')
  const [preferredLocation,setPrefLocation]   = useState('')
  const [workMode,        setWorkMode]        = useState<string[]>([])
  const [shift,           setShift]           = useState('')
  const [availability,    setAvailability]    = useState('')
  const [employmentPref,  setEmpPref]         = useState<string[]>([])
  // Compensation
  const [currentPay,      setCurrentPay]      = useState('')
  const [expectedPay,     setExpectedPay]     = useState('')
  const [payType,         setPayType]         = useState<'hourly' | 'salary'>('hourly')
  // Work auth
  const [workAuth,        setWorkAuth]        = useState('')
  const [clearance,       setClearance]       = useState('')
  const [sponsorship,     setSponsorship]     = useState(false)
  // LinkedIn
  const [linkedin,        setLinkedin]        = useState('')
  const [portfolio,       setPortfolio]       = useState('')
  // Recruiter info
  const [source,          setSource]          = useState('')
  const [owner,           setOwner]           = useState('')
  const [status,          setStatus]          = useState('active')
  const [tags,            setTags]            = useState<string[]>([])
  const [notes,           setNotes]           = useState('')
  // Duplicate check
  const [dupeState,       setDupeState]       = useState<DupeState>('idle')

  const [isPending, startTransition] = useTransition()
  const [errors,    setErrors]       = useState<string[]>([])

  // Skill suggestions from title
  const skillSugg = useMemo(() => {
    const t = title.toLowerCase()
    if (/java|spring/i.test(t))        return SKILL_SUGGESTIONS.java!
    if (/react|frontend|ui/i.test(t))  return SKILL_SUGGESTIONS.react!
    if (/devops|cloud|aws/i.test(t))   return SKILL_SUGGESTIONS.devops!
    if (/rn|nurse|icu|cna/i.test(t))   return SKILL_SUGGESTIONS.nurse!
    if (/sap/i.test(t))                return SKILL_SUGGESTIONS.sap!
    if (/data|etl|analytics/i.test(t)) return SKILL_SUGGESTIONS.data!
    if (/pm|project/i.test(t))         return SKILL_SUGGESTIONS.pm!
    return []
  }, [title])

  // Fill form from extraction
  const handleExtracted = (data: ExtractedData, fileName: string) => {
    setFirstName(data.first_name); setLastName(data.last_name)
    setEmail(data.email);         setPhone(data.phone)
    setTitle(data.current_title); setCompany(data.current_company)
    setCurrentLocation(data.location); setExperience(data.experience)
    setWorkAuth(data.work_auth);  setSkills(data.skills)
    setEducation(data.education); setCertifications(data.certifications)
    setLinkedin(data.linkedin_url); setSummary(data.summary)
    setResumeName(fileName);      setExtracted(true)
    setStep('form')
  }

  // Simulate duplicate check on email blur
  const handleEmailBlur = async () => {
    if (!email || email.length < 5) return
    setDupeState('checking')
    await new Promise(r => setTimeout(r, 600))
    setDupeState('clear') // 'found' to simulate duplicate
  }

  const toggleMulti = (arr: string[], setArr: (v: string[]) => void, val: string) =>
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  // Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: string[] = []
    if (!firstName.trim() || !lastName.trim()) errs.push('Full name is required.')
    if (!email.trim()) errs.push('Email is required.')
    if (errs.length) { setErrors(errs); return }
    setErrors([])

    // Pack extra fields into notes text
    const extraLines: string[] = []
    if (summary)              extraLines.push(`Summary: ${summary}`)
    if (experience)           extraLines.push(`Experience: ${experience}+ years`)
    if (skills.length)        extraLines.push(`Skills: ${skills.join(', ')}`)
    if (certifications.length)extraLines.push(`Certifications: ${certifications.join(', ')}`)
    if (education)            extraLines.push(`Education: ${education}`)
    if (workAuth)             extraLines.push(`Work Authorization: ${workAuth}`)
    if (clearance && clearance !== 'None') extraLines.push(`Security Clearance: ${clearance}`)
    if (sponsorship)          extraLines.push('Requires sponsorship: Yes')
    if (preferredLocation)    extraLines.push(`Preferred Location: ${preferredLocation}`)
    if (workMode.length)      extraLines.push(`Work Mode Preference: ${workMode.join(', ')}`)
    if (shift)                extraLines.push(`Preferred Shift: ${shift}`)
    if (availability)         extraLines.push(`Availability: ${availability}`)
    if (employmentPref.length)extraLines.push(`Employment Preference: ${employmentPref.join(', ')}`)
    if (portfolio)            extraLines.push(`Portfolio: ${portfolio}`)
    if (owner)                extraLines.push(`Assigned Recruiter: ${owner}`)
    if (tags.length)          extraLines.push(`Tags: ${tags.join(', ')}`)
    if (notes)                extraLines.push(`\nNotes:\n${notes}`)

    const fd = new FormData()
    fd.set('first_name',      firstName)
    fd.set('last_name',       lastName)
    fd.set('email',           email)
    fd.set('phone',           phone)
    fd.set('current_title',   title)
    fd.set('current_company', company)
    fd.set('location',        currentLocation)
    fd.set('linkedin_url',    linkedin)
    fd.set('candidate_type',  employmentPref[0]?.toLowerCase().startsWith('contract') ? 'contract' : employmentPref[0]?.includes('Direct') ? 'permanent' : 'unknown')
    fd.set('notice_period',   availability)
    fd.set('source',          source)
    fd.set('notes',           extraLines.join('\n'))
    fd.set('current_ctc',     currentPay ? String(parseFloat(currentPay) * (payType === 'hourly' ? 2080 : 1)) : '')
    fd.set('expected_ctc',    expectedPay ? String(parseFloat(expectedPay) * (payType === 'hourly' ? 2080 : 1)) : '')

    startTransition(async () => { await createCandidateAction(fd) })
  }

  if (step === 'intake') {
    return (
      <div className="h-full overflow-y-auto bg-muted/10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 px-6 pt-6 pb-2">
            <Link href="/dashboard/candidates"
              className="size-8 rounded-lg border border-border bg-background hover:bg-muted/60 flex items-center justify-center transition-colors">
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Add Candidate</h1>
              <p className="text-sm text-muted-foreground">Start with a resume — AI fills the form for you</p>
            </div>
          </div>
          <IntakeScreen onExtracted={handleExtracted} onSkip={() => setStep('form')} />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-muted/10">
      <div className="max-w-[1400px] mx-auto px-6 py-6 pb-24">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setStep('intake')}
              className="size-8 rounded-lg border border-border bg-background hover:bg-muted/60 flex items-center justify-center transition-colors">
              <ArrowLeft className="size-4" />
            </button>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Add Candidate</h1>
              {extracted
                ? <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 flex items-center gap-1"><CheckCircle2 className="size-3" />Resume parsed — {resumeName}</p>
                : <p className="text-sm text-muted-foreground mt-0.5">Fill in candidate details</p>}
            </div>
          </div>
          {!extracted && (
            <button type="button" onClick={() => setStep('intake')}
              className="h-8 px-4 text-sm font-semibold rounded-lg border border-[#dd7456] text-[#dd7456] hover:bg-[#fdf0ec] dark:hover:bg-[#2a1a15] transition-colors flex items-center gap-1.5">
              <Upload className="size-3.5" />Upload Resume Instead
            </button>
          )}
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mb-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/60 px-4 py-3 space-y-1">
            {errors.map(e => (
              <div key={e} className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                <AlertCircle className="size-4 shrink-0" />{e}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-12 gap-5">

            {/* ── Left: form ────────────────────────────────────── */}
            <div className="col-span-12 lg:col-span-8 space-y-5">

              {/* Section 1: Basic */}
              <SectionCard n={1} icon={User} title="Basic Information" badge={extracted ? 'AI filled' : undefined}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>First Name</FieldLabel>
                    <FInput value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="e.g. Sarah" required highlighted={extracted && !!firstName} />
                  </div>
                  <div>
                    <FieldLabel required>Last Name</FieldLabel>
                    <FInput value={lastName} onChange={e => setLastName(e.target.value)} placeholder="e.g. Johnson" required highlighted={extracted && !!lastName} />
                  </div>
                </div>

                {/* Email with dupe check */}
                <div>
                  <FieldLabel required>Email</FieldLabel>
                  <div className="relative">
                    <FInput
                      type="email" value={email}
                      onChange={e => { setEmail(e.target.value); setDupeState('idle') }}
                      onBlur={handleEmailBlur}
                      placeholder="sarah.johnson@email.com"
                      required highlighted={extracted && !!email}
                      className={dupeState === 'found' ? 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/20' : ''}
                    />
                    {dupeState === 'checking' && <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin" />}
                    {dupeState === 'clear'    && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-emerald-500" />}
                    {dupeState === 'found'    && <AlertCircle  className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-amber-500" />}
                  </div>
                  {dupeState === 'found' && (
                    <div className="mt-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-2.5 flex items-center justify-between gap-2">
                      <p className="text-sm text-amber-700 dark:text-amber-300">This email matches an existing candidate.</p>
                      <div className="flex gap-1.5 shrink-0">
                        <button type="button" className="h-6 px-2 text-[10px] font-semibold rounded-md bg-amber-600 text-white hover:bg-amber-700 transition-colors">View</button>
                        <button type="button" className="h-6 px-2 text-[10px] font-medium rounded-md border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 transition-colors">Merge</button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Phone</FieldLabel>
                    <FInput value={phone} onChange={e => setPhone(e.target.value)} placeholder="(713) 555-0192" type="tel" highlighted={extracted && !!phone} />
                  </div>
                  <div>
                    <FieldLabel>LinkedIn</FieldLabel>
                    <FInput value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="linkedin.com/in/sarah-johnson" type="url" highlighted={extracted && !!linkedin} />
                  </div>
                </div>
              </SectionCard>

              {/* Section 2: Professional */}
              <SectionCard n={2} icon={Briefcase} title="Professional Details" badge={extracted ? 'AI filled' : undefined}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Current Job Title</FieldLabel>
                    <FInput value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Staff RN — ICU" highlighted={extracted && !!title} />
                  </div>
                  <div>
                    <FieldLabel>Current Company</FieldLabel>
                    <FInput value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Houston Methodist" highlighted={extracted && !!company} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Total Experience</FieldLabel>
                    <FSelect value={experience} onChange={e => setExperience(e.target.value)}>
                      <option value="">Not specified</option>
                      <option value="0">Less than 1 year</option>
                      {['1','2','3','4','5','6','7','8','10','12','15','20'].map(y => (
                        <option key={y} value={y}>{y}+ years</option>
                      ))}
                    </FSelect>
                  </div>
                  <div>
                    <FieldLabel>Education</FieldLabel>
                    <FInput value={education} onChange={e => setEducation(e.target.value)} placeholder="e.g. BSN — UT (2018)" highlighted={extracted && !!education} />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <FieldLabel>Skills</FieldLabel>
                  <SkillTags
                    skills={skills} onChange={setSkills}
                    suggestions={skillSugg}
                    placeholder="Type a skill and press Enter (e.g. Java, RN License, AWS…)"
                  />
                </div>

                {/* Certifications */}
                <div>
                  <FieldLabel>Certifications</FieldLabel>
                  <SkillTags
                    skills={certifications} onChange={setCertifications}
                    placeholder="e.g. PMP, AWS SA, BLS, CPA…"
                  />
                </div>

                {/* AI Summary */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <FieldLabel>Candidate Summary</FieldLabel>
                    <button type="button"
                      className="h-6 px-2.5 text-[10px] font-semibold rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900 transition-colors flex items-center gap-1">
                      <Sparkles className="size-3" />Generate
                    </button>
                  </div>
                  <textarea
                    rows={3} value={summary} onChange={e => setSummary(e.target.value)}
                    placeholder="Brief summary of the candidate's background, key strengths, and career goals…"
                    className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#dd7456]/20 focus:border-[#dd7456] resize-none placeholder:text-muted-foreground transition-colors"
                  />
                </div>
              </SectionCard>

              {/* Section 3: Location & Work Preferences */}
              <SectionCard n={3} icon={MapPin} title="Location & Work Preferences">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Current Location</FieldLabel>
                    <FInput value={currentLocation} onChange={e => setCurrentLocation(e.target.value)} placeholder="e.g. Houston, TX" highlighted={extracted && !!currentLocation} />
                  </div>
                  <div>
                    <FieldLabel>Open to Relocate / Preferred Location</FieldLabel>
                    <FInput value={preferredLocation} onChange={e => setPrefLocation(e.target.value)} placeholder="e.g. Houston, TX or Remote" />
                  </div>
                </div>

                <div>
                  <FieldLabel>Preferred Work Mode</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {WORK_MODE_OPTS.map(m => (
                      <PillToggle key={m} label={m} active={workMode.includes(m)} onClick={() => toggleMulti(workMode, setWorkMode, m)} />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Preferred Shift</FieldLabel>
                    <FSelect value={shift} onChange={e => setShift(e.target.value)}>
                      <option value="">No preference</option>
                      {SHIFT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </FSelect>
                  </div>
                  <div>
                    <FieldLabel>Available to Start</FieldLabel>
                    <FSelect value={availability} onChange={e => setAvailability(e.target.value)}>
                      <option value="">Not specified</option>
                      {AVAILABILITY_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                    </FSelect>
                  </div>
                </div>

                <div>
                  <FieldLabel>Employment Preference</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {EMPLOYMENT_PREFS.map(p => (
                      <PillToggle key={p} label={p} active={employmentPref.includes(p)} onClick={() => toggleMulti(employmentPref, setEmpPref, p)} />
                    ))}
                  </div>
                </div>
              </SectionCard>

              {/* Section 4: Compensation */}
              <SectionCard n={4} icon={DollarSign} title="Compensation">
                <div>
                  <FieldLabel>Pay Type</FieldLabel>
                  <div className="flex gap-2 mb-4">
                    {(['hourly', 'salary'] as const).map(t => (
                      <button key={t} type="button" onClick={() => setPayType(t)}
                        className={cn(
                          'flex-1 h-9 text-sm font-semibold rounded-xl border-2 capitalize transition-all',
                          payType === t ? 'border-[#dd7456] bg-[#fdf0ec] dark:bg-[#2a1a15] text-[#dd7456]'
                                        : 'border-border bg-background text-muted-foreground hover:border-muted-foreground/50'
                        )}>
                        {t === 'hourly' ? '$/hr — Contract' : '$/year — Direct Hire'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Current Pay Rate</FieldLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">$</span>
                      <FInput type="number" min="0" step={payType === 'hourly' ? '0.5' : '1000'} value={currentPay} onChange={e => setCurrentPay(e.target.value)} placeholder={payType === 'hourly' ? '55.00' : '90,000'} className="pl-7" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">{payType === 'hourly' ? '/hr' : '/yr'}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">What they currently earn</p>
                  </div>
                  <div>
                    <FieldLabel>Expected Pay Rate</FieldLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">$</span>
                      <FInput type="number" min="0" step={payType === 'hourly' ? '0.5' : '1000'} value={expectedPay} onChange={e => setExpectedPay(e.target.value)} placeholder={payType === 'hourly' ? '65.00' : '110,000'} className="pl-7" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">{payType === 'hourly' ? '/hr' : '/yr'}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">What they want to earn</p>
                  </div>
                </div>
              </SectionCard>

              {/* Section 5: Work Authorization */}
              <SectionCard n={5} icon={Shield} title="Work Authorization & Compliance">
                <div>
                  <FieldLabel required>Work Authorization</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {WORK_AUTH_OPTIONS.map(a => (
                      <button key={a} type="button" onClick={() => setWorkAuth(a === workAuth ? '' : a)}
                        className={cn(
                          'h-8 px-3 text-sm font-medium rounded-lg border-2 transition-all',
                          workAuth === a
                            ? 'border-[#dd7456] bg-[#fdf0ec] dark:bg-[#2a1a15] text-[#dd7456]'
                            : 'border-border bg-background text-muted-foreground hover:border-muted-foreground/50'
                        )}>
                        {workAuth === a && <Check className="size-3 inline mr-1" />}{a}
                      </button>
                    ))}
                  </div>
                  {workAuth && workAuth !== 'US Citizen' && workAuth !== 'Green Card' && workAuth !== 'GC EAD' && workAuth !== 'Any / Open' && (
                    <div className="flex items-center gap-2 mt-3">
                      <input type="checkbox" id="sponsorship" checked={sponsorship} onChange={e => setSponsorship(e.target.checked)}
                        className="size-4 rounded accent-[#dd7456]" />
                      <label htmlFor="sponsorship" className="text-sm text-muted-foreground cursor-pointer">
                        Requires H1B sponsorship or visa transfer
                      </label>
                    </div>
                  )}
                </div>

                <div>
                  <FieldLabel>Security Clearance</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {CLEARANCE_OPTIONS.map(c => (
                      <PillToggle key={c} label={c} active={clearance === c} onClick={() => setClearance(c === clearance ? '' : c)} />
                    ))}
                  </div>
                </div>
              </SectionCard>

              {/* Section 6: Additional */}
              <SectionCard n={6} icon={Globe} title="Links & Additional">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Portfolio / GitHub / Website</FieldLabel>
                    <FInput value={portfolio} onChange={e => setPortfolio(e.target.value)} placeholder="github.com/username" type="url" />
                  </div>
                  <div>
                    {/* spacer */}
                  </div>
                </div>
              </SectionCard>

              {/* Section 7: Recruiter Info */}
              <SectionCard n={7} icon={User} title="Recruiter & Tracking">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Source</FieldLabel>
                    <FSelect value={source} onChange={e => setSource(e.target.value)}>
                      <option value="">Not specified</option>
                      {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </FSelect>
                  </div>
                  <div>
                    <FieldLabel>Assigned Recruiter</FieldLabel>
                    <FSelect value={owner} onChange={e => setOwner(e.target.value)}>
                      <option value="">— Assign recruiter —</option>
                      {RECENT_RECRUITERS.map(r => <option key={r} value={r}>{r}</option>)}
                    </FSelect>
                  </div>
                </div>

                <div>
                  <FieldLabel>Candidate Status</FieldLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {CANDIDATE_STATUS_OPTIONS.map(s => (
                      <button key={s.value} type="button" onClick={() => setStatus(s.value)}
                        className={cn(
                          'flex items-start gap-2 p-3 rounded-xl border-2 text-left transition-all',
                          status === s.value
                            ? 'border-[#dd7456] bg-[#fdf0ec] dark:bg-[#2a1a15]'
                            : 'border-border bg-background hover:border-muted-foreground/40'
                        )}>
                        <div className={cn('mt-0.5 size-3.5 rounded-full shrink-0 border-2', status === s.value ? 'bg-[#dd7456] border-[#dd7456]' : 'border-muted-foreground/40')} />
                        <div>
                          <p className={cn('text-sm font-semibold', status === s.value ? 'text-[#dd7456]' : 'text-foreground')}>{s.label}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <FieldLabel>Tags</FieldLabel>
                  <SkillTags
                    skills={tags} onChange={setTags}
                    placeholder="e.g. travel-ready, bilingual, top-talent…"
                  />
                  {tags.length === 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[10px] text-muted-foreground self-center">Common:</span>
                      {['Top Talent', 'Travel-Ready', 'Do Not Contact', 'Relocation OK', 'VIP Candidate'].map(t => (
                        <button key={t} type="button" onClick={() => setTags(prev => prev.includes(t) ? prev : [...prev, t])}
                          className="h-6 px-2 text-[10px] rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          + {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <FieldLabel>Internal Notes</FieldLabel>
                  <textarea
                    rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Call notes, interview feedback, referral context, anything your team should know…"
                    className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#dd7456]/20 focus:border-[#dd7456] resize-none placeholder:text-muted-foreground transition-colors"
                  />
                </div>
              </SectionCard>

            </div>

            {/* ── Right: smart panel ────────────────────────── */}
            <div className="col-span-12 lg:col-span-4">
              <SmartPanel
                extracted={extracted}
                firstName={firstName} lastName={lastName}
                skills={skills} workAuth={workAuth}
                experience={experience} status={status}
              />
            </div>
          </div>

          {/* ── Sticky footer ──────────────────────────────── */}
          <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur-sm px-6 py-3">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                {firstName || lastName ? (
                  <span>
                    <span className="font-medium text-foreground">{`${firstName} ${lastName}`.trim()}</span>
                    {workAuth && <span> · {workAuth}</span>}
                    {skills.length > 0 && <span> · {skills.slice(0, 3).join(', ')}</span>}
                  </span>
                ) : (
                  <span>Enter name and email to continue</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Link href="/dashboard/candidates"
                  className="h-9 px-4 text-sm rounded-xl border border-border bg-background hover:bg-muted/60 transition-colors font-medium text-muted-foreground flex items-center">
                  Cancel
                </Link>
                <button type="submit" name="status_override" value="draft"
                  className="h-9 px-4 text-sm rounded-xl border border-border bg-background hover:bg-muted/60 transition-colors font-medium text-muted-foreground flex items-center gap-1.5">
                  Save Draft
                </button>
                <button type="submit"
                  disabled={!firstName || !email || isPending}
                  className={cn(
                    'h-9 px-5 text-sm rounded-xl font-semibold transition-all flex items-center gap-2',
                    'bg-[#dd7456] text-white hover:bg-[#c45e3e]',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                  )}>
                  {isPending ? <><RefreshCw className="size-4 animate-spin" />Saving…</> : <>Save Candidate <Star className="size-3.5" /></>}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
