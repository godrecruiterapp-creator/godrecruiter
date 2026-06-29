'use client'

import { useState, useMemo } from 'react'
import {
  Search, Plus, X, ChevronRight, AlertTriangle, CheckCircle2,
  Clock, Mail, Phone, FileText, Sparkles, RefreshCw,
  TrendingUp, Users, CalendarClock, Activity, DollarSign,
  MessageSquare, Upload, ListTodo, Bot, ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  PLACEMENTS, filterPlacements, healthStatus,
  type Placement, type FilterTab, type ComplianceStatus,
} from './_data'

// ─── Health score badge ────────────────────────────────────────────────────
function HealthBadge({ score }: { score: number }) {
  const status = healthStatus(score)
  return (
    <div className={cn(
      'flex flex-col items-center justify-center w-12 h-12 rounded-xl shrink-0',
      status === 'healthy'   ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' :
      status === 'attention' ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400' :
                               'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400'
    )}>
      <span className="text-base font-bold tabular-nums leading-none">{score}</span>
      <span className="text-[9px] font-medium mt-0.5 leading-none opacity-70">
        {status === 'healthy' ? 'OK' : status === 'attention' ? 'ATTN' : 'CRIT'}
      </span>
    </div>
  )
}

// ─── Status pill ───────────────────────────────────────────────────────────
const STATUS_LABELS: Record<Placement['status'], string> = {
  active:         'Active',
  starting_today: 'Starting Today',
  starting_soon:  'Starting Soon',
  ending_soon:    'Ending Soon',
  completed:      'Completed',
  needs_attention:'Needs Attention',
}
const STATUS_COLORS: Record<Placement['status'], string> = {
  active:          'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400',
  starting_today:  'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-400',
  starting_soon:   'bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-400',
  ending_soon:     'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400',
  completed:       'bg-muted text-muted-foreground',
  needs_attention: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400',
}

