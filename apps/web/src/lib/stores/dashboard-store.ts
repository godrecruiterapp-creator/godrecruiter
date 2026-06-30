'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ulid } from 'ulid'

// ─── Types ────────────────────────────────────────────────────────────────────

export type WidgetSize       = 'small' | 'medium' | 'large' | 'full'
export type DashboardLayout  = 'comfortable' | 'compact' | 'dense'
export type DashboardVis     = 'private' | 'team' | 'organization'

export interface DashboardWidget {
  id:     string
  type:   string
  label:  string
  size:   WidgetSize
  hidden: boolean
  order:  number
}

export interface DashboardConfig {
  id:          string
  name:        string
  description: string
  icon:        string   // emoji
  color:       string   // hex
  template:    string
  layout:      DashboardLayout
  visibility:  DashboardVis
  isDefault:   boolean
  widgets:     DashboardWidget[]
  createdAt:   number
  updatedAt:   number
  deletedAt?: number | undefined   // soft delete
}

// ─── Widget catalog ───────────────────────────────────────────────────────────

export const WIDGET_CATALOG = [
  // Focus & Tasks
  { type:'today-focus',      label:"Today's Focus",       desc:'Greeting, date and daily summary',              icon:'🎯', category:'Focus & Tasks' },
  { type:'todo',             label:'Things To Do',         desc:'Your task queue and priorities',                icon:'✅', category:'Focus & Tasks' },
  { type:'quick-actions',    label:'Quick Actions',        desc:'Fast access to your most-used actions',         icon:'⚡', category:'Focus & Tasks' },
  { type:'quick-notes',      label:'Quick Notes',          desc:'Scratch pad visible on every dashboard',        icon:'📝', category:'Focus & Tasks' },
  { type:'calendar',         label:'Calendar',             desc:"Today's schedule at a glance",                  icon:'📅', category:'Focus & Tasks' },

  // Pipeline & Jobs
  { type:'pipeline',         label:'Pipeline Funnel',      desc:'Visual hiring funnel by stage',                 icon:'📊', category:'Pipeline & Jobs' },
  { type:'my-jobs',          label:'My Jobs',              desc:'Your active job orders',                        icon:'💼', category:'Pipeline & Jobs' },
  { type:'job-pipeline',     label:'Job Pipeline',         desc:'Job status across all stages',                  icon:'🏗️', category:'Pipeline & Jobs' },
  { type:'pinned-jobs',      label:'Pinned Jobs',          desc:'Quick access to your pinned jobs',              icon:'📌', category:'Pipeline & Jobs' },
  { type:'saved-searches',   label:'Saved Searches',       desc:'Instant access to saved candidate searches',    icon:'🔍', category:'Pipeline & Jobs' },

  // Candidates
  { type:'candidate-pipeline', label:'Candidate Pipeline', desc:'All candidates by hiring stage',               icon:'👥', category:'Candidates' },
  { type:'my-candidates',    label:'My Candidates',        desc:'Candidates you own or manage',                  icon:'🙋', category:'Candidates' },
  { type:'attention',        label:'Needs Attention',      desc:'Stalled candidates and overdue tasks',          icon:'⚠️', category:'Candidates' },
  { type:'pinned-candidates',label:'Pinned Candidates',    desc:'Your starred candidates',                       icon:'⭐', category:'Candidates' },
  { type:'candidate-replies',label:'Recent Replies',       desc:'Latest candidate message replies',              icon:'💬', category:'Candidates' },
  { type:'availability',     label:'Candidate Availability',desc:'Candidates available to start',               icon:'🟢', category:'Candidates' },
  { type:'recently-viewed',  label:'Recently Viewed',      desc:'Candidates and jobs you opened recently',       icon:'🕐', category:'Candidates' },

  // Interviews & Offers
  { type:'my-interviews',    label:'My Interviews',        desc:'Upcoming and recent interviews',                icon:'🎤', category:'Interviews & Offers' },
  { type:'schedule',         label:"Today's Schedule",     desc:'All interviews and meetings today',             icon:'📆', category:'Interviews & Offers' },
  { type:'feedback',         label:'Interview Feedback',   desc:'Feedback pending from interviewers',            icon:'📋', category:'Interviews & Offers' },
  { type:'offers',           label:'Offer Approvals',      desc:'Offers pending approval or response',           icon:'📄', category:'Interviews & Offers' },

  // Placements & Revenue
  { type:'placements',       label:'Placement Watch',      desc:'Offer and placement status tracker',            icon:'🏆', category:'Placements & Revenue' },
  { type:'my-placements',    label:'My Placements',        desc:'Your placement history and pipeline',           icon:'🎉', category:'Placements & Revenue' },
  { type:'upcoming-starts',  label:'Upcoming Starts',      desc:'Candidates confirmed to start soon',            icon:'🚀', category:'Placements & Revenue' },
  { type:'revenue',          label:'Revenue',              desc:'Revenue metrics and targets',                   icon:'💰', category:'Placements & Revenue' },

  // Compliance
  { type:'bg-checks',        label:'Background Checks',    desc:'Pending and in-progress background checks',     icon:'🔒', category:'Compliance' },
  { type:'documents',        label:'Documents Waiting',    desc:'Documents pending signature or upload',         icon:'📎', category:'Compliance' },
  { type:'license-expiry',   label:'License Expiration',   desc:'Licenses expiring in the next 30 days',         icon:'⏰', category:'Compliance' },
  { type:'work-auth',        label:'Work Authorization',   desc:'Work auth status for active candidates',        icon:'🛂', category:'Compliance' },

  // Communication
  { type:'emails',           label:'Unread Emails',        desc:'Unread emails from candidates and clients',     icon:'📧', category:'Communication' },
  { type:'notifications',    label:'Notifications',        desc:'Recent system notifications',                   icon:'🔔', category:'Communication' },

  // Analytics & Team
  { type:'updates',          label:'Recent Updates',       desc:'Activity feed across the team',                 icon:'📰', category:'Analytics & Team' },
  { type:'progress',         label:"Today's Progress",     desc:'Daily metrics and goal tracking',               icon:'📈', category:'Analytics & Team' },
  { type:'leaderboard',      label:'Leaderboard',          desc:'Team performance rankings',                     icon:'🏅', category:'Analytics & Team' },
  { type:'source-perf',      label:'Source Performance',   desc:'Which sources produce the best hires',          icon:'📡', category:'Analytics & Team' },
  { type:'open-tasks',       label:'Open Tasks',           desc:'All open tasks across jobs and candidates',     icon:'🗂️', category:'Analytics & Team' },
  { type:'fav-clients',      label:'Favourite Clients',    desc:'Quick access to favourite client accounts',     icon:'🤝', category:'Analytics & Team' },

  // AI & Automation
  { type:'ai-suggestions',   label:'AI Suggestions',       desc:'AI-powered next best actions',                  icon:'✨', category:'AI & Automation' },
  { type:'automation',       label:'Automation Status',    desc:'Active automations and recent runs',            icon:'⚙️', category:'AI & Automation' },
  { type:'ai-activity',      label:'AI Activity',          desc:'What your AI agents have been doing',           icon:'🤖', category:'AI & Automation' },
] as const

