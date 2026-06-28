'use client'

import { useState } from 'react'
import { Plus, Zap, Trash2 } from 'lucide-react'
import { Breadcrumb, PageHeader, SettingCard, CardRow, Toggle, Badge } from '../_components'

const RULES = [
  { id: '1', name: 'Auto-flag overdue jobs',         trigger: 'SLA ≤ 4 hours',                 action: 'Mark urgent + notify manager',           on: true  },
  { id: '2', name: 'Send briefing to recruiters',    trigger: 'Every day at 8:00 AM',           action: 'AI generates daily work briefing',        on: true  },
  { id: '3', name: 'Reassign inactive jobs',         trigger: 'No activity for 24 hours',       action: 'Move back to unassigned queue',           on: true  },
  { id: '4', name: 'Auto-parse new resumes',         trigger: 'Resume uploaded',                action: 'Run AI resume parsing',                  on: true  },
  { id: '5', name: 'Notify on new VMS job',          trigger: 'VMS sync imports new job',       action: 'Alert manager + auto-score with AI',     on: true  },
  { id: '6', name: 'Offer follow-up reminder',       trigger: 'Offer open for 48 hours',        action: 'Remind recruiter to follow up',          on: false },
  { id: '7', name: 'Archive placed candidates',      trigger: 'Candidate stage = Placed',       action: 'Archive after 30 days of inactivity',    on: false },
]

export default function AutomationPage() {
  const [rules, setRules] = useState(RULES)

  const toggle = (id: string) =>
    setRules(p => p.map(r => r.id === id ? { ...r, on: !r.on } : r))

  const activeCount = rules.filter(r => r.on).length

  return (
    <div className="px-8 py-10">
      <Breadcrumb />
      <PageHeader
        title="Automation"
        description="Workflow rules, scheduled tasks, and AI-driven actions."
        action={
          <button className="h-9 px-4 text-xs rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors flex items-center gap-1.5 font-medium">
            <Plus className="size-3.5" />New rule
          </button>
        }
      />

      <div className="space-y-4">
        {/* Active Rules */}
        <SettingCard
          title="Automation Rules"
          description={`${activeCount} of ${rules.length} rules active`}
          summary={
            <div className="flex items-center gap-2 flex-wrap">
              {rules.filter(r => r.on).map(r => (
                <div key={r.id} className="flex items-center gap-1.5 text-xs">
                  <Zap className="size-3 text-amber-500" />
                  <span>{r.name}</span>
                </div>
              ))}
            </div>
          }
        >
          <div className="space-y-0">
            {rules.map(r => (
              <div key={r.id} className="flex items-center justify-between py-4 border-b border-border/40 last:border-0">
                <div className="flex items-start gap-3">
                  <Toggle checked={r.on} onChange={() => toggle(r.id)} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{r.name}</p>
                      {!r.on && <Badge>inactive</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      When: {r.trigger}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Then: {r.action}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">Edit</button>
                  <button onClick={() => setRules(p => p.filter(x => x.id !== r.id))}
                    className="p-1 text-muted-foreground hover:text-red-600 transition-colors">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SettingCard>

        {/* Scheduled Tasks */}
        <SettingCard
          title="Scheduled Tasks"
          description="Recurring system jobs that run on a fixed schedule"
          summary={
            <p className="text-xs text-muted-foreground">5 scheduled tasks running daily/weekly.</p>
          }
        >
          <div className="space-y-3">
            {[
              { label: 'Daily AI briefing',         time: 'Every day 8:00 AM', on: true  },
              { label: 'VMS sync',                  time: 'Every 30 minutes',  on: true  },
              { label: 'Weekly performance report', time: 'Every Monday 7AM',  on: true  },
              { label: 'Daily backup',              time: 'Every day 2:00 AM', on: true  },
              { label: 'License expiry check',      time: 'Every day 9:00 AM', on: true  },
            ].map(t => (
              <CardRow key={t.label} label={t.label} description={t.time}>
                <Toggle checked={t.on} onChange={() => {}} />
              </CardRow>
            ))}
          </div>
        </SettingCard>
      </div>
    </div>
  )
}
