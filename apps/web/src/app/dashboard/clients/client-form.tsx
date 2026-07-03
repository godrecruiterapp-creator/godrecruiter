'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Building2, MapPin, Users, Settings2, Tag, AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Client, Industry } from './_data'
import { createClientAction, updateClientAction } from './actions'

// ─── Static data ──────────────────────────────────────────────────────────────

const INDUSTRIES: Industry[] = [
  'Healthcare', 'IT', 'Engineering', 'Finance', 'Manufacturing', 'Government', 'Professional Services', 'Other',
]
const COMPANY_SIZES = ['1-100', '100-500', '500-1,000', '1,000-5,000', '5,000-10,000', '10,000+']

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

function FieldTextarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} className={cn(
      'w-full px-3 py-2 text-sm rounded-lg border border-border bg-background resize-none',
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

function TypeBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={cn(
        'flex-1 py-3 px-4 rounded-xl text-sm font-medium border-2 transition-all text-center',
        active
          ? 'border-[#dd7456] bg-[#fdf0ec] dark:bg-[#2a1a15] text-[#dd7456]'
          : 'border-border bg-background text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground'
      )}>
      {label}
    </button>
  )
}

function SectionCard({ n, icon: Icon, title, children }: {
  n: number; icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background shadow-sm overflow-hidden">
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

// ─── Form ─────────────────────────────────────────────────────────────────────

export function ClientForm({ mode, clientId, initial }: {
  mode: 'create' | 'edit'; clientId?: string; initial?: Client
}) {
  const [isPending, startTransition] = useTransition()

  const [name, setName]               = useState(initial?.name ?? '')
  const [displayName, setDisplayName] = useState(initial?.displayName ?? '')
  const [legalName, setLegalName]     = useState(initial?.legalName ?? '')
  const [website, setWebsite]         = useState(initial?.website ?? '')
  const [taxId, setTaxId]             = useState(initial?.taxId ?? '')
  const [companySize, setCompanySize] = useState(initial?.companySize || COMPANY_SIZES[0]!)

  const [industry, setIndustry]       = useState<Industry>(initial?.industry ?? 'IT')
  const [companyType, setCompanyType] = useState<'direct' | 'vms'>(initial?.companyType ?? 'direct')

  const [city, setCity]     = useState(initial?.city ?? '')
  const [state, setState]   = useState(initial?.state ?? '')
  const [country, setCountry] = useState(initial?.country ?? 'USA')
  const [zip, setZip]       = useState(initial?.zip ?? '')
  const [timezone, setTimezone] = useState(initial?.timezone ?? 'America/Chicago')

  const [accountOwner, setAccountOwner]             = useState(initial?.accountOwner ?? '')
  const [recruitmentManager, setRecruitmentManager] = useState(initial?.recruitmentManager ?? '')
  const [primaryRecruiter, setPrimaryRecruiter]     = useState(initial?.primaryRecruiter ?? '')

  const [preferredCommunication, setPreferredCommunication]   = useState(initial?.preferredCommunication ?? 'Email')
  const [preferredSubmissionMethod, setPreferredSubmissionMethod] = useState(initial?.preferredSubmissionMethod ?? 'Email')
  const [preferredResumeFormat, setPreferredResumeFormat]     = useState(initial?.preferredResumeFormat ?? 'PDF')
  const [preferredInterviewProcess, setPreferredInterviewProcess] = useState(initial?.preferredInterviewProcess ?? '')
  const [specialInstructions, setSpecialInstructions]         = useState(initial?.specialInstructions ?? '')

  const [status, setStatus] = useState<'active' | 'prospect' | 'inactive'>(initial?.status ?? 'prospect')
  const [tagsInput, setTagsInput] = useState(initial?.tags.join(', ') ?? '')

  const [errors, setErrors] = useState<string[]>([])

  const isEdit = mode === 'edit'
  const backHref = isEdit ? `/dashboard/clients/${clientId}` : '/dashboard/clients'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errs: string[] = []
    if (!name.trim()) errs.push('Company name is required.')
    if (errs.length) { setErrors(errs); return }
    setErrors([])

    const fd = new FormData()
    fd.set('name', name)
    fd.set('display_name', displayName)
    fd.set('legal_name', legalName)
    fd.set('website', website)
    fd.set('tax_id', taxId)
    fd.set('company_size', companySize)
    fd.set('industry', industry)
    fd.set('company_type', companyType)
    fd.set('city', city)
    fd.set('state', state)
    fd.set('country', country)
    fd.set('zip', zip)
    fd.set('timezone', timezone)
    fd.set('account_owner', accountOwner)
    fd.set('recruitment_manager', recruitmentManager)
    fd.set('primary_recruiter', primaryRecruiter)
    fd.set('preferred_communication', preferredCommunication)
    fd.set('preferred_submission_method', preferredSubmissionMethod)
    fd.set('preferred_resume_format', preferredResumeFormat)
    fd.set('preferred_interview_process', preferredInterviewProcess)
    fd.set('special_instructions', specialInstructions)
    fd.set('status', status)
    fd.set('tags', tagsInput)

    startTransition(async () => {
      const res = isEdit
        ? await updateClientAction(clientId!, fd)
        : await createClientAction(fd)
      if (res?.error) setErrors([res.error])
    })
  }

  return (
    <div className="h-full overflow-y-auto bg-muted/10">
      <div className="max-w-[900px] mx-auto px-6 py-6 pb-24">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href={backHref}
            className="size-8 rounded-lg border border-border bg-background hover:bg-muted/60 flex items-center justify-center transition-colors">
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold tracking-tight">{isEdit ? 'Edit client' : 'Add client'}</h1>
            <p className="text-sm text-muted-foreground">
              {isEdit ? 'Update this client’s details' : 'Fill in the details below to add a new client'}
            </p>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="mb-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/60 px-4 py-3">
            {errors.map(e => (
              <div key={e} className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                <AlertCircle className="size-4 shrink-0" />{e}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <SectionCard n={1} icon={Building2} title="Company info">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <FieldLabel required>Company name</FieldLabel>
                <FieldInput value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Houston Methodist" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FieldLabel>Display name</FieldLabel>
                <FieldInput value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Shown across the app" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FieldLabel>Legal name</FieldLabel>
                <FieldInput value={legalName} onChange={e => setLegalName(e.target.value)} placeholder="For contracts and invoices" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FieldLabel>Website</FieldLabel>
                <FieldInput value={website} onChange={e => setWebsite(e.target.value)} placeholder="e.g. example.com" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FieldLabel>Tax ID</FieldLabel>
                <FieldInput value={taxId} onChange={e => setTaxId(e.target.value)} placeholder="EIN" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FieldLabel>Company size</FieldLabel>
                <FieldSelect value={companySize} onChange={e => setCompanySize(e.target.value)}>
                  {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                </FieldSelect>
              </div>
            </div>
          </SectionCard>

          <SectionCard n={2} icon={Settings2} title="Industry & type">
            <div>
              <FieldLabel>Industry</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map(i => <TypeBtn key={i} label={i} active={industry === i} onClick={() => setIndustry(i)} />)}
              </div>
            </div>
            <div>
              <FieldLabel>Company type</FieldLabel>
              <div className="flex gap-2">
                <TypeBtn label="Direct client" active={companyType === 'direct'} onClick={() => setCompanyType('direct')} />
                <TypeBtn label="VMS"           active={companyType === 'vms'}    onClick={() => setCompanyType('vms')} />
              </div>
            </div>
          </SectionCard>

          <SectionCard n={3} icon={MapPin} title="Address & time zone">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <FieldLabel>City</FieldLabel>
                <FieldInput value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Houston" />
              </div>
              <div>
                <FieldLabel>State</FieldLabel>
                <FieldInput value={state} onChange={e => setState(e.target.value)} placeholder="e.g. TX" />
              </div>
              <div>
                <FieldLabel>Zip code</FieldLabel>
                <FieldInput value={zip} onChange={e => setZip(e.target.value)} placeholder="e.g. 77030" />
              </div>
              <div>
                <FieldLabel>Country</FieldLabel>
                <FieldInput value={country} onChange={e => setCountry(e.target.value)} />
              </div>
              <div>
                <FieldLabel>Time zone</FieldLabel>
                <FieldInput value={timezone} onChange={e => setTimezone(e.target.value)} placeholder="e.g. America/Chicago" />
              </div>
            </div>
          </SectionCard>

          <SectionCard n={4} icon={Users} title="Account team">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <FieldLabel>Account owner</FieldLabel>
                <FieldInput value={accountOwner} onChange={e => setAccountOwner(e.target.value)} placeholder="e.g. Arun Kumar" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FieldLabel>Recruitment manager</FieldLabel>
                <FieldInput value={recruitmentManager} onChange={e => setRecruitmentManager(e.target.value)} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FieldLabel>Primary recruiter</FieldLabel>
                <FieldInput value={primaryRecruiter} onChange={e => setPrimaryRecruiter(e.target.value)} />
              </div>
            </div>
          </SectionCard>

          <SectionCard n={5} icon={Tag} title="Preferences">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <FieldLabel>Preferred communication</FieldLabel>
                <FieldSelect value={preferredCommunication} onChange={e => setPreferredCommunication(e.target.value)}>
                  {['Email', 'Phone', 'VMS Portal'].map(v => <option key={v} value={v}>{v}</option>)}
                </FieldSelect>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FieldLabel>Preferred submission method</FieldLabel>
                <FieldSelect value={preferredSubmissionMethod} onChange={e => setPreferredSubmissionMethod(e.target.value)}>
                  {['Email', 'VMS Portal', 'ATS Integration'].map(v => <option key={v} value={v}>{v}</option>)}
                </FieldSelect>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FieldLabel>Preferred resume format</FieldLabel>
                <FieldSelect value={preferredResumeFormat} onChange={e => setPreferredResumeFormat(e.target.value)}>
                  {['PDF', 'Word'].map(v => <option key={v} value={v}>{v}</option>)}
                </FieldSelect>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FieldLabel>Preferred interview process</FieldLabel>
                <FieldInput value={preferredInterviewProcess} onChange={e => setPreferredInterviewProcess(e.target.value)} placeholder="e.g. 2 rounds — phone then panel" />
              </div>
              <div className="col-span-2">
                <FieldLabel>Special instructions</FieldLabel>
                <FieldTextarea value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)}
                  rows={3} placeholder="Anything a recruiter should know before submitting a candidate" />
              </div>
            </div>
          </SectionCard>

          <SectionCard n={6} icon={Tag} title="Tags & status">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Status</FieldLabel>
                <div className="flex gap-2">
                  <TypeBtn label="Prospect" active={status === 'prospect'} onClick={() => setStatus('prospect')} />
                  <TypeBtn label="Active"   active={status === 'active'}   onClick={() => setStatus('active')} />
                  <TypeBtn label="Inactive" active={status === 'inactive'} onClick={() => setStatus('inactive')} />
                </div>
              </div>
              <div>
                <FieldLabel>Tags</FieldLabel>
                <FieldInput value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="Comma-separated, e.g. Hot, VMS" />
              </div>
            </div>
          </SectionCard>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Link href={backHref} className="h-9 px-4 text-sm rounded-lg border border-border bg-background hover:bg-muted/60 transition-colors font-medium">
              Cancel
            </Link>
            <button type="submit" disabled={isPending} className="h-9 px-5 text-sm rounded-lg bg-[#dd7456] hover:bg-[#c9603d] text-white transition-colors font-medium disabled:opacity-60">
              {isEdit ? (isPending ? 'Saving…' : 'Save') : (isPending ? 'Adding…' : 'Add client')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