export const WIDGET_CATEGORIES = [...new Set(WIDGET_CATALOG.map(w => w.category))]

// ─── Templates ────────────────────────────────────────────────────────────────

export interface TemplateConfig {
  label:   string
  desc:    string
  icon:    string
  color:   string
  widgets: string[]
}

// Typed as a concrete object so every key lookup is non-optional
export const DASHBOARD_TEMPLATES: { [key: string]: TemplateConfig; recruiter: TemplateConfig } = {
  blank: {
    label:'Blank Dashboard',        desc:'Start from scratch — you choose every section',
    icon:'⬜', color:'#6b7280',
    widgets: [],
  },
  recruiter: {
    label:'Recruiter Dashboard',    desc:'The classic all-round recruiter setup',
    icon:'🎯', color:'#dd7456',
    widgets: ['today-focus','todo','pipeline','attention','progress','placements','updates'],
  },
  healthcare: {
    label:'Healthcare Recruiter',   desc:'Compliance-heavy workflow for healthcare staffing',
    icon:'🏥', color:'#10b981',
    widgets: ['today-focus','todo','my-jobs','attention','license-expiry','work-auth','bg-checks','availability','schedule','updates'],
  },
  it: {
    label:'IT Recruiter',           desc:'Fast-paced tech hiring with candidate-first layout',
    icon:'💻', color:'#3b82f6',
    widgets: ['today-focus','todo','pipeline','my-candidates','saved-searches','candidate-replies','attention','progress','updates'],
  },
  manager: {
    label:'Recruitment Manager',    desc:'Team oversight, performance and pipeline health',
    icon:'📊', color:'#8b5cf6',
    widgets: ['today-focus','pipeline','leaderboard','open-tasks','progress','source-perf','updates','revenue'],
  },
  account: {
    label:'Account Manager',        desc:'Client relationship and revenue-focused layout',
    icon:'🤝', color:'#f59e0b',
    widgets: ['today-focus','fav-clients','my-jobs','offers','placements','upcoming-starts','revenue','updates'],
  },
  executive: {
    label:'Executive Dashboard',    desc:'High-level metrics — no noise',
    icon:'📈', color:'#1e293b',
    widgets: ['pipeline','revenue','leaderboard','source-perf','placements','progress','updates'],
  },
  operations: {
    label:'Operations Dashboard',   desc:'Process, compliance and automation focus',
    icon:'⚙️', color:'#64748b',
    widgets: ['todo','documents','bg-checks','work-auth','license-expiry','automation','attention','upcoming-starts'],
  },
}

