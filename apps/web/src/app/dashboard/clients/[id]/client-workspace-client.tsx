'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { relTime, formatSize, toInitials } from '@/lib/format'
import {
  ArrowLeft, Phone, Mail, Briefcase, UserPlus, CalendarPlus, CheckSquare,
  Building2, Plus, FileText, Upload, Hospital, X, Pencil, MoreHorizontal,
  Settings, BarChart3,
} from 'lucide-react'
import type { Client, ClientContact, ClientFacility } from '../_data'
import {
  addClientActivityAction, addClientContactAction, addClientFacilityAction,
  addClientNoteAction, deleteClientDocumentAction, updateClientContactAction,
  updateClientInfoAction, updateClientTeamAction, uploadClientDocumentAction,
} from '../actions'
import { PLACEMENTS } from '../../placements/_data'
import type { WorkspaceJob, WorkspaceCandidate, WorkspaceDoc, WorkspaceActivity, WorkspaceNote } from './page'

const JOB_STATUS_BADGE: Record<string, string> = {
  open:    'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  on_hold: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  closed:  'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  filled:  'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
}
const CLIENT_STATUS_BADGE: Record<Client['status'], string> = {
  active:   'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  prospect: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  inactive: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
}
const CLIENT_STATUS_LABEL: Record<Client['status'], string> = { active: 'Active', prospect: 'Prospect', inactive: 'Inactive' }

// ── Tasks are local-only (no task infrastructure exists anywhere else in the
// app yet — add a real tasks table when the app gets a cross-module Tasks
// feature, not just for this one tab) ─────────────────────────────────────────
type TaskItem = { id: string; title: string; type: string; assignee: string; due: string; priority: 'High' | 'Medium' | 'Low'; status: 'Open' | 'Done' }

const FACILITY_TYPES: ClientFacility['type'][] = ['Hospital', 'Clinic', 'Laboratory', 'Rehabilitation', 'Urgent Care', 'Skilled Nursing', 'Home Health']
const TASK_TYPES = ['Follow-up', 'Meeting', 'Document Request', 'Contract Renewal', 'Client Visit', 'Credentialing']

// ── Small pieces ───────────────────────────────────────────────────────────────

