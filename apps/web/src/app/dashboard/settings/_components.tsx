'use client'

import { ReactNode } from 'react'
import { Save, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

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

export function SettingsSection({ title, description, children, action }: { title: string; description?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-background">
      <div className="flex items-start justify-between px-5 py-4 border-b">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {action && <div className="shrink-0 ml-4">{action}</div>}
      </div>
      <div className="divide-y divide-border/50">{children}</div>
    </div>
  )
}

export function SettingRow({ label, description, children, fullWidth }: { label: string; description?: string; children: ReactNode; fullWidth?: boolean }) {
  if (fullWidth) {
    return (
      <div className="px-5 py-4">
        <div className="mb-2">
          <p className="text-sm font-medium">{label}</p>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {children}
      </div>
    )
  }
  return (
    <div className="flex items-center justify-between gap-6 px-5 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        checked ? 'bg-foreground' : 'bg-input'
      )}
    >
      <span className={cn(
        'pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transform ring-0 transition-transform',
        checked ? 'translate-x-4' : 'translate-x-0'
      )} />
    </button>
  )
}

export function SettingsHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6 pb-5 border-b">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
    </div>
  )
}

export function TabNav({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex items-center gap-0.5 border-b mb-6">
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)}
          className={cn(
            'px-3 py-2 text-xs font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
            active === t
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
          )}>
          {t}
        </button>
      ))}
    </div>
  )
}

export function FieldInput({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  )
}

export function FieldSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

export function Badge({ children, variant = 'default' }: { children: ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' }) {
  const cls = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger:  'bg-red-100 text-red-700',
    info:    'bg-blue-100 text-blue-700',
  }[variant]
  return <span className={cn('inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded', cls)}>{children}</span>
}
