'use client'

import { useState } from 'react'
import { Plus, Zap, Play, Pause, Trash2, Clock } from 'lucide-react'
import { SettingsHeader, SettingsSection, SettingRow, TabNav, SaveBar, Toggle, Badge } from '../_components'

const TABS = ['Workflow Rules', 'Assignment Rules', 'Scheduled Jobs', 'Logs']

const RULES = [
  { name: 'Auto-assign urgent jobs',          trigger: 'Job priority = Urgent',       action: 'Assign to available recruiter with matching skill', active: true,  runs: 42  },
  { name: 'SLA warning notification',         trigger: 'SLA < 4 hours remaining',     action: 'Send SMS + in-app to assigned recruiter',           active: true,  runs: 128 },
  { name: 'No-activity escalation',           trigger: 'No activity for 24h',         action: 'Email manager + flag job in queue',                 active: true,  runs: 17  },
  { name: 'Auto follow-up email',             trigger: 'Candidate contacted, no reply', action: 'Send follow-up email after 3 days',              active: false, runs: 0   },
  { name: 'Interview reminder',               trigger: 'Interview in 24 hours',        action: 'Send reminder email + SMS to candidate',           active: true,  runs: 56  },
  { name: 'Round-robin assignment',           trigger: 'Job = Medium/Low priority, unassigned', action: 'Assign using round-robin to Healthcare team', active: false, runs: 0 },
  { name: 'Placement completion task',        trigger: 'Candidate moved to Placed',   action: 'Create task: Send placement paperwork',            active: true,  runs: 12  },
]

const SCHEDULED = [
  { name: 'Daily AI Briefing',          schedule: 'Every weekday 8:00 AM CT', lastRun: 'Today 8:00 AM',  status: 'active' },
  { name: 'Weekly Workload Report',     schedule: 'Every Monday 7:00 AM CT',  lastRun: 'Jun 23 7:00 AM', status: 'active' },
  { name: 'SLA Overdue Digest',         schedule: 'Every day 7:00 AM CT',     lastRun: 'Today 7:00 AM',  status: 'active' },
  { name: 'Idle Job Scan',              schedule: 'Every 4 hours',            lastRun: '2h ago',          status: 'active' },
  { name: 'Candidate Expiry Check',     schedule: 'Every Sunday midnight',    lastRun: 'Jun 22',          status: 'paused' },
]

export default function AutomationPage() {
  const [tab, setTab] = useState('Workflow Rules')
  const [dirty, setDirty] = useState(false)
  const mark = () => setDirty(true)
  const [rules, setRules] = useState(RULES)

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 max-w-3xl">
        <SettingsHeader title="Automation" description="Configure workflow rules, assignment automation, scheduled jobs, and escalation rules." />
        <TabNav tabs={TABS} active={tab} onChange={setTab} />

        {tab === 'Workflow Rules' && (
          <SettingsSection title={`Workflow Rules (${rules.length})`} action={
            <button onClick={mark} className="h-7 px-2.5 text-xs rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors flex items-center gap-1.5">
              <Plus className="size-3.5" />New Rule
            </button>
          }>
            {rules.map((r, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-4 border-b border-border/50 last:border-0">
                <div className="size-7 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="size-3.5 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium">{r.name}</p>
                    <Badge variant={r.active ? 'success' : 'default'}>{r.active ? 'Active' : 'Paused'}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground"><span className="font-medium">When:</span> {r.trigger}</p>
                  <p className="text-xs text-muted-foreground"><span className="font-medium">Then:</span> {r.action}</p>
                  {r.runs > 0 && <p className="text-[10px] text-muted-foreground mt-1">Ran {r.runs} times this month</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Toggle checked={r.active} onChange={v => { setRules(p => p.map((x, j) => j === i ? { ...x, active: v } : x)); mark() }} />
                  <button onClick={() => { setRules(p => p.filter((_, j) => j !== i)); mark() }} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </SettingsSection>
        )}

        {tab === 'Assignment Rules' && (
          <div className="space-y-4">
            <SettingsSection title="Round Robin Rules">
              <SettingRow label="Enable Round Robin" description="Automatically rotate job assignments among available recruiters.">
                <Toggle checked={false} onChange={mark} />
              </SettingRow>
              <SettingRow label="Respect capacity limits" description="Skip recruiters who are at or above their maximum.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="Skill-based routing" description="Only assign to recruiters with matching skills.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="Reset cycle" description="Reset rotation counters.">
                <select defaultValue="weekly" onChange={mark} className="h-8 px-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="never">Never (lifetime)</option>
                </select>
              </SettingRow>
            </SettingsSection>

            <SettingsSection title="Approval Rules">
              <SettingRow label="Require approval for submissions" description="Manager must approve before candidate is submitted to client.">
                <Toggle checked={false} onChange={mark} />
              </SettingRow>
              <SettingRow label="Require approval for placements" description="Manager must approve placement confirmation.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="Approval timeout" description="Auto-approve if manager doesn't respond within this time.">
                <div className="flex items-center gap-1.5">
                  <input type="number" defaultValue={24} onChange={mark}
                    className="w-16 h-8 text-center text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
                  <span className="text-xs text-muted-foreground">hours</span>
                </div>
              </SettingRow>
            </SettingsSection>
          </div>
        )}

        {tab === 'Scheduled Jobs' && (
          <SettingsSection title="Scheduled Jobs" action={
            <button onClick={mark} className="h-7 px-2.5 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors flex items-center gap-1.5">
              <Plus className="size-3.5" />Schedule Job
            </button>
          }>
            {SCHEDULED.map((s, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="size-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Clock className="size-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.schedule} · Last run: {s.lastRun}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={s.status === 'active' ? 'success' : 'default'}>{s.status}</Badge>
                  <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                    {s.status === 'active' ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </SettingsSection>
        )}

        {tab === 'Logs' && (
          <SettingsSection title="Automation Logs" description="Recent automation executions.">
            {[
              { rule: 'SLA warning notification',   time: 'Today 10:30 AM', result: 'success', detail: 'SMS sent to James Rodriguez for ICU RN @ Houston Methodist' },
              { rule: 'SLA warning notification',   time: 'Today 09:15 AM', result: 'success', detail: 'SMS sent to Arun Kumar for ER Nurse @ Memorial Hermann' },
              { rule: 'Interview reminder',          time: 'Today 08:00 AM', result: 'success', detail: 'Email sent to James Wilson — interview tomorrow 2:00 PM' },
              { rule: 'No-activity escalation',      time: 'Yesterday 5:00 PM', result: 'success', detail: 'Flagged: AWS Solutions Arch. @ AT&T — no activity 24h' },
              { rule: 'Auto follow-up email',        time: 'Yesterday 3:00 PM', result: 'skipped', detail: 'Rule is paused' },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3 border-b border-border/50 last:border-0">
                <Badge variant={log.result === 'success' ? 'success' : log.result === 'skipped' ? 'default' : 'danger'}>{log.result}</Badge>
                <div>
                  <p className="text-xs font-medium">{log.rule}</p>
                  <p className="text-[10px] text-muted-foreground">{log.detail}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{log.time}</p>
                </div>
              </div>
            ))}
          </SettingsSection>
        )}
      </div>
      <SaveBar dirty={dirty} onSave={() => setDirty(false)} onDiscard={() => setDirty(false)} />
    </div>
  )
}
