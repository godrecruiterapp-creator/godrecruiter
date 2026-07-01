'use client'

import { useState } from 'react'
import { Plus, Download, Clock } from 'lucide-react'
import { Breadcrumb, PageHeader, SettingCard, CardRow, Toggle, Badge } from '../_components'

const TEMPLATES = [
  { name: 'Weekly Recruiter Performance', type: 'Recruiter',  schedule: 'Every Monday',   status: 'active' },
  { name: 'Daily Work Queue Summary',     type: 'Operations', schedule: 'Every weekday',  status: 'active' },
  { name: 'Monthly Placement Report',     type: 'Executive',  schedule: 'First of month', status: 'active' },
  { name: 'SLA Compliance Report',        type: 'Operations', schedule: 'Every Friday',   status: 'active' },
  { name: 'Client Submission Summary',    type: 'Client',     schedule: 'On demand',      status: 'draft'  },
  { name: 'Overdue Jobs Report',          type: 'Operations', schedule: 'Every weekday',  status: 'active' },
]

export default function ReportsPage() {
  const [schedules, setSchedules] = useState(TEMPLATES.map(t => ({ ...t, on: t.status === 'active' })))

  return (
    <div className="px-8 py-10">
      <Breadcrumb />
      <PageHeader title="Reports" description="Report templates, scheduled delivery, and default export settings." />

      <div className="space-y-4">
        {/* Templates */}
        <SettingCard
          title="Report Templates"
          description={`${TEMPLATES.filter(t => t.status === 'active').length} active, ${TEMPLATES.filter(t => t.status === 'draft').length} draft`}
          summary={
            <div className="space-y-2">
              {TEMPLATES.slice(0, 4).map(t => (
                <div key={t.name} className="flex items-center gap-2 text-sm">
                  <Clock className="size-3 text-muted-foreground shrink-0" />
                  <span className="font-medium">{t.name}</span>
                  <span className="text-muted-foreground">· {t.schedule}</span>
                </div>
              ))}
            </div>
          }
          action={
            <button className="h-8 px-3 text-sm rounded-lg border border-border hover:bg-muted/60 transition-colors flex items-center gap-1.5">
              <Plus className="size-3.5" />New template
            </button>
          }
        >
          <div className="space-y-0">
            {schedules.map((t, i) => (
              <div key={t.name} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
                <div className="flex items-center gap-3">
                  <Toggle checked={t.on}
                    onChange={v => setSchedules(p => p.map((x, j) => j === i ? { ...x, on: v } : x))} />
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.schedule} · <Badge>{t.type}</Badge></p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">Edit</button>
                  <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <Download className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SettingCard>

        {/* Recipients */}
        <SettingCard
          title="Report Recipients"
          description="Who receives scheduled reports automatically"
          summary={
            <p className="text-sm text-muted-foreground">Managers and Super Admins receive weekly digests.</p>
          }
        >
          <div className="space-y-3">
            <CardRow label="Manager reports" description="Auto-email to all Manager-and-above users">
              <Toggle checked={true} onChange={() => {}} />
            </CardRow>
            <CardRow label="Executive summary" description="Send weekly summary to Super Admin">
              <Toggle checked={true} onChange={() => {}} />
            </CardRow>
            <CardRow label="Recruiter performance" description="Send personal stats to each recruiter weekly">
              <Toggle checked={false} onChange={() => {}} />
            </CardRow>
          </div>
        </SettingCard>

        {/* Export Defaults */}
        <SettingCard
          title="Export Defaults"
          description="File format and options when exporting data from any table"
          summary={
            <p className="text-sm text-muted-foreground">CSV · With headers · Last 30 days · Excludes archived</p>
          }
        >
          <div className="space-y-3">
            <CardRow label="Default export format">
              <select defaultValue="csv" className="h-8 px-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="csv">CSV</option>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="pdf">PDF</option>
              </select>
            </CardRow>
            <CardRow label="Default date range">
              <select defaultValue="30d" className="h-8 px-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="ytd">Year to date</option>
              </select>
            </CardRow>
            <CardRow label="Include column headers"><Toggle checked={true} onChange={() => {}} /></CardRow>
            <CardRow label="Include archived records"><Toggle checked={false} onChange={() => {}} /></CardRow>
          </div>
        </SettingCard>
      </div>
    </div>
  )
}
