'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowLeft, Pencil, MoreHorizontal, ChevronRight,
  Mail, Phone, Globe, Briefcase, FileText, Users,
} from 'lucide-react'
import { deleteCandidateAction } from '../actions'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CandidateDetailData {
  id: string
  first_name: string | null; last_name: string | null
  email: string; phone: string | null; location: string | null
  linkedin_url: string | null; source: string | null
  current_title: string | null; current_company: string | null
  candidate_type: string | null; notice_period: string | null
  current_ctc: number | null; expected_ctc: number | null
  notes: string | null
  created_at: string; updated_at: string
}

const TYPE_LABEL: Record<string, string> = {
  permanent: 'Citizen / PR', contract: 'Work Visa', temp: 'Temp / OPT', unknown: 'Unknown',
}
const SOURCE_LABEL: Record<string, string> = {
  linkedin: 'LinkedIn', referral: 'Referral', inbound: 'Inbound',
  naukri: 'Naukri', indeed: 'Indeed', import: 'Import', other: 'Other',
}

function fmt(val: number | null) {
  if (!val) return null
  if (val >= 100_000) return `₹${(val / 100_000).toFixed(1)}L`
  if (val >= 1_000) return `₹${(val / 1_000).toFixed(0)}K`
  return `₹${val}`
}
function relTime(iso: string) {
  const d = Date.now() - new Date(iso).getTime()
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h ago`
  if (d < 7 * 86_400_000) return `${Math.floor(d / 86_400_000)}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
}

// ── Right sidebar ─────────────────────────────────────────────────────────────

