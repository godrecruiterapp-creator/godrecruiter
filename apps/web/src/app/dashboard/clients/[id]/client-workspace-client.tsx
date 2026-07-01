'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft, Phone, Mail, Briefcase, UserPlus, CalendarPlus, CheckSquare,
  Building2, MapPin, Globe, Tag, Plus, FileText, Upload, Hospital, X,
} from 'lucide-react'
import type { Client, ClientContact, ClientFacility } from '../_data'
import { MOCK_INTERVIEWS } from '../../interviews/_data'
import { PLACEMENTS } from '../../placements/_data'
import type { WorkspaceJob, WorkspaceCandidate } from './page'

// ── Canonical candidate pipeline labels (matches candidates/jobs modules) ─────
const STAGE_LABEL: Record<string, string> = {
  sourced: 'New', qualified: 'Reviewing', submitted: 'Submitted',
  interview: 'Interview Scheduled', offer: 'Offer Sent', start: 'Placed',
}
const STAGE_BADGE: Record<string, string> = {
  sourced:   'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  qualified: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  submitted: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  interview: 'bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800',
  offer:     'bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  start:     'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
}
const JOB_STATUS_BADGE: Record<string, string> = {
  open:    'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  on_hold: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  closed:  'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  filled:  'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
}
const INTERVIEW_STATUS_BADGE: Record<string, string> = {
  scheduled:   'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  confirmed:   'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  completed:   'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  cancelled:   'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
  rescheduled: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  no_show:     'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
}
const PLACEMENT_STATUS_BADGE: Record<string, string> = {
  active:          'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400',
  starting_today:  'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-400',
  starting_soon:   'bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-400',
  ending_soon:     'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400',
  completed:       'bg-muted text-muted-foreground',
  needs_attention: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400',
}
const CLIENT_STATUS_BADGE: Record<Client['status'], string> = {
  active:   'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  prospect: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  inactive: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
}
const CLIENT_STATUS_LABEL: Record<Client['status'], string> = { active: 'Active', prospect: 'Prospect', inactive: 'Inactive' }

// ── Per-client mock content (Documents/Tasks/Activity/Notes) ─────────────────
// ponytail: only a handful of "hero" clients get seeded demo content; every
// other client renders the tab's real empty state instead of fake data.

type Doc = { id: string; name: string; category: string; size: string; uploadedAt: string }
type Task = { id: string; title: string; type: string; assignee: string; due: string; priority: 'High' | 'Medium' | 'Low'; status: 'Open' | 'Done' }
type ActivityItem = { id: string; actor: string; action: string; time: string }
type NoteItem = { id: string; author: string; text: string; time: string; visibility: 'shared' | 'private'; pinned: boolean }

const DOCS: Record<string, Doc[]> = {
  cl1: [
    { id: 'd1', name: 'MSA — Houston Methodist.pdf', category: 'Contracts', size: '412 KB', uploadedAt: 'Jan 12, 2023' },
    { id: 'd2', name: 'Certificate of Insurance 2026.pdf', category: 'Insurance', size: '188 KB', uploadedAt: 'Mar 2, 2026' },
  ],
  cl21: [
    { id: 'd3', name: 'MSA — TechCorp Inc.pdf', category: 'Contracts', size: '365 KB', uploadedAt: 'Feb 3, 2023' },
    { id: 'd4', name: 'Q2 Invoice.pdf', category: 'Invoices', size: '96 KB', uploadedAt: 'Jun 15, 2026' },
  ],
}

const TASKS: Record<string, Task[]> = {
  cl1: [
    { id: 't1', title: 'Follow up on ICU submission feedback', type: 'Follow-up', assignee: 'Sarah M.', due: 'Jul 5, 2026', priority: 'High', status: 'Open' },
    { id: 't2', title: 'Renew credentialing packet for new hires', type: 'Credentialing', assignee: 'Sarah M.', due: 'Jul 20, 2026', priority: 'Medium', status: 'Open' },
  ],
  cl21: [
    { id: 't3', title: 'Schedule quarterly business review', type: 'Meeting', assignee: 'Arun Kumar', due: 'Jul 10, 2026', priority: 'Medium', status: 'Open' },
  ],
}

