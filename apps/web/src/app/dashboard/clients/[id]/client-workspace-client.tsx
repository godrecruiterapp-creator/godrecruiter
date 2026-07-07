'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { relTime, formatSize, toInitials } from '@/lib/format'
import {
  ArrowLeft, Phone, Mail, Briefcase, UserPlus, CalendarPlus, CheckSquare,
  Plus, FileText, Upload, Hospital, Pencil, MoreHorizontal, Eye, ChevronDown,
  Settings, BarChart3, Trash2,
} from 'lucide-react'
import type { Client, ClientContact, ClientFacility } from '../_data'
import {
  addClientActivityAction, addClientContactAction, addClientFacilityAction,
  addClientNoteAction, deleteClientAction, deleteClientContactAction,
  deleteClientDocumentAction, deleteClientFacilityAction, deleteClientNoteAction,
  getClientDocumentViewUrlAction, replaceClientDocumentAction, updateClientContactAction,
  updateClientFacilityAction, updateClientNoteAction, updateClientTeamAction,
  uploadClientDocumentAction,
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
const DOCUMENT_CATEGORIES = ['Contract', 'Agreement', 'Other']

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
      'w-full h-9 px-3 text-sm rounded-lg border border-border bg-background ring-offset-background',
      'focus-visible:outline-none focus-visible:border-[#D1D5DB]',
      'placeholder:text-muted-foreground transition-colors',
      className,
    )} />
  )
}
function FieldSelect({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cn(
      'w-full h-9 px-3 text-sm rounded-lg border border-border bg-background ring-offset-background cursor-pointer',
      'focus-visible:outline-none focus-visible:border-[#D1D5DB] transition-colors',
      className,
    )}>
      {children}
    </select>
  )
}

function ManageMenu({ count, children }: { count: number; children: React.ReactNode }) {
  if (count === 0) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="h-8 px-3 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted/60 flex items-center gap-1.5">
          Manage ({count})<MoreHorizontal className="size-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">{children}</DropdownMenuContent>
    </DropdownMenu>
  )
}