function CandidateInfoSidebar({ c, open, onToggle }: {
  c: CandidateDetailData; open: boolean; onToggle: () => void
}) {
  const rows: { label: string; value: string | null; href?: string }[] = [
    { label: 'Email',       value: c.email,         href: `mailto:${c.email}` },
    { label: 'Phone',       value: c.phone,         ...(c.phone ? { href: `tel:${c.phone}` } : {}) },
    { label: 'LinkedIn',    value: c.linkedin_url ? 'View profile' : null, ...(c.linkedin_url ? { href: c.linkedin_url } : {}) },
    { label: 'Location',    value: c.location },
    { label: 'Source',      value: c.source ? (SOURCE_LABEL[c.source] ?? c.source) : null },
    { label: 'Type',        value: c.candidate_type ? (TYPE_LABEL[c.candidate_type] ?? null) : null },
    { label: 'Notice',      value: c.notice_period },
    { label: 'Current CTC', value: fmt(c.current_ctc) },
    { label: 'Expected CTC',value: fmt(c.expected_ctc) },
    { label: 'Added',       value: relTime(c.created_at) },
  ].filter(r => r.value)

  return (
    <div
      className="border-l bg-background flex flex-col transition-[width] duration-300 ease-in-out overflow-hidden shrink-0"
      style={{ width: open ? '280px' : '0px' }}
    >
      {open && (
        <>
          <div className="flex items-center justify-between px-5 h-11 border-b shrink-0">
            <span className="text-sm font-semibold">Candidate Info</span>
            <button onClick={onToggle} className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
              <ChevronRight className="size-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0 px-5 py-5 space-y-3">
            {rows.map(({ label, value, href }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="text-xs text-muted-foreground w-24 shrink-0 leading-5">{label}</span>
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
        </>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function CandidateDetailClient({ candidate }: { candidate: CandidateDetailData }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'notes' | 'documents' | 'activity'>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const name     = [candidate.first_name, candidate.last_name].filter(Boolean).join(' ') || 'Unnamed'
  const initials = [candidate.first_name?.[0], candidate.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?'
  const ageDays  = Math.floor((Date.now() - new Date(candidate.created_at).getTime()) / 86_400_000)

  const chips = [
    candidate.current_title,
    candidate.current_company,
    candidate.location,
    candidate.candidate_type ? TYPE_LABEL[candidate.candidate_type] : null,
    candidate.notice_period ? `${candidate.notice_period} notice` : null,
  ].filter(Boolean) as string[]

  async function handleDelete() {
    if (!confirm('Delete this candidate? This cannot be undone.')) return
    await deleteCandidateAction(candidate.id)
    router.push('/dashboard/candidates')
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-5 h-14 border-b bg-background shrink-0">
        <Link href="/dashboard/candidates"
          className="size-8 flex items-center justify-center border border-border rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0">
          <ArrowLeft className="size-4" />
        </Link>
        <Avatar className="size-8 shrink-0">
          <AvatarFallback className="text-xs font-semibold bg-brand-muted text-brand">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h1 className="text-base font-semibold text-foreground truncate">{name}</h1>
          {candidate.current_title && (
            <span className="shrink-0 text-xs text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-md">
              {candidate.current_title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm" asChild>
            <Link href={`/dashboard/candidates/${candidate.id}/edit`}>
              <Pencil className="size-3.5" />Edit
            </Link>
          </Button>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            title={sidebarOpen ? 'Hide panel' : 'Show Candidate Info'}
            className={`size-9 flex items-center justify-center border rounded-md transition-colors ${
              sidebarOpen
                ? 'border-brand bg-brand-muted text-brand'
                : 'border-border text-muted-foreground hover:text-brand hover:border-brand hover:bg-brand-muted'
            }`}
          >
            <ChevronRight className="size-4" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {candidate.email && (
                <DropdownMenuItem asChild>
                  <a href={`mailto:${candidate.email}`} className="gap-2">
                    <Mail className="size-4" />Send Email
                  </a>
                </DropdownMenuItem>
              )}
              {candidate.phone && (
                <DropdownMenuItem asChild>
                  <a href={`tel:${candidate.phone}`} className="gap-2">
                    <Phone className="size-4" />Call
                  </a>
                </DropdownMenuItem>
              )}
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
        {[
          candidate.email,
          candidate.phone,
          ...chips,
          `${ageDays}d ago`,
        ].filter(Boolean).map((text, i) => (
          <span key={i} className="shrink-0 text-xs font-medium text-foreground bg-muted border border-border rounded-full px-3 py-1 whitespace-nowrap">
            {text as string}
          </span>
        ))}
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

          {/* Tab bar */}
          <div className="border-b shrink-0 px-5 flex">
            {([
              { id: 'overview',  label: 'Overview'  },
              { id: 'jobs',      label: 'Applied Jobs' },
              { id: 'notes',     label: 'Notes'     },
              { id: 'documents', label: 'Documents' },
              { id: 'activity',  label: 'Activity'  },
            ] as const).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
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

          {/* ── Overview ───────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="flex-1 overflow-auto">
              <div className="flex h-full divide-x divide-border">

                {/* Left 70% — notes / bio */}
                <div className="w-[70%] px-6 py-6 overflow-auto">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Internal Notes</p>
                  {candidate.notes ? (
                    <p className="text-sm text-foreground leading-7 whitespace-pre-wrap">{candidate.notes}</p>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-lg py-14 flex flex-col items-center gap-3 text-center">
                      <FileText className="size-8 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">No notes yet</p>
                      <Link href={`/dashboard/candidates/${candidate.id}/edit`} className="text-sm text-brand hover:underline">
                        Add notes →
                      </Link>
                    </div>
                  )}
                </div>

                {/* Right 30% — professional details */}
                <div className="w-[30%] px-5 py-6 space-y-5 overflow-auto">
                  {[
                    { label: 'Title',        value: candidate.current_title || '—'    },
                    { label: 'Company',      value: candidate.current_company || '—'  },
                    { label: 'Notice',       value: candidate.notice_period || '—'    },
                    { label: 'Current CTC',  value: fmt(candidate.current_ctc) || '—' },
                    { label: 'Expected CTC', value: fmt(candidate.expected_ctc) || '—'},
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
                      <p className="text-sm text-foreground leading-relaxed">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Applied Jobs ─────────────────────────────────────────── */}
          {activeTab === 'jobs' && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
              <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                <Briefcase className="size-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No active applications</p>
              <p className="text-sm text-muted-foreground">Job applications will appear here once linked.</p>
            </div>
          )}

          {/* ── Notes ────────────────────────────────────────────────── */}
          {activeTab === 'notes' && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
              <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                <FileText className="size-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No notes yet</p>
              <p className="text-sm text-muted-foreground">Candidate-level notes coming soon.</p>
            </div>
          )}

          {/* ── Documents ────────────────────────────────────────────── */}
          {activeTab === 'documents' && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
              <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                <FileText className="size-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No documents yet</p>
              <p className="text-sm text-muted-foreground">Resume and document uploads coming soon.</p>
            </div>
          )}

          {/* ── Activity ─────────────────────────────────────────────── */}
          {activeTab === 'activity' && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
              <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                <Users className="size-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No activity yet</p>
              <p className="text-sm text-muted-foreground">Activity log coming soon.</p>
            </div>
          )}

        </div>

        {/* Right sidebar */}
        <CandidateInfoSidebar c={candidate} open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />
      </div>
    </div>
  )
}
