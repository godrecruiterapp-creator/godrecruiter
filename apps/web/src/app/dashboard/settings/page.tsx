'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search, Building2, Users, Shield, Briefcase, Mail, Sparkles,
  Zap, Link2, Palette, Globe, Lock, FileCheck, CreditCard,
  BarChart3, Bell, HardDrive, Settings2, ChevronRight, Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const CARDS = [
  { href: '/dashboard/settings/organization', icon: Building2, label: 'Organization',        desc: 'Company info, locations, departments, business hours', stat: 'God Recruiter Inc.',         color: 'bg-blue-50 text-blue-600' },
  { href: '/dashboard/settings/users',        icon: Users,     label: 'Users & Teams',       desc: 'Manage recruiters, managers, and team structure',      stat: '7 active users',             color: 'bg-violet-50 text-violet-600' },
  { href: '/dashboard/settings/roles',        icon: Shield,    label: 'Roles & Permissions', desc: 'Access control and permission matrix',                 stat: '5 roles configured',         color: 'bg-orange-50 text-orange-600' },
  { href: '/dashboard/settings/recruitment',  icon: Briefcase, label: 'Recruitment',         desc: 'Pipeline stages, sources, skills, and job settings',   stat: '10 candidate stages',        color: 'bg-emerald-50 text-emerald-600' },
  { href: '/dashboard/settings/communication',icon: Mail,      label: 'Communication',       desc: 'Email, SMS, templates, and calendar integrations',     stat: 'Outlook connected',          color: 'bg-pink-50 text-pink-600' },
  { href: '/dashboard/settings/ai',           icon: Sparkles,  label: 'AI Settings',         desc: 'Provider, agents, scoring thresholds, and usage',      stat: 'Claude Sonnet 4.6',          color: 'bg-purple-50 text-purple-600' },
  { href: '/dashboard/settings/automation',   icon: Zap,       label: 'Automation',          desc: 'Workflow rules, triggers, and scheduled jobs',         stat: '5 active rules',             color: 'bg-amber-50 text-amber-600' },
  { href: '/dashboard/settings/integrations', icon: Link2,     label: 'Integrations',        desc: 'VMS, job boards, API keys, and webhooks',              stat: '3 VMS connected',            color: 'bg-sky-50 text-sky-600' },
  { href: '/dashboard/settings/branding',     icon: Palette,   label: 'Branding',            desc: 'Logo, colors, and white-label settings',               stat: 'Custom logo set',            color: 'bg-rose-50 text-rose-600' },
  { href: '/dashboard/settings/career-portal',icon: Globe,     label: 'Career Portal',       desc: 'Public job site, SEO, and candidate experience',       stat: 'Portal live',                color: 'bg-teal-50 text-teal-600' },
  { href: '/dashboard/settings/security',     icon: Lock,      label: 'Security',            desc: 'Password policy, 2FA, SSO, and access logs',           stat: '2FA enabled',                color: 'bg-red-50 text-red-600' },
  { href: '/dashboard/settings/compliance',   icon: FileCheck, label: 'Compliance',          desc: 'EEO, OFCCP, background checks, GDPR & CCPA',           stat: 'GDPR enabled',               color: 'bg-indigo-50 text-indigo-600' },
  { href: '/dashboard/settings/billing',      icon: CreditCard,label: 'Billing',             desc: 'Subscription plan, usage meters, and invoices',        stat: 'Growth · $299/mo',           color: 'bg-green-50 text-green-600' },
  { href: '/dashboard/settings/reports',      icon: BarChart3, label: 'Reports',             desc: 'Report templates, scheduled delivery, and export',     stat: '6 active reports',           color: 'bg-cyan-50 text-cyan-600' },
  { href: '/dashboard/settings/notifications',icon: Bell,      label: 'Notifications',       desc: 'Channels, events, digest, and quiet hours',            stat: '3 channels active',          color: 'bg-yellow-50 text-yellow-600' },
  { href: '/dashboard/settings/files',        icon: HardDrive, label: 'Files & Storage',     desc: 'Storage usage, upload limits, and document processing',stat: '18.4 GB / 50 GB',           color: 'bg-slate-50 text-slate-600' },
  { href: '/dashboard/settings/system',       icon: Settings2, label: 'System',              desc: 'Service health, feature flags, and system logs',       stat: 'All systems operational',    color: 'bg-emerald-50 text-emerald-600' },
]

const RECENT = [
  { label: 'Organization',   href: '/dashboard/settings/organization' },
  { label: 'Security',       href: '/dashboard/settings/security' },
  { label: 'Billing',        href: '/dashboard/settings/billing' },
  { label: 'Notifications',  href: '/dashboard/settings/notifications' },
]

export default function SettingsDashboard() {
  const [search, setSearch] = useState('')
  const filtered = search.trim()
    ? CARDS.filter(c =>
        c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.desc.toLowerCase().includes(search.toLowerCase())
      )
    : CARDS

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your organization, users, integrations, and system preferences.</p>
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search settings…"
          className="w-full h-10 pl-10 pr-4 text-sm rounded-xl border border-input bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-all"
        />
      </div>

      {/* Recently visited */}
      {!search && (
        <div className="mb-8">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Recently Visited</p>
          <div className="flex items-center gap-2 flex-wrap">
            {RECENT.map(r => (
              <Link key={r.href} href={r.href}
                className="inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-lg border border-border bg-background hover:bg-muted/60 transition-colors">
                <Clock className="size-3 text-muted-foreground" />
                {r.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(card => {
          const Icon = card.icon
          const [bg, fg] = card.color.split(' ') as [string, string]
          return (
            <Link key={card.href} href={card.href}
              className="group rounded-xl border border-border bg-background p-5 hover:shadow-sm hover:border-foreground/20 transition-all">
              <div className="flex items-start gap-4">
                <div className={cn('size-10 rounded-lg flex items-center justify-center shrink-0', bg)}>
                  <Icon className={cn('size-5', fg)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold truncate">{card.label}</p>
                    <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{card.desc}</p>
                  <p className="text-xs font-medium mt-2.5 text-foreground/60">{card.stat}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="size-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No settings match &ldquo;{search}&rdquo;</p>
        </div>
      )}
    </div>
  )
}