function Chip({ label, className }: { label: string; className: string }) {
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${className}`}>{label}</span>
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
        <button type="button" onClick={onAction} className="mt-1 h-9 px-4 text-sm font-medium rounded-lg bg-brand hover:bg-brand/90 text-white">
          {actionLabel}
        </button>
      )}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-foreground mb-1.5">{children}</label>
}
function FieldInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} className={cn(
      'w-full h-9 px-3 text-sm rounded-lg border border-border bg-background',
      'focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand',
      'placeholder:text-muted-foreground transition-colors',
      className,
    )} />
  )
}
function FieldSelect({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cn(
      'w-full h-9 px-3 text-sm rounded-lg border border-border bg-background cursor-pointer',
      'focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors',
      className,
    )}>
      {children}
    </select>
  )
}

const TABS = [
  { id: 'overview',    label: 'Overview' },
  { id: 'info',        label: 'Client info' },
  { id: 'contacts',    label: 'Contacts' },
  { id: 'facilities',  label: 'Facilities' },
  { id: 'documents',   label: 'Documents' },
  { id: 'tasks',       label: 'Tasks' },
  { id: 'activity',    label: 'Activity' },
  { id: 'notes',       label: 'Notes' },
] as const
type TabId = typeof TABS[number]['id']

export function ClientWorkspaceClient({ client, contacts, facilities, jobs, candidates, documents, activity, notes }: {
  client: Client; contacts: ClientContact[]; facilities: ClientFacility[]
  jobs: WorkspaceJob[]; candidates: WorkspaceCandidate[]
  documents: WorkspaceDoc[]; activity: WorkspaceActivity[]; notes: WorkspaceNote[]
}) {
  const [, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  // Editable client info (name/id stay fixed — they key filtering/routing elsewhere)
  const [clientInfo, setClientInfo] = useState<Client>(client)
  const [editingInfo, setEditingInfo] = useState(false)
  const [draftInfo, setDraftInfo] = useState<Client>(client)

  const [contactList, setContactList]   = useState<ClientContact[]>(contacts)
  const [facilityList, setFacilityList] = useState<ClientFacility[]>(facilities)
  const [docList, setDocList]           = useState<WorkspaceDoc[]>(documents)
  const [taskList, setTaskList]         = useState<TaskItem[]>([])
  const [activityList, setActivityList] = useState<WorkspaceActivity[]>(activity)
  const [noteText, setNoteText] = useState('')
  const [notesList, setNotesList] = useState<WorkspaceNote[]>(notes)

  const [contactDrawerOpen, setContactDrawerOpen] = useState(false)
  const [facilityDrawerOpen, setFacilityDrawerOpen] = useState(false)
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false)
  const [metricsDrawerOpen, setMetricsDrawerOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<ClientContact | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Team & roles panel ────────────────────────────────────────────────────
  const [teamDrawerOpen, setTeamDrawerOpen] = useState(false)
  const [tAccountManager, setTAccountManager] = useState('')
  const [tRecruitmentManager, setTRecruitmentManager] = useState('')
  const [tTeamLead, setTTeamLead] = useState('')
  const [tAssignedRecruiters, setTAssignedRecruiters] = useState('')

  function openTeamDrawer() {
    setTAccountManager(clientInfo.accountOwner)
    setTRecruitmentManager(clientInfo.recruitmentManager)
    setTTeamLead(clientInfo.teamLead)
    setTAssignedRecruiters(clientInfo.assignedRecruiters.join(', '))
    setTeamDrawerOpen(true)
  }
  function submitTeam(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('account_owner', tAccountManager)
    fd.set('recruitment_manager', tRecruitmentManager)
    fd.set('team_lead', tTeamLead)
    fd.set('assigned_recruiters', tAssignedRecruiters)
    setClientInfo(c => ({
      ...c,
      accountOwner: tAccountManager,
      recruitmentManager: tRecruitmentManager,
      teamLead: tTeamLead,
      assignedRecruiters: tAssignedRecruiters.split(',').map(s => s.trim()).filter(Boolean),
    }))
    setTeamDrawerOpen(false)
    startTransition(async () => {
      const res = await updateClientTeamAction(clientInfo.id, fd)
      if (!res.success) { toast.error(res.error); return }
      toast('Team & roles updated.')
    })
  }

  const isHealthcare = clientInfo.industry === 'Healthcare'
  const tabs = TABS.filter(t => t.id !== 'facilities' || isHealthcare)

  const placements = useMemo(() => PLACEMENTS.filter(p => p.client === clientInfo.name), [clientInfo.name])

  // Distinct candidates (Candidates tab), vs one row per submission event (Submissions tab)
  const distinctCandidates = useMemo(() => {
    const seen = new Map<string, WorkspaceCandidate>()
    for (const c of candidates) if (!seen.has(c.candidateId)) seen.set(c.candidateId, c)
    return Array.from(seen.values())
  }, [candidates])

  const openJobs = jobs.filter(j => j.status === 'open').length
  const revenue = placements.reduce((sum, p) => sum + p.weeklyRevenue, 0)
  const avgMargin = placements.length ? Math.round(placements.reduce((s, p) => s + p.marginPct, 0) / placements.length) : 0

  function logActivity(action: string) {
    startTransition(async () => {
      const res = await addClientActivityAction(clientInfo.id, action)
      if (res.success) setActivityList(prev => [{ id: res.id, actor: res.actor_name, action, time: res.created_at }, ...prev])
    })
  }

  function addNote() {
    if (!noteText.trim()) return
    const text = noteText
    setNoteText('')
    startTransition(async () => {
      const res = await addClientNoteAction(clientInfo.id, text)
      if (!res.success) { toast.error(res.error); return }
      setNotesList(prev => [{ id: res.id, author: res.author_name, text, time: res.created_at }, ...prev])
      toast('Note added.')
    })
  }

  function startEditInfo() {
    setDraftInfo(clientInfo)
    setEditingInfo(true)
  }
  function saveInfo() {
    const info = draftInfo
    setClientInfo(info)
    setEditingInfo(false)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('display_name', info.displayName)
      fd.set('legal_name', info.legalName)
      fd.set('website', info.website)
      fd.set('tax_id', info.taxId)
      fd.set('city', info.city)
      fd.set('state', info.state)
      fd.set('special_instructions', info.specialInstructions)
      const res = await updateClientInfoAction(clientInfo.id, fd)
      if (!res.success) { toast.error(res.error); return }
      toast('Client info saved.')
    })
  }
  function cancelEditInfo() {
    setEditingInfo(false)
  }

  // ── Add / edit contact form ───────────────────────────────────────────────
  const [ncName, setNcName] = useState('')
  const [ncTitle, setNcTitle] = useState('')
  const [ncDept, setNcDept] = useState('')
  const [ncEmail, setNcEmail] = useState('')
  const [ncPhone, setNcPhone] = useState('')
  const [ncDecisionMaker, setNcDecisionMaker] = useState(false)
  const [editingContactId, setEditingContactId] = useState<string | null>(null)

  function resetContactForm() {
    setNcName(''); setNcTitle(''); setNcDept(''); setNcEmail(''); setNcPhone(''); setNcDecisionMaker(false)
  }
  function openAddContact() {
    setEditingContactId(null)
    resetContactForm()
    setContactDrawerOpen(true)
  }
  function openEditContact(contact: ClientContact) {
    setEditingContactId(contact.id)
    setNcName(contact.name); setNcTitle(contact.title); setNcDept(contact.department)
    setNcEmail(contact.email); setNcPhone(contact.phone); setNcDecisionMaker(contact.decisionMaker)
    setContactDrawerOpen(true)
  }
  function openEditPrimaryContact() {
    const primary = contactList.find(c => c.primary) ?? contactList[0]
    if (primary) openEditContact(primary)
    else openAddContact()
  }
  function submitContact(e: React.FormEvent) {
    e.preventDefault()
    if (!ncName.trim()) return
    const fd = new FormData()
    fd.set('name', ncName); fd.set('title', ncTitle); fd.set('department', ncDept)
    fd.set('email', ncEmail); fd.set('phone', ncPhone)
    if (ncDecisionMaker) fd.set('decision_maker', 'on')
    const name = ncName
    const editingId = editingContactId
    resetContactForm()
    setEditingContactId(null)
    setContactDrawerOpen(false)
    startTransition(async () => {
      const res = editingId
        ? await updateClientContactAction(editingId, fd)
        : await addClientContactAction(clientInfo.id, fd)
      if (!res.success) { toast.error(res.error); return }
      if (editingId) {
        setContactList(prev => prev.map(c => c.id === editingId ? res.contact : c))
        setActivityList(prev => [{ id: `local-${Date.now()}`, actor: 'You', action: `updated contact ${name}`, time: new Date().toISOString() }, ...prev])
        toast(`${name} updated.`)
      } else {
        setContactList(prev => [...prev, res.contact])
        setActivityList(prev => [{ id: `local-${Date.now()}`, actor: 'You', action: `added contact ${name}`, time: new Date().toISOString() }, ...prev])
        toast(`${name} added as a contact.`)
      }
    })
  }

  // ── Add facility form ─────────────────────────────────────────────────────
  const [nfName, setNfName] = useState('')
  const [nfType, setNfType] = useState<ClientFacility['type']>('Hospital')
  const [nfCity, setNfCity] = useState('')
  const [nfState, setNfState] = useState('')
  const [nfManager, setNfManager] = useState('')

  function resetFacilityForm() {
    setNfName(''); setNfType('Hospital'); setNfCity(''); setNfState(''); setNfManager('')
  }
  function submitFacility(e: React.FormEvent) {
    e.preventDefault()
    if (!nfName.trim()) return
    const fd = new FormData()
    fd.set('name', nfName); fd.set('type', nfType); fd.set('city', nfCity)
    fd.set('state', nfState); fd.set('facility_manager', nfManager)
    const name = nfName
    resetFacilityForm()
    setFacilityDrawerOpen(false)
    startTransition(async () => {
      const res = await addClientFacilityAction(clientInfo.id, fd)
      if (!res.success) { toast.error(res.error); return }
      setFacilityList(prev => [...prev, res.facility])
      setActivityList(prev => [{ id: `local-${Date.now()}`, actor: 'You', action: `added facility ${name}`, time: new Date().toISOString() }, ...prev])
      toast(`${name} added.`)
    })
  }

  // ── Create task form (local-only, see TaskItem note above) ───────────────
  const [ntTitle, setNtTitle] = useState('')
  const [ntType, setNtType] = useState(TASK_TYPES[0]!)
  const [ntAssignee, setNtAssignee] = useState('')
  const [ntDue, setNtDue] = useState('')
  const [ntPriority, setNtPriority] = useState<TaskItem['priority']>('Medium')

  function resetTaskForm() {
    setNtTitle(''); setNtType(TASK_TYPES[0]!); setNtAssignee(''); setNtDue(''); setNtPriority('Medium')
  }
  function submitTask(e: React.FormEvent) {
    e.preventDefault()
    if (!ntTitle.trim()) return
    const task: TaskItem = {
      id: `t${Date.now()}`, title: ntTitle, type: ntType,
      assignee: ntAssignee || 'Unassigned', due: ntDue || 'No due date', priority: ntPriority, status: 'Open',
    }
    setTaskList(prev => [task, ...prev])
    logActivity(`created task "${ntTitle}"`)
    toast('Task created.')
    resetTaskForm()
    setTaskDrawerOpen(false)
  }

  function triggerUpload() {
    fileInputRef.current?.click()
  }
  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const fd = new FormData()
    fd.set('file', file)
    startTransition(async () => {
      const res = await uploadClientDocumentAction(clientInfo.id, fd)
      if (!res.success) { toast.error(res.error); return }
      setDocList(prev => [{ id: res.id, name: res.name, category: 'Other', size: res.size, uploadedAt: res.created_at }, ...prev])
      setActivityList(prev => [{ id: `local-${Date.now()}`, actor: 'You', action: `uploaded document: ${res.name}`, time: new Date().toISOString() }, ...prev])
      toast('Document uploaded.')
    })
  }
  function removeDocument(docId: string) {
    setDocList(prev => prev.filter(d => d.id !== docId))
    startTransition(async () => { await deleteClientDocumentAction(docId) })
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
              {toInitials(clientInfo.name)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold tracking-tight truncate">{clientInfo.name}</h1>
                <Chip label={CLIENT_STATUS_LABEL[clientInfo.status]} className={CLIENT_STATUS_BADGE[clientInfo.status]} />
                <Chip label={clientInfo.industry} className="bg-muted text-muted-foreground border-border" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Account owner {clientInfo.accountOwner || '—'}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">Client since {clientInfo.clientSince} · Last activity {clientInfo.lastActivity}</p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="h-8 px-3 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted/60 flex items-center gap-1.5"><Pencil className="size-3.5" />Edit</button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuItem asChild className="text-sm gap-2">
                  <Link href={`/dashboard/clients/${clientInfo.id}/edit`}><Building2 className="size-3.5" />Edit client</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm gap-2" onClick={openEditPrimaryContact}>
                  <UserPlus className="size-3.5" />Edit contact
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button type="button" onClick={openAddContact} className="h-8 px-3 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted/60 flex items-center gap-1.5"><UserPlus className="size-3.5" />Add contact</button>
            <button type="button" onClick={openTeamDrawer} title="Team & roles" className="size-8 rounded-lg border border-border bg-background hover:bg-muted/60 flex items-center justify-center shrink-0">
              <Settings className="size-3.5" />
            </button>
            <button type="button" onClick={() => setMetricsDrawerOpen(true)} title="Metrics" className="size-8 rounded-lg border border-border bg-background hover:bg-muted/60 flex items-center justify-center shrink-0">
              <BarChart3 className="size-3.5" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" title="More actions" className="size-8 rounded-lg border border-border bg-background hover:bg-muted/60 flex items-center justify-center shrink-0">
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="text-sm gap-2"
                  onClick={() => { toast(`Calling ${clientInfo.name}…`); logActivity(`called ${clientInfo.name}`) }}>
                  <Phone className="size-3.5" />Call
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm gap-2"
                  onClick={() => { toast(`Email opened for ${clientInfo.name}.`); logActivity(`emailed ${clientInfo.name}`) }}>
                  <Mail className="size-3.5" />Email
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-sm gap-2">
                  <Link href={`/dashboard/jobs/new?client=${encodeURIComponent(clientInfo.name)}`}><Briefcase className="size-3.5" />Post job</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm gap-2"
                  onClick={() => { toast(`Meeting scheduling opened for ${clientInfo.name}.`); logActivity(`scheduled a meeting with ${clientInfo.name}`) }}>
                  <CalendarPlus className="size-3.5" />Schedule meeting
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm gap-2" onClick={() => setTaskDrawerOpen(true)}>
                  <CheckSquare className="size-3.5" />Create task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b shrink-0 px-6 flex overflow-x-auto">
        {tabs.map(({ id, label }) => (
          <button type="button" key={id} onClick={() => setActiveTab(id)}
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
                {activityList.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent activity yet.</p>
                ) : (
                  <div className="space-y-3">
                    {activityList.slice(0, 5).map(a => (
                      <div key={a.id} className="flex items-start gap-2.5 text-sm">
                        <span className="font-medium">{a.actor}</span>
                        <span className="text-muted-foreground">{a.action}</span>
                        <span className="text-muted-foreground ml-auto shrink-0 text-xs">{relTime(a.time)}</span>
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
                  <div className="flex justify-between gap-3"><span className="text-muted-foreground">Communication</span><span className="font-medium">{clientInfo.preferredCommunication}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-muted-foreground">Submission method</span><span className="font-medium">{clientInfo.preferredSubmissionMethod}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-muted-foreground">Resume format</span><span className="font-medium">{clientInfo.preferredResumeFormat}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-muted-foreground">Interview process</span><span className="font-medium text-right">{clientInfo.preferredInterviewProcess || '—'}</span></div>
                </div>
              </section>
              {clientInfo.specialInstructions && (
                <>
                  <Separator />
                  <section>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Special instructions</p>
                    <p className="text-sm text-foreground leading-relaxed">{clientInfo.specialInstructions}</p>
                  </section>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="max-w-2xl px-6 py-6">
            {!editingInfo ? (
              <>
                <div className="flex justify-end mb-3">
                  <button type="button" onClick={startEditInfo} className="h-8 px-3 text-sm font-medium rounded-lg border border-border hover:bg-muted/60 flex items-center gap-1.5">
                    <Pencil className="size-3.5" />Edit
                  </button>
                </div>
                <div className="space-y-5">
                  {[
                    { label: 'Company name', value: clientInfo.name },
                    { label: 'Display name', value: clientInfo.displayName },
                    { label: 'Legal name', value: clientInfo.legalName },
                    { label: 'Industry', value: clientInfo.industry },
                    { label: 'Company type', value: clientInfo.companyType === 'vms' ? 'VMS' : 'Direct client' },
                    { label: 'Website', value: clientInfo.website },
                    { label: 'Tax ID', value: clientInfo.taxId },
                    { label: 'Company size', value: clientInfo.companySize ? `${clientInfo.companySize} employees` : '—' },
                    { label: 'Address', value: `${clientInfo.city}, ${clientInfo.state} ${clientInfo.zip}, ${clientInfo.country}` },
                    { label: 'Time zone', value: clientInfo.timezone },
                    { label: 'Tags', value: clientInfo.tags.length ? clientInfo.tags.join(', ') : '—' },
                    { label: 'Special instructions', value: clientInfo.specialInstructions || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start gap-6 border-b border-border/60 pb-3">
                      <span className="text-sm text-muted-foreground w-40 shrink-0">{label}</span>
                      <span className="text-sm font-medium">{value || '—'}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <form onSubmit={e => { e.preventDefault(); saveInfo() }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Display name</FieldLabel>
                    <FieldInput value={draftInfo.displayName} onChange={e => setDraftInfo(d => ({ ...d, displayName: e.target.value }))} />
                  </div>
                  <div>
                    <FieldLabel>Legal name</FieldLabel>
                    <FieldInput value={draftInfo.legalName} onChange={e => setDraftInfo(d => ({ ...d, legalName: e.target.value }))} />
                  </div>
                  <div>
                    <FieldLabel>Website</FieldLabel>
                    <FieldInput value={draftInfo.website} onChange={e => setDraftInfo(d => ({ ...d, website: e.target.value }))} />
                  </div>
                  <div>
                    <FieldLabel>Tax ID</FieldLabel>
                    <FieldInput value={draftInfo.taxId} onChange={e => setDraftInfo(d => ({ ...d, taxId: e.target.value }))} />
                  </div>
                  <div>
                    <FieldLabel>City</FieldLabel>
                    <FieldInput value={draftInfo.city} onChange={e => setDraftInfo(d => ({ ...d, city: e.target.value }))} />
                  </div>
                  <div>
                    <FieldLabel>State</FieldLabel>
                    <FieldInput value={draftInfo.state} onChange={e => setDraftInfo(d => ({ ...d, state: e.target.value }))} />
                  </div>
                  <div className="col-span-2">
                    <FieldLabel>Special instructions</FieldLabel>
                    <Textarea value={draftInfo.specialInstructions} onChange={e => setDraftInfo(d => ({ ...d, specialInstructions: e.target.value }))} className="text-sm" rows={3} />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button type="button" onClick={cancelEditInfo} className="h-9 px-4 text-sm rounded-lg border border-border hover:bg-muted/60">Cancel</button>
                  <button type="submit" className="h-9 px-4 text-sm rounded-lg bg-brand hover:bg-brand/90 text-white">Save</button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="px-6 py-6">
            <div className="flex justify-end mb-3">
              {contactList.length > 0 && (
                <button type="button" onClick={openAddContact} className="h-8 px-3 text-sm font-medium rounded-lg bg-brand hover:bg-brand/90 text-white flex items-center gap-1.5">
                  <Plus className="size-3.5" />Add contact
                </button>
              )}
            </div>
            {contactList.length === 0 ? (
              <EmptyTab icon={UserPlus} title="No contacts yet" description="Add the people you work with at this client so recruiters always know who to reach." actionLabel="Add contact" onAction={openAddContact} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {contactList.map(c => (
                  <button type="button" key={c.id} onClick={() => setSelectedContact(c)} className="text-left rounded-xl border border-border p-4 hover:bg-muted/30 hover:border-brand/40 transition-colors">
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
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'facilities' && isHealthcare && (
          <div className="px-6 py-6">
            <div className="flex justify-end mb-3">
              {facilityList.length > 0 && (
                <button type="button" onClick={() => setFacilityDrawerOpen(true)} className="h-8 px-3 text-sm font-medium rounded-lg bg-brand hover:bg-brand/90 text-white flex items-center gap-1.5">
                  <Plus className="size-3.5" />Add facility
                </button>
              )}
            </div>
            {facilityList.length === 0 ? (
              <EmptyTab icon={Hospital} title="No facilities yet" description="Add the hospitals, clinics, or labs this client operates so jobs can reference the right location." actionLabel="Add facility" onAction={() => setFacilityDrawerOpen(true)} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {facilityList.map(f => (
                  <div key={f.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">{f.name}</p>
                      <Chip label={f.type} className="bg-muted text-muted-foreground border-border" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{f.city}, {f.state}</p>
                    {f.departments.length > 0 && <p className="text-sm"><span className="text-muted-foreground">Departments: </span>{f.departments.join(', ')}</p>}
                    {f.specialties.length > 0 && <p className="text-sm"><span className="text-muted-foreground">Specialties: </span>{f.specialties.join(', ')}</p>}
                    <p className="text-sm mt-2"><span className="text-muted-foreground">Manager: </span>{f.facilityManager || '—'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="px-6 py-6">
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} />
            <div className="flex justify-end mb-3">
              {docList.length > 0 && (
                <button type="button" onClick={triggerUpload} className="h-8 px-3 text-sm font-medium rounded-lg bg-brand hover:bg-brand/90 text-white flex items-center gap-1.5">
                  <Upload className="size-3.5" />Upload document
                </button>
              )}
            </div>
            {docList.length === 0 ? (
              <EmptyTab icon={Upload} title="No documents yet" description="Contracts, insurance, invoices, and other files for this client will show up here." actionLabel="Upload document" onAction={triggerUpload} />
            ) : (
              <div className="space-y-2">
                {docList.map(d => (
                  <div key={d.id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                    <FileText className="size-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium truncate">{d.name}</span>
                    <Chip label={d.category} className="bg-muted text-muted-foreground border-border ml-2" />
                    <span className="text-sm text-muted-foreground ml-auto shrink-0">{formatSize(d.size)} · {relTime(d.uploadedAt)}</span>
                    <button type="button" onClick={() => removeDocument(d.id)} className="size-6 rounded-md hover:bg-muted flex items-center justify-center shrink-0">
                      <X className="size-3.5 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="px-6 py-6">
            <div className="flex justify-end mb-3">
              {taskList.length > 0 && (
                <button type="button" onClick={() => setTaskDrawerOpen(true)} className="h-8 px-3 text-sm font-medium rounded-lg bg-brand hover:bg-brand/90 text-white flex items-center gap-1.5">
                  <Plus className="size-3.5" />Create task
                </button>
              )}
            </div>
            {taskList.length === 0 ? (
              <EmptyTab icon={CheckSquare} title="No tasks yet" description="Follow-ups, meetings, and reminders for this client will show up here." actionLabel="Create task" onAction={() => setTaskDrawerOpen(true)} />
            ) : (
              <SimpleTable
                headers={['Task', 'Type', 'Assignee', 'Due', 'Priority', 'Status']}
                rows={taskList.map(t => [
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
            {activityList.length === 0 ? (
              <EmptyTab icon={Briefcase} title="No activity yet" description="Calls, emails, meetings, and updates for this client will show up here." />
            ) : (
              <div className="space-y-4">
                {activityList.map(a => (
                  <div key={a.id} className="flex items-start gap-3 border-b border-border/60 pb-4 last:border-0">
                    <Avatar className="size-7 shrink-0"><AvatarFallback className="text-xs font-bold bg-brand-muted text-brand">{toInitials(a.actor)}</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <p className="text-sm"><span className="font-medium">{a.actor}</span> <span className="text-muted-foreground">{a.action}</span></p>
                      <p className="text-sm text-muted-foreground mt-0.5">{relTime(a.time)}</p>
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
                <button type="button" onClick={() => setNoteText('')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Clear</button>
                <button type="button" onClick={addNote} disabled={!noteText.trim()} className="h-8 px-4 text-sm rounded-lg bg-brand hover:bg-brand/90 text-white disabled:opacity-40">Add note</button>
              </div>
            </div>
            {notesList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No notes yet. Add one above.</p>
            ) : (
              notesList.map(n => (
                <div key={n.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="size-7"><AvatarFallback className="text-xs font-bold bg-brand-muted text-brand">{toInitials(n.author)}</AvatarFallback></Avatar>
                    <span className="text-sm font-medium">{n.author}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{relTime(n.time)}</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{n.text}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Metrics drawer */}
      <Sheet open={metricsDrawerOpen} onOpenChange={setMetricsDrawerOpen}>
        <SheetContent className="w-[360px] sm:max-w-[360px]">
          <SheetHeader><SheetTitle>Metrics</SheetTitle></SheetHeader>
          <div className="px-4 py-4 grid grid-cols-2 gap-3">
            <Metric label="Total jobs" value={jobs.length} />
            <Metric label="Open jobs" value={openJobs} />
            <Metric label="Candidates submitted" value={distinctCandidates.length} />
            <Metric label="Placements" value={placements.length} />
            <Metric label="Revenue" value={`$${revenue.toLocaleString()}/wk`} />
            <Metric label="Avg margin" value={placements.length ? `${avgMargin}%` : '—'} />
            <Metric label="Avg fill time" value={placements.length ? '18 days' : '—'} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Team & roles drawer */}
      <Sheet open={teamDrawerOpen} onOpenChange={setTeamDrawerOpen}>
        <SheetContent className="w-[420px] sm:max-w-[420px]">
          <SheetHeader><SheetTitle>Team & roles</SheetTitle></SheetHeader>
          <form onSubmit={submitTeam} className="px-4 py-4 space-y-4 overflow-y-auto">
            <div>
              <FieldLabel>Account manager</FieldLabel>
              <FieldInput value={tAccountManager} onChange={e => setTAccountManager(e.target.value)} placeholder="e.g. Arun Kumar" />
            </div>
            <div>
              <FieldLabel>Recruitment manager</FieldLabel>
              <FieldInput value={tRecruitmentManager} onChange={e => setTRecruitmentManager(e.target.value)} placeholder="e.g. Sarah M." />
            </div>
            <div>
              <FieldLabel>Team lead</FieldLabel>
              <FieldInput value={tTeamLead} onChange={e => setTTeamLead(e.target.value)} placeholder="e.g. James R." />
            </div>
            <div>
              <FieldLabel>Assigned recruiters</FieldLabel>
              <FieldInput value={tAssignedRecruiters} onChange={e => setTAssignedRecruiters(e.target.value)} placeholder="Comma-separated, e.g. Emily T., Priya S." />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setTeamDrawerOpen(false)} className="h-9 px-4 text-sm rounded-lg border border-border hover:bg-muted/60">Cancel</button>
              <button type="submit" className="h-9 px-4 text-sm rounded-lg bg-brand hover:bg-brand/90 text-white">Save</button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Add / edit contact drawer */}
      <Sheet open={contactDrawerOpen} onOpenChange={setContactDrawerOpen}>
        <SheetContent className="w-[420px] sm:max-w-[420px]">
          <SheetHeader><SheetTitle>{editingContactId ? 'Edit contact' : 'Add contact'}</SheetTitle></SheetHeader>
          <form onSubmit={submitContact} className="px-4 py-4 space-y-4 overflow-y-auto">
            <div>
              <FieldLabel>Name</FieldLabel>
              <FieldInput value={ncName} onChange={e => setNcName(e.target.value)} placeholder="e.g. Dr. Sarah Kim" required />
            </div>
            <div>
              <FieldLabel>Job title</FieldLabel>
              <FieldInput value={ncTitle} onChange={e => setNcTitle(e.target.value)} placeholder="e.g. Director of Nursing" />
            </div>
            <div>
              <FieldLabel>Department</FieldLabel>
              <FieldInput value={ncDept} onChange={e => setNcDept(e.target.value)} placeholder="e.g. ICU" />
            </div>
            <div>
              <FieldLabel>Email</FieldLabel>
              <FieldInput type="email" value={ncEmail} onChange={e => setNcEmail(e.target.value)} placeholder="name@company.com" />
            </div>
            <div>
              <FieldLabel>Phone</FieldLabel>
              <FieldInput value={ncPhone} onChange={e => setNcPhone(e.target.value)} placeholder="(555) 555-0100" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={ncDecisionMaker} onChange={e => setNcDecisionMaker(e.target.checked)} className="size-4" />
              Decision maker
            </label>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setContactDrawerOpen(false)} className="h-9 px-4 text-sm rounded-lg border border-border hover:bg-muted/60">Cancel</button>
              <button type="submit" className="h-9 px-4 text-sm rounded-lg bg-brand hover:bg-brand/90 text-white">{editingContactId ? 'Save contact' : 'Add contact'}</button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Add facility drawer */}
      <Sheet open={facilityDrawerOpen} onOpenChange={setFacilityDrawerOpen}>
        <SheetContent className="w-[420px] sm:max-w-[420px]">
          <SheetHeader><SheetTitle>Add facility</SheetTitle></SheetHeader>
          <form onSubmit={submitFacility} className="px-4 py-4 space-y-4 overflow-y-auto">
            <div>
              <FieldLabel>Facility name</FieldLabel>
              <FieldInput value={nfName} onChange={e => setNfName(e.target.value)} placeholder="e.g. Memorial Hospital — Main Campus" required />
            </div>
            <div>
              <FieldLabel>Facility type</FieldLabel>
              <FieldSelect value={nfType} onChange={e => setNfType(e.target.value as ClientFacility['type'])}>
                {FACILITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </FieldSelect>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>City</FieldLabel>
                <FieldInput value={nfCity} onChange={e => setNfCity(e.target.value)} />
              </div>
              <div>
                <FieldLabel>State</FieldLabel>
                <FieldInput value={nfState} onChange={e => setNfState(e.target.value)} />
              </div>
            </div>
            <div>
              <FieldLabel>Facility manager</FieldLabel>
              <FieldInput value={nfManager} onChange={e => setNfManager(e.target.value)} />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setFacilityDrawerOpen(false)} className="h-9 px-4 text-sm rounded-lg border border-border hover:bg-muted/60">Cancel</button>
              <button type="submit" className="h-9 px-4 text-sm rounded-lg bg-brand hover:bg-brand/90 text-white">Add facility</button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Create task drawer */}
      <Sheet open={taskDrawerOpen} onOpenChange={setTaskDrawerOpen}>
        <SheetContent className="w-[420px] sm:max-w-[420px]">
          <SheetHeader><SheetTitle>Create task</SheetTitle></SheetHeader>
          <form onSubmit={submitTask} className="px-4 py-4 space-y-4 overflow-y-auto">
            <div>
              <FieldLabel>Task</FieldLabel>
              <FieldInput value={ntTitle} onChange={e => setNtTitle(e.target.value)} placeholder="e.g. Follow up on submission feedback" required />
            </div>
            <div>
              <FieldLabel>Type</FieldLabel>
              <FieldSelect value={ntType} onChange={e => setNtType(e.target.value)}>
                {TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </FieldSelect>
            </div>
            <div>
              <FieldLabel>Assignee</FieldLabel>
              <FieldInput value={ntAssignee} onChange={e => setNtAssignee(e.target.value)} placeholder="e.g. Sarah M." />
            </div>
            <div>
              <FieldLabel>Due date</FieldLabel>
              <FieldInput type="date" value={ntDue} onChange={e => setNtDue(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Priority</FieldLabel>
              <FieldSelect value={ntPriority} onChange={e => setNtPriority(e.target.value as TaskItem['priority'])}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </FieldSelect>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setTaskDrawerOpen(false)} className="h-9 px-4 text-sm rounded-lg border border-border hover:bg-muted/60">Cancel</button>
              <button type="submit" className="h-9 px-4 text-sm rounded-lg bg-brand hover:bg-brand/90 text-white">Create task</button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Contact detail drawer */}
      <Sheet open={!!selectedContact} onOpenChange={open => !open && setSelectedContact(null)}>
        <SheetContent className="w-[420px] sm:max-w-[420px]">
          <SheetHeader><SheetTitle>{selectedContact?.name}</SheetTitle></SheetHeader>
          {selectedContact && (
            <div className="px-4 py-4 space-y-5">
              <div className="flex items-center gap-3">
                <Avatar className="size-10"><AvatarFallback className="text-sm font-bold bg-brand-muted text-brand">{toInitials(selectedContact.name)}</AvatarFallback></Avatar>
                <div>
                  <p className="text-sm font-medium">{selectedContact.title || '—'}</p>
                  <p className="text-sm text-muted-foreground">{selectedContact.department || '—'}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium">{selectedContact.email || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="font-medium">{selectedContact.phone || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Preferred contact</span><span className="font-medium">{selectedContact.preferredContactMethod}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Decision maker</span><span className="font-medium">{selectedContact.decisionMaker ? 'Yes' : 'No'}</span></div>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Recent activity</p>
                <div className="space-y-3">
                  {activityList.filter(a => a.action.includes(selectedContact.name)).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No activity with this contact yet.</p>
                  ) : (
                    activityList.filter(a => a.action.includes(selectedContact.name)).map(a => (
                      <div key={a.id} className="text-sm">
                        <span className="font-medium">{a.actor}</span> <span className="text-muted-foreground">{a.action}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">{relTime(a.time)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button"
                  onClick={() => { toast(`Calling ${selectedContact.name}…`); logActivity(`called ${selectedContact.name}`) }}
                  className="h-8 px-3 text-sm rounded-lg border border-border hover:bg-muted/60 flex items-center gap-1.5"><Phone className="size-3.5" />Call</button>
                <button type="button"
                  onClick={() => { toast(`Email opened for ${selectedContact.name}.`); logActivity(`emailed ${selectedContact.name}`) }}
                  className="h-8 px-3 text-sm rounded-lg border border-border hover:bg-muted/60 flex items-center gap-1.5"><Mail className="size-3.5" />Email</button>
                <button type="button"
                  onClick={() => { const c = selectedContact; setSelectedContact(null); openEditContact(c) }}
                  className="h-8 px-3 text-sm rounded-lg border border-border hover:bg-muted/60 flex items-center gap-1.5 ml-auto"><Pencil className="size-3.5" />Edit</button>
              </div>
            </div>
          )}
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
