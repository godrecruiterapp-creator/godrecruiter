'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Building2, Plus, Search } from 'lucide-react'
import type { Client, Industry } from './_data'

type ClientRow = { client: Client; totalJobs: number; openJobs: number; placements: number }

const STATUS_BADGE: Record<Client['status'], string> = {
  active:   'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  prospect: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  inactive: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
}
const STATUS_LABEL: Record<Client['status'], string> = {
  active: 'Active', prospect: 'Prospect', inactive: 'Inactive',
}

function Chip({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${className}`}>
      {label}
    </span>
  )
}

function toInitials(name: string) {
  return name.split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2) || '??'
}

export function ClientsTableClient({ rows }: { rows: ClientRow[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [industry, setIndustry] = useState<Industry | '__all__'>('__all__')
  const [status, setStatus] = useState<Client['status'] | '__all__'>('__all__')

  const industries = useMemo(() => Array.from(new Set(rows.map(r => r.client.industry))).sort(), [rows])

  const filtered = rows.filter(({ client: c }) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.accountOwner.toLowerCase().includes(search.toLowerCase())) return false
    if (industry !== '__all__' && c.industry !== industry) return false
    if (status !== '__all__' && c.status !== status) return false
    return true
  })

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="size-10 rounded-full bg-muted flex items-center justify-center">
          <Building2 className="size-4 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No clients yet</p>
        <p className="text-sm text-muted-foreground">Add your first client to start posting jobs against them.</p>
        <Link href="/dashboard/clients/new" className="mt-1 h-9 px-4 text-sm font-medium rounded-lg bg-brand hover:bg-brand/90 text-white flex items-center gap-1.5">
          <Plus className="size-3.5" />Add client
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between pb-3 shrink-0 gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="relative shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or account owner…" className="h-8 w-64 pl-8 text-sm" />
          </div>
          <Select value={industry} onValueChange={v => setIndustry(v as typeof industry)}>
            <SelectTrigger className="h-8 w-40 text-sm"><SelectValue placeholder="Industry" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All industries</SelectItem>
              {industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={v => setStatus(v as typeof status)}>
            <SelectTrigger className="h-8 w-36 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link href="/dashboard/clients/new"
          className="h-8 px-3.5 text-sm font-medium rounded-lg bg-brand hover:bg-brand/90 text-white flex items-center gap-1.5 shrink-0">
          <Plus className="size-3.5" />Add client
        </Link>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto rounded-xl border border-border">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 bg-muted/40 z-10">
            <tr className="border-b border-border">
              {['Name', 'Industry', 'Status', 'Account Owner', 'Open Jobs', 'Placements', 'Last Activity'].map(h => (
                <th key={h} className="text-left px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ client: c, openJobs, placements }) => (
              <tr key={c.id} onClick={() => router.push(`/dashboard/clients/${c.id}`)}
                className="border-b border-border/60 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors" style={{ height: 52 }}>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-8 rounded-lg bg-brand-muted text-brand flex items-center justify-center text-xs font-bold shrink-0">
                      {toInitials(c.name)}
                    </div>
                    <span className="font-medium truncate">{c.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-secondary-foreground">{c.industry}</td>
                <td className="px-3 py-2"><Chip label={STATUS_LABEL[c.status]} className={STATUS_BADGE[c.status]} /></td>
                <td className="px-3 py-2 text-secondary-foreground">{c.accountOwner}</td>
                <td className="px-3 py-2 text-secondary-foreground">{openJobs}</td>
                <td className="px-3 py-2 text-secondary-foreground">{placements}</td>
                <td className="px-3 py-2 text-secondary-foreground">{c.lastActivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-medium">No clients match your filters</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different search or clear a filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}
