'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Search, LayoutDashboard, Star, StarOff, Copy, Trash2,
  RotateCcw, Users, Lock, Globe, Pencil, Check, X, ArrowLeft,
  Clock, Sparkles, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useDashboardStore,
  DASHBOARD_TEMPLATES,
  type DashboardConfig,
} from '@/lib/stores/dashboard-store'
import { NewButtonModal } from '../_components/new-button-modal'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins  = Math.floor(diff / 60000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function VisIcon({ vis }: { vis: DashboardConfig['visibility'] }) {
  if (vis === 'organization') return <Globe className="size-3" />
  if (vis === 'team')         return <Users className="size-3" />
  return <Lock className="size-3" />
}

// ─── Inline rename ────────────────────────────────────────────────────────────

function RenameField({ current, onSave, onCancel }: { current: string; onSave:(v:string)=>void; onCancel:()=>void }) {
  const [val, setVal] = useState(current)
  return (
    <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
      <input
        autoFocus value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') onSave(val); if (e.key === 'Escape') onCancel() }}
        className="flex-1 h-7 px-2 text-sm rounded-lg border border-[#dd7456]/50 bg-background focus:outline-none min-w-0"
      />
      <button onClick={() => onSave(val)} className="p-1 rounded hover:bg-muted"><Check className="size-3.5 text-[#dd7456]" /></button>
      <button onClick={onCancel}          className="p-1 rounded hover:bg-muted"><X className="size-3.5" /></button>
    </div>
  )
}

// ─── Dashboard card ───────────────────────────────────────────────────────────

function DashCard({ dash, isActive, onActivate }: { dash: DashboardConfig; isActive: boolean; onActivate: () => void }) {
  const store    = useDashboardStore()
  const router   = useRouter()
  const [renaming, setRenaming] = useState(false)
  const [deleted,  setDeleted]  = useState(!!dash.deletedAt)

  const tmpl = DASHBOARD_TEMPLATES[dash.template]

  if (deleted) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-muted/20 opacity-60">
        <span className="text-2xl">{dash.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium line-through text-muted-foreground truncate">{dash.name}</p>
          <p className="text-xs text-muted-foreground">Deleted</p>
        </div>
        <button onClick={() => { store.restoreDashboard(dash.id); setDeleted(false) }}
          className="h-7 px-3 text-xs rounded-lg border border-border hover:bg-muted/60 transition-colors flex items-center gap-1.5">
          <RotateCcw className="size-3" /> Restore
        </button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-3 p-4 rounded-2xl border transition-all cursor-pointer',
        isActive
          ? 'border-[#dd7456]/40 bg-gradient-to-br from-[#fdf0ec] to-background dark:from-[#2a1a15] shadow-sm'
          : 'border-border hover:border-muted-foreground/30 hover:shadow-sm bg-background',
      )}
      onClick={onActivate}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="size-10 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={{ backgroundColor: dash.color + '20' }}>
            {dash.icon}
          </div>
          <div className="min-w-0">
            {renaming
              ? <RenameField current={dash.name}
                  onSave={v => { store.updateDashboard(dash.id, { name: v }); setRenaming(false) }}
                  onCancel={() => setRenaming(false)} />
              : <p className="text-sm font-semibold truncate">{dash.name}</p>
            }
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <VisIcon vis={dash.visibility} /> {dash.visibility}
              </span>
              {dash.isDefault && (
                <span className="inline-flex items-center gap-1 text-[10px] text-[#dd7456] font-medium">
                  <Star className="size-2.5" fill="currentColor" /> Default
                </span>
              )}
            </div>
          </div>
        </div>

        {isActive && (
          <span className="shrink-0 h-5 px-2 text-[10px] font-semibold rounded-full bg-[#dd7456] text-white flex items-center">Active</span>
        )}
      </div>

      {/* Template badge + stats */}
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="px-2 py-0.5 rounded-full bg-muted border border-border">{tmpl?.label ?? dash.template}</span>
        <span>{dash.widgets.filter(w => !w.hidden).length} sections</span>
        <span className="ml-auto flex items-center gap-1"><Clock className="size-3" />{timeAgo(dash.updatedAt)}</span>
      </div>

      {/* Actions — shown on hover */}
      <div className="flex items-center gap-1.5 pt-1 border-t border-border/60 opacity-0 group-hover:opacity-100 transition-opacity">
        {!dash.isDefault && (
          <button onClick={e => { e.stopPropagation(); store.setDefault(dash.id) }}
            className="flex-1 h-7 text-xs rounded-lg hover:bg-muted/60 flex items-center justify-center gap-1 transition-colors text-muted-foreground">
            <Star className="size-3" /> Set Default
          </button>
        )}
        <button onClick={e => { e.stopPropagation(); setRenaming(true) }}
          className="flex-1 h-7 text-xs rounded-lg hover:bg-muted/60 flex items-center justify-center gap-1 transition-colors text-muted-foreground">
          <Pencil className="size-3" /> Rename
        </button>
        <button onClick={e => { e.stopPropagation(); store.duplicateDashboard(dash.id); router.refresh() }}
          className="flex-1 h-7 text-xs rounded-lg hover:bg-muted/60 flex items-center justify-center gap-1 transition-colors text-muted-foreground">
          <Copy className="size-3" /> Duplicate
        </button>
        {!dash.isDefault && (
          <button onClick={e => { e.stopPropagation(); store.deleteDashboard(dash.id); setDeleted(true) }}
            className="h-7 w-7 rounded-lg hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors text-muted-foreground">
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ManageDashboardsPage() {
  const router    = useRouter()
  const store     = useDashboardStore()
  const [search,  setSearch]  = useState('')
  const [showNew, setShowNew] = useState(false)

  const live    = store.dashboards.filter(d => !d.deletedAt)
  const deleted = store.dashboards.filter(d =>  d.deletedAt)

  const filtered = live.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-6 py-6 max-w-4xl mx-auto space-y-6 pb-12">

        {/* Breadcrumb / back */}
        <button onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard Manager</h1>
            <p className="text-sm text-muted-foreground mt-1">Create, organize, and switch between your dashboards</p>
          </div>
          <button onClick={() => setShowNew(true)}
            className="h-9 px-4 text-sm rounded-lg bg-[#dd7456] text-white hover:bg-[#c9603d] transition-colors font-medium flex items-center gap-1.5 shrink-0">
            <Plus className="size-3.5" /> New Dashboard
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label:'Total Dashboards', value: live.length,                                  icon:'📊' },
            { label:'Active Right Now',  value: 1,                                            icon:'🎯' },
            { label:'Shared with Team',  value: live.filter(d => d.visibility !== 'private').length, icon:'👥' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="px-4 py-3 rounded-2xl border border-border bg-background">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search dashboards…"
            className="w-full h-10 pl-10 pr-4 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#dd7456]/30" />
        </div>

        {/* Active dashboards */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground text-sm">No dashboards found</p>
            <button onClick={() => setShowNew(true)}
              className="mt-3 h-8 px-4 text-xs rounded-lg border border-border hover:bg-muted/60 transition-colors">
              Create your first dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(d => (
              <DashCard key={d.id} dash={d}
                isActive={d.id === store.activeDashboardId}
                onActivate={() => { store.setActive(d.id); router.push('/dashboard') }} />
            ))}
          </div>
        )}

        {/* AI prompt */}
        <div className="flex items-center justify-between px-5 py-4 rounded-2xl border border-[#dd7456]/20 bg-gradient-to-r from-[#fdf0ec] to-background dark:from-[#2a1a15]">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[#dd7456]/10 flex items-center justify-center">
              <Sparkles className="size-5 text-[#dd7456]" />
            </div>
            <div>
              <p className="text-sm font-semibold">Create with AI</p>
              <p className="text-xs text-muted-foreground">Tell AI your role — it builds the perfect dashboard</p>
            </div>
          </div>
          <button onClick={() => setShowNew(true)}
            className="h-8 px-3 text-xs rounded-lg bg-[#dd7456] text-white hover:bg-[#c9603d] transition-colors font-medium flex items-center gap-1.5 shrink-0">
            Try it <ChevronRight className="size-3" />
          </button>
        </div>

        {/* Deleted / trash */}
        {deleted.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Recently Deleted</p>
            <div className="space-y-2">
              {deleted.map(d => (
                <DashCard key={d.id} dash={d}
                  isActive={false}
                  onActivate={() => {}} />
              ))}
            </div>
          </div>
        )}
      </div>

      {showNew && <NewButtonModal onClose={() => setShowNew(false)} />}
    </div>
  )
}
