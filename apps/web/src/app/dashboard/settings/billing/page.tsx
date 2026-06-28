'use client'

import { useState } from 'react'
import { CreditCard, Download, TrendingUp, Users, HardDrive, Sparkles, MessageSquare } from 'lucide-react'
import { SettingsHeader, SettingsSection, SettingRow, TabNav, SaveBar, Badge } from '../_components'

const TABS = ['Subscription', 'Usage', 'Invoices', 'Payment']

const INVOICES = [
  { id: 'INV-2026-06', date: 'Jun 1, 2026',  amount: '$299.00', status: 'paid',   period: 'Jun 2026' },
  { id: 'INV-2026-05', date: 'May 1, 2026',  amount: '$299.00', status: 'paid',   period: 'May 2026' },
  { id: 'INV-2026-04', date: 'Apr 1, 2026',  amount: '$249.00', status: 'paid',   period: 'Apr 2026' },
  { id: 'INV-2026-03', date: 'Mar 1, 2026',  amount: '$249.00', status: 'paid',   period: 'Mar 2026' },
  { id: 'INV-2026-02', date: 'Feb 1, 2026',  amount: '$249.00', status: 'paid',   period: 'Feb 2026' },
]

export default function BillingPage() {
  const [tab, setTab] = useState('Subscription')
  const [dirty, setDirty] = useState(false)

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 max-w-3xl">
        <SettingsHeader title="Billing" description="Manage your subscription, usage, invoices, and payment method." />
        <TabNav tabs={TABS} active={tab} onChange={setTab} />

        {tab === 'Subscription' && (
          <div className="space-y-4">
            {/* Current plan */}
            <div className="rounded-xl border border-foreground bg-foreground text-background p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-background/60 uppercase tracking-wide font-semibold">Current Plan</p>
                  <h3 className="text-xl font-bold mt-0.5">Growth</h3>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <p className="text-2xl font-bold">$299<span className="text-sm font-normal text-background/70">/month</span></p>
              <p className="text-xs text-background/70 mt-1">Next billing date: Jul 1, 2026</p>
              <div className="mt-4 pt-4 border-t border-background/20 grid grid-cols-3 gap-3 text-xs text-background/70">
                <div><span className="block text-background font-semibold text-sm">10</span>Users included</div>
                <div><span className="block text-background font-semibold text-sm">10M</span>AI tokens/mo</div>
                <div><span className="block text-background font-semibold text-sm">50GB</span>Storage</div>
              </div>
            </div>

            <SettingsSection title="Plan Features">
              {[
                'Unlimited jobs and candidates',
                'Work Queue with AI scoring',
                'VMS integrations (Beeline, Fieldglass, IQNavigator)',
                'AI resume parsing and matching',
                'Email and SMS integration',
                'Projects and Automation modules',
                'Standard support (email + chat)',
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 px-5 py-2.5 border-b border-border/40 last:border-0">
                  <span className="text-emerald-600">✓</span>
                  <span className="text-sm">{f}</span>
                </div>
              ))}
            </SettingsSection>

            <div className="rounded-xl border border-border bg-muted/20 p-5">
              <p className="text-sm font-semibold mb-1">Upgrade to Enterprise</p>
              <p className="text-xs text-muted-foreground mb-3">Unlimited users, custom AI models, dedicated account manager, SLA guarantees, and white-label options.</p>
              <button className="h-8 px-4 text-xs rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors">Contact Sales</button>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setDirty(true)} className="h-8 px-3 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors">Change Plan</button>
              <button className="h-8 px-3 text-xs rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition-colors">Cancel Subscription</button>
            </div>
          </div>
        )}

        {tab === 'Usage' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Users',        used: 7,       limit: 10,      unit: 'users',    icon: Users,        color: 'text-blue-600' },
                { label: 'Storage',      used: 18.4,    limit: 50,      unit: 'GB',       icon: HardDrive,    color: 'text-violet-600' },
                { label: 'AI Tokens',    used: 2.4,     limit: 10,      unit: 'M tokens', icon: Sparkles,     color: 'text-purple-600' },
                { label: 'SMS Credits',  used: 840,     limit: 2000,    unit: 'messages', icon: MessageSquare,color: 'text-emerald-600' },
              ].map(m => {
                const pct = Math.round((m.used / m.limit) * 100)
                const barColor = pct >= 90 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                const Icon = m.icon
                return (
                  <div key={m.label} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                      <Icon className={`size-3.5 ${m.color}`} />
                    </div>
                    <p className="text-lg font-bold tabular-nums">{m.used}<span className="text-xs font-normal text-muted-foreground">/{m.limit} {m.unit}</span></p>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-2">
                      <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{pct}% used</p>
                  </div>
                )
              })}
            </div>

            <SettingsSection title="Add-ons">
              <SettingRow label="Additional Users" description="$25/user/month">
                <button onClick={() => setDirty(true)} className="h-7 px-2.5 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors">Add Users</button>
              </SettingRow>
              <SettingRow label="Additional AI Credits" description="10M tokens for $49">
                <button onClick={() => setDirty(true)} className="h-7 px-2.5 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors">Buy Credits</button>
              </SettingRow>
              <SettingRow label="Additional SMS Credits" description="1,000 messages for $12">
                <button onClick={() => setDirty(true)} className="h-7 px-2.5 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors">Buy Credits</button>
              </SettingRow>
              <SettingRow label="Additional Storage" description="50GB for $9/month">
                <button onClick={() => setDirty(true)} className="h-7 px-2.5 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors">Upgrade</button>
              </SettingRow>
            </SettingsSection>
          </div>
        )}

        {tab === 'Invoices' && (
          <SettingsSection title="Invoice History">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Invoice</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Period</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Amount</th>
                    <th className="text-center px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {INVOICES.map((inv, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3 font-mono text-muted-foreground">{inv.id}</td>
                      <td className="px-3 py-3">{inv.period}</td>
                      <td className="px-3 py-3 text-muted-foreground">{inv.date}</td>
                      <td className="px-3 py-3 text-right font-semibold">{inv.amount}</td>
                      <td className="px-3 py-3 text-center">
                        <Badge variant="success">{inv.status}</Badge>
                      </td>
                      <td className="px-3 py-3">
                        <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                          <Download className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SettingsSection>
        )}

        {tab === 'Payment' && (
          <div className="space-y-4">
            <SettingsSection title="Payment Method">
              <div className="px-5 py-4 flex items-center gap-4">
                <div className="size-12 rounded-lg border border-border bg-muted/30 flex items-center justify-center shrink-0">
                  <CreditCard className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Visa ending in 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 08/2028</p>
                </div>
                <button onClick={() => setDirty(true)} className="ml-auto h-7 px-2.5 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors">Update</button>
              </div>
            </SettingsSection>
            <SettingsSection title="Billing Contact">
              <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Billing Email</label>
                  <input defaultValue="godrecruiterapp@gmail.com" onChange={() => setDirty(true)}
                    className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Company / Tax ID</label>
                  <input defaultValue="" placeholder="Optional" onChange={() => setDirty(true)}
                    className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
              </div>
            </SettingsSection>
          </div>
        )}
      </div>
      <SaveBar dirty={dirty} onSave={() => setDirty(false)} onDiscard={() => setDirty(false)} />
    </div>
  )
}
