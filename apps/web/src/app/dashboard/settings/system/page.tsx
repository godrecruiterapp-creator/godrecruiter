'use client'

import { useState } from 'react'
import { CheckCircle2, AlertTriangle, RefreshCw, Activity } from 'lucide-react'
import { Breadcrumb, PageHeader, SettingCard, Toggle, Badge } from '../_components'
import { cn } from '@/lib/utils'

const SERVICES = [
  { name: 'Web Application',       status: 'operational', latency: '42ms',  uptime: '99.99%' },
  { name: 'Database',              status: 'operational', latency: '8ms',   uptime: '99.99%' },
  { name: 'AI Service',            status: 'operational', latency: '310ms', uptime: '99.95%' },
  { name: 'Email Service',         status: 'operational', latency: '180ms', uptime: '99.98%' },
  { name: 'SMS Service',           status: 'operational', latency: '95ms',  uptime: '99.97%' },
  { name: 'File Storage',          status: 'operational', latency: '55ms',  uptime: '100%'   },
  { name: 'Background Jobs',       status: 'operational', latency: '—',     uptime: '99.93%' },
  { name: 'VMS Sync (Beeline)',    status: 'operational', latency: '240ms', uptime: '99.80%' },
  { name: 'VMS Sync (Fieldglass)', status: 'degraded',    latency: '1.2s',  uptime: '98.50%' },
  { name: 'VMS Sync (IQNav)',      status: 'operational', latency: '320ms', uptime: '99.70%' },
]

const FLAGS = [
  { id: '1', name: 'New Candidate Import UI',  desc: 'Redesigned bulk import flow',              enabled: false },
  { id: '2', name: 'AI Auto-Submit',           desc: 'AI drafts submissions for recruiter review',enabled: false },
  { id: '3', name: 'Board View v2',            desc: 'New drag-and-drop board with swim lanes',  enabled: true  },
  { id: '4', name: 'Mobile App Beta',          desc: 'React Native mobile app early access',     enabled: false },
  { id: '5', name: 'Advanced Analytics',       desc: 'New dashboards with drill-down',           enabled: false },
  { id: '6', name: 'Candidate Ranking v3',     desc: 'Improved AI scoring with LLM ranking',     enabled: false },
]

