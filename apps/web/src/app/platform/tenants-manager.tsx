'use client'

import { useState } from 'react'
import { Plus, Building2, Loader2 } from 'lucide-react'
import { Badge, SettingsSection } from '@/app/dashboard/settings/_components'
import { createTenantAction, setTenantStatusAction, type TenantRow } from './actions'

const REGIONS = ['us-east-1', 'eu-west-1', 'ap-southeast-1'] as const

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (t: TenantRow) => void }) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [region, setRegion] = useState<string>(REGIONS[0])
  const [ownerName, setOwnerName] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    if (!name.trim() || !slug.trim() || !ownerName.trim() || !ownerEmail.trim()) return
    setPending(true); setError(null)
    const res = await createTenantAction({ name, slug, region, ownerEmail, ownerName })
    setPending(false)
    if ('error' in res) { setError(res.error); return }
    onCreated({ id: slug, name, slug, region, status: 'trial', plan_id: 'trial', created_at: new Date().toISOString() })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl border border-border shadow-xl w-full max-w-md p-6">
        <h3 className="text-sm font-semibold mb-4">Create Company</h3>
        {error && <p className="text-sm text-destructive mb-3">{error}</p>}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Company name</label>
            <input value={name} onChange={e => { setName(e.target.value); setSlug(slugify(e.target.value)) }} placeholder="Acme Staffing"
              className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus-visible:outline-none focus-visible:border-[#D1D5DB]" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">URL slug</label>
            <input value={slug} onChange={e => setSlug(slugify(e.target.value))} placeholder="acme-staffing"
              className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus-visible:outline-none focus-visible:border-[#D1D5DB]" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Region</label>
            <select value={region} onChange={e => setRegion(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus-visible:outline-none focus-visible:border-[#D1D5DB]">
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="pt-2 border-t border-border/60 space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Owner (becomes Super Admin)</p>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Full name</label>
              <input value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="Jane Smith"
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus-visible:outline-none focus-visible:border-[#D1D5DB]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Email address</label>
              <input value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} placeholder="jane@acme.com"
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus-visible:outline-none focus-visible:border-[#D1D5DB]" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="h-8 px-3 text-sm rounded-lg border border-border hover:bg-muted/60 transition-colors">Cancel</button>
          <button onClick={handleCreate} disabled={pending || !name.trim() || !slug.trim() || !ownerName.trim() || !ownerEmail.trim()}
            className="h-8 px-3 text-sm rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors flex items-center gap-1.5 disabled:opacity-40">
            {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Building2 className="size-3.5" />}
            Create Tenant
          </button>
        </div>
      </div>
    </div>
  )
}

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  trial: 'info', active: 'success', suspended: 'warning', cancelled: 'danger',
}

export function TenantsManager({ initialTenants }: { initialTenants: TenantRow[] }) {
  const [tenants, setTenants] = useState(initialTenants)
  const [showCreate, setShowCreate] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function handleToggleStatus(t: TenantRow) {
    setError(null); setBusyId(t.id)
    const nextStatus = t.status === 'suspended' ? 'active' : 'suspended'
    const res = await setTenantStatusAction(t.id, nextStatus)
    setBusyId(null)
    if ('error' in res) { setError(res.error); return }
    setTenants(prev => prev.map(x => x.id === t.id ? { ...x, status: nextStatus } : x))
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowCreate(true)}
          className="h-9 px-4 text-sm rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors flex items-center gap-1.5 font-medium">
          <Plus className="size-3.5" />Create Company
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/60 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <SettingsSection title={`Tenants (${tenants.length})`} description="Every company using God Recruiter">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Company', 'Region', 'Plan', 'Status', ''].map(h => (
                  <th key={h} className="px-5 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenants.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">No companies yet.</td></tr>
              )}
              {tenants.map(t => (
                <tr key={t.id} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.slug}</p>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{t.region}</td>
                  <td className="px-5 py-3 text-muted-foreground capitalize">{t.plan_id}</td>
                  <td className="px-5 py-3"><Badge variant={STATUS_VARIANT[t.status] ?? 'default'}>{t.status}</Badge></td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => handleToggleStatus(t)} disabled={busyId === t.id}
                      className="h-7 px-2.5 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors disabled:opacity-40">
                      {busyId === t.id ? '…' : t.status === 'suspended' ? 'Activate' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsSection>

      {showCreate && (
        <CreateModal onClose={() => setShowCreate(false)}
          onCreated={t => setTenants(prev => [t, ...prev])} />
      )}
    </>
  )
}
