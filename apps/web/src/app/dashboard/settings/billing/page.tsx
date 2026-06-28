'use client'

import { CreditCard, Download, TrendingUp } from 'lucide-react'
import { Breadcrumb, PageHeader, SettingCard, SummaryGrid, Badge } from '../_components'
import { cn } from '@/lib/utils'

const USAGE = [
  { label: 'Active users',    used: 7,    limit: 15,   unit: 'users' },
  { label: 'AI tokens',       used: 240,  limit: 1000, unit: 'K tokens' },
  { label: 'Storage',         used: 18.4, limit: 50,   unit: 'GB' },
  { label: 'Jobs posted',     used: 23,   limit: 50,   unit: 'jobs' },
  { label: 'Automations',     used: 5,    limit: 20,   unit: 'rules' },
  { label: 'API calls',       used: 4200, limit: 10000,unit: 'calls/mo' },
]

const INVOICES = [
  { date: 'Jun 1, 2026',  amount: '$299.00', status: 'paid' },
  { date: 'May 1, 2026',  amount: '$299.00', status: 'paid' },
  { date: 'Apr 1, 2026',  amount: '$299.00', status: 'paid' },
  { date: 'Mar 1, 2026',  amount: '$249.00', status: 'paid' },
]

export default function BillingPage() {
  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <Breadcrumb />
      <PageHeader title="Billing" description="Subscription plan, usage, payment method, and invoices." />

      <div className="space-y-4">
        {/* Current Plan */}
        <div className="rounded-xl bg-foreground text-background p-6 overflow-hidden relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold opacity-60 uppercase tracking-wide mb-1">Current Plan</p>
              <h2 className="text-2xl font-bold">Growth</h2>
              <p className="text-sm opacity-70 mt-1">$299 / month · Billed monthly · Renews July 1, 2026</p>
            </div>
            <TrendingUp className="size-10 opacity-10" />
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button className="h-9 px-4 text-xs rounded-lg bg-background text-foreground hover:bg-background/90 transition-colors font-medium">
              Upgrade plan
            </button>
            <button className="h-9 px-4 text-xs rounded-lg border border-background/30 text-background hover:bg-white/10 transition-colors">
              View all plans
            </button>
          </div>
        </div>

        {/* Usage */}
        <SettingCard
          title="Usage"
          description="Current period usage against your plan limits"
          summary={
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {USAGE.map(u => {
                const pct = Math.round((u.used / u.limit) * 100)
                return (
                  <div key={u.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{u.label}</span>
                      <span className={cn('font-medium tabular-nums', pct >= 90 ? 'text-red-600' : pct >= 75 ? 'text-amber-600' : 'text-foreground')}>
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={cn('h-1.5 rounded-full transition-all', pct >= 90 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-500' : 'bg-emerald-500')}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          }
        >
          <div className="space-y-4">
            {USAGE.map(u => {
              const pct = Math.round((u.used / u.limit) * 100)
              return (
                <div key={u.label}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium">{u.label}</span>
                    <span className="text-muted-foreground">{u.used} / {u.limit} {u.unit}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={cn('h-2 rounded-full transition-all', pct >= 90 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-500' : 'bg-emerald-500')}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </SettingCard>

        {/* Payment Method */}
        <SettingCard
          title="Payment Method"
          description="Card used for subscription charges"
          summary={
            <div className="flex items-center gap-3 text-sm">
              <CreditCard className="size-4 text-muted-foreground" />
              <span className="font-medium">Visa ending in 4242</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground text-xs">Expires 08/27</span>
            </div>
          }
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Card number</label>
              <input defaultValue="•••• •••• •••• 4242"
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Expiry</label>
              <input defaultValue="08/27" placeholder="MM/YY"
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">CVC</label>
              <input defaultValue="•••" placeholder="CVC"
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
        </SettingCard>

        {/* Invoices */}
        <SettingCard
          title="Invoices"
          description="Download past invoices for your records"
          summary={
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{INVOICES.length} invoices available</span>
              <span>·</span>
              <span>All payments successful</span>
            </div>
          }
        >
          <div className="space-y-0">
            {INVOICES.map((inv, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
                <div>
                  <p className="text-sm font-medium">{inv.date}</p>
                  <p className="text-xs text-muted-foreground">{inv.amount} · Growth plan</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">{inv.status}</Badge>
                  <button className="h-7 px-2.5 text-xs rounded-lg border border-border hover:bg-muted/60 transition-colors flex items-center gap-1.5">
                    <Download className="size-3" />PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SettingCard>
      </div>
    </div>
  )
}
