'use client'

import { useState, useRef, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowLeft, Pencil, MoreHorizontal, Send,
  Mail, Phone, Globe, Briefcase, FileText, Users,
  Upload, File, Trash2, Download, Maximize2, X,
  Sparkles, ArrowUpDown, SlidersHorizontal,
} from 'lucide-react'
import {
  deleteCandidateAction,
  addCandidateNoteAction, deleteCandidateNoteAction,
  uploadCandidateDocumentAction, deleteCandidateDocumentAction,
  uploadCandidateResumeAction,
} from '../actions'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CandidateDetailData {
  id: string
  candidate_number: number
  first_name: string | null; last_name: string | null
  email: string; phone: string | null; location: string | null
  linkedin_url: string | null; source: string | null
  current_title: string | null; current_company: string | null
  candidate_type: string | null; notice_period: string | null
  current_ctc: number | null; expected_ctc: number | null
  notes: string | null
  resume_url: string | null
  created_at: string; updated_at: string
}

export type NoteRow     = { id: string; author: string; initials: string; text: string; time: string }
export type DocRow      = { id: string; name: string; size: string; type: string; docType: string; uploadedAt: string; storagePath: string | null }
export type ActivityRow = { id: string; actor: string; action: string; time: string }
export type JobRow      = { submissionId: string; stage: string; submittedAt: string; jobId: string; title: string; client: string | null; status: string; location: string | null }

const TYPE_LABEL: Record<string, string> = {
  permanent: 'Citizen / PR', contract: 'Work Visa', temp: 'Temp / OPT', unknown: 'Unknown',
}
const SOURCE_LABEL: Record<string, string> = {
  linkedin: 'LinkedIn', referral: 'Referral', inbound: 'Inbound',
  naukri: 'Naukri', indeed: 'Indeed', import: 'Import', other: 'Other',
}
const STAGE_LABEL: Record<string, string> = {
  sourced: 'Sourced', qualified: 'Qualified', submitted: 'Submitted',
  interview: 'Interview', offer: 'Offer', start: 'Started',
}
const STATUS_DOT: Record<string, string> = {
  open: 'bg-emerald-500', on_hold: 'bg-amber-500', filled: 'bg-blue-500', closed: 'bg-zinc-400',
}

function fmt(val: number | null) {
  if (!val) return null
  if (val >= 100_000) return `₹${(val / 100_000).toFixed(1)}L`
  if (val >= 1_000) return `₹${(val / 1_000).toFixed(0)}K`
  return `₹${val}`
}

// ── Notes tab ─────────────────────────────────────────────────────────────────