const ACTIVITY: Record<string, ActivityItem[]> = {
  cl1: [
    { id: 'a1', actor: 'Sarah M.', action: 'submitted Maria Lopez for ICU RN', time: '2 hours ago' },
    { id: 'a2', actor: 'Sarah M.', action: 'logged a call with Dr. Sarah Kim', time: '1 day ago' },
    { id: 'a3', actor: 'System', action: 'uploaded Certificate of Insurance 2026.pdf', time: '3 days ago' },
  ],
  cl21: [
    { id: 'a4', actor: 'Arun Kumar', action: 'sent an email to Rachel Brown', time: '1 hour ago' },
    { id: 'a5', actor: 'Arun Kumar', action: 'created job Senior Java Developer', time: '2 days ago' },
  ],
}

const NOTES: Record<string, NoteItem[]> = {
  cl1: [
    { id: 'n1', author: 'Sarah M.', text: 'Client prefers candidates with Epic EMR experience — flagged for all future ICU submissions.', time: '2 days ago', visibility: 'shared', pinned: true },
  ],
}

// ── Small pieces ───────────────────────────────────────────────────────────────

function Chip({ label, className }: { label: string; className: string }) {
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${className}`}>{label}</span>
}

function toInitials(name: string) {
  return name.split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2) || '??'
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </div>
  )
}

function EmptyTab({ icon: Icon, title, description, actionLabel, onAction }: {
  icon: React.ComponentType<{ className?: string }>; title: string; description: string
  actionLabel?: string; onAction?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <div className="size-12 rounded-2xl bg-muted flex items-center justify-center">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-base font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-[360px]">{description}</p>
      </div>
      {actionLabel && (
        <button onClick={onAction} className="mt-1 h-9 px-4 text-sm font-medium rounded-lg bg-brand hover:bg-brand/90 text-white">
          {actionLabel}
        </button>
      )}
    </div>
  )
}

const TABS = [
  { id: 'overview',    label: 'Overview' },
  { id: 'info',        label: 'Client info' },
  { id: 'contacts',    label: 'Contacts' },
  { id: 'facilities',  label: 'Facilities' },
  { id: 'jobs',        label: 'Jobs' },
  { id: 'candidates',  label: 'Candidates' },
  { id: 'submissions', label: 'Submissions' },
  { id: 'interviews',  label: 'Interviews' },
  { id: 'placements',  label: 'Placements' },
  { id: 'documents',   label: 'Documents' },
  { id: 'tasks',       label: 'Tasks' },
  { id: 'activity',    label: 'Activity' },
  { id: 'notes',       label: 'Notes' },
] as const
type TabId = typeof TABS[number]['id']

export function ClientWorkspaceClient({ client, contacts, facilities, jobs, candidates }: {
  client: Client; contacts: ClientContact[]; facilities: ClientFacility[]
  jobs: WorkspaceJob[]; candidates: WorkspaceCandidate[]
}) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [contactDrawerOpen, setContactDrawerOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [notes, setNotes] = useState<NoteItem[]>(NOTES[client.id] ?? [])

  const isHealthcare = client.industry === 'Healthcare'
  const tabs = TABS.filter(t => t.id !== 'facilities' || isHealthcare)

  const interviews = useMemo(() => MOCK_INTERVIEWS.filter(i => i.client === client.name), [client.name])
  const placements = useMemo(() => PLACEMENTS.filter(p => p.client === client.name), [client.name])
  const docs = DOCS[client.id] ?? []
  const tasks = TASKS[client.id] ?? []
  const activity = ACTIVITY[client.id] ?? []

  // Distinct candidates (Candidates tab), vs one row per submission event (Submissions tab)
  const distinctCandidates = useMemo(() => {
    const seen = new Map<string, WorkspaceCandidate>()
    for (const c of candidates) if (!seen.has(c.candidateId)) seen.set(c.candidateId, c)
    return Array.from(seen.values())
  }, [candidates])

  const openJobs = jobs.filter(j => j.status === 'open').length
  const revenue = placements.reduce((sum, p) => sum + p.weeklyRevenue, 0)
  const avgMargin = placements.length ? Math.round(placements.reduce((s, p) => s + p.marginPct, 0) / placements.length) : 0

  function addNote() {
    if (!noteText.trim()) return
    setNotes(prev => [{ id: `n${Date.now()}`, author: 'You', text: noteText, time: 'Just now', visibility: 'shared', pinned: false }, ...prev])
    setNoteText('')
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header */}
      <div className="border-b shrink-0 px-6 py-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3 min-w-0">
            <Link href="/dashboard/clients" className="size-8 rounded-lg border border-border bg-background hover:bg-muted/60 flex items-center justify-center transition-colors shrink-0 mt-0.5">
              <ArrowLeft className="size-4" />
            </Link>
            <div className="size-12 rounded-xl bg-brand-muted text-brand flex items-center justify-center text-base font-bold shrink-0">
              {toInitials(client.name)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold tracking-tight truncate">{client.name}</h1>
                <Chip label={CLIENT_STATUS_LABEL[client.status]} className={CLIENT_STATUS_BADGE[client.status]} />
                <Chip label={client.industry} className="bg-muted text-muted-foreground border-border" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Account owner {client.accountOwner} · Recruitment manager {client.recruitmentManager} · Primary recruiter {client.primaryRecruiter}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">Client since {client.clientSince} · Last activity {client.lastActivity}</p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            <button className="h-8 px-3 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted/60 flex items-center gap-1.5"><Phone className="size-3.5" />Call</button>
            <button className="h-8 px-3 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted/60 flex items-center gap-1.5"><Mail className="size-3.5" />Email</button>
            <Link href={`/dashboard/jobs/new?client=${encodeURIComponent(client.name)}`} className="h-8 px-3 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted/60 flex items-center gap-1.5"><Briefcase className="size-3.5" />Post job</Link>
            <button onClick={() => setContactDrawerOpen(true)} className="h-8 px-3 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted/60 flex items-center gap-1.5"><UserPlus className="size-3.5" />Add contact</button>
            <button className="h-8 px-3 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted/60 flex items-center gap-1.5"><CalendarPlus className="size-3.5" />Schedule meeting</button>
            <button className="h-8 px-3 text-sm font-medium rounded-lg bg-brand hover:bg-brand/90 text-white flex items-center gap-1.5"><CheckSquare className="size-3.5" />Create task</button>
          </div>
        </div>

        {/* Metrics — all visible without scrolling */}
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
          <Metric label="Total jobs" value={jobs.length} />
          <Metric label="Open jobs" value={openJobs} />
          <Metric label="Candidates submitted" value={distinctCandidates.length} />
          <Metric label="Interviews" value={interviews.length} />
          <Metric label="Placements" value={placements.length} />
          <Metric label="Revenue" value={`$${revenue.toLocaleString()}/wk`} />
          <Metric label="Avg margin" value={placements.length ? `${avgMargin}%` : '—'} />
          <Metric label="Avg fill time" value={placements.length ? '18 days' : '—'} />
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b shrink-0 px-6 flex overflow-x-auto">
        {tabs.map(({ id, label }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`h-11 px-4 text-sm font-medium -mb-px border-b-2 transition-colors whitespace-nowrap ${
              activeTab === id ? 'border-brand text-brand' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'overview' && (
          <div className="flex h-full divide-x divide-border">
            <div className="w-[65%] px-6 py-6 overflow-auto space-y-6">
              <section>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Open jobs</p>
                {jobs.filter(j => j.status === 'open').length === 0 ? (
                  <p className="text-sm text-muted-foreground">No open jobs right now.</p>
                ) : (
                  <div className="space-y-2">
                    {jobs.filter(j => j.status === 'open').slice(0, 5).map(j => (
                      <Link key={j.id} href={`/dashboard/jobs/${j.id}`} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 hover:bg-muted/30 transition-colors">
                        <span className="text-sm font-medium">{j.title}</span>
                        <Chip label={j.status} className={JOB_STATUS_BADGE[j.status] ?? ''} />
                      </Link>
                    ))}
                  </div>
                )}
              </section>
              <Separator />
              <section>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Recent activity</p>
                {activity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent activity yet.</p>
                ) : (
                  <div className="space-y-3">
                    {activity.slice(0, 5).map(a => (
                      <div key={a.id} className="flex items-start gap-2.5 text-sm">
                        <span className="font-medium">{a.actor}</span>
                        <span className="text-muted-foreground">{a.action}</span>
                        <span className="text-muted-foreground ml-auto shrink-0 text-xs">{a.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
            <div className="w-[35%] px-6 py-6 overflow-auto space-y-6">
              <section>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Preferences</p>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between gap-3"><span className="text-muted-foreground">Communication</span><span className="font-medium">{client.preferredCommunication}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-muted-foreground">Submission method</span><span className="font-medium">{client.preferredSubmissionMethod}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-muted-foreground">Resume format</span><span className="font-medium">{client.preferredResumeFormat}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-muted-foreground">Interview process</span><span className="font-medium text-right">{client.preferredInterviewProcess || '—'}</span></div>
                </div>
              </section>
              {client.specialInstructions && (
                <>
                  <Separator />
                  <section>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Special instructions</p>
                    <p className="text-sm text-foreground leading-relaxed">{client.specialInstructions}</p>
                  </section>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="max-w-2xl px-6 py-6 space-y-5">
            {[
              { label: 'Company name', value: client.name },
              { label: 'Display name', value: client.displayName },
              { label: 'Legal name', value: client.legalName },
              { label: 'Industry', value: client.industry },
              { label: 'Company type', value: client.companyType === 'vms' ? 'VMS' : 'Direct client' },
              { label: 'Website', value: client.website },
              { label: 'Tax ID', value: client.taxId },
              { label: 'Company size', value: `${client.companySize} employees` },
              { label: 'Address', value: `${client.city}, ${client.state} ${client.zip}, ${client.country}` },
              { label: 'Time zone', value: client.timezone },
              { label: 'Tags', value: client.tags.length ? client.tags.join(', ') : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start gap-6 border-b border-border/60 pb-3">
                <span className="text-sm text-muted-foreground w-40 shrink-0">{label}</span>
                <span className="text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="px-6 py-6">
            {contacts.length === 0 ? (
              <EmptyTab icon={UserPlus} title="No contacts yet" description="Add the people you work with at this client so recruiters always know who to reach." actionLabel="Add contact" onAction={() => setContactDrawerOpen(true)} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {contacts.map(c => (
                  <div key={c.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="size-9"><AvatarFallback className="text-sm font-bold bg-brand-muted text-brand">{toInitials(c.name)}</AvatarFallback></Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{c.title}{c.department ? ` · ${c.department}` : ''}</p>
                      </div>
                      {c.primary && <Chip label="Primary" className="bg-brand-muted text-brand border-brand/25 ml-auto" />}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>{c.email}</p>
                      <p>{c.phone}</p>
                    </div>
                    {c.decisionMaker && <Chip label="Decision maker" className="bg-muted text-muted-foreground border-border mt-2" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'facilities' && isHealthcare && (
          <div className="px-6 py-6">
            {facilities.length === 0 ? (
              <EmptyTab icon={Hospital} title="No facilities yet" description="Add the hospitals, clinics, or labs this client operates so jobs can reference the right location." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {facilities.map(f => (
                  <div key={f.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">{f.name}</p>
                      <Chip label={f.type} className="bg-muted text-muted-foreground border-border" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{f.city}, {f.state}</p>
                    {f.departments.length > 0 && <p className="text-sm"><span className="text-muted-foreground">Departments: </span>{f.departments.join(', ')}</p>}
                    {f.specialties.length > 0 && <p className="text-sm"><span className="text-muted-foreground">Specialties: </span>{f.specialties.join(', ')}</p>}
                    <p className="text-sm mt-2"><span className="text-muted-foreground">Manager: </span>{f.facilityManager}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="px-6 py-6">
            {jobs.length === 0 ? (
              <EmptyTab icon={Briefcase} title="No jobs yet" description="Jobs posted for this client will show up here." actionLabel="Post job" />
            ) : (
              <>
                <SimpleTable
                  headers={['Job title', 'Status', 'Openings', 'Recruiter']}
                  rows={jobs.map(j => [
                    <Link key="t" href={`/dashboard/jobs/${j.id}`} className="font-medium hover:text-brand">{j.title}</Link>,
                    <Chip key="s" label={j.status} className={JOB_STATUS_BADGE[j.status] ?? ''} />,
                    String(j.openings ?? 1),
                    j.recruiter_name ?? 'Unassigned',
                  ])}
                />
                <Link href={`/dashboard/jobs?client=${encodeURIComponent(client.name)}`} className="inline-block mt-4 text-sm font-medium text-brand hover:underline">View all in Jobs →</Link>
              </>
            )}
          </div>
        )}

        {activeTab === 'candidates' && (
          <div className="px-6 py-6">
            {distinctCandidates.length === 0 ? (
              <EmptyTab icon={UserPlus} title="No candidates yet" description="Candidates submitted to this client's jobs will show up here." />
            ) : (
              <SimpleTable
                headers={['Candidate', 'Latest job', 'Stage']}
                rows={distinctCandidates.map(c => [
                  c.name,
                  c.jobTitle,
                  <Chip key="s" label={STAGE_LABEL[c.stage] ?? c.stage} className={STAGE_BADGE[c.stage] ?? ''} />,
                ])}
              />
            )}
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="px-6 py-6">
            {candidates.length === 0 ? (
              <EmptyTab icon={FileText} title="No submissions yet" description="Every time a candidate is submitted to a job at this client, it'll show up here." />
            ) : (
              <SimpleTable
                headers={['Candidate', 'Job', 'Stage', 'Submitted']}
                rows={candidates.map(c => [
                  c.name,
                  c.jobTitle,
                  <Chip key="s" label={STAGE_LABEL[c.stage] ?? c.stage} className={STAGE_BADGE[c.stage] ?? ''} />,
                  new Date(c.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                ])}
              />
            )}
          </div>
        )}

        {activeTab === 'interviews' && (
          <div className="px-6 py-6">
            {interviews.length === 0 ? (
              <EmptyTab icon={CalendarPlus} title="No interviews yet" description="Interviews scheduled with this client will show up here." />
            ) : (
              <>
                <SimpleTable
                  headers={['Candidate', 'Job', 'Date', 'Status']}
                  rows={interviews.map(i => [
                    i.candidate,
                    i.job,
                    `${i.date} · ${i.time}`,
                    <Chip key="s" label={i.status.replace('_', ' ')} className={INTERVIEW_STATUS_BADGE[i.status] ?? ''} />,
                  ])}
                />
                <Link href="/dashboard/interviews/all" className="inline-block mt-4 text-sm font-medium text-brand hover:underline">View all in Interviews →</Link>
              </>
            )}
          </div>
        )}

        {activeTab === 'placements' && (
          <div className="px-6 py-6">
            {placements.length === 0 ? (
              <EmptyTab icon={CheckSquare} title="No placements yet" description="Completed placements with this client will show up here." />
            ) : (
              <>
                <SimpleTable
                  headers={['Candidate', 'Job title', 'Status', 'Bill rate', 'Margin']}
                  rows={placements.map(p => [
                    p.candidate,
                    p.jobTitle,
                    <Chip key="s" label={p.status.replace('_', ' ')} className={PLACEMENT_STATUS_BADGE[p.status] ?? ''} />,
                    `$${p.billRate}/hr`,
                    `${p.marginPct}%`,
                  ])}
                />
                <Link href="/dashboard/placements" className="inline-block mt-4 text-sm font-medium text-brand hover:underline">View all in Placements →</Link>
              </>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="px-6 py-6">
            {docs.length === 0 ? (
              <EmptyTab icon={Upload} title="No documents yet" description="Contracts, insurance, invoices, and other files for this client will show up here." actionLabel="Upload document" />
            ) : (
              <div className="space-y-2">
                {docs.map(d => (
                  <div key={d.id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                    <FileText className="size-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium truncate">{d.name}</span>
                    <Chip label={d.category} className="bg-muted text-muted-foreground border-border ml-2" />
                    <span className="text-sm text-muted-foreground ml-auto shrink-0">{d.size} · {d.uploadedAt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="px-6 py-6">
            {tasks.length === 0 ? (
              <EmptyTab icon={CheckSquare} title="No tasks yet" description="Follow-ups, meetings, and reminders for this client will show up here." actionLabel="Create task" />
            ) : (
              <SimpleTable
                headers={['Task', 'Type', 'Assignee', 'Due', 'Priority', 'Status']}
                rows={tasks.map(t => [
                  t.title, t.type, t.assignee, t.due,
                  <Chip key="p" label={t.priority} className={t.priority === 'High' ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' : t.priority === 'Medium' ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'} />,
                  <Chip key="st" label={t.status} className={t.status === 'Done' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'} />,
                ])}
              />
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="px-6 py-6 max-w-2xl">
            {activity.length === 0 ? (
              <EmptyTab icon={Briefcase} title="No activity yet" description="Calls, emails, meetings, and updates for this client will show up here." />
            ) : (
              <div className="space-y-4">
                {activity.map(a => (
                  <div key={a.id} className="flex items-start gap-3 border-b border-border/60 pb-4 last:border-0">
                    <Avatar className="size-7 shrink-0"><AvatarFallback className="text-xs font-bold bg-brand-muted text-brand">{toInitials(a.actor)}</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <p className="text-sm"><span className="font-medium">{a.actor}</span> <span className="text-muted-foreground">{a.action}</span></p>
                      <p className="text-sm text-muted-foreground mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="px-6 py-6 max-w-2xl space-y-5">
            <div className="border border-border rounded-lg p-4 bg-muted/20">
              <Textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Write a note about this client…" className="h-24 resize-none mb-3 text-sm" />
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => setNoteText('')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Clear</button>
                <button onClick={addNote} disabled={!noteText.trim()} className="h-8 px-4 text-sm rounded-lg bg-brand hover:bg-brand/90 text-white disabled:opacity-40">Add note</button>
              </div>
            </div>
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No notes yet. Add one above.</p>
            ) : (
              notes.map(n => (
                <div key={n.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="size-7"><AvatarFallback className="text-xs font-bold bg-brand-muted text-brand">{toInitials(n.author)}</AvatarFallback></Avatar>
                    <span className="text-sm font-medium">{n.author}</span>
                    {n.pinned && <Chip label="Pinned" className="bg-brand-muted text-brand border-brand/25" />}
                    <Chip label={n.visibility === 'shared' ? 'Shared' : 'Private'} className="bg-muted text-muted-foreground border-border" />
                    <span className="text-xs text-muted-foreground ml-auto">{n.time}</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{n.text}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add contact drawer */}
      <Sheet open={contactDrawerOpen} onOpenChange={setContactDrawerOpen}>
        <SheetContent className="w-[420px] sm:max-w-[420px]">
          <SheetHeader><SheetTitle>Add contact</SheetTitle></SheetHeader>
          <div className="px-4 py-4 space-y-4">
            <p className="text-sm text-muted-foreground">Contact form fields would go here (name, title, department, email, phone, LinkedIn, decision maker).</p>
            <button onClick={() => setContactDrawerOpen(false)} className="h-9 px-4 text-sm rounded-lg bg-brand hover:bg-brand/90 text-white">Done</button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-auto rounded-xl border border-border">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-muted/40">
          <tr className="border-b border-border">
            {headers.map(h => <th key={h} className="text-left px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/60 last:border-0" style={{ height: 52 }}>
              {row.map((cell, j) => <td key={j} className="px-3 py-2">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
