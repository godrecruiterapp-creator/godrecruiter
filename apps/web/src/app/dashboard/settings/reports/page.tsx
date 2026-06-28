'use client'

import { useState } from 'react'
import { Plus, Clock, Download } from 'lucide-react'
import { SettingsHeader, SettingsSection, SettingRow, TabNav, SaveBar, Toggle, Badge } from '../_components'

const TABS = ['Report Templates', 'Scheduled Reports', 'Export Defaults']

const TEMPLATES = [
  { name: 'Weekly Recruiter Performance', owner: 'Manager', type: 'Recruiter',  schedule: 'Every Monday',     status: 'active' },
  { name: 'Daily Work Queue Summary',     owner: 'Manager', type: 'Operations', schedule: 'Every weekday',    status: 'active' },
  { name: 'Monthly Placement Report',     owner: 'Admin',   type: 'Executive',  schedule: 'First of month',   status: 'active' },
  { name: 'SLA Compliance Report',        owner: 'Manager', type: 'Operations', schedule: 'Every Friday',     status: 'active' },
  { name: 'Client Submission Summary',    owner: 'Manager', type: 'Client',     schedule: 'On demand',        status: 'draft'  },
  { name: 'Overdue Jobs Report',          owner: 'Admin',   type: 'Operations', schedule: 'Every weekday',    status: 'active' },
]

export default function ReportsPage() {
  const [tab, setTab] = useState('Report Templates')
  const [dirty, setDirty] = useState(false)
  const mark = () => setDirty(true)

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 max-w-3xl">
        <SettingsHeader title="Reports" description="Manage report templates, scheduled delivery, and default export settings." />
        <TabNav tabs={TABS} active={tab} onChange={setTab} />

        {tab === 'Report Templates' && (
          <SettingsSection title="Report Templates" action={
            <button onClick={mark} className="h-7 px-2.5 text-xs rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors flex items-center gap-1.5">
              <Plus className="size-3.5" />New Template
            </button>
          }>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Template</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Type</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Schedule</th>
                    <th className="text-center px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {TEMPLATES.map((t, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3 font-medium">{t.name}</td>
                      <td className="px-3 py-3"><Badge>{t.type}</Badge></td>
                      <td className="px-3 py-3 text-muted-foreground">{t.schedule}</td>
                      <td className="px-3 py-3 text-center"><Badge variant={t.status === 'active' ? 'success' : 'default'}>{t.status}</Badge></td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">Edit</button>
                          <span className="text-border">·</span>
                          <button className="p-1 text-muted-foreground hover:text-foreground transition-colors"><Download className="size-3" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SettingsSection>
        )}

        {tab === 'Scheduled Reports' && (
          <div className="space-y-4">
            <SettingsSection title="Scheduled Delivery">
              {TEMPLATES.filter(t => t.schedule !== 'On demand').map((t, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.schedule} · Recipients: {t.owner}</p>
                    </div>
                  </div>
                  <Toggle checked={t.status === 'active'} onChange={mark} />
                </div>
              ))}
            </SettingsSection>
            <SettingsSection title="Report Recipients">
              <SettingRow label="Manager reports" description="Auto-email to all users with Manager or above role.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="Executive dashboard" description="Send executive summary to Super Admin weekly.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="Recruiter reports" description="Send personal performance to each recruiter weekly.">
                <Toggle checked={false} onChange={mark} />
              </SettingRow>
            </SettingsSection>
          </div>
        )}

        {tab === 'Export Defaults' && (
          <SettingsSection title="Default Export Settings">
            <SettingRow label="Default export format" description="File format when exporting data tables.">
              <select defaultValue="csv" onChange={mark} className="h-8 px-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="csv">CSV</option>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="pdf">PDF</option>
              </select>
            </SettingRow>
            <SettingRow label="Include headers" description="Add column headers to exported files.">
              <Toggle checked={true} onChange={mark} />
            </SettingRow>
            <SettingRow label="Date range default" description="Default time range when generating reports.">
              <select defaultValue="30d" onChange={mark} className="h-8 px-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="ytd">Year to date</option>
              </select>
            </SettingRow>
            <SettingRow label="Include archived records" description="Include archived jobs and candidates in report exports.">
              <Toggle checked={false} onChange={mark} />
            </SettingRow>
          </SettingsSection>
        )}
      </div>
      <SaveBar dirty={dirty} onSave={() => setDirty(false)} onDiscard={() => setDirty(false)} />
    </div>
  )
}