function NotesTab({ candidateId, notes, setNotes }: {
  candidateId: string
  notes: NoteRow[]
  setNotes: React.Dispatch<React.SetStateAction<NoteRow[]>>
}) {
  const [text, setText] = useState('')
  const [byFilter, setByFilter] = useState('')

  const authors = [...new Set(notes.map(n => n.author))]
  const visible  = byFilter ? notes.filter(n => n.author === byFilter) : notes

  async function addNote() {
    if (!text.trim()) return
    const draft = text.trim()
    const tempId = `temp_${Date.now()}`
    setNotes(prev => [{ id: tempId, author: 'You', initials: 'ME', text: draft, time: 'Just now' }, ...prev])
    setText('')
    const res = await addCandidateNoteAction(candidateId, draft)
    if ('error' in res) {
      setNotes(prev => prev.filter(n => n.id !== tempId))
    } else {
      const initials = res.author_name.split(' ').map((w: string) => w[0] ?? '').join('').toUpperCase().slice(0, 2) || 'ME'
      setNotes(prev => prev.map(n => n.id === tempId ? { ...n, id: res.id, author: res.author_name, initials } : n))
    }
  }

  async function deleteNote(noteId: string) {
    setNotes(prev => prev.filter(n => n.id !== noteId))
    await deleteCandidateNoteAction(noteId)
  }

  return (
    <div className="flex h-full divide-x divide-border">
      <div className="w-1/2 flex flex-col overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-2.5 border-b shrink-0 bg-muted/10">
          <Select value="__all__" onValueChange={() => {}}>
            <SelectTrigger className="h-9 text-sm w-36"><SelectValue placeholder="Date" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Date</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
            </SelectContent>
          </Select>
          <Select value={byFilter || '__all__'} onValueChange={v => setByFilter(v === '__all__' ? '' : v)}>
            <SelectTrigger className="h-9 text-sm w-40"><SelectValue placeholder="Added By" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Added By</SelectItem>
              {authors.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          {byFilter && <button onClick={() => setByFilter('')} className="text-sm text-brand hover:underline">Clear</button>}
        </div>
        <div className="flex-1 overflow-auto px-5 py-4 space-y-3">
          {visible.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-10">No notes yet</p>
          )}
          {visible.map(n => (
            <div key={n.id} className="border border-border rounded-lg p-4 group">
              <div className="flex items-center gap-2.5 mb-2.5">
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs font-bold bg-brand-muted text-brand">{n.initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold text-foreground">{n.author}</span>
                <span className="text-xs text-muted-foreground ml-auto">{n.time}</span>
                <button onClick={() => deleteNote(n.id)}
                  className="size-6 flex items-center justify-center text-muted-foreground hover:text-destructive rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{n.text}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="w-1/2 px-6 py-6">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Add Note</p>
        <div className="border border-border rounded-lg overflow-hidden">
          <Textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write a note about this candidate…"
            className="h-36 resize-none border-0 rounded-none shadow-none focus-visible:ring-0 text-sm px-4 py-3"
          />
          <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/20">
            <span className="text-sm text-muted-foreground">Visible to all team members</span>
            <Button onClick={addNote} disabled={!text.trim()} size="sm"
              className="h-8 text-sm bg-brand hover:bg-brand/90 text-white border-0 disabled:opacity-40">
              Post Note
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Documents tab ─────────────────────────────────────────────────────────────

function DocumentsTab({ candidateId, docs, setDocs }: {
  candidateId: string
  docs: DocRow[]
  setDocs: React.Dispatch<React.SetStateAction<DocRow[]>>
}) {
  const [typeFilter, setTypeFilter] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    for (const f of files) {
      const tempId = `temp_${Date.now()}_${Math.random()}`
      const size = f.size > 1024 * 1024 ? `${(f.size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`
      setDocs(prev => [{
        id: tempId, name: f.name, size,
        type: f.name.split('.').pop() ?? 'file',
        docType: 'other',
        storagePath: null,
        uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      }, ...prev])
      const fd = new FormData(); fd.append('file', f)
      const res = await uploadCandidateDocumentAction(candidateId, fd)
      if ('error' in res) {
        setDocs(prev => prev.filter(d => d.id !== tempId))
      } else {
        setDocs(prev => prev.map(d => d.id === tempId ? { ...d, id: res.id } : d))
      }
    }
  }

  async function deleteDoc(docId: string) {
    setDocs(prev => prev.filter(d => d.id !== docId))
    await deleteCandidateDocumentAction(docId)
  }

  const iconColor: Record<string, string> = {
    pdf: 'text-red-500', doc: 'text-blue-500', docx: 'text-blue-500',
    xls: 'text-emerald-500', xlsx: 'text-emerald-500',
  }
  const types   = [...new Set(docs.map(d => d.type))]
  const visible = typeFilter ? docs.filter(d => d.type === typeFilter) : docs

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-6 py-2.5 border-b shrink-0 bg-muted/10">
        <Button size="sm" onClick={() => inputRef.current?.click()}
          className="h-9 gap-1.5 text-sm bg-brand hover:bg-brand/90 text-white border-0">
          <Upload className="size-3.5" />Add Document
        </Button>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
        <Select value="__all__" onValueChange={() => {}}>
          <SelectTrigger className="h-9 text-sm w-36"><SelectValue placeholder="Date" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Date</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This week</SelectItem>
            <SelectItem value="month">This month</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter || '__all__'} onValueChange={v => setTypeFilter(v === '__all__' ? '' : v)}>
          <SelectTrigger className="h-9 text-sm w-40"><SelectValue placeholder="Document Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Document Type</SelectItem>
            {types.map(t => <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>)}
          </SelectContent>
        </Select>
        {typeFilter && <button onClick={() => setTypeFilter('')} className="text-sm text-brand hover:underline">Clear</button>}
      </div>
      <div className="flex-1 overflow-auto">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-center">
            <File className="size-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No documents yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {visible.map(doc => (
              <div key={doc.id} className="flex items-center gap-3.5 px-6 py-3 group hover:bg-muted/20 transition-colors">
                <div className={`shrink-0 ${iconColor[doc.type] ?? 'text-muted-foreground'}`}>
                  <File className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.size} · {doc.uploadedAt}</p>
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-sm border border-border px-2.5 py-1 rounded-md hover:bg-muted transition-colors">Download</button>
                  <button onClick={() => deleteDoc(doc.id)}
                    className="size-7 flex items-center justify-center text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10 transition-colors">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Jobs tab ──────────────────────────────────────────────────────────────────

function JobsTab({ jobs }: { jobs: JobRow[] }) {
  const [stageFilter, setStageFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')

  const stages  = [...new Set(jobs.map(j => j.stage))]
  const statuses = [...new Set(jobs.map(j => j.status))]

  const visible = jobs
    .filter(j => (!stageFilter || j.stage === stageFilter) && (!statusFilter || j.status === statusFilter))
    .sort((a, b) => {
      const d = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
      return sortDir === 'desc' ? -d : d
    })

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 py-2.5 border-b shrink-0 bg-muted/10">
        <Button size="sm" className="h-9 gap-1.5 text-sm bg-brand hover:bg-brand/90 text-white border-0">
          <Sparkles className="size-3.5" />AI Candidate Match
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Select value={stageFilter || '__all__'} onValueChange={v => setStageFilter(v === '__all__' ? '' : v)}>
          <SelectTrigger className="h-9 text-sm w-36"><SelectValue placeholder="Stage" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Stages</SelectItem>
            {stages.map(s => <SelectItem key={s} value={s}>{STAGE_LABEL[s] ?? s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter || '__all__'} onValueChange={v => setStatusFilter(v === '__all__' ? '' : v)}>
          <SelectTrigger className="h-9 text-sm w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Statuses</SelectItem>
            {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <button
          onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
          className="h-9 flex items-center gap-2 px-3 rounded-md border border-border text-sm text-foreground hover:bg-muted transition-colors"
        >
          <ArrowUpDown className="size-3.5" />
          {sortDir === 'desc' ? 'Newest first' : 'Oldest first'}
        </button>
        {(stageFilter || statusFilter) && (
          <button onClick={() => { setStageFilter(''); setStatusFilter('') }} className="text-sm text-brand hover:underline">Clear</button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center">
              <Briefcase className="size-4 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No job submissions yet</p>
            <p className="text-sm text-muted-foreground">Jobs this candidate has been submitted to will appear here.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-muted/60 backdrop-blur-sm border-b border-border">
              <tr>
                {['Job Title', 'Client', 'Location', 'Stage', 'Status', 'Submitted', ''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-5 h-9 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visible.map(j => (
                <tr key={j.submissionId} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-5 py-2.5">
                    <Link href={`/dashboard/jobs/${j.jobId}`} className="text-sm font-medium hover:text-brand transition-colors">
                      {j.title}
                    </Link>
                  </td>
                  <td className="px-5 py-2.5"><span className="text-sm text-muted-foreground">{j.client ?? '—'}</span></td>
                  <td className="px-5 py-2.5"><span className="text-sm text-muted-foreground">{j.location ?? '—'}</span></td>
                  <td className="px-5 py-2.5">
                    <span className="text-xs bg-muted text-foreground px-2.5 py-1 rounded-md">
                      {STAGE_LABEL[j.stage] ?? j.stage}
                    </span>
                  </td>
                  <td className="px-5 py-2.5">
                    <span className="flex items-center gap-1.5 text-sm text-foreground">
                      <span className={`size-1.5 rounded-full ${STATUS_DOT[j.status] ?? 'bg-zinc-400'}`} />
                      {j.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-2.5"><span className="text-sm text-muted-foreground">{j.submittedAt}</span></td>
                  <td className="px-5 py-2.5">
                    <Link href={`/dashboard/jobs/${j.jobId}`}
                      className="text-sm border border-border px-2.5 py-1 rounded-md hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ── Resume section ────────────────────────────────────────────────────────────

function ResumeSection({ candidateId, initialUrl }: { candidateId: string; initialUrl: string | null }) {
  const [resumeUrl, setResumeUrl] = useState<string | null>(initialUrl)
  const [resumeName, setResumeName] = useState<string | null>(
    initialUrl ? initialUrl.split('/').pop()?.split('?')[0] ?? 'Resume' : null
  )
  const [previewOpen, setPreviewOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    const res = await uploadCandidateResumeAction(candidateId, fd)
    setUploading(false)
    if ('success' in res) {
      setResumeUrl(res.resumeUrl ?? null)
      setResumeName(res.resumeName ?? null)
    }
  }

  if (!resumeUrl) {
    return (
      <div className="border-2 border-dashed border-border rounded-lg py-14 flex flex-col items-center gap-3 text-center">
        <FileText className="size-8 text-muted-foreground/30" />
        <p className="text-sm font-medium text-foreground">No resume uploaded</p>
        <p className="text-sm text-muted-foreground">Supports PDF and Word documents</p>
        <Button variant="outline" size="sm" disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="mt-1 text-brand border-brand hover:bg-brand-muted gap-1.5">
          <Upload className="size-3.5" />{uploading ? 'Uploading…' : 'Upload Resume'}
        </Button>
        <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleUpload} />
      </div>
    )
  }

  return (
    <>
      <div className="border border-border rounded-lg p-4 flex items-center gap-3.5">
        <div className="text-red-500 shrink-0">
          <FileText className="size-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{resumeName ?? 'Resume'}</p>
          <p className="text-sm text-muted-foreground">Resume</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setPreviewOpen(true)}
            title="Preview"
            className="size-8 flex items-center justify-center border border-border rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Maximize2 className="size-3.5" />
          </button>
          <a href={resumeUrl} download target="_blank" rel="noopener noreferrer"
            className="size-8 flex items-center justify-center border border-border rounded-md text-muted-foreground hover:text-brand hover:border-brand transition-colors"
            title="Download">
            <Download className="size-3.5" />
          </a>
          <Button variant="outline" size="sm" disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="h-8 text-sm gap-1 text-muted-foreground">
            <Upload className="size-3" />{uploading ? 'Uploading…' : 'Replace'}
          </Button>
        </div>
        <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleUpload} />
      </div>

      {/* Preview modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setPreviewOpen(false)}>
          <div className="bg-background rounded-xl shadow-2xl flex flex-col overflow-hidden"
            style={{ width: '80vw', height: '85vh' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b shrink-0">
              <p className="text-sm font-semibold truncate">{resumeName ?? 'Resume'}</p>
              <div className="flex items-center gap-2">
                <a href={resumeUrl} download target="_blank" rel="noopener noreferrer"
                  className="h-8 flex items-center gap-1.5 px-3 border border-border rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <Download className="size-3.5" />Download
                </a>
                <button onClick={() => setPreviewOpen(false)}
                  className="size-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <X className="size-4" />
                </button>
              </div>
            </div>
            <iframe src={resumeUrl} className="flex-1 w-full border-0" title="Resume preview" />
          </div>
        </div>
      )}
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function CandidateDetailClient({ candidate, initialNotes, initialDocs, initialActivity, initialJobs }: {
  candidate: CandidateDetailData
  initialNotes: NoteRow[]
  initialDocs: DocRow[]
  initialActivity: ActivityRow[]
  initialJobs: JobRow[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'notes' | 'documents' | 'activity'>('overview')
  const [notes, setNotes]   = useState<NoteRow[]>(initialNotes)
  const [docs, setDocs]     = useState<DocRow[]>(initialDocs)

  const name     = [candidate.first_name, candidate.last_name].filter(Boolean).join(' ') || 'Unnamed'
  const initials = [candidate.first_name?.[0], candidate.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?'

  function handleDelete() {
    if (!confirm('Delete this candidate? This cannot be undone.')) return
    startTransition(async () => { await deleteCandidateAction(candidate.id) })
  }

  const infoRows: { label: string; value: string | null; href?: string }[] = [
    { label: 'Email',        value: candidate.email,         href: `mailto:${candidate.email}` },
    { label: 'Phone',        value: candidate.phone,         ...(candidate.phone ? { href: `tel:${candidate.phone}` } : {}) },
    { label: 'LinkedIn',     value: candidate.linkedin_url ? 'View profile' : null, ...(candidate.linkedin_url ? { href: candidate.linkedin_url } : {}) },
    { label: 'Location',     value: candidate.location },
    { label: 'Source',       value: candidate.source ? (SOURCE_LABEL[candidate.source] ?? candidate.source) : null },
    { label: 'Type',         value: candidate.candidate_type ? (TYPE_LABEL[candidate.candidate_type] ?? null) : null },
    { label: 'Notice',       value: candidate.notice_period },
    { label: 'Current CTC',  value: fmt(candidate.current_ctc) },
    { label: 'Expected CTC', value: fmt(candidate.expected_ctc) },
  ].filter(r => r.value)

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 h-14 border-b bg-background shrink-0">
        <Link href="/dashboard/candidates"
          className="size-8 flex items-center justify-center border border-border rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0">
          <ArrowLeft className="size-4" />
        </Link>
        <Avatar className="size-8 shrink-0">
          <AvatarFallback className="text-xs font-semibold bg-brand-muted text-brand">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h1 className="text-base font-semibold truncate">{name}</h1>
          <span className="shrink-0 text-xs text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-md">
            CAN-{String(candidate.candidate_number).padStart(4, '0')}
          </span>
          {candidate.current_title && (
            <span className="shrink-0 text-xs text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-md">
              {candidate.current_title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {candidate.email && (
            <a href={`mailto:${candidate.email}`}
              className="size-9 flex items-center justify-center border border-border rounded-md text-muted-foreground hover:text-brand hover:border-brand hover:bg-brand-muted transition-colors"
              title={candidate.email}>
              <Mail className="size-4" />
            </a>
          )}
          {candidate.phone && (
            <a href={`tel:${candidate.phone}`}
              className="size-9 flex items-center justify-center border border-border rounded-md text-muted-foreground hover:text-brand hover:border-brand hover:bg-brand-muted transition-colors"
              title={candidate.phone}>
              <Phone className="size-4" />
            </a>
          )}
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm" asChild>
            <Link href={`/dashboard/candidates/${candidate.id}/edit`}>
              <Pencil className="size-3.5" />Edit
            </Link>
          </Button>
          <Button size="sm" className="h-9 gap-1.5 text-sm bg-brand hover:bg-brand/90 text-white border-0">
            <Send className="size-3.5" />Submit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {candidate.linkedin_url && (
                <DropdownMenuItem asChild>
                  <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="gap-2">
                    <Globe className="size-4" />LinkedIn
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-sm gap-2 text-destructive focus:text-destructive">
                Delete Candidate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Meta bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-5 h-12 border-b bg-muted/15 shrink-0 overflow-x-auto">
        {[candidate.email, candidate.phone, candidate.location,
            candidate.candidate_type ? TYPE_LABEL[candidate.candidate_type] : null]
          .filter(Boolean).map((text, i) => (
            <span key={i} className="shrink-0 text-xs font-medium text-foreground bg-muted border border-border rounded-full px-3 py-1 whitespace-nowrap">
              {text as string}
            </span>
          ))}
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* Tab bar */}
        <div className="border-b shrink-0 px-5 flex">
          {([
            { id: 'overview',  label: 'Overview'  },
            { id: 'jobs',      label: 'Jobs'       },
            { id: 'notes',     label: `Notes${notes.length > 0 ? ` (${notes.length})` : ''}` },
            { id: 'documents', label: 'Documents'  },
            { id: 'activity',  label: 'Activity'   },
          ] as const).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`h-11 px-4 text-sm font-medium -mb-px border-b-2 transition-colors whitespace-nowrap ${
                activeTab === id
                  ? 'border-brand text-brand'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Overview ─────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="flex-1 overflow-auto">
            <div className="flex h-full divide-x divide-border">
              <div className="w-[70%] px-6 py-6 overflow-auto">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Resume</p>
                <ResumeSection candidateId={candidate.id} initialUrl={candidate.resume_url} />
              </div>
              <div className="w-[30%] px-5 py-6 overflow-auto">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Candidate Info</p>
                <div className="space-y-3.5">
                  {infoRows.map(({ label, value, href }) => (
                    <div key={label} className="flex items-start gap-3">
                      <span className="text-sm text-muted-foreground w-28 shrink-0 leading-5">{label}</span>
                      {href ? (
                        <a href={href} target={href.startsWith('http') ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          className="text-sm font-medium leading-5 text-brand hover:underline truncate">
                          {value}
                        </a>
                      ) : (
                        <span className="text-sm font-medium leading-5 text-foreground">{value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Jobs ─────────────────────────────────────────────────────── */}
        {activeTab === 'jobs' && (
          <div className="flex-1 overflow-hidden">
            <JobsTab jobs={initialJobs} />
          </div>
        )}

        {/* ── Notes ────────────────────────────────────────────────────── */}
        {activeTab === 'notes' && (
          <div className="flex-1 overflow-hidden">
            <NotesTab candidateId={candidate.id} notes={notes} setNotes={setNotes} />
          </div>
        )}

        {/* ── Documents ────────────────────────────────────────────────── */}
        {activeTab === 'documents' && (
          <div className="flex-1 overflow-hidden">
            <DocumentsTab candidateId={candidate.id} docs={docs} setDocs={setDocs} />
          </div>
        )}

        {/* ── Activity ─────────────────────────────────────────────────── */}
        {activeTab === 'activity' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2.5 px-6 py-2.5 border-b shrink-0 bg-muted/10">
              <Select value="__all__" onValueChange={() => {}}>
                <SelectTrigger className="h-9 text-sm w-36"><SelectValue placeholder="Date" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Date</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 overflow-auto px-6 py-6">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">Activity Log</p>
              {initialActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Users className="size-7 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No activity yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {initialActivity.map(a => (
                    <div key={a.id} className="flex gap-3">
                      <Avatar className="size-7 shrink-0 mt-0.5">
                        <AvatarFallback className="text-xs font-bold bg-muted text-muted-foreground">
                          {a.actor.split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2) || '??'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm"><span className="font-medium">{a.actor}</span> {a.action}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