// ─── AI role → template mapping ───────────────────────────────────────────────

export const AI_ROLE_TEMPLATE: Record<string, string> = {
  'Healthcare Recruiter':  'healthcare',
  'IT Recruiter':          'it',
  'Recruitment Manager':   'manager',
  'Account Manager':       'account',
  'Executive':             'executive',
  'Operations':            'operations',
  'Agency Owner':          'manager',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildWidgets(types: string[]): DashboardWidget[] {
  return types.map((type, i) => {
    const meta = WIDGET_CATALOG.find(w => w.type === type)
    return { id: ulid(), type, label: meta?.label ?? type, size: 'medium' as WidgetSize, hidden: false, order: i }
  })
}

const DEFAULT_DASHBOARD: DashboardConfig = {
  id:          ulid(),
  name:        'My Dashboard',
  description: 'Your default recruiter workspace',
  icon:        '🎯',
  color:       '#dd7456',
  template:    'recruiter',
  layout:      'comfortable',
  visibility:  'private',
  isDefault:   true,
  widgets:     buildWidgets(DASHBOARD_TEMPLATES.recruiter.widgets),
  createdAt:   Date.now(),
  updatedAt:   Date.now(),
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface DashboardStore {
  dashboards:        DashboardConfig[]
  activeDashboardId: string | null

  createDashboard:   (cfg: Omit<DashboardConfig, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateDashboard:   (id: string, updates: Partial<Omit<DashboardConfig, 'id' | 'createdAt'>>) => void
  deleteDashboard:   (id: string) => void
  restoreDashboard:  (id: string) => void
  duplicateDashboard:(id: string) => string
  setActive:         (id: string) => void
  setDefault:        (id: string) => void
  updateWidgets:     (id: string, widgets: DashboardWidget[]) => void
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      dashboards:        [DEFAULT_DASHBOARD],
      activeDashboardId: DEFAULT_DASHBOARD.id,

      createDashboard(cfg) {
        const id = ulid()
        const now = Date.now()
        const dash: DashboardConfig = { ...cfg, id, createdAt: now, updatedAt: now }
        // If new one is default, unset others
        set(s => ({
          dashboards: [
            ...(cfg.isDefault ? s.dashboards.map(d => ({ ...d, isDefault: false })) : s.dashboards),
            dash,
          ],
          activeDashboardId: id,
        }))
        return id
      },

      updateDashboard(id, updates) {
        const now = Date.now()
        set(s => ({
          dashboards: s.dashboards.map(d =>
            d.id === id
              ? { ...d, ...updates, updatedAt: now,
                  ...(updates.isDefault ? {} : {}) }
              : (updates.isDefault ? { ...d, isDefault: false } : d)
          ),
        }))
      },

      deleteDashboard(id) {
        set(s => ({
          dashboards: s.dashboards.map(d =>
            d.id === id ? { ...d, deletedAt: Date.now(), isDefault: false } : d
          ),
          activeDashboardId:
            s.activeDashboardId === id
              ? (s.dashboards.find(d => !d.deletedAt && d.id !== id)?.id ?? null)
              : s.activeDashboardId,
        }))
      },

      restoreDashboard(id) {
        set(s => ({
          dashboards: s.dashboards.map(d =>
            d.id === id ? { ...d, deletedAt: undefined } : d
          ),
        }))
      },

      duplicateDashboard(id) {
        const src = get().dashboards.find(d => d.id === id)
        if (!src) return ''
        const newId = ulid()
        const now   = Date.now()
        const copy: DashboardConfig = {
          ...src,
          id:        newId,
          name:      `${src.name} (copy)`,
          isDefault: false,
          deletedAt: undefined,
          widgets:   src.widgets.map(w => ({ ...w, id: ulid() })),
          createdAt: now,
          updatedAt: now,
        }
        set(s => ({ dashboards: [...s.dashboards, copy], activeDashboardId: newId }))
        return newId
      },

      setActive(id) {
        set({ activeDashboardId: id })
      },

      setDefault(id) {
        set(s => ({
          dashboards: s.dashboards.map(d => ({ ...d, isDefault: d.id === id })),
        }))
      },

      updateWidgets(id, widgets) {
        set(s => ({
          dashboards: s.dashboards.map(d =>
            d.id === id ? { ...d, widgets, updatedAt: Date.now() } : d
          ),
        }))
      },
    }),
    { name: 'god-recruiter-dashboards' }
  )
)

// ─── Derived helpers (call outside render for simplicity) ─────────────────────

export function getActiveDashboard(store: DashboardStore): DashboardConfig | undefined {
  return store.dashboards.find(d => d.id === store.activeDashboardId)
}

export { buildWidgets }
