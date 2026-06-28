'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { Save, X, AlertCircle, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Legacy components (kept for existing pages) ─────────────────────────────

export function SaveBar({ dirty, onSave, onDiscard }: { dirty: boolean; onSave: () => void; onDiscard: () => void }) {
  if (!dirty) return null
  return (
    <div className="sticky bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur z-10">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2 text-xs text-amber-600">
          <AlertCircle className="size-3.5" />Unsaved changes
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onDiscard} className="h-8 px-3 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors flex items-center gap-1.5">
            <X className="size-3.5" />Discard
          </button>
          <button onClick={onSave} className="h-8 px-3 text-xs rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors flex items-center gap-1.5">
            <Save className="size-3.5" />Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export function SettingsSection({ title, description, children, action }: {
  title: string; description?: string; children: ReactNode; action?: ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden mb-4">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

export function SettingRow({ label, description, children, fullWidth }: {
  label: string; description?: string; children: ReactNode; fullWidth?: boolean
}) {
  return (
    <div className={cn('flex px-5 py-3.5 border-b border-border/40 last:border-0', fullWidth ? 'flex-col gap-2' : 'items-center justify-between gap-4')}>
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className={fullWidth ? '' : 'shrink-0'}>{children}</div>
    </div>
  )
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn('relative inline-flex h-5 w-9 rounded-full border-2 border-transparent transition-colors shrink-0', checked ? 'bg-foreground' : 'bg-input')}
    >
      <span className={cn('inline-block size-4 rounded-full bg-white shadow-sm transform transition-transform', checked ? 'translate-x-4' : 'translate-x-0')} />
    </button>
  )
}

export function SettingsHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6 pb-4 border-b border-border">
      <h2 className="text-base font-semibold">{title}</h2>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </div>
  )
}

export function TabNav({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex items-center gap-1 mb-5 border-b border-border">
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)}
          className={cn('px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px', t === active ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}>
          {t}
        </button>
      ))}
    </div>
  )
}

export function FieldInput({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-shadow" />
    </div>
  )
}

export function FieldSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-shadow">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

export function Badge({ children, variant = 'default' }: {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium', {
      'bg-muted text-muted-foreground':   variant === 'default',
      'bg-emerald-100 text-emerald-700':  variant === 'success',
      'bg-amber-100 text-amber-700':      variant === 'warning',
      'bg-red-100 text-red-700':          variant === 'danger',
      'bg-blue-100 text-blue-700':        variant === 'info',
    })}>
      {children}
    </span>
  )
}

// ─── Modern SaaS components ───────────────────────────────────────────────────

export function Breadcrumb({ label = 'Settings', href = '/dashboard/settings' }: { label?: string; href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6 group">
      <ChevronLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
      {label}
    </Link>
  )
}

export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      {action && <div className="shrink-0 ml-4">{action}</div>}
    </div>
  )
}

/** Card that shows a summary when collapsed; expands to a form on Edit. Each card saves independently. */
export function SettingCard({ title, description, summary, children, action }: {
  title: string
  description?: string
  summary: ReactNode
  children: ReactNode
  action?: ReactNode
}) {
  const [editing, setEditing] = useState(false)
  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          {action}
          {!editing && (
            <button onClick={() => setEditing(true)}
              className="h-8 px-3.5 text-xs rounded-lg border border-border hover:bg-muted/60 transition-colors font-medium">
              Edit
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <>
          <div className="px-6 pt-5 pb-4 border-t border-border space-y-4">{children}</div>
          <div className="flex justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20">
            <button onClick={() => setEditing(false)}
              className="h-8 px-3.5 text-xs rounded-lg border border-border hover:bg-muted/60 transition-colors">
              Cancel
            </button>
            <button onClick={() => setEditing(false)}
              className="h-8 px-3.5 text-xs rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors font-medium">
              Save changes
            </button>
          </div>
        </>
      ) : (
        <div className="px-6 pb-5 border-t border-border/40 pt-4">{summary}</div>
      )}
    </div>
  )
}

/** Key-value grid for SettingCard summary views */
export function SummaryGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
      {items.map(i => (
        <div key={i.label}>
          <dt className="text-xs text-muted-foreground">{i.label}</dt>
          <dd className="text-sm font-medium mt-0.5">{i.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Inline row inside SettingCard edit form */
export function CardRow({ label, description, children }: { label: string; description?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 py-1">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}