export default function SystemPage() {
  const [flags, setFlags] = useState(FLAGS)
  const operational = SERVICES.filter(s => s.status === 'operational').length
  const total        = SERVICES.length

  return (
    <div className="px-8 py-10">
      <Breadcrumb />
      <PageHeader title="System" description="Service health, version info, feature flags, and system logs." />

      <div className="space-y-4">
        {/* Health Banner */}
        <div className={cn('rounded-xl border p-5 flex items-center gap-4',
          operational === total ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50')}>
          <Activity className={cn('size-7 shrink-0', operational === total ? 'text-emerald-600' : 'text-amber-600')} />
          <div>
            <p className={cn('text-sm font-semibold', operational === total ? 'text-emerald-700' : 'text-amber-700')}>
              {operational === total ? 'All Systems Operational' : `${total - operational} Service${total - operational > 1 ? 's' : ''} Degraded`}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{operational}/{total} healthy · Last checked 2 min ago</p>
          </div>
          <button className="ml-auto p-1.5 rounded-lg hover:bg-black/5 transition-colors text-muted-foreground">
            <RefreshCw className="size-4" />
          </button>
        </div>

        {/* Services */}
        <SettingCard
          title="Service Status"
          description={`${operational} of ${total} services healthy`}
          summary={
            <div className="space-y-1.5">
              {SERVICES.filter(s => s.status !== 'operational').map(s => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <AlertTriangle className="size-3.5 text-amber-500 shrink-0" />
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted-foreground">— {s.latency} latency</span>
                </div>
              ))}
              {SERVICES.filter(s => s.status !== 'operational').length === 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  <span className="text-muted-foreground">All services operating normally</span>
                </div>
              )}
            </div>
          }
        >
          <div className="space-y-0">
            {SERVICES.map(s => (
              <div key={s.name} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
                <div className="flex items-center gap-2.5">
                  {s.status === 'operational'
                    ? <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                    : <AlertTriangle className="size-3.5 text-amber-500 shrink-0" />
                  }
                  <span className="text-sm">{s.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{s.latency}</span>
                  <span>{s.uptime}</span>
                  <Badge variant={s.status === 'operational' ? 'success' : 'warning'}>{s.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </SettingCard>

        {/* Version Info */}
        <SettingCard
          title="Version Information"
          description="Current build and environment details"
          summary={
            <div className="flex items-center gap-6 text-xs">
              <div><span className="text-muted-foreground">Version </span><span className="font-mono font-semibold">v2.4.1</span></div>
              <div><span className="text-muted-foreground">Env </span><span className="font-medium">Production</span></div>
              <div><span className="text-muted-foreground">Region </span><span className="font-medium">us-east-1</span></div>
              <div><span className="text-muted-foreground">Last deploy </span><span className="font-medium">Jun 25, 2026</span></div>
            </div>
          }
        >
          <div className="space-y-0">
            {[
              { label: 'Application version', value: 'v2.4.1' },
              { label: 'Release date',         value: 'June 25, 2026' },
              { label: 'Environment',          value: 'Production' },
              { label: 'Region',               value: 'us-east-1' },
              { label: 'Database version',     value: 'PostgreSQL 16.2' },
              { label: 'Node.js version',      value: 'v22.3.0' },
              { label: 'Last deploy',          value: 'Jun 25, 2026 — 3:42 PM UTC' },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
                <span className="text-sm text-muted-foreground">{r.label}</span>
                <span className="text-sm font-mono font-medium">{r.value}</span>
              </div>
            ))}
          </div>
        </SettingCard>

        {/* Feature Flags */}
        <SettingCard
          title="Feature Flags"
          description="Experimental features — may be incomplete"
          summary={
            <div className="flex items-center gap-2 flex-wrap">
              {flags.filter(f => f.enabled).map(f => (
                <Badge key={f.id} variant="info">{f.name}</Badge>
              ))}
              {flags.filter(f => f.enabled).length === 0 && (
                <span className="text-xs text-muted-foreground">No experimental features enabled.</span>
              )}
            </div>
          }
        >
          <div className="space-y-0">
            {flags.map((f, i) => (
              <div key={f.id} className="flex items-center justify-between py-3.5 border-b border-border/40 last:border-0">
                <div>
                  <p className="text-sm font-medium">{f.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
                <Toggle checked={f.enabled}
                  onChange={v => setFlags(p => p.map((x, j) => j === i ? { ...x, enabled: v } : x))} />
              </div>
            ))}
          </div>
        </SettingCard>

        {/* Logs */}
        <SettingCard
          title="Recent System Events"
          description="Last 48 hours of system activity"
          summary={
            <p className="text-xs text-muted-foreground">6 recent events · 1 warning · 0 errors</p>
          }
        >
          <div className="space-y-0">
            {[
              { level: 'info',  msg: 'VMS sync completed — 3 new jobs from Beeline',               time: 'Today 10:45 AM' },
              { level: 'warn',  msg: 'Fieldglass VMS response slow (1.2s) — retried successfully',  time: 'Today 10:43 AM' },
              { level: 'info',  msg: 'AI briefing generated for 6 recruiters',                     time: 'Today 08:00 AM' },
              { level: 'info',  msg: 'Daily backup completed — 18.4 GB',                           time: 'Today 02:00 AM' },
              { level: 'info',  msg: 'Scheduled report sent: Daily Work Queue Summary',            time: 'Yesterday 7AM'  },
              { level: 'info',  msg: 'User sarah@godrecruiter.com invited',                        time: 'Yesterday 3PM'  },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b border-border/40 last:border-0">
                <Badge variant={log.level === 'error' ? 'danger' : log.level === 'warn' ? 'warning' : 'info'}>
                  {log.level}
                </Badge>
                <div>
                  <p className="text-xs">{log.msg}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </SettingCard>
      </div>
    </div>
  )
}
