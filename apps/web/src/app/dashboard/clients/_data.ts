// Types + row-mapping helpers for the Clients module (backed by Supabase)

import { relTime } from '@/lib/format'

export type Industry =
  | 'Healthcare' | 'IT' | 'Engineering' | 'Finance'
  | 'Manufacturing' | 'Government' | 'Professional Services' | 'Other'

export type Client = {
  id: string
  name: string
  displayName: string
  legalName: string
  industry: Industry
  companyType: 'direct' | 'vms'
  status: 'active' | 'prospect' | 'inactive'
  website: string
  taxId: string
  companySize: string
  city: string
  state: string
  country: string
  zip: string
  timezone: string
  accountOwner: string
  recruitmentManager: string
  primaryRecruiter: string
  teamLead: string
  assignedRecruiters: string[]
  clientSince: string
  lastActivity: string
  tags: string[]
  preferredCommunication: string
  preferredSubmissionMethod: string
  preferredResumeFormat: string
  preferredInterviewProcess: string
  specialInstructions: string
}

export type ClientContact = {
  id: string
  clientId: string
  name: string
  title: string
  department: string
  email: string
  phone: string
  mobile: string
  linkedin: string
  preferredContactMethod: string
  decisionMaker: boolean
  primary: boolean
  status: 'active' | 'inactive'
  notes: string
}

export type ClientFacility = {
  id: string
  clientId: string
  name: string
  type: 'Hospital' | 'Clinic' | 'Laboratory' | 'Rehabilitation' | 'Urgent Care' | 'Skilled Nursing' | 'Home Health'
  city: string
  state: string
  departments: string[]
  specialties: string[]
  facilityManager: string
  primaryContact: string
  timezone: string
  notes: string
}

const MONTH_YEAR: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' }

export function mapClientRow(r: any): Client {
  return {
    id: r.id,
    name: r.name,
    displayName: r.display_name ?? r.name,
    legalName: r.legal_name ?? '',
    industry: r.industry,
    companyType: r.company_type,
    status: r.status,
    website: r.website ?? '',
    taxId: r.tax_id ?? '',
    companySize: r.company_size ?? '',
    city: r.city ?? '',
    state: r.state ?? '',
    country: r.country ?? 'USA',
    zip: r.zip ?? '',
    timezone: r.timezone ?? '',
    accountOwner: r.account_owner ?? '',
    recruitmentManager: r.recruitment_manager ?? '',
    primaryRecruiter: r.primary_recruiter ?? '',
    teamLead: r.team_lead ?? '',
    assignedRecruiters: r.assigned_recruiters ?? [],
    clientSince: r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', MONTH_YEAR) : '',
    lastActivity: r.updated_at ? relTime(r.updated_at) : '',
    tags: r.tags ?? [],
    preferredCommunication: r.preferred_communication ?? 'Email',
    preferredSubmissionMethod: r.preferred_submission_method ?? 'Email',
    preferredResumeFormat: r.preferred_resume_format ?? 'PDF',
    preferredInterviewProcess: r.preferred_interview_process ?? '',
    specialInstructions: r.special_instructions ?? '',
  }
}

export function mapContactRow(r: any): ClientContact {
  return {
    id: r.id,
    clientId: r.client_id,
    name: r.name,
    title: r.title ?? '',
    department: r.department ?? '',
    email: r.email ?? '',
    phone: r.phone ?? '',
    mobile: r.mobile ?? '',
    linkedin: r.linkedin ?? '',
    preferredContactMethod: r.preferred_contact_method ?? 'Email',
    decisionMaker: r.decision_maker ?? false,
    primary: r.is_primary ?? false,
    status: r.status,
    notes: r.notes ?? '',
  }
}

export function mapFacilityRow(r: any): ClientFacility {
  return {
    id: r.id,
    clientId: r.client_id,
    name: r.name,
    type: r.type,
    city: r.city ?? '',
    state: r.state ?? '',
    departments: r.departments ?? [],
    specialties: r.specialties ?? [],
    facilityManager: r.facility_manager ?? '',
    primaryContact: r.primary_contact ?? '',
    timezone: r.timezone ?? '',
    notes: r.notes ?? '',
  }
}