// Jobs-style bulk action bar: "N selected" + divider + a left-aligned "Manage" dropdown
function BulkBar({ count, children }: { count: number; children: React.ReactNode }) {
  if (count === 0) return null
  return (
    <div className="flex items-center gap-2 px-3 py-2 mb-2.5 bg-brand-muted border border-brand/20 rounded-lg">
      <span className="text-sm font-semibold text-brand">{count} selected</span>
      <div className="w-px h-4 bg-brand/20 mx-1" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="h-7 text-sm">
            Manage <ChevronDown className="size-3.5 ml-1.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">{children}</DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// Hover-reveal row actions, right-aligned in the last cell of a table row
function RowActions({ children }: { children: React.ReactNode }) {
  return <div className="hidden group-hover:flex items-center justify-end gap-1">{children}</div>
}
function RowActionButton({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" title={title} onClick={onClick} className="size-7 rounded-md hover:bg-muted flex items-center justify-center">
      {children}
    </button>
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  useEffect(() => {
    const flag = searchParams.get('created') ? 'created' : searchParams.get('updated') ? 'updated' : null
    if (flag) {
      toast(flag === 'created' ? 'Client created successfully.' : 'Client updated successfully.')
      router.replace(`/dashboard/clients/${client.id}`, { scroll: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Editable client info (name/id stay fixed — they key filtering/routing elsewhere)
  const [clientInfo, setClientInfo] = useState<Client>(client)

  const [contactList, setContactList]   = useState<ClientContact[]>(contacts)
  const [facilityList, setFacilityList] = useState<ClientFacility[]>(facilities)
  const [docList, setDocList]           = useState<WorkspaceDoc[]>(documents)
  const [taskList, setTaskList]         = useState<TaskItem[]>([])
  const [activityList, setActivityList] = useState<WorkspaceActivity[]>(activity)
  const [notesList, setNotesList]       = useState<WorkspaceNote[]>(notes)

  const [contactDrawerOpen, setContactDrawerOpen]   = useState(false)
  const [facilityDrawerOpen, setFacilityDrawerOpen] = useState(false)
  const [taskDrawerOpen, setTaskDrawerOpen]         = useState(false)
  const [metricsDrawerOpen, setMetricsDrawerOpen]   = useState(false)
  const [selectedContact, setSelectedContact]       = useState<ClientContact | null>(null)

  // ── Team & roles panel ────────────────────────────────────────────────────
  const [teamDrawerOpen, setTeamDrawerOpen] = useState(false)
  const [tAccountManager, setTAccountManager] = useState('')
  const [tRecruitmentManager, setTRecruitmentManager] = useState('')
  const [tTeamLead, setTTeamLead] = useState('')
  const [tAssignedRecruiters, setTAssignedRecruiters] = useState('')

  function openTeamDrawer() {
    setTAccountManager(clientInfo.accountOwner.join(', '))
    setTRecruitmentManager(clientInfo.recruitmentManager.join(', '))
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
      accountOwner: tAccountManager.split(',').map(s => s.trim()).filter(Boolean),
      recruitmentManager: tRecruitmentManager.split(',').map(s => s.trim()).filter(Boolean),
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

  // Distinct candidates, for the metrics count
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

  // ── Add / edit contact form ───────────────────────────────────────────────
  const [ncName, setNcName] = useState('')
  const [ncTitle, setNcTitle] = useState('')
  const [ncEmail, setNcEmail] = useState('')
  const [ncPhone, setNcPhone] = useState('')
  const [ncDecisionMaker, setNcDecisionMaker] = useState(false)
  const [editingContactId, setEditingContactId] = useState<string | null>(null)
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])

  function resetContactForm() {
    setNcName(''); setNcTitle(''); setNcEmail(''); setNcPhone(''); setNcDecisionMaker(false)
  }
  function openAddContact() {
    setEditingContactId(null)
    resetContactForm()
    setContactDrawerOpen(true)
  }
  function openEditContact(contact: ClientContact) {
    setEditingContactId(contact.id)
    setNcName(contact.name); setNcTitle(contact.title)
    setNcEmail(contact.email); setNcPhone(contact.phone); setNcDecisionMaker(contact.decisionMaker)
    setContactDrawerOpen(true)
  }
  function submitContact(e: React.FormEvent) {
    e.preventDefault()
    if (!ncName.trim()) return
    const fd = new FormData()
    fd.set('name', ncName); fd.set('title', ncTitle)
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
  function toggleContactSelect(id: string) {
    setSelectedContactIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  const allContactsSelected  = contactList.length > 0 && contactList.every(c => selectedContactIds.includes(c.id))
  const someContactsSelected = contactList.some(c => selectedContactIds.includes(c.id)) && !allContactsSelected
  function toggleAllContacts(v: boolean) { setSelectedContactIds(v ? contactList.map(c => c.id) : []) }

  function deleteContacts(ids: string[]) {
    if (!confirm(`Delete ${ids.length} contact(s)?`)) return
    setContactList(prev => prev.filter(c => !ids.includes(c.id)))
    setSelectedContactIds(prev => prev.filter(id => !ids.includes(id)))
    startTransition(async () => { await Promise.all(ids.map(id => deleteClientContactAction(id))) })
  }
  function emailContacts(ids: string[]) {
    const chosen = contactList.filter(c => ids.includes(c.id))
    const emails = chosen.map(c => c.email).filter(Boolean)
    if (!emails.length) { toast.error('No email on file for the selected contact(s).'); return }
    window.open(`mailto:${emails.join(',')}`)
    logActivity(emails.length > 1 ? `emailed ${emails.length} contacts` : `emailed ${chosen[0]?.name}`)
    setSelectedContactIds(prev => prev.filter(id => !ids.includes(id)))
  }

  // ── Add / edit facility form ──────────────────────────────────────────────
  const [nfName, setNfName] = useState('')
  const [nfType, setNfType] = useState<ClientFacility['type']>('Hospital')
  const [nfCity, setNfCity] = useState('')
  const [nfState, setNfState] = useState('')
  const [nfManager, setNfManager] = useState('')
  const [editingFacilityId, setEditingFacilityId] = useState<string | null>(null)
  const [selectedFacilityIds, setSelectedFacilityIds] = useState<string[]>([])

  function resetFacilityForm() {
    setNfName(''); setNfType('Hospital'); setNfCity(''); setNfState(''); setNfManager('')
  }
  function openAddFacility() {
    setEditingFacilityId(null)
    resetFacilityForm()
    setFacilityDrawerOpen(true)
  }
  function openEditFacility(f: ClientFacility) {
    setEditingFacilityId(f.id)
    setNfName(f.name); setNfType(f.type); setNfCity(f.city); setNfState(f.state); setNfManager(f.facilityManager)
    setFacilityDrawerOpen(true)
  }
  function submitFacility(e: React.FormEvent) {
    e.preventDefault()
    if (!nfName.trim()) return
    const fd = new FormData()
    fd.set('name', nfName); fd.set('type', nfType); fd.set('city', nfCity)
    fd.set('state', nfState); fd.set('facility_manager', nfManager)
    const name = nfName
    const editingId = editingFacilityId
    resetFacilityForm()
    setEditingFacilityId(null)
    setFacilityDrawerOpen(false)
    startTransition(async () => {
      const res = editingId
        ? await updateClientFacilityAction(editingId, fd)
        : await addClientFacilityAction(clientInfo.id, fd)
      if (!res.success) { toast.error(res.error); return }
      if (editingId) {
        setFacilityList(prev => prev.map(f => f.id === editingId ? res.facility : f))
        toast(`${name} updated.`)
      } else {
        setFacilityList(prev => [...prev, res.facility])
        toast(`${name} added.`)
      }
      setActivityList(prev => [{ id: `local-${Date.now()}`, actor: 'You', action: `${editingId ? 'updated' : 'added'} facility ${name}`, time: new Date().toISOString() }, ...prev])
    })
  }
  function toggleFacilitySelect(id: string) {
    setSelectedFacilityIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  const allFacilitiesSelected  = facilityList.length > 0 && facilityList.every(f => selectedFacilityIds.includes(f.id))
  const someFacilitiesSelected = facilityList.some(f => selectedFacilityIds.includes(f.id)) && !allFacilitiesSelected
  function toggleAllFacilities(v: boolean) { setSelectedFacilityIds(v ? facilityList.map(f => f.id) : []) }

  function deleteFacilities(ids: string[]) {
    if (!confirm(`Delete ${ids.length} facilit${ids.length > 1 ? 'ies' : 'y'}?`)) return
    setFacilityList(prev => prev.filter(f => !ids.includes(f.id)))
    setSelectedFacilityIds(prev => prev.filter(id => !ids.includes(id)))
    startTransition(async () => { await Promise.all(ids.map(id => deleteClientFacilityAction(id))) })
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

  // ── Upload / replace document ─────────────────────────────────────────────
  const [docDrawerOpen, setDocDrawerOpen] = useState(false)
  const [docMode, setDocMode] = useState<'add' | 'replace'>('add')
  const [replacingDocId, setReplacingDocId] = useState<string | null>(null)
  const [docCategory, setDocCategory] = useState(DOCUMENT_CATEGORIES[0]!)
  const [docFile, setDocFile] = useState<File | null>(null)
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([])

  function openUploadDocument() {
    setDocMode('add'); setReplacingDocId(null); setDocCategory(DOCUMENT_CATEGORIES[0]!); setDocFile(null)
    setDocDrawerOpen(true)
  }
  function openReplaceDocument(doc: WorkspaceDoc) {
    setDocMode('replace'); setReplacingDocId(doc.id); setDocFile(null)
    setDocDrawerOpen(true)
  }
  function submitDocument(e: React.FormEvent) {
    e.preventDefault()
    if (!docFile) { toast.error('Choose a file to upload.'); return }
    const fd = new FormData()
    fd.set('file', docFile)
    if (docMode === 'add') fd.set('category', docCategory)
    const mode = docMode
    const replaceId = replacingDocId
    setDocDrawerOpen(false)
    setDocFile(null)
    startTransition(async () => {
      if (mode === 'add') {
        const res = await uploadClientDocumentAction(clientInfo.id, fd)
        if (!res.success) { toast.error(res.error); return }
        setDocList(prev => [{ id: res.id, name: res.name, category: res.category, size: res.size, uploadedAt: res.created_at, uploaderName: res.uploader_name }, ...prev])
        setActivityList(prev => [{ id: `local-${Date.now()}`, actor: 'You', action: `uploaded document: ${res.name}`, time: new Date().toISOString() }, ...prev])
        toast('Document uploaded.')
      } else if (replaceId) {
        const res = await replaceClientDocumentAction(replaceId, fd)
        if (!res.success) { toast.error(res.error); return }
        setDocList(prev => prev.map(d => d.id === replaceId ? { ...d, name: res.name, size: res.size, uploadedAt: res.created_at, uploaderName: res.uploader_name } : d))
        setActivityList(prev => [{ id: `local-${Date.now()}`, actor: 'You', action: `replaced document: ${res.name}`, time: new Date().toISOString() }, ...prev])
        toast('Document updated.')
      }
    })
  }
  function toggleDocSelect(id: string) {
    setSelectedDocIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  const allDocsSelected  = docList.length > 0 && docList.every(d => selectedDocIds.includes(d.id))
  const someDocsSelected = docList.some(d => selectedDocIds.includes(d.id)) && !allDocsSelected
  function toggleAllDocs(v: boolean) { setSelectedDocIds(v ? docList.map(d => d.id) : []) }

  function deleteDocuments(ids: string[]) {
    if (!confirm(`Delete ${ids.length} document(s)?`)) return
    setDocList(prev => prev.filter(d => !ids.includes(d.id)))
    setSelectedDocIds(prev => prev.filter(id => !ids.includes(id)))
    startTransition(async () => { await Promise.all(ids.map(id => deleteClientDocumentAction(id))) })
  }
  // Documents live in a private bucket — every preview fetches a fresh,
  // short-lived signed URL and shows it in-app instead of a shareable link.
  const [docPreview, setDocPreview] = useState<{ name: string; url: string } | null>(null)
  function viewDocument(d: WorkspaceDoc) {
    startTransition(async () => {
      const res = await getClientDocumentViewUrlAction(d.id)
      if (!res.success) { toast.error(res.error); return }
      setDocPreview({ name: d.name, url: res.url })
    })
  }

  function deleteClient() {
    if (!confirm(`Delete ${clientInfo.name}? This cannot be undone.`)) return
    startTransition(async () => { await deleteClientAction(clientInfo.id) })
  }

  // ── Add / edit note ───────────────────────────────────────────────────────
  const [noteDrawerOpen, setNoteDrawerOpen] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([])

  function openAddNote() {
    setEditingNoteId(null)
    setNoteText('')
    setNoteDrawerOpen(true)
  }
  function openEditNote(note: WorkspaceNote) {
    setEditingNoteId(note.id)
    setNoteText(note.text)
    setNoteDrawerOpen(true)
  }
  function submitNote(e: React.FormEvent) {
    e.preventDefault()
    if (!noteText.trim()) return
    const text = noteText
    const editingId = editingNoteId
    setNoteText('')
    setEditingNoteId(null)
    setNoteDrawerOpen(false)
    startTransition(async () => {
      if (editingId) {
        const res = await updateClientNoteAction(editingId, text)
        if (!res.success) { toast.error(res.error); return }
        setNotesList(prev => prev.map(n => n.id === editingId ? { ...n, text } : n))
        toast('Note updated.')
      } else {
        const res = await addClientNoteAction(clientInfo.id, text)
        if (!res.success) { toast.error(res.error); return }
        setNotesList(prev => [{ id: res.id, author: res.author_name, text, time: res.created_at }, ...prev])
        toast('Note added.')
      }
    })
  }
  function toggleNoteSelect(id: string) {
    setSelectedNoteIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  function deleteSelectedNotes() {
    if (!confirm(`Delete ${selectedNoteIds.length} note(s)?`)) return
    const ids = selectedNoteIds
    setNotesList(prev => prev.filter(n => !ids.includes(n.id)))
    setSelectedNoteIds([])
    startTransition(async () => { await Promise.all(ids.map(id => deleteClientNoteAction(id))) })
  }

  // ── Activity filters ──────────────────────────────────────────────────────
  const distinctActors = useMemo(() => Array.from(new Set(activityList.map(a => a.actor))).sort(), [activityList])
  const [filterActor, setFilterActor] = useState('__all__')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const filteredActivity = useMemo(() => activityList.filter(a => {
    if (filterActor !== '__all__' && a.actor !== filterActor) return false
    if (filterFrom && new Date(a.time) < new Date(filterFrom)) return false
    if (filterTo && new Date(a.time) > new Date(`${filterTo}T23:59:59`)) return false
    return true
  }), [activityList, filterActor, filterFrom, filterTo])

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
                Account owner {clientInfo.accountOwner.join(', ') || '—'}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">Client since {clientInfo.clientSince} · Last activity {clientInfo.lastActivity}</p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            <Link href={`/dashboard/clients/${clientInfo.id}/edit`} className="h-8 px-3 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted/60 flex items-center gap-1.5"><Pencil className="size-3.5" />Edit</Link>
            <button type="button" onClick={openAddContact} className="h-8 px-3 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted/60 flex items-center gap-1.5"><UserPlus className="size-3.5" />Add contact</button>
            {isHealthcare && (
              <button type="button" onClick={openAddFacility} className="h-8 px-3 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted/60 flex items-center gap-1.5"><Hospital className="size-3.5" />Add facility</button>
            )}
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
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-sm gap-2 text-destructive focus:text-destructive" onClick={deleteClient}>
                  <Trash2 className="size-3.5" />Delete client
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
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Description</p>
                <p className="text-sm text-foreground leading-relaxed">{clientInfo.description || 'No description yet.'}</p>
              </section>
              <Separator />
              <section>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Website</p>
                {clientInfo.website ? (
                  <a href={clientInfo.website} target="_blank" rel="noopener noreferrer" className="text-sm text-brand hover:underline">{clientInfo.website}</a>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </section>
              <Separator />
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
            <div className="w-[35%] px-6 py-6 overflow-auto space-y-6">
              {isHealthcare && (
                <section>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Facilities</p>
                  {facilityList.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No facilities added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {facilityList.map(f => (
                        <div key={f.id} className="rounded-lg border border-border px-3 py-2.5">
                          <p className="text-sm font-medium">{f.name}</p>
                          <p className="text-xs text-muted-foreground">{f.type}{(f.city || f.state) ? ` · ${[f.city, f.state].filter(Boolean).join(', ')}` : ''}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="max-w-2xl px-6 py-6">
            <div className="space-y-5">
              {[
                { label: 'Company name', value: clientInfo.name },
                { label: 'Display name', value: clientInfo.displayName },
                { label: 'Legal name', value: clientInfo.legalName },
                { label: 'Description', value: clientInfo.description },
                { label: 'Website', value: clientInfo.website },
                { label: 'Tax ID', value: clientInfo.taxId },
                { label: 'Company size', value: clientInfo.companySize ? `${clientInfo.companySize} employees` : '—' },
                { label: 'Industry', value: clientInfo.industry },
                { label: 'Company type', value: clientInfo.companyType === 'vms' ? 'VMS' : 'Direct client' },
                { label: 'City', value: clientInfo.city },
                { label: 'State', value: clientInfo.state },
                { label: 'Country', value: clientInfo.country },
                { label: 'Zip', value: clientInfo.zip },
                { label: 'Time zone', value: clientInfo.timezone },
                { label: 'Account owner', value: clientInfo.accountOwner.join(', ') },
                { label: 'Recruitment manager', value: clientInfo.recruitmentManager.join(', ') },
                { label: 'Primary recruiter', value: clientInfo.primaryRecruiter.join(', ') },
                { label: 'Assigned recruiter(s)', value: clientInfo.assignedRecruiters.join(', ') },
                { label: 'Preferred communication', value: clientInfo.preferredCommunication },
                { label: 'Preferred submission method', value: clientInfo.preferredSubmissionMethod },
                { label: 'Preferred resume format', value: clientInfo.preferredResumeFormat },
                { label: 'Preferred interview process', value: clientInfo.preferredInterviewProcess },
                { label: 'Special instructions', value: clientInfo.specialInstructions },
                { label: 'Status', value: CLIENT_STATUS_LABEL[clientInfo.status] },
                { label: 'Tags', value: clientInfo.tags.length ? clientInfo.tags.join(', ') : '' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start gap-6 border-b border-border/60 pb-3">
                  <span className="text-sm text-muted-foreground w-48 shrink-0">{label}</span>
                  <span className="text-sm font-medium">{value || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="px-6 py-6">
            {contactList.length === 0 ? (
              <EmptyTab icon={UserPlus} title="No contacts yet" description="Add the people you work with at this client so recruiters always know who to reach." />
            ) : (
              <>
                <BulkBar count={selectedContactIds.length}>
                  {selectedContactIds.length === 1 && (
                    <DropdownMenuItem className="text-sm gap-2" onClick={() => {
                      const c = contactList.find(c => c.id === selectedContactIds[0])
                      setSelectedContactIds([])
                      if (c) openEditContact(c)
                    }}>
                      <Pencil className="size-3.5" />Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="text-sm gap-2" onClick={() => emailContacts(selectedContactIds)}>
                    <Mail className="size-3.5" />Send email
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-sm gap-2 text-destructive focus:text-destructive" onClick={() => deleteContacts(selectedContactIds)}>
                    <Trash2 className="size-3.5" />Delete
                  </DropdownMenuItem>
                </BulkBar>
                <div className="overflow-auto rounded-xl border border-border">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-muted/40">
                      <tr className="border-b border-border">
                        <th className="w-10 px-3 py-3"><Checkbox checked={allContactsSelected} data-state={someContactsSelected ? 'indeterminate' : undefined} onCheckedChange={v => toggleAllContacts(!!v)} aria-label="Select all contacts" /></th>
                        <th className="text-left px-3 py-3 table-header-cell whitespace-nowrap">Contact</th>
                        <th className="text-left px-3 py-3 table-header-cell whitespace-nowrap">Title</th>
                        <th className="text-left px-3 py-3 table-header-cell whitespace-nowrap">Email</th>
                        <th className="text-left px-3 py-3 table-header-cell whitespace-nowrap">Phone</th>
                        <th className="text-left px-3 py-3 table-header-cell whitespace-nowrap">Status</th>
                        <th className="w-28" />
                      </tr>
                    </thead>
                    <tbody>
                      {contactList.map(c => (
                        <tr key={c.id} className="group border-b border-border/60 last:border-0 hover:bg-muted/20" style={{ height: 52 }}>
                          <td className="px-3 py-2"><Checkbox checked={selectedContactIds.includes(c.id)} onCheckedChange={() => toggleContactSelect(c.id)} aria-label={`Select ${c.name}`} /></td>
                          <td className="px-3 py-2">
                            <button type="button" onClick={() => setSelectedContact(c)} className="flex items-center gap-2.5 table-cell-primary hover:text-brand">
                              <Avatar className="size-7 shrink-0"><AvatarFallback className="text-xs font-bold bg-brand-muted text-brand">{toInitials(c.name)}</AvatarFallback></Avatar>
                              {c.name}
                            </button>
                          </td>
                          <td className="px-3 py-2 table-cell-secondary">{c.title || '—'}</td>
                          <td className="px-3 py-2 table-cell-secondary">{c.email || '—'}</td>
                          <td className="px-3 py-2 table-cell-secondary">{c.phone || '—'}</td>
                          <td className="px-3 py-2">
                            <div className="flex gap-1.5">
                              {c.primary && <Chip label="Primary" className="bg-brand-muted text-brand border-brand/25" />}
                              {c.decisionMaker && <Chip label="Decision maker" className="bg-muted text-muted-foreground border-border" />}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <RowActions>
                              <RowActionButton title="Edit" onClick={() => openEditContact(c)}><Pencil className="size-3.5 text-muted-foreground" /></RowActionButton>
                              <RowActionButton title="Delete" onClick={() => deleteContacts([c.id])}><Trash2 className="size-3.5 text-muted-foreground" /></RowActionButton>
                              <RowActionButton title="Email" onClick={() => emailContacts([c.id])}><Mail className="size-3.5 text-muted-foreground" /></RowActionButton>
                            </RowActions>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'facilities' && isHealthcare && (
          <div className="px-6 py-6">
            {facilityList.length === 0 ? (
              <EmptyTab icon={Hospital} title="No facilities yet" description="Add the hospitals, clinics, or labs this client operates so jobs can reference the right location." actionLabel="Add facility" onAction={openAddFacility} />
            ) : (
              <>
                <BulkBar count={selectedFacilityIds.length}>
                  {selectedFacilityIds.length === 1 && (
                    <DropdownMenuItem className="text-sm gap-2" onClick={() => {
                      const f = facilityList.find(f => f.id === selectedFacilityIds[0])
                      setSelectedFacilityIds([])
                      if (f) openEditFacility(f)
                    }}>
                      <Pencil className="size-3.5" />Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-sm gap-2 text-destructive focus:text-destructive" onClick={() => deleteFacilities(selectedFacilityIds)}>
                    <Trash2 className="size-3.5" />Delete
                  </DropdownMenuItem>
                </BulkBar>
                <div className="overflow-auto rounded-xl border border-border">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-muted/40">
                      <tr className="border-b border-border">
                        <th className="w-10 px-3 py-3"><Checkbox checked={allFacilitiesSelected} data-state={someFacilitiesSelected ? 'indeterminate' : undefined} onCheckedChange={v => toggleAllFacilities(!!v)} aria-label="Select all facilities" /></th>
                        <th className="text-left px-3 py-3 table-header-cell whitespace-nowrap">Facility</th>
                        <th className="text-left px-3 py-3 table-header-cell whitespace-nowrap">Type</th>
                        <th className="text-left px-3 py-3 table-header-cell whitespace-nowrap">Location</th>
                        <th className="text-left px-3 py-3 table-header-cell whitespace-nowrap">Departments</th>
                        <th className="text-left px-3 py-3 table-header-cell whitespace-nowrap">Specialties</th>
                        <th className="text-left px-3 py-3 table-header-cell whitespace-nowrap">Manager</th>
                        <th className="w-20" />
                      </tr>
                    </thead>
                    <tbody>
                      {facilityList.map(f => (
                        <tr key={f.id} className="group border-b border-border/60 last:border-0 hover:bg-muted/20" style={{ height: 52 }}>
                          <td className="px-3 py-2"><Checkbox checked={selectedFacilityIds.includes(f.id)} onCheckedChange={() => toggleFacilitySelect(f.id)} aria-label={`Select ${f.name}`} /></td>
                          <td className="px-3 py-2 table-cell-primary">{f.name}</td>
                          <td className="px-3 py-2"><Chip label={f.type} className="bg-muted text-muted-foreground border-border" /></td>
                          <td className="px-3 py-2 table-cell-secondary">{[f.city, f.state].filter(Boolean).join(', ') || '—'}</td>
                          <td className="px-3 py-2 table-cell-secondary">{f.departments.length ? f.departments.join(', ') : '—'}</td>
                          <td className="px-3 py-2 table-cell-secondary">{f.specialties.length ? f.specialties.join(', ') : '—'}</td>
                          <td className="px-3 py-2 table-cell-secondary">{f.facilityManager || '—'}</td>
                          <td className="px-3 py-2">
                            <RowActions>
                              <RowActionButton title="Edit" onClick={() => openEditFacility(f)}><Pencil className="size-3.5 text-muted-foreground" /></RowActionButton>
                              <RowActionButton title="Delete" onClick={() => deleteFacilities([f.id])}><Trash2 className="size-3.5 text-muted-foreground" /></RowActionButton>
                            </RowActions>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="px-6 py-6">
            {docList.length === 0 ? (
              <EmptyTab icon={Upload} title="No documents yet" description="Contracts, agreements, and other files for this client will show up here." actionLabel="Upload document" onAction={openUploadDocument} />
            ) : (
              <>
                <div className="flex items-center justify-between mb-2.5 gap-2">
                  <BulkBar count={selectedDocIds.length}>
                    {selectedDocIds.length === 1 && (
                      <DropdownMenuItem className="text-sm gap-2" onClick={() => {
                        const d = docList.find(d => d.id === selectedDocIds[0])
                        setSelectedDocIds([])
                        if (d) openReplaceDocument(d)
                      }}>
                        <Upload className="size-3.5" />Change document
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-sm gap-2 text-destructive focus:text-destructive" onClick={() => deleteDocuments(selectedDocIds)}>
                      <Trash2 className="size-3.5" />Delete
                    </DropdownMenuItem>
                  </BulkBar>
                  <button type="button" onClick={openUploadDocument} className="h-8 px-3 text-sm font-medium rounded-lg bg-brand hover:bg-brand/90 text-white flex items-center gap-1.5 shrink-0">
                    <Upload className="size-3.5" />Upload document
                  </button>
                </div>
                <div className="overflow-auto rounded-xl border border-border">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-muted/40">
                      <tr className="border-b border-border">
                        <th className="w-10 px-3 py-3"><Checkbox checked={allDocsSelected} data-state={someDocsSelected ? 'indeterminate' : undefined} onCheckedChange={v => toggleAllDocs(!!v)} aria-label="Select all documents" /></th>
                        <th className="text-left px-3 py-3 table-header-cell whitespace-nowrap">Name</th>
                        <th className="text-left px-3 py-3 table-header-cell whitespace-nowrap">Category</th>
                        <th className="text-left px-3 py-3 table-header-cell whitespace-nowrap">Size</th>
                        <th className="text-left px-3 py-3 table-header-cell whitespace-nowrap">Uploaded</th>
                        <th className="text-left px-3 py-3 table-header-cell whitespace-nowrap">Uploaded by</th>
                        <th className="w-28" />
                      </tr>
                    </thead>
                    <tbody>
                      {docList.map(d => (
                        <tr key={d.id} className="group border-b border-border/60 last:border-0 hover:bg-muted/20" style={{ height: 52 }}>
                          <td className="px-3 py-2"><Checkbox checked={selectedDocIds.includes(d.id)} onCheckedChange={() => toggleDocSelect(d.id)} aria-label={`Select ${d.name}`} /></td>
                          <td className="px-3 py-2">
                            <span className="flex items-center gap-2 table-cell-primary"><FileText className="size-4 text-muted-foreground shrink-0" />{d.name}</span>
                          </td>
                          <td className="px-3 py-2"><Chip label={d.category} className="bg-muted text-muted-foreground border-border" /></td>
                          <td className="px-3 py-2 table-cell-secondary">{formatSize(d.size)}</td>
                          <td className="px-3 py-2 table-cell-secondary">{relTime(d.uploadedAt)}</td>
                          <td className="px-3 py-2 table-cell-secondary">{d.uploaderName || '—'}</td>
                          <td className="px-3 py-2">
                            <RowActions>
                              <RowActionButton title="View" onClick={() => viewDocument(d)}><Eye className="size-3.5 text-muted-foreground" /></RowActionButton>
                              <RowActionButton title="Change document" onClick={() => openReplaceDocument(d)}><Upload className="size-3.5 text-muted-foreground" /></RowActionButton>
                              <RowActionButton title="Delete" onClick={() => deleteDocuments([d.id])}><Trash2 className="size-3.5 text-muted-foreground" /></RowActionButton>
                            </RowActions>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
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
          <div className="px-6 py-6">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <FieldSelect value={filterActor} onChange={e => setFilterActor(e.target.value)} className="w-44">
                <option value="__all__">All users</option>
                {distinctActors.map(a => <option key={a} value={a}>{a}</option>)}
              </FieldSelect>
              <FieldInput type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} className="w-40" />
              <span className="text-sm text-muted-foreground">to</span>
              <FieldInput type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} className="w-40" />
              {(filterActor !== '__all__' || filterFrom || filterTo) && (
                <button type="button" onClick={() => { setFilterActor('__all__'); setFilterFrom(''); setFilterTo('') }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Clear filters
                </button>
              )}
            </div>
            {filteredActivity.length === 0 ? (
              <EmptyTab icon={Briefcase} title="No activity yet" description="Calls, emails, meetings, and updates for this client will show up here." />
            ) : (
              <SimpleTable
                headers={['Actor', 'Action', 'Time']}
                rows={filteredActivity.map(a => [
                  <div key="a" className="flex items-center gap-2.5 font-medium">
                    <Avatar className="size-7 shrink-0"><AvatarFallback className="text-xs font-bold bg-brand-muted text-brand">{toInitials(a.actor)}</AvatarFallback></Avatar>
                    {a.actor}
                  </div>,
                  a.action,
                  relTime(a.time),
                ])}
              />
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="px-6 py-6">
            <div className="flex justify-end mb-3 gap-2">
              <ManageMenu count={selectedNoteIds.length}>
                {selectedNoteIds.length === 1 && (
                  <DropdownMenuItem className="text-sm gap-2" onClick={() => {
                    const n = notesList.find(n => n.id === selectedNoteIds[0])
                    setSelectedNoteIds([])
                    if (n) openEditNote(n)
                  }}>
                    <Pencil className="size-3.5" />Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-sm gap-2 text-destructive focus:text-destructive" onClick={deleteSelectedNotes}>
                  <Trash2 className="size-3.5" />Delete
                </DropdownMenuItem>
              </ManageMenu>
              {notesList.length > 0 && (
                <button type="button" onClick={openAddNote} className="h-8 px-3 text-sm font-medium rounded-lg bg-brand hover:bg-brand/90 text-white flex items-center gap-1.5">
                  <Plus className="size-3.5" />Add note
                </button>
              )}
            </div>
            {notesList.length === 0 ? (
              <EmptyTab icon={FileText} title="No notes yet" description="Add notes about this client so the team stays in sync." actionLabel="Add note" onAction={openAddNote} />
            ) : (
              <SimpleTable
                headers={['', 'Note', 'Created by', 'Created on']}
                rows={notesList.map(n => [
                  <input key="cb" type="checkbox" checked={selectedNoteIds.includes(n.id)} onChange={() => toggleNoteSelect(n.id)} className="size-4" />,
                  <span key="t" className="text-foreground">{n.text}</span>,
                  <div key="a" className="flex items-center gap-2.5 font-medium shrink-0">
                    <Avatar className="size-7 shrink-0"><AvatarFallback className="text-xs font-bold bg-brand-muted text-brand">{toInitials(n.author)}</AvatarFallback></Avatar>
                    {n.author}
                  </div>,
                  <span key="ti" className="whitespace-nowrap">{relTime(n.time)}</span>,
                ])}
              />
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
              <FieldInput value={tAccountManager} onChange={e => setTAccountManager(e.target.value)} placeholder="Comma-separated, e.g. Arun Kumar, Sarah M." />
            </div>
            <div>
              <FieldLabel>Recruitment manager</FieldLabel>
              <FieldInput value={tRecruitmentManager} onChange={e => setTRecruitmentManager(e.target.value)} placeholder="Comma-separated, e.g. Sarah M., Emily T." />
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

      {/* Add / edit facility drawer */}
      <Sheet open={facilityDrawerOpen} onOpenChange={setFacilityDrawerOpen}>
        <SheetContent className="w-[420px] sm:max-w-[420px]">
          <SheetHeader><SheetTitle>{editingFacilityId ? 'Edit facility' : 'Add facility'}</SheetTitle></SheetHeader>
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
              <button type="submit" className="h-9 px-4 text-sm rounded-lg bg-brand hover:bg-brand/90 text-white">{editingFacilityId ? 'Save facility' : 'Add facility'}</button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Upload / replace document drawer */}
      <Sheet open={docDrawerOpen} onOpenChange={setDocDrawerOpen}>
        <SheetContent className="w-[420px] sm:max-w-[420px]">
          <SheetHeader><SheetTitle>{docMode === 'replace' ? 'Change document' : 'Upload document'}</SheetTitle></SheetHeader>
          <form onSubmit={submitDocument} className="px-4 py-4 space-y-4 overflow-y-auto">
            {docMode === 'add' && (
              <div>
                <FieldLabel>Document type</FieldLabel>
                <FieldSelect value={docCategory} onChange={e => setDocCategory(e.target.value)}>
                  {DOCUMENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </FieldSelect>
              </div>
            )}
            <div>
              <FieldLabel>File</FieldLabel>
              <input type="file" onChange={e => setDocFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm file:mr-3 file:h-8 file:px-3 file:rounded-lg file:border-0 file:bg-brand file:text-white file:text-sm file:font-medium file:cursor-pointer" />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setDocDrawerOpen(false)} className="h-9 px-4 text-sm rounded-lg border border-border hover:bg-muted/60">Cancel</button>
              <button type="submit" className="h-9 px-4 text-sm rounded-lg bg-brand hover:bg-brand/90 text-white">{docMode === 'replace' ? 'Save' : 'Upload'}</button>
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

      {/* Add / edit note drawer */}
      <Sheet open={noteDrawerOpen} onOpenChange={setNoteDrawerOpen}>
        <SheetContent className="w-[420px] sm:max-w-[420px]">
          <SheetHeader><SheetTitle>{editingNoteId ? 'Edit note' : 'Add note'}</SheetTitle></SheetHeader>
          <form onSubmit={submitNote} className="px-4 py-4 space-y-4">
            <Textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Write a note about this client…" className="h-32 resize-none text-sm" required />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setNoteDrawerOpen(false)} className="h-9 px-4 text-sm rounded-lg border border-border hover:bg-muted/60">Cancel</button>
              <button type="submit" className="h-9 px-4 text-sm rounded-lg bg-brand hover:bg-brand/90 text-white">{editingNoteId ? 'Save' : 'Add note'}</button>
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
                <p className="text-sm font-medium">{selectedContact.title || '—'}</p>
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

      {/* Document preview drawer — signed URL, never a public link */}
      <Sheet open={!!docPreview} onOpenChange={open => !open && setDocPreview(null)}>
        <SheetContent className="w-[700px] sm:max-w-[700px] flex flex-col">
          <SheetHeader><SheetTitle className="truncate">{docPreview?.name}</SheetTitle></SheetHeader>
          {docPreview && (
            <iframe src={docPreview.url} title={docPreview.name} className="flex-1 w-full border-0 rounded-lg" />
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
            {headers.map((h, i) => <th key={h || `h${i}`} className="text-left px-3 py-3 table-header-cell whitespace-nowrap">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/60 last:border-0" style={{ height: 52 }}>
              {row.map((cell, j) => <td key={j} className="px-3 py-2 table-cell-secondary">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
