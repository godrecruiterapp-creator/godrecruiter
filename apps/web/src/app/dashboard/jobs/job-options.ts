// Shared field options and requirements-blob helpers for the job create/edit forms.
// Single source of truth so "post job" and "edit job" never drift apart again.

export type JobType   = 'contract' | 'direct_hire' | 'cth'
export type WorkMode  = 'onsite'   | 'hybrid'      | 'remote'
export type TaxTerm   = 'w2'       | 'c2c'         | '1099'   | ''
export type Priority  = 'high'     | 'medium'      | 'low'
export type JobStatus = 'open'     | 'on_hold'     | 'closed' | 'filled'

// employment_type only ever stores a plain job type (DB check constraint rejects
// anything else) — tax term travels in `requirements` text instead, alongside
// duration/experience/etc.
export const EMPLOYMENT_TYPE_OPTIONS: { value: JobType; label: string }[] = [
  { value: 'contract',    label: 'Contract (W2 / C2C / 1099)' },
  { value: 'direct_hire', label: 'Direct Hire (Full-time permanent)' },
  { value: 'cth',         label: 'Contract to Hire' },
]

export const WORK_MODE_OPTIONS: { value: WorkMode; label: string }[] = [
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
]

export const CLIENT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'direct', label: 'Direct Client' },
  { value: 'vms',    label: 'VMS' },
]

export const TAX_TERM_OPTIONS: { value: TaxTerm; label: string }[] = [
  { value: 'w2',   label: 'W2 (Through agency)' },
  { value: 'c2c',  label: 'C2C (Corp-to-Corp)' },
  { value: '1099', label: '1099 (Independent)' },
]

export const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'high',   label: '🔴 High' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'low',    label: '⚪ Low' },
]

export const STATUS_OPTIONS: { value: JobStatus; label: string }[] = [
  { value: 'open',    label: 'Open' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'closed',  label: 'Closed' },
  { value: 'filled',  label: 'Filled' },
]

export const US_STATES = [
  'TX','NY','CA','FL','IL','WA','GA','CO','NC','OH','PA','AZ','NV','MN','WI','MA','VA','MD','NJ','MI',
]

export const DURATIONS = ['1 month', '3 months', '6 months', '12 months', '18 months', '24 months', 'Ongoing']

export const EDUCATION_OPTS = [
  'High School / GED', 'Associate Degree', "Bachelor's Degree", "Master's Degree", 'PhD', 'RN / BSN', 'No preference',
]

export const EXPERIENCE_OPTIONS: { value: string; label: string }[] = [
  { value: '',   label: 'Any experience level' },
  { value: '0',  label: 'Entry level (0-1 year)' },
  { value: '2',  label: '2+ years' },
  { value: '3',  label: '3+ years' },
  { value: '5',  label: '5+ years' },
  { value: '7',  label: '7+ years' },
  { value: '10', label: '10+ years' },
]

export const VISA_OPTIONS = ['US Citizen', 'Green Card', 'H1B Transfer', 'OPT / CPT', 'TN Visa', 'EAD', 'Any']

export const RECENT_TITLES = ['Travel RN (ICU)', 'Senior Java Developer', 'Cloud Architect', 'DevOps Engineer', 'Staff RN', 'Project Manager', 'Data Engineer', 'SAP Consultant']

export const RECENT_RECRUITERS = ['Arun Kumar', 'Priya Sharma', 'James Wilson', 'Sarah Chen']

export const SKILL_SUGGESTIONS: Record<string, string[]> = {
  rn:      ['RN License', 'BLS', 'ACLS', 'ICU Experience', 'Epic EMR', 'Med-Surg', 'NIHSS', 'Telemetry'],
  java:    ['Java', 'Spring Boot', 'Microservices', 'REST APIs', 'SQL', 'AWS', 'Maven', 'JUnit'],
  cloud:   ['AWS', 'Azure', 'GCP', 'Terraform', 'Kubernetes', 'Docker', 'CI/CD', 'Linux'],
  devops:  ['CI/CD', 'Docker', 'Kubernetes', 'Jenkins', 'AWS', 'Git', 'Ansible', 'Python'],
  data:    ['Python', 'SQL', 'Spark', 'Databricks', 'ETL', 'Azure', 'dbt', 'Airflow'],
  sap:     ['SAP S/4HANA', 'SAP FI/CO', 'SAP MM', 'ABAP', 'SAP BW', 'SAP Basis'],
  default: ['Communication', 'Problem Solving', 'Teamwork', 'MS Office'],
}

export function skillSuggestionsFor(title: string): string[] {
  const t = title.toLowerCase()
  if (t.includes('rn') || t.includes('nurse') || t.includes('icu') || t.includes('cna')) return SKILL_SUGGESTIONS.rn!
  if (t.includes('java') || t.includes('spring'))   return SKILL_SUGGESTIONS.java!
  if (t.includes('cloud') || t.includes('aws'))     return SKILL_SUGGESTIONS.cloud!
  if (t.includes('devops') || t.includes('devsec')) return SKILL_SUGGESTIONS.devops!
  if (t.includes('data') || t.includes('etl'))      return SKILL_SUGGESTIONS.data!
  if (t.includes('sap'))                            return SKILL_SUGGESTIONS.sap!
  return SKILL_SUGGESTIONS.default!
}

