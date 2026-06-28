'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, ExternalLink, Plus, Copy, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { SettingsHeader, SettingsSection, TabNav, SaveBar, FieldInput, Badge } from '../_components'

const TABS = ['VMS', 'Job Boards', 'Cloud & Storage', 'API & Webhooks']

const VMS = [
  { name: 'Beeline',       connected: true,  jobs: 8,  lastSync: '5 min ago',  logo: '🔵' },
  { name: 'Fieldglass',    connected: true,  jobs: 6,  lastSync: '12 min ago', logo: '🟡' },
  { name: 'IQNavigator',   connected: true,  jobs: 5,  lastSync: '8 min ago',  logo: '🟢' },
  { name: 'Coupa',         connected: false, jobs: 0,  lastSync: 'Never',      logo: '🟠' },
  { name: 'SAP Fieldglass',connected: false, jobs: 0,  lastSync: 'Never',      logo: '⚫' },
  { name: 'Wand',          connected: false, jobs: 0,  lastSync: 'Never',      logo: '🔷' },
]

const JOB_BOARDS = [
  { name: 'LinkedIn',     connected: true,  posts: 24, logo: '💼' },
  { name: 'Indeed',       connected: true,  posts: 18, logo: '🔍' },
  { name: 'Dice',         connected: false, posts: 0,  logo: '🎲' },
  { name: 'Monster',      connected: false, posts: 0,  logo: '👾' },
  { name: 'CareerBuilder',connected: false, posts: 0,  logo: '🏗️' },
  { name: 'ZipRecruiter', connected: false, posts: 0,  logo: '⚡' },
]

const CLOUD = [
  { name: 'Google Drive',      connected: true,  desc: 'Store resumes and documents',     logo: '📁' },
  { name: 'OneDrive',          connected: false, desc: 'Microsoft cloud storage',          logo: '☁️' },
  { name: 'Dropbox',           connected: false, desc: 'File storage and sharing',         logo: '📦' },
  { name: 'Google Workspace',  connected: true,  desc: 'Docs, Sheets, Gmail',              logo: '🗂️' },
  { name: 'Microsoft 365',     connected: true,  desc: 'Outlook, Teams, OneDrive',         logo: '🪟' },
  { name: 'Bullhorn',          connected: false, desc: 'Migrate data from Bullhorn ATS',   logo: '📊' },
  { name: 'CEIPAL',            connected: false, desc: 'Migrate data from CEIPAL ATS',     logo: '📋' },
]

const API_KEYS = [
  { name: 'Production API Key', key: 'gr_live_••••••••••••••••••••••••••••••••', created: 'Jun 1, 2026',    lastUsed: 'Today',      scopes: ['read', 'write'] },
  { name: 'Zapier Integration', key: 'gr_live_••••••••••••••••••••••••••••••••', created: 'May 15, 2026',   lastUsed: '2 days ago', scopes: ['read'] },
  { name: 'Power Automate',     key: 'gr_live_••••••••••••••••••••••••••••••••', created: 'Apr 20, 2026',   lastUsed: 'Yesterday',  scopes: ['read', 'write'] },
]

export default function IntegrationsPage() {
  const [tab, setTab] = useState('VMS')
  const [dirty, setDirty] = useState(false)
  const [showKey, setShowKey] = useState<Record<number, boolean>>({})

  function IntegCard({ name, connected, logo, meta, onConnect }: { name: string; connected: boolean; logo: string; meta?: string; onConnect: () => void }) {
    return (
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="text-xl shrink-0">{logo}</span>
          <div>
            <p className="text-sm font-medium">{name}</p>
            {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {connected
            ? <Badge variant="success"><CheckCircle2 className="size-2.5 mr-0.5 inline" />Connected</Badge>
            : <Badge><XCircle className="size-2.5 mr-0.5 inline" />Not Connected</Badge>}
          <button onClick={onConnect} className="h-7 px-2.5 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors flex items-center gap-1">
            {connected ? 'Configure' : 'Connect'}<ExternalLink className="size-2.5 ml-1" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 max-w-3xl">
        <SettingsHeader title="Integrations" description="Connect VMS platforms, job boards, cloud storage, and external services." />
        <TabNav tabs={TABS} active={tab} onChange={setTab} />

        {tab === 'VMS' && (
          <SettingsSection title="VMS Integrations" description="Jobs received from connected VMS platforms flow directly into Work Queue.">
            {VMS.map(v => (
              <IntegCard key={v.name} name={v.name} connected={v.connected} logo={v.logo}
                meta={v.connected ? `${v.jobs} active jobs · Last sync: ${v.lastSync}` : 'Not connected'}
                onConnect={() => setDirty(true)} />
            ))}
          </SettingsSection>
        )}

        {tab === 'Job Boards' && (
          <SettingsSection title="Job Boards" description="Post jobs directly to connected job boards.">
            {JOB_BOARDS.map(b => (
              <IntegCard key={b.name} name={b.name} connected={b.connected} logo={b.logo}
                meta={b.connected ? `${b.posts} active postings` : 'Not connected'}
                onConnect={() => setDirty(true)} />
            ))}
          </SettingsSection>
        )}

        {tab === 'Cloud & Storage' && (
          <SettingsSection title="Cloud Services & Migrations">
            {CLOUD.map(c => (
              <IntegCard key={c.name} name={c.name} connected={c.connected} logo={c.logo} meta={c.desc} onConnect={() => setDirty(true)} />
            ))}
          </SettingsSection>
        )}

        {tab === 'API & Webhooks' && (
          <div className="space-y-4">
            <SettingsSection title="API Keys" action={
              <button onClick={() => setDirty(true)} className="h-7 px-2.5 text-xs rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors flex items-center gap-1.5">
                <Plus className="size-3.5" />Generate Key
              </button>
            }>
              {API_KEYS.map((k, i) => (
                <div key={i} className="px-5 py-4 border-b border-border/50 last:border-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium">{k.name}</p>
                    <div className="flex items-center gap-1">
                      {k.scopes.map(s => <Badge key={s}>{s}</Badge>)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-[10px] font-mono bg-muted rounded px-2 py-1 text-muted-foreground">
                      {showKey[i] ? k.key.replace(/•/g, 'x') : k.key}
                    </code>
                    <button onClick={() => setShowKey(p => ({ ...p, [i]: !p[i] }))} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                      {showKey[i] ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                    <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">Created {k.created} · Last used {k.lastUsed}</p>
                </div>
              ))}
            </SettingsSection>

            <SettingsSection title="Webhooks" description="Send real-time events to external systems." action={
              <button onClick={() => setDirty(true)} className="h-7 px-2.5 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors flex items-center gap-1.5">
                <Plus className="size-3.5" />Add Webhook
              </button>
            }>
              {[
                { url: 'https://zapier.com/hooks/catch/••••••••', events: ['job.created','candidate.submitted'], active: true },
                { url: 'https://flow.microsoft.com/api/•••••••', events: ['placement.completed'],              active: true },
              ].map((w, i) => (
                <div key={i} className="flex items-start justify-between px-5 py-3.5 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground">{w.url}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {w.events.map(e => <Badge key={e}>{e}</Badge>)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <Badge variant="success">Active</Badge>
                    <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                      <RefreshCw className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </SettingsSection>
          </div>
        )}
      </div>
      <SaveBar dirty={dirty} onSave={() => setDirty(false)} onDiscard={() => setDirty(false)} />
    </div>
  )
}
