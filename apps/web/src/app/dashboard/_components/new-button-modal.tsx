'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  X, Plus, LayoutDashboard, Pencil, Copy, Settings2,
  Download, RotateCcw, Sparkles, ChevronRight, ChevronLeft,
  Eye, EyeOff, GripVertical, Check, ArrowUp, ArrowDown,
  Search, Trash2, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useDashboardStore,
  WIDGET_CATALOG, WIDGET_CATEGORIES,
  DASHBOARD_TEMPLATES, AI_ROLE_TEMPLATE,
  buildWidgets,
  type DashboardWidget, type DashboardLayout, type DashboardVis,
} from '@/lib/stores/dashboard-store'
import { ulid } from 'ulid'

// ─── Types ────────────────────────────────────────────────────────────────────

type View = 'home' | 'create' | 'customize' | 'ai-builder' | 'duplicate' | 'reset-confirm'

// ─── Root modal ───────────────────────────────────────────────────────────────

export function NewButtonModal({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<View>('home')

  function back() { setView('home') }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={cn(
        'relative w-full bg-background border border-border rounded-2xl shadow-2xl overflow-hidden transition-all duration-200',
        view === 'customize' ? 'max-w-3xl' : 'max-w-lg',
      )}>
        {view === 'home'         && <HomeView      onClose={onClose} onNav={setView} />}
        {view === 'create'       && <CreateView    onClose={onClose} onBack={back} />}
        {view === 'customize'    && <CustomizeView onClose={onClose} onBack={back} />}
        {view === 'ai-builder'   && <AIBuilderView onClose={onClose} onBack={back} />}
        {view === 'duplicate'    && <DuplicateView onClose={onClose} onBack={back} />}
        {view === 'reset-confirm'&& <ResetView     onClose={onClose} onBack={back} />}
      </div>
    </div>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

function ModalHeader({
  title, subtitle, onClose, onBack,
}: { title: string; subtitle?: string; onClose: () => void; onBack?: () => void }) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
      {onBack && (
        <button onClick={onBack} className="rounded-lg p-1.5 hover:bg-muted transition-colors shrink-0">
          <ChevronLeft className="size-4" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h2 className="text-base font-semibold truncate">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors shrink-0">
        <X className="size-4" />
      </button>
    </div>
  )
}

// ─── Home view ────────────────────────────────────────────────────────────────

const HOME_OPTIONS = [
  { id:'create'    as View, icon: Plus,            label:'Create New Dashboard',     desc:'Start from a template or blank canvas' },
  { id:'customize' as View, icon: Pencil,          label:'Customize This Dashboard', desc:'Move, resize, add or hide sections'    },
  { id:'duplicate' as View, icon: Copy,            label:'Duplicate This Dashboard', desc:'Make a copy and edit it separately'    },
  { id:'manage'           , icon: Settings2,       label:'Manage Dashboards',        desc:'View, organize and share all dashboards'},
  { id:'import'           , icon: Download,        label:'Import Dashboard',         desc:'Paste a shared dashboard link or JSON'  },
  { id:'reset-confirm'as View,icon: RotateCcw,     label:'Reset This Dashboard',     desc:'Restore to template defaults'          },
]

function HomeView({ onClose, onNav }: { onClose: () => void; onNav: (v: View) => void }) {
  const router = useRouter()

  function handle(id: string) {
    if (id === 'manage') { onClose(); router.push('/dashboard/manage'); return }
    if (id === 'import') return  // ponytail: import not yet wired
    onNav(id as View)
  }

  return (
    <>
      <ModalHeader title="What would you like to do?" onClose={onClose} />
      <div className="p-4 space-y-1.5">
        {HOME_OPTIONS.map(({ id, icon: Icon, label, desc }) => (
          <button key={id} onClick={() => handle(id)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/60 transition-colors text-left group">
            <div className="size-9 rounded-lg border border-border bg-background flex items-center justify-center shrink-0 group-hover:border-[#dd7456]/40 group-hover:bg-[#fdf0ec] dark:group-hover:bg-[#2a1a15] transition-colors">
              <Icon className="size-4 text-muted-foreground group-hover:text-[#dd7456] transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-none mb-0.5">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
          </button>
        ))}

        {/* AI shortcut */}
        <button onClick={() => onNav('ai-builder')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[#fdf0ec] to-background dark:from-[#2a1a15] border border-[#dd7456]/20 hover:border-[#dd7456]/50 transition-colors text-left group mt-3">
          <div className="size-9 rounded-lg bg-[#dd7456]/10 flex items-center justify-center shrink-0">
            <Sparkles className="size-4 text-[#dd7456]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-none mb-0.5 text-[#dd7456]">Create with AI</p>
            <p className="text-xs text-muted-foreground">Tell AI your role — it builds the dashboard for you</p>
          </div>
          <ChevronRight className="size-4 text-[#dd7456]/40 group-hover:text-[#dd7456] transition-colors shrink-0" />
        </button>
      </div>
    </>
  )
}

// ─── Create wizard ────────────────────────────────────────────────────────────

const ICONS   = ['🎯','📊','💼','🏥','💻','🤝','📈','⚙️','🚀','⭐','🎤','🏆','📋','🔥','🌟','💡','🎪','🏗️','📌','🗂️']
const COLORS  = ['#dd7456','#3b82f6','#10b981','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#ec4899','#14b8a6','#6b7280','#1e293b','#d97706']

function CreateView({ onClose, onBack }: { onClose: () => void; onBack: () => void }) {
  const store  = useDashboardStore()
  const router = useRouter()

  const [step,     setStep]     = useState(0)
  const [name,     setName]     = useState('')
  const [desc,     setDesc]     = useState('')
  const [icon,     setIcon]     = useState('🎯')
  const [color,    setColor]    = useState('#dd7456')
  const [template, setTemplate] = useState('recruiter')
  const [layout,   setLayout]   = useState<DashboardLayout>('comfortable')
  const [vis,      setVis]      = useState<DashboardVis>('private')
  const [isDefault,setIsDefault]= useState(false)

  const steps = ['Details', 'Template', 'Settings']

  function create() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const tmpl = (DASHBOARD_TEMPLATES[template] ?? DASHBOARD_TEMPLATES.recruiter)!
    store.createDashboard({
      name:        name || tmpl.label,
      description: desc,
      icon,
      color,
      template,
      layout,
      visibility:  vis,
      isDefault,
      widgets:     buildWidgets(tmpl.widgets),
    })
    onClose()
    router.refresh()
  }

  return (
    <>
      <ModalHeader title="Create New Dashboard" subtitle={`Step ${step + 1} of 3 — ${steps[step]}`} onClose={onClose} onBack={step === 0 ? onBack : () => setStep(s => s - 1)} />

      {/* Step indicator */}
      <div className="px-6 pt-4 flex gap-1.5">
        {steps.map((s, i) => (
          <div key={s} className={cn('h-1 flex-1 rounded-full transition-colors', i <= step ? 'bg-[#dd7456]' : 'bg-muted')} />
        ))}
      </div>

      <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

        {/* Step 0 — Details */}
        {step === 0 && (
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">Dashboard Name</label>
              <input
                value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Morning Dashboard"
                className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#dd7456]/30 focus:border-[#dd7456]/50"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">Description <span className="font-normal normal-case">(optional)</span></label>
              <textarea
                value={desc} onChange={e => setDesc(e.target.value)}
                placeholder="What is this dashboard for?"
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#dd7456]/30 focus:border-[#dd7456]/50 resize-none"
              />
            </div>

            {/* Icon */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">Icon</label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map(e => (
                  <button key={e} onClick={() => setIcon(e)}
                    className={cn('size-9 text-lg rounded-lg border transition-colors flex items-center justify-center',
                      icon === e ? 'border-[#dd7456] bg-[#fdf0ec] dark:bg-[#2a1a15]' : 'border-border hover:border-muted-foreground/40')}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">Color</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)}
                    className={cn('size-7 rounded-full border-2 transition-all',
                      color === c ? 'border-foreground scale-110' : 'border-transparent')}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1 — Template */}
        {step === 1 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-3">Choose a starting point. You can customize everything after.</p>
            {Object.entries(DASHBOARD_TEMPLATES).map(([key, tmpl]) => (
              <button key={key} onClick={() => { setTemplate(key); if (!name) setIcon(tmpl.icon); if (!name) setColor(tmpl.color) }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors',
                  template === key ? 'border-[#dd7456]/50 bg-[#fdf0ec] dark:bg-[#2a1a15]' : 'border-border hover:bg-muted/40'
                )}>
                <span className="text-2xl shrink-0">{tmpl.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none mb-0.5">{tmpl.label}</p>
                  <p className="text-xs text-muted-foreground">{tmpl.desc}</p>
                </div>
                <div className={cn('size-4 rounded-full border-2 shrink-0 transition-colors',
                  template === key ? 'border-[#dd7456] bg-[#dd7456]' : 'border-border')} />
              </button>
            ))}
          </div>
        )}

        {/* Step 2 — Settings */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Layout density */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">Layout Density</label>
              <div className="grid grid-cols-3 gap-2">
                {(['comfortable','compact','dense'] as DashboardLayout[]).map(l => (
                  <button key={l} onClick={() => setLayout(l)}
                    className={cn('h-9 rounded-lg border text-xs font-medium capitalize transition-colors',
                      layout === l ? 'border-foreground bg-foreground text-background' : 'border-border hover:bg-muted/60 text-muted-foreground')}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Visibility */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">Visibility</label>
              <div className="space-y-2">
                {([
                  { v:'private'      as DashboardVis, label:'Private',      desc:'Only you can see this dashboard' },
                  { v:'team'         as DashboardVis, label:'Team',         desc:'Shared with your team members'   },
                  { v:'organization' as DashboardVis, label:'Organization', desc:'Everyone in your organization'   },
                ]).map(({ v, label, desc }) => (
                  <button key={v} onClick={() => setVis(v)}
                    className={cn('w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-colors',
                      vis === v ? 'border-[#dd7456]/40 bg-[#fdf0ec] dark:bg-[#2a1a15]' : 'border-border hover:bg-muted/40')}>
                    <div>
                      <p className="text-sm font-medium leading-none mb-0.5">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <div className={cn('size-4 rounded-full border-2 shrink-0 ml-4 transition-colors',
                      vis === v ? 'border-[#dd7456] bg-[#dd7456]' : 'border-border')} />
                  </button>
                ))}
              </div>
            </div>

            {/* Default toggle */}
            <button onClick={() => setIsDefault(d => !d)}
              className={cn('w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors',
                isDefault ? 'border-[#dd7456]/40 bg-[#fdf0ec] dark:bg-[#2a1a15]' : 'border-border hover:bg-muted/40')}>
              <div>
                <p className="text-sm font-medium leading-none mb-0.5">Set as Default Dashboard</p>
                <p className="text-xs text-muted-foreground">Opens this dashboard when you log in</p>
              </div>
              <div className={cn('size-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ml-4',
                isDefault ? 'border-[#dd7456] bg-[#dd7456]' : 'border-border')}>
                {isDefault && <Check className="size-3 text-white" strokeWidth={3} />}
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border">
        <button onClick={() => step === 0 ? onBack() : setStep(s => s - 1)}
          className="h-9 px-4 text-sm rounded-lg border border-border hover:bg-muted/60 transition-colors">
          {step === 0 ? 'Cancel' : 'Back'}
        </button>
        {step < 2
          ? <button onClick={() => setStep(s => s + 1)}
              className="h-9 px-5 text-sm rounded-lg bg-foreground text-background hover:bg-foreground/85 transition-colors font-medium flex items-center gap-1.5">
              Next <ChevronRight className="size-3.5" />
            </button>
          : <button onClick={create}
              className="h-9 px-5 text-sm rounded-lg bg-[#dd7456] text-white hover:bg-[#c9603d] transition-colors font-medium flex items-center gap-1.5">
              <Plus className="size-3.5" /> Create Dashboard
            </button>
        }
      </div>
    </>
  )
}

// ─── Customize view ───────────────────────────────────────────────────────────

function CustomizeView({ onClose, onBack }: { onClose: () => void; onBack: () => void }) {
  const store          = useDashboardStore()
  const activeDash     = store.dashboards.find(d => d.id === store.activeDashboardId)
  const [widgets, setWidgets] = useState<DashboardWidget[]>(
    activeDash ? [...activeDash.widgets].sort((a, b) => a.order - b.order) : []
  )
  const [tab, setTab]         = useState<'sections' | 'library'>('sections')
  const [libSearch, setLibSearch] = useState('')
  const [libCat, setLibCat]   = useState('All')
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  // Native HTML5 drag-and-drop
  const dragOver = useRef<number | null>(null)

  function onDragStart(i: number) { setDragIndex(i) }
  function onDragEnter(i: number) { dragOver.current = i }
  function onDragEnd() {
    if (dragIndex === null || dragOver.current === null || dragIndex === dragOver.current) {
      setDragIndex(null); dragOver.current = null; return
    }
    const next = [...widgets]
    const moved = next.splice(dragIndex, 1)[0]
    if (!moved) { setDragIndex(null); dragOver.current = null; return }
    next.splice(dragOver.current, 0, moved)
    const reindexed = next.map((w, i) => ({ ...w, order: i }))
    setWidgets(reindexed)
    setDragIndex(null); dragOver.current = null
  }

  function toggleHidden(id: string) {
    setWidgets(ws => ws.map(w => w.id === id ? { ...w, hidden: !w.hidden } : w))
  }

  function moveWidget(id: string, dir: -1 | 1) {
    setWidgets(ws => {
      const i   = ws.findIndex(w => w.id === id)
      const j   = i + dir
      if (j < 0 || j >= ws.length) return ws
      const next = [...ws]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next.map((w, idx) => ({ ...w, order: idx }))
    })
  }

  function removeWidget(id: string) {
    setWidgets(ws => ws.filter(w => w.id !== id))
  }

  function resizeWidget(id: string, size: DashboardWidget['size']) {
    setWidgets(ws => ws.map(w => w.id === id ? { ...w, size } : w))
  }

  function addFromLibrary(type: string) {
    const meta = WIDGET_CATALOG.find(w => w.type === type)
    if (!meta) return
    if (widgets.find(w => w.type === type)) return // already added
    const newWidget: DashboardWidget = {
      id:     ulid(),
      type,
      label:  meta.label,
      size:   'medium',
      hidden: false,
      order:  widgets.length,
    }
    setWidgets(ws => [...ws, newWidget])
  }

  function save() {
    if (!activeDash) return
    store.updateWidgets(activeDash.id, widgets)
    setSavedAt(Date.now())
  }

  const libCategories = ['All', ...WIDGET_CATEGORIES]
  const filteredLib = WIDGET_CATALOG.filter(w => {
    const inCat    = libCat === 'All' || w.category === libCat
    const inSearch = w.label.toLowerCase().includes(libSearch.toLowerCase()) || w.desc.toLowerCase().includes(libSearch.toLowerCase())
    const notAdded = !widgets.find(ww => ww.type === w.type)
    return inCat && inSearch && notAdded
  })

  return (
    <>
      <ModalHeader title="Customize Dashboard" subtitle={activeDash?.name} onClose={onClose} onBack={onBack} />

      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-3">
        {(['sections','library'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('flex-1 h-8 text-xs font-medium rounded-lg capitalize transition-colors',
              tab === t ? 'bg-foreground text-background' : 'hover:bg-muted/60 text-muted-foreground')}>
            {t === 'sections' ? 'Current Sections' : 'Add Section'}
          </button>
        ))}
      </div>

      <div className="p-4 max-h-[65vh] overflow-y-auto">

        {/* Sections tab */}
        {tab === 'sections' && (
          <div className="space-y-1.5">
            {widgets.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No sections yet. Switch to "Add Section" to get started.
              </div>
            )}
            {widgets.map((w, i) => (
              <div key={w.id}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragEnter={() => onDragEnter(i)}
                onDragEnd={onDragEnd}
                onDragOver={e => e.preventDefault()}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors select-none cursor-grab active:cursor-grabbing',
                  w.hidden ? 'border-border bg-muted/30 opacity-60' : 'border-border bg-background',
                  dragIndex === i && 'ring-2 ring-[#dd7456]/40 bg-[#fdf0ec] dark:bg-[#2a1a15]',
                )}>
                <GripVertical className="size-4 text-muted-foreground/40 shrink-0" />
                <span className="text-base shrink-0">
                  {WIDGET_CATALOG.find(c => c.type === w.type)?.icon ?? '📦'}
                </span>
                <span className="text-sm font-medium flex-1 truncate">{w.label}</span>

                {/* Size picker */}
                <select
                  value={w.size}
                  onChange={e => resizeWidget(w.id, e.target.value as DashboardWidget['size'])}
                  onClick={e => e.stopPropagation()}
                  className="h-6 px-1.5 text-[10px] rounded border border-border bg-background text-muted-foreground focus:outline-none">
                  {(['small','medium','large','full'] as const).map(s => (
                    <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>

                {/* Actions */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button onClick={() => moveWidget(w.id, -1)} disabled={i === 0}
                    className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-30">
                    <ArrowUp className="size-3" />
                  </button>
                  <button onClick={() => moveWidget(w.id, 1)} disabled={i === widgets.length - 1}
                    className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-30">
                    <ArrowDown className="size-3" />
                  </button>
                  <button onClick={() => toggleHidden(w.id)}
                    className="p-1 rounded hover:bg-muted transition-colors">
                    {w.hidden ? <EyeOff className="size-3.5 text-muted-foreground" /> : <Eye className="size-3.5" />}
                  </button>
                  <button onClick={() => removeWidget(w.id)}
                    className="p-1 rounded hover:bg-muted hover:text-destructive transition-colors">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Library tab */}
        {tab === 'library' && (
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                value={libSearch} onChange={e => setLibSearch(e.target.value)}
                placeholder="Search sections…"
                className="w-full h-9 pl-8 pr-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#dd7456]/30"
              />
            </div>

            {/* Category pills */}
            <div className="flex gap-1.5 flex-wrap">
              {libCategories.map(cat => (
                <button key={cat} onClick={() => setLibCat(cat)}
                  className={cn('h-6 px-2.5 text-[11px] rounded-full border transition-colors whitespace-nowrap',
                    libCat === cat ? 'border-foreground bg-foreground text-background' : 'border-border hover:bg-muted/60 text-muted-foreground')}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Widget grid */}
            {filteredLib.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                {libSearch ? 'No sections match your search.' : 'All available sections are already on your dashboard.'}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {filteredLib.map(w => (
                <button key={w.type} onClick={() => addFromLibrary(w.type)}
                  className="flex items-start gap-2.5 p-3 rounded-xl border border-border hover:border-[#dd7456]/40 hover:bg-[#fdf0ec] dark:hover:bg-[#2a1a15] transition-colors text-left group">
                  <span className="text-xl shrink-0 mt-0.5">{w.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold leading-none mb-1 group-hover:text-[#dd7456] transition-colors">{w.label}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{w.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          {savedAt ? `Saved just now` : `${widgets.filter(w => !w.hidden).length} visible · ${widgets.filter(w => w.hidden).length} hidden`}
        </p>
        <button onClick={save}
          className="h-9 px-5 text-sm rounded-lg bg-[#dd7456] text-white hover:bg-[#c9603d] transition-colors font-medium">
          Save Layout
        </button>
      </div>
    </>
  )
}

// ─── AI Builder ───────────────────────────────────────────────────────────────

const AI_ROLES = Object.keys(AI_ROLE_TEMPLATE)

function AIBuilderView({ onClose, onBack }: { onClose: () => void; onBack: () => void }) {
  const store  = useDashboardStore()
  const router = useRouter()

  const [role,    setRole]    = useState('')
  const [name,    setName]    = useState('')
  const [loading, setLoading] = useState(false)

  function build() {
    if (!role) return
    setLoading(true)
    const templateKey = AI_ROLE_TEMPLATE[role] ?? 'recruiter'
    const tmpl        = DASHBOARD_TEMPLATES[templateKey]
    setTimeout(() => {
      store.createDashboard({
        name:        name || `${role} Dashboard`,
        description: `AI-built dashboard optimized for ${role}`,
        icon:        tmpl.icon,
        color:       tmpl.color,
        template:    templateKey,
        layout:      'comfortable',
        visibility:  'private',
        isDefault:   false,
        widgets:     buildWidgets(tmpl.widgets),
      })
      setLoading(false)
      onClose()
      router.refresh()
    }, 1200) // ponytail: fake AI delay — wire real AI when backend ready
  }

  return (
    <>
      <ModalHeader title="Create Dashboard with AI" subtitle="Tell AI your role — it builds the layout for you" onClose={onClose} onBack={onBack} />
      <div className="p-6 space-y-5">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">What is your role?</label>
          <div className="grid grid-cols-2 gap-2">
            {AI_ROLES.map(r => (
              <button key={r} onClick={() => setRole(r)}
                className={cn('px-3 py-2.5 rounded-xl border text-sm font-medium text-left transition-colors',
                  role === r ? 'border-[#dd7456]/50 bg-[#fdf0ec] dark:bg-[#2a1a15] text-[#dd7456]' : 'border-border hover:bg-muted/40')}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">Dashboard Name <span className="font-normal normal-case">(optional)</span></label>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder={role ? `${role} Dashboard` : 'e.g. Morning Dashboard'}
            className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#dd7456]/30" />
        </div>

        {role && (
          <div className="px-4 py-3 rounded-xl bg-muted/40 border border-border">
            <p className="text-xs font-semibold mb-1">AI will include:</p>
            <p className="text-xs text-muted-foreground">
              {DASHBOARD_TEMPLATES[AI_ROLE_TEMPLATE[role]]?.widgets
                .map(t => WIDGET_CATALOG.find(w => w.type === t)?.label)
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-6 py-4 border-t border-border">
        <button onClick={onBack} className="h-9 px-4 text-sm rounded-lg border border-border hover:bg-muted/60 transition-colors">Cancel</button>
        <button onClick={build} disabled={!role || loading}
          className="h-9 px-5 text-sm rounded-lg bg-[#dd7456] text-white hover:bg-[#c9603d] disabled:opacity-50 transition-colors font-medium flex items-center gap-2">
          {loading ? (
            <><span className="size-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Building…</>
          ) : (
            <><Sparkles className="size-3.5" /> Build My Dashboard</>
          )}
        </button>
      </div>
    </>
  )
}

// ─── Duplicate view ───────────────────────────────────────────────────────────

function DuplicateView({ onClose, onBack }: { onClose: () => void; onBack: () => void }) {
  const store      = useDashboardStore()
  const router     = useRouter()
  const activeDash = store.dashboards.find(d => d.id === store.activeDashboardId)
  const [name, setName] = useState(activeDash ? `${activeDash.name} (copy)` : '')

  function dupe() {
    if (!activeDash) return
    const newId = store.duplicateDashboard(activeDash.id)
    if (name && name !== `${activeDash.name} (copy)`) {
      store.updateDashboard(newId, { name })
    }
    onClose()
    router.refresh()
  }

  return (
    <>
      <ModalHeader title="Duplicate Dashboard" subtitle={`Copying: ${activeDash?.name}`} onClose={onClose} onBack={onBack} />
      <div className="p-6 space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">New Dashboard Name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#dd7456]/30" />
        </div>
        <p className="text-xs text-muted-foreground">All sections and settings will be copied. The original dashboard will not be changed.</p>
      </div>
      <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
        <button onClick={onBack} className="h-9 px-4 text-sm rounded-lg border border-border hover:bg-muted/60 transition-colors">Cancel</button>
        <button onClick={dupe} disabled={!name.trim()}
          className="h-9 px-5 text-sm rounded-lg bg-foreground text-background hover:bg-foreground/85 disabled:opacity-50 transition-colors font-medium flex items-center gap-1.5">
          <Copy className="size-3.5" /> Duplicate
        </button>
      </div>
    </>
  )
}

// ─── Reset view ───────────────────────────────────────────────────────────────

function ResetView({ onClose, onBack }: { onClose: () => void; onBack: () => void }) {
  const store      = useDashboardStore()
  const router     = useRouter()
  const activeDash = store.dashboards.find(d => d.id === store.activeDashboardId)

  function reset() {
    if (!activeDash) return
    const tmpl = DASHBOARD_TEMPLATES[activeDash.template] ?? DASHBOARD_TEMPLATES.recruiter
    store.updateWidgets(activeDash.id, buildWidgets(tmpl.widgets))
    onClose()
    router.refresh()
  }

  return (
    <>
      <ModalHeader title="Reset Dashboard" onClose={onClose} onBack={onBack} />
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
          <RotateCcw className="size-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">This will reset your layout</p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
              "{activeDash?.name}" will be restored to its original template ({activeDash?.template}). Your customizations will be lost.
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
        <button onClick={onBack} className="h-9 px-4 text-sm rounded-lg border border-border hover:bg-muted/60 transition-colors">Cancel</button>
        <button onClick={reset}
          className="h-9 px-5 text-sm rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors font-medium flex items-center gap-1.5">
          <RotateCcw className="size-3.5" /> Reset to Default
        </button>
      </div>
    </>
  )
}