export type JobTemplate = {
  name: string; title: string; jobType: JobType; workMode: WorkMode; taxTerm: TaxTerm
  duration?: string; department?: string; education?: string
  mustHave: string[]; niceToHave?: string[]; description: string
}

export const JOB_TEMPLATES: JobTemplate[] = [
  {
    name: 'Travel RN (ICU)', title: 'Travel RN (ICU)', jobType: 'contract', workMode: 'onsite', taxTerm: 'w2',
    duration: '3 months', department: 'ICU', education: 'RN / BSN',
    mustHave: ['RN License', 'BLS', 'ACLS', 'ICU Experience'],
    description: 'Travel RN needed for a busy ICU. 13-week contract, day/night rotation, weekly pay.',
  },
  {
    name: 'Senior Java Developer', title: 'Senior Java Developer', jobType: 'contract', workMode: 'hybrid', taxTerm: 'c2c',
    duration: '6 months', department: 'Engineering', education: "Bachelor's Degree",
    mustHave: ['Java', 'Spring Boot', 'Microservices', 'AWS'],
    description: 'Senior Java engineer to build and maintain backend microservices on AWS.',
  },
  {
    name: 'DevOps Engineer', title: 'DevOps Engineer', jobType: 'direct_hire', workMode: 'remote', taxTerm: '',
    department: 'Engineering', education: "Bachelor's Degree",
    mustHave: ['CI/CD', 'Docker', 'Kubernetes', 'AWS'],
    description: 'DevOps engineer to own CI/CD pipelines and cloud infrastructure end to end.',
  },
  {
    name: 'Data Engineer', title: 'Data Engineer', jobType: 'contract', workMode: 'remote', taxTerm: 'w2',
    duration: '12 months', department: 'Engineering', education: "Bachelor's Degree",
    mustHave: ['Python', 'SQL', 'Spark', 'ETL'],
    description: 'Data engineer to build and maintain ETL pipelines feeding the analytics warehouse.',
  },
]

export function parseEmploymentType(v: string): JobType {
  return v === 'direct_hire' || v === 'cth' ? v : 'contract'
}

export function parseStatus(v: string | null | undefined): JobStatus {
  return (STATUS_OPTIONS.map(o => o.value) as string[]).includes(v ?? '') ? (v as JobStatus) : 'open'
}

export function parsePriority(v: string | null | undefined): Priority {
  return (['high', 'medium', 'low'] as const).includes(v as Priority) ? (v as Priority) : 'medium'
}

export function parseWorkMode(v: string | null | undefined): WorkMode {
  return (['onsite', 'hybrid', 'remote'] as const).includes(v as WorkMode) ? (v as WorkMode) : 'onsite'
}

// Reverses the "Label: value" lines buildRequirementsText joins together, so an
// existing job's requirements blob can round-trip back into structured fields.
export function parseRequirements(text: string) {
  const lines = (text || '').split('\n')
  const get = (label: string) => lines.find(l => l.startsWith(`${label}:`))?.slice(label.length + 1).trim() ?? ''
  const list = (label: string) => { const v = get(label); return v ? v.split(',').map(s => s.trim()).filter(Boolean) : [] }
  const taxTermRaw = get('Tax Term').toLowerCase()
  return {
    hiringManager: get('Hiring Manager'),
    duration: get('Duration'),
    startDate: get('Start Date'),
    deadline: get('Submission Deadline'),
    taxTerm: (['w2', 'c2c', '1099'] as string[]).includes(taxTermRaw) ? (taxTermRaw as TaxTerm) : '',
    experience: get('Experience Required').replace(/\+ years$/, ''),
    mustHave: list('Must-Have Skills'),
    niceToHave: list('Nice to Have'),
    workAuth: list('Work Authorization'),
    education: get('Education'),
  }
}

export function buildRequirementsText(fields: {
  hiringManager: string; isContract: boolean; taxTerm: TaxTerm; duration: string
  startDate: string; deadline: string; experience: string
  mustHave: string[]; niceToHave: string[]; workAuth: string[]; education: string
}): string {
  const lines: string[] = []
  if (fields.hiringManager) lines.push(`Hiring Manager: ${fields.hiringManager}`)
  if (fields.isContract && fields.taxTerm) lines.push(`Tax Term: ${fields.taxTerm.toUpperCase()}`)
  if (fields.duration) lines.push(`Duration: ${fields.duration}`)
  if (fields.startDate) lines.push(`Start Date: ${fields.startDate}`)
  if (fields.deadline) lines.push(`Submission Deadline: ${fields.deadline}`)
  if (fields.experience) lines.push(`Experience Required: ${fields.experience}+ years`)
  if (fields.mustHave.length) lines.push(`Must-Have Skills: ${fields.mustHave.join(', ')}`)
  if (fields.niceToHave.length) lines.push(`Nice to Have: ${fields.niceToHave.join(', ')}`)
  if (fields.workAuth.length) lines.push(`Work Authorization: ${fields.workAuth.join(', ')}`)
  if (fields.education) lines.push(`Education: ${fields.education}`)
  return lines.join('\n')
}
