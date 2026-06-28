'use client'

import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, Activity } from 'lucide-react'
import { SettingsHeader, SettingsSection, TabNav, Badge } from '../_components'
import { useState } from 'react'

const TABS = ['Health', 'Version', 'Feature Flags', 'Logs']

const SERVICES = [
  { name: 'Web Application',     status: 'operational', latency: '42ms',  uptime: '99.99%' },
  { name: 'Database',            status: 'operational', latency: '8ms',   uptime: '99.99%' },
  { name: 'AI Service',          status: 'operational', latency: '310ms', uptime: '99.95%' },
  { name: 'Email Service',       status: 'operational', latency: '180ms', uptime: '99.98%' },
  { name: 'SMS Service',         status: 'operational', latency: '95ms',  uptime: '99.97%' },
  { name: 'File Storage',        status: 'operational', latency: '55ms',  uptime: '100%' },
  { name: 'Background Jobs',     status: 'operational', latency: '—',     uptime: '99.93%' },
  { name: 'VMS Sync (Beeline)',  status: 'operational', latency: '240ms', uptime: '99.80%' },
  { name: 'VMS Sync (Fieldglass)',status: 'degraded',   latency: '1.2s',  uptime: '98.50%' },
  { name: 'VMS Sync (IQNav)',    status: 'operational', latency: '320ms', uptime: '99.70%' },
]

function StatusIcon({ status }: { status: string }) {
  if (status === 'operational') return <CheckCircle2 className="size-3.5 text-emerald-500" />
  if (status === 'degraded')    return <AlertTriangle className="size-3.5 text-amber-500" />
  return <XCircle className="size-3.5 text-red-500" />
}

const FLAGS = [
  { name: 'New Candidate Import UI',   desc: 'Redesigned bulk import flow',              enabled: false },
  { name: 'AI Auto-Submit',            desc: 'AI drafts submissions for recruiter review',enabled: false },
  { name: 'Board View v2',             desc: 'New drag-and-drop board with swim lanes',  enabled: true  },
  { name: 'Mobile App Beta',           desc: 'React Native mobile app early access',     enabled: false },
  { name: 'Advanced Analytics',        desc: 'New analytics dashboards with drill-down', enabled: false },
  { name: 'Candidate Ranking v3',      desc: 'Improved AI scoring with LLM ranking',     enabled: false },
]

export default function SystemPage() {
  const [tab, setTab] = useState('Health')
  const [flags, setFlags] = useState(FLAGS)

  const operational = SERVICES.filter(s => s.status === 'operational').length
  const total = SERVICES.length

  return (
    <div className="h-full overflow-y-auto p-6 max-w-3xl">
      <SettingsHeader title="System" description="Monitor service health, view release notes, manage feature flags, and review system logs." />
      <TabNav tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'Health' && (
        <div className="space-y-4">
          <div className={`rounded-xl border p-5 flex items-center gap-4 ${operational === total ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
            <Activity className={`size-8 ${operational === total ? 'text-emerald-600' : 'text-amber-600'}`} />
            <div>
              <p className={`text-sm font-semibold ${operational === total ? 'text-emerald-700' : 'text-amber-700'}`}>
                {operational === total ? 'All Systems Operational' : `${total - operational} Service${total - operational > 1 ? 's' : ''} Degraded`}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{operational}/{total} services healthy · Last checked: 2 min ago</p>
            </div>
            <button className="ml-auto p-1.5 rounded-md hover:bg-white/50 transition-colors text-muted-foreground">
              <RefreshCw className="size-4" />
            </button>
          </div>

          <SettingsSection title="Service Status">
            {SERVICES.map(s => (
              <div key={s.name} className="flex items-center justify-between px-5 py-3 border-b border-border/40 last:border-0">
                <div className="flex items-center gap-2.5">
                  <StatusIcon status={s.status} />
                  <span className="text-sm">{s.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{s.latency}</span>
                  <span>{s.uptime}</span>
                  <Badge variant={s.status === 'operational' ? 'success' : s.status === 'degraded' ? 'warning' : 'danger'}>
                    {s.status}
                  </Badge>
                </div>
              </div>
            ))}
          </SettingsSection>
        </div>
      )}

      {tab === 'Version' && (
        <SettingsSection title="Version Information">
          {[
            { label: 'Application Version',  value: 'v2.4.1' },
            { label: 'Release Date',         value: 'June 25, 2026' },
            { label: 'Environment',          value: 'Production' },
            { label: 'Region',               value: 'us-east-1' },
            { label: 'Database Version',     value: 'PostgreSQL 16.2' },
            { label: 'Node.js Version',      value: 'v22.3.0' },
            { label: 'Last Deploy',          value: 'Jun 25, 2026 — 3:42 PM UTC' },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between px-5 py-3 border-b border-border/40 last:border-0">
              <span className="text-sm text-muted-foreground">{r.label}</span>
              <span className="text-sm font-mono font-medium">{r.value}</span>
            </div>
          ))}
          <div className="px-5 py-4">
            <button className="h-7 px-3 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors">View Release Notes</button>
          </div>
        </SettingsSection>
      )}

      {tab === 'Feature Flags' && (
        <SettingsSection title="Experimental Features" description="Early access features for your organization. May be incomplete.">
          {flags.map((f, i) => (
            <div key={f.name} className="flex items-start justify-between px-5 py-4 border-b border-border/50 last:border-0">
              <div>
                <p className="text-sm font-medium">{f.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
              <div className="relative inline-flex shrink-0 ml-4">
                <button
                  onClick={() => setFlags(p => p.map((x, j) => j === i ? { ...x, enabled: !x.enabled } : x))}
                  className={`relative inline-flex h-5 w-9 rounded-full border-2 border-transparent transition-colors ${f.enabled ? 'bg-foreground' : 'bg-input'}`}
                >
                  <span className={`inline-block size-4 rounded-full bg-white shadow-sm transform transition-transform ${f.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          ))}
        </SettingsSection>
      )}

      {tab === 'Logs' && (
        <SettingsSection title="Recent System Events">
          {[
            { level: 'info',  msg: 'VMS sync completed — 3 new jobs from Beeline',              time: 'Today 10:45 AM' },
            { level: 'warn',  msg: 'Fieldglass VMS response slow (1.2s) — retried successfully', time: 'Today 10:43 AM' },
            { level: 'info',  msg: 'AI briefing generated for 6 recruiters',                    time: 'Today 08:00 AM' },
            { level: 'info',  msg: 'Daily backup completed — 18.4 GB',                          time: 'Today 02:00 AM' },
            { level: 'info',  msg: 'Scheduled report sent: Daily Work Queue Summary',           time: 'Yesterday 7:00 AM' },
            { level: 'error', msg: 'Fieldglass sync timeout — retrying in 5 min',               time: 'Yesterday 6:42 AM' },
          ].map((log, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-3 border-b border-border/50 last:border-0">
              <Badge variant={log.level === 'error' ? 'danger' : log.level === 'warn' ? 'warning' : 'info'}>{log.level}</Badge>
              <div>
                <p className="text-xs">{log.msg}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{log.time}</p>
              </div>
            </div>
          ))}
        </SettingsSection>
      )}
    </div>
  )
}