// ─── Placement card ────────────────────────────────────────────────────────
function PlacementCard({ p, selected, onClick }: { p: Placement; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-xl border bg-background transition-all hover:shadow-md hover:border-foreground/20',
        selected ? 'border-foreground/30 shadow-md ring-2 ring-foreground/10' : 'border-border'
      )}
    >
      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start gap-3 mb-3">
          <div className="size-9 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700 shrink-0">
            {p.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold leading-tight">{p.candidate}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.jobTitle}</p>
              </div>
              <HealthBadge score={p.healthScore} />
            </div>
          </div>
        </div>

        {/* Client + recruiter */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{p.client}</span>
            <span>·</span>
            <span>{p.location}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Recruiter: <span className="text-foreground">{p.recruiter}</span>
          </div>
        </div>

        {/* Dates + type */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-xs text-muted-foreground">
            {p.startDate} → {p.endDate}
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
            {p.employmentType}
          </span>
        </div>

        {/* Rate row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span>${p.billRate}/hr bill</span>
          <span>·</span>
          <span>${p.payRate}/hr pay</span>
          <span>·</span>
          <span className="font-medium text-foreground">{p.marginPct}% margin</span>
        </div>

        {/* Issues */}
        {p.issues.length > 0 && (
          <div className="space-y-1 mb-3">
            {p.issues.slice(0, 2).map((issue, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                <AlertTriangle className="size-3 shrink-0" />
                <span className="truncate">{issue}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', STATUS_COLORS[p.status])}>
            {STATUS_LABELS[p.status]}
          </span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Email">
              <Mail className="size-3.5" />
            </button>
            <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Call">
              <Phone className="size-3.5" />
            </button>
            <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Note">
              <FileText className="size-3.5" />
            </button>
            <ChevronRight className="size-3.5 text-muted-foreground ml-1" />
          </div>
        </div>
      </div>
    </button>
  )
}

// ─── KPI card ──────────────────────────────────────────────────────────────
function KPICard({
  label, value, sub, icon: Icon, color, onClick, active,
}: {
  label: string; value: string | number; sub?: string
  icon: React.ComponentType<{ className?: string }>
  color: string; onClick?: () => void; active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-shrink-0 w-44 text-left rounded-xl border p-4 transition-all hover:shadow-sm',
        active ? 'border-foreground/30 bg-foreground/5' : 'border-border bg-background hover:border-foreground/20'
      )}
    >
      <div className={cn('size-8 rounded-lg flex items-center justify-center mb-3', color)}>
        <Icon className="size-4" />
      </div>
      <p className="text-xl font-bold tabular-nums">{value}</p>
      <p className="text-xs font-medium mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </button>
  )
}

// ─── Compliance dot ────────────────────────────────────────────────────────
const COMP_COLORS: Record<ComplianceStatus, string> = {
  completed: 'text-emerald-500',
  pending:   'text-amber-500',
  expired:   'text-red-500',
  missing:   'text-red-600',
}
const COMP_ICONS: Record<ComplianceStatus, React.ComponentType<{ className?: string }>> = {
  completed: CheckCircle2,
  pending:   Clock,
  expired:   AlertTriangle,
  missing:   AlertTriangle,
}

// ─── Activity icon ─────────────────────────────────────────────────────────
const ACT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  email:  Mail,
  note:   FileText,
  call:   Phone,
  sms:    MessageSquare,
  upload: Upload,
  task:   ListTodo,
  ai:     Bot,
}

// ─── Side panel ────────────────────────────────────────────────────────────
type PanelTab = 'overview' | 'compliance' | 'financial' | 'timeline' | 'activity'

function SidePanel({ p, onClose }: { p: Placement; onClose: () => void }) {
  const [tab, setTab] = useState<PanelTab>('overview')

  const TABS: { key: PanelTab; label: string }[] = [
    { key: 'overview',   label: 'Overview'    },
    { key: 'compliance', label: 'Compliance'  },
    { key: 'financial',  label: 'Financial'   },
    { key: 'timeline',   label: 'Timeline'    },
    { key: 'activity',   label: 'Activity'    },
  ]

  const status = healthStatus(p.healthScore)

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Panel header */}
      <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-border shrink-0">
        <div className="size-10 rounded-full bg-violet-100 flex items-center justify-center text-sm font-bold text-violet-700 shrink-0">
          {p.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{p.candidate}</p>
              <p className="text-xs text-muted-foreground">{p.jobTitle} · {p.client}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground" title="Open full record">
                <ExternalLink className="size-3.5" />
              </button>
              <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground">
                <X className="size-3.5" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', STATUS_COLORS[p.status])}>
              {STATUS_LABELS[p.status]}
            </span>
            <span className={cn('text-[10px] font-semibold',
              status === 'healthy' ? 'text-emerald-600 dark:text-emerald-400' : status === 'attention' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
            )}>
              Health: {p.healthScore}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 px-5 border-b border-border shrink-0 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'text-xs font-medium py-2.5 px-1 mr-4 border-b-2 transition-colors whitespace-nowrap',
              tab === t.key
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {tab === 'overview' && (
          <div className="space-y-5">
            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Bill Rate',      value: `$${p.billRate}/hr`     },
                { label: 'Pay Rate',       value: `$${p.payRate}/hr`      },
                { label: 'Weekly Revenue', value: `$${p.weeklyRevenue.toLocaleString()}` },
                { label: 'Margin',         value: `${p.marginPct}%`       },
                { label: 'Start',          value: p.startDate             },
                { label: 'End',            value: p.endDate               },
                { label: 'Type',           value: p.employmentType        },
                { label: 'Recruiter',      value: p.recruiter             },
              ].map(item => (
                <div key={item.label} className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{item.label}</p>
                  <p className="text-sm font-semibold mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Issues */}
            {p.issues.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Issues</p>
                <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 divide-y divide-amber-100 dark:divide-amber-900">
                  {p.issues.map((issue, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                      <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="text-xs text-amber-800 dark:text-amber-300 flex-1">{issue}</span>
                      <button className="text-xs font-medium text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 transition-colors">Fix →</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI panel */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">AI Actions</p>
              <div className="rounded-xl border border-border divide-y divide-border/60">
                {[
                  'Summarize placement',
                  'Find missing compliance',
                  'Predict extension likelihood',
                  'Generate client update',
                  'Candidate follow-up draft',
                  p.status === 'ending_soon' || p.status === 'completed' ? 'Find redeployment jobs' : null,
                ].filter(Boolean).map((action) => (
                  <button
                    key={action!}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left hover:bg-muted/50 transition-colors"
                  >
                    <Sparkles className="size-3.5 text-violet-500 shrink-0" />
                    <span>{action}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'compliance' && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              {p.compliance.filter(c => c.status === 'completed').length} of {p.compliance.length} items complete
            </p>
            {p.compliance.map((item, i) => {
              const Icon = COMP_ICONS[item.status]
              return (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-border/40 last:border-0">
                  <Icon className={cn('size-4 shrink-0', COMP_COLORS[item.status])} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.name}</p>
                    {item.date && <p className="text-xs text-muted-foreground mt-0.5">{item.date}</p>}
                  </div>
                  <span className={cn('text-[10px] font-semibold uppercase tracking-wide', COMP_COLORS[item.status])}>
                    {item.status}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'financial' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Bill Rate',       value: `$${p.billRate}/hr`,                          color: 'text-foreground' },
                { label: 'Pay Rate',        value: `$${p.payRate}/hr`,                           color: 'text-foreground' },
                { label: 'Margin %',        value: `${p.marginPct}%`,                            color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Weekly Revenue',  value: `$${p.weeklyRevenue.toLocaleString()}`,        color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Contract Value',  value: `$${p.contractValue.toLocaleString()}`,        color: 'text-foreground' },
                { label: 'Weekly Spread',   value: `$${(p.billRate - p.payRate) * 40}`,           color: 'text-foreground' },
              ].map(item => (
                <div key={item.label} className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{item.label}</p>
                  <p className={cn('text-lg font-bold mt-0.5', item.color)}>{item.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-border p-4 text-center">
              <p className="text-xs text-muted-foreground">Revenue this month (est.)</p>
              <p className="text-2xl font-bold mt-1">${(p.weeklyRevenue * 4.33).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
            </div>
          </div>
        )}

        {tab === 'timeline' && (
          <div className="relative">
            <div className="absolute left-[7px] top-0 bottom-0 w-px bg-border/60" />
            <div className="space-y-0">
              {p.timeline.map((event, i) => (
                <div key={i} className="flex gap-4 pb-5 last:pb-0">
                  <div className={cn(
                    'size-[15px] rounded-full border-2 shrink-0 mt-0.5 z-10',
                    event.done
                      ? 'bg-foreground border-foreground'
                      : 'bg-background border-border'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium', !event.done && 'text-muted-foreground')}>{event.event}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{event.date} · {event.user}</p>
                    {event.note && <p className="text-xs text-muted-foreground mt-1 italic">{event.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'activity' && (
          <div className="space-y-1">
            {p.activity.map((item, i) => {
              const Icon = ACT_ICONS[item.type] ?? FileText
              return (
                <div key={i} className="flex gap-3 py-3 border-b border-border/40 last:border-0">
                  <div className="size-7 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="size-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{item.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.user} · {item.time}</p>
                  </div>
                </div>
              )
            })}
            <button className="w-full mt-3 h-9 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors flex items-center justify-center gap-1.5">
              <Plus className="size-3.5" />Add note or task
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────
const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',            label: 'All'            },
  { key: 'starting_today', label: 'Starting Today' },
  { key: 'active',         label: 'Active'         },
  { key: 'needs_attention',label: 'Needs Attention'},
  { key: 'ending_soon',    label: 'Ending Soon'    },
  { key: 'completed',      label: 'Completed'      },
  { key: 'redeployment',   label: 'Redeployment'   },
]

export default function PlacementsPage() {
  const [search,      setSearch]      = useState('')
  const [filterTab,   setFilterTab]   = useState<FilterTab>('all')
  const [selectedId,  setSelectedId]  = useState<string | null>(null)

  const filtered = useMemo(
    () => filterPlacements(PLACEMENTS, filterTab, search),
    [filterTab, search]
  )

  const selected = PLACEMENTS.find(p => p.id === selectedId) ?? null

  // KPI values
  const active       = PLACEMENTS.filter(p => p.status === 'active').length
  const startToday   = PLACEMENTS.filter(p => p.status === 'starting_today').length
  const startWeek    = PLACEMENTS.filter(p => p.status === 'starting_today' || p.status === 'starting_soon').length
  const attention    = PLACEMENTS.filter(p => p.status === 'needs_attention' || p.healthScore < 70).length
  const endingSoon   = PLACEMENTS.filter(p => p.status === 'ending_soon').length
  const monthRevenue = PLACEMENTS.filter(p => p.status === 'active').reduce((s, p) => s + p.weeklyRevenue * 4.33, 0)
  const avgMargin    = PLACEMENTS.filter(p => p.status === 'active').reduce((s, p) => s + p.marginPct, 0) / (active || 1)

  const needsAttentionItems = PLACEMENTS.filter(p =>
    p.status === 'needs_attention' || (p.healthScore < 70 && p.status !== 'completed')
  )

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main content */}
      <div className={cn('flex flex-col flex-1 min-w-0 overflow-hidden transition-all', selected ? 'mr-0' : '')}>
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold tracking-tight">Placements</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Workforce Command Center</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search placements…"
                    className="h-9 pl-8 pr-3 text-xs w-56 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <button className="h-9 px-4 text-xs rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors flex items-center gap-1.5 font-medium">
                  <Plus className="size-3.5" />New Placement
                </button>
              </div>
            </div>

            {/* KPI strip */}
            <div className="flex gap-3 overflow-x-auto pb-2 mb-6 -mx-1 px-1">
              <KPICard label="Active Placements" value={active}       icon={Activity}      color="bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400" onClick={() => setFilterTab('active')}         active={filterTab === 'active'} />
              <KPICard label="Starts Today"       value={startToday}  icon={CalendarClock} color="bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-400"  onClick={() => setFilterTab('starting_today')} active={filterTab === 'starting_today'} />
              <KPICard label="Starts This Week"   value={startWeek}   icon={Users}         color="bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-400"      sub="incl. today" />
              <KPICard label="Needs Attention"    value={attention}   icon={AlertTriangle} color="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400"      onClick={() => setFilterTab('needs_attention')} active={filterTab === 'needs_attention'} />
              <KPICard label="Ending Soon"        value={endingSoon}  icon={Clock}         color="bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400"    onClick={() => setFilterTab('ending_soon')}    active={filterTab === 'ending_soon'} />
              <KPICard label="Revenue / Month"    value={`$${(monthRevenue / 1000).toFixed(0)}k`} icon={DollarSign} color="bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400" sub="active only" />
              <KPICard label="Avg Margin"         value={`${avgMargin.toFixed(1)}%`} icon={TrendingUp} color="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400" sub="active only" />
              <KPICard label="Total Placements"   value={PLACEMENTS.length} icon={RefreshCw} color="bg-muted text-muted-foreground" onClick={() => setFilterTab('all')} active={filterTab === 'all'} />
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 overflow-x-auto mb-6 pb-px">
              {FILTER_TABS.map(t => {
                const count = filterPlacements(PLACEMENTS, t.key, '').length
                return (
                  <button
                    key={t.key}
                    onClick={() => setFilterTab(t.key)}
                    className={cn(
                      'flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                      filterTab === t.key
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {t.label}
                    <span className={cn(
                      'text-[10px] px-1 rounded-full font-semibold',
                      filterTab === t.key ? 'bg-background/20 text-background' : 'bg-muted text-muted-foreground'
                    )}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Needs Attention banner */}
            {filterTab === 'all' && needsAttentionItems.length > 0 && (
              <div className="mb-6 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-100 dark:border-amber-900">
                  <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">Needs Attention ({needsAttentionItems.length})</span>
                </div>
                <div className="divide-y divide-amber-100 dark:divide-amber-900">
                  {needsAttentionItems.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-100/50 dark:hover:bg-amber-900/50 transition-colors text-left"
                    >
                      <div className="size-7 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center text-[10px] font-bold text-amber-800 dark:text-amber-200 shrink-0">
                        {p.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">{p.candidate}</p>
                        <p className="text-[10px] text-amber-700 dark:text-amber-400 truncate">{p.issues[0] ?? 'Health score below threshold'}</p>
                      </div>
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-400 shrink-0">Fix →</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cards grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Activity className="size-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">No placements found</p>
                <p className="text-xs mt-1">Try a different filter or search term.</p>
              </div>
            ) : (
              <div className={cn(
                'grid gap-4',
                selected ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
              )}>
                {filtered.map(p => (
                  <PlacementCard
                    key={p.id}
                    p={p}
                    selected={selectedId === p.id}
                    onClick={() => setSelectedId(prev => prev === p.id ? null : p.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Side panel */}
      {selected && (
        <>
          {/* Backdrop (mobile only) */}
          <div
            className="fixed inset-0 bg-black/20 z-20 lg:hidden"
            onClick={() => setSelectedId(null)}
          />
          {/* Panel */}
          <div className="w-[460px] shrink-0 border-l border-border z-30 bg-background flex flex-col overflow-hidden">
            <SidePanel p={selected} onClose={() => setSelectedId(null)} />
          </div>
        </>
      )}
    </div>
  )
}
