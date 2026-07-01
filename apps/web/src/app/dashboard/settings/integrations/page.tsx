'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, ExternalLink, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { Breadcrumb, PageHeader, Badge } from '../_components'
import { cn } from '@/lib/utils'

const VMS = [
  { name: 'Beeline',       desc: 'Enterprise VMS integration',          connected: true,  lastSync: '10 min ago',   jobs: 14 },
  { name: 'Fieldglass',    desc: 'SAP Fieldglass workforce management',  connected: true,  lastSync: '43 min ago',   jobs: 6  },
  { name: 'IQNavigator',   desc: 'Contingent workforce management',      connected: true,  lastSync: '2 hours ago',  jobs: 3  },
  { name: 'Workday',       desc: 'HR and talent management platform',    connected: false, lastSync: 'Never',        jobs: 0  },
  { name: 'Coupa',         desc: 'Business spend management',            connected: false, lastSync: 'Never',        jobs: 0  },
]

const JOB_BOARDS = [
  { name: 'Indeed',    connected: true  },
  { name: 'LinkedIn',  connected: true  },
  { name: 'ZipRecruiter', connected: false },
  { name: 'Monster',   connected: false },
]

export default function IntegrationsPage() {
  const [showApiKey, setShowApiKey] = useState(false)
  const apiKey = 'gr_live_sk_••••••••••••••••••••••••••7a3f'

  return (
    <div className="px-8 py-10">
      <Breadcrumb />
      <PageHeader title="Integrations" description="Connect VMS platforms, job boards, and external services." />

      <div className="space-y-6">
        {/* VMS */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">VMS Platforms</h2>
          <div className="space-y-3">
            {VMS.map(v => (
              <div key={v.name} className="rounded-xl border border-border bg-background p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('size-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                      v.connected ? 'bg-emerald-50 text-emerald-700' : 'bg-muted text-muted-foreground')}>
                      {v.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{v.name}</p>
                        <Badge variant={v.connected ? 'success' : 'default'}>
                          {v.connected ? 'Connected' : 'Not connected'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{v.desc}</p>
                      {v.connected && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Last sync: {v.lastSync} · {v.jobs} active jobs
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {v.connected && (
                      <button className="p-1.5 rounded-lg border border-border hover:bg-muted/60 transition-colors text-muted-foreground" title="Sync now">
                        <RefreshCw className="size-3.5" />
                      </button>
                    )}
                    <button className={cn('h-8 px-3.5 text-sm rounded-lg border transition-colors font-medium',
                      v.connected
                        ? 'border-border hover:bg-muted/60'
                        : 'border-foreground bg-foreground text-background hover:bg-foreground/90')}>
                      {v.connected ? 'Configure' : 'Connect'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Job Boards */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Job Boards</h2>
          <div className="rounded-xl border border-border bg-background overflow-hidden">
            {JOB_BOARDS.map((b, i) => (
              <div key={b.name} className={cn('flex items-center justify-between px-5 py-4', i < JOB_BOARDS.length - 1 && 'border-b border-border/40')}>
                <div className="flex items-center gap-3">
                  {b.connected
                    ? <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    : <XCircle className="size-4 text-muted-foreground/40 shrink-0" />
                  }
                  <span className="text-sm font-medium">{b.name}</span>
                </div>
                <button className="h-7 px-2.5 text-sm rounded-lg border border-border hover:bg-muted/60 transition-colors flex items-center gap-1.5">
                  {b.connected ? 'Manage' : 'Connect'}
                  <ExternalLink className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* API Keys */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">API Access</h2>
          <div className="rounded-xl border border-border bg-background p-5 space-y-4">
            <div>
              <p className="text-sm font-semibold">API Key</p>
              <p className="text-sm text-muted-foreground mt-0.5">Use this key to authenticate API requests from external systems.</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type={showApiKey ? 'text' : 'password'}
                readOnly
                value={apiKey}
                className="flex-1 h-9 px-3 text-sm rounded-lg border border-input bg-muted/40 font-mono focus:outline-none" />
              <button onClick={() => setShowApiKey(s => !s)}
                className="h-9 px-3 text-sm rounded-lg border border-border hover:bg-muted/60 transition-colors flex items-center gap-1.5">
                {showApiKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                {showApiKey ? 'Hide' : 'Reveal'}
              </button>
              <button className="h-9 px-3 text-sm rounded-lg border border-border hover:bg-muted/60 transition-colors">
                Regenerate
              </button>
            </div>
          </div>
        </div>

        {/* Webhooks */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Webhooks</h2>
          <div className="rounded-xl border border-border bg-background p-5">
            <p className="text-sm text-muted-foreground">No webhooks configured. Add one to receive real-time event notifications.</p>
            <button className="mt-3 h-8 px-3 text-sm rounded-lg border border-border hover:bg-muted/60 transition-colors">
              Add webhook
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
