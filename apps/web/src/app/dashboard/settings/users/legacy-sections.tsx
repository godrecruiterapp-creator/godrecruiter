'use client'

import { useState } from 'react'
import { Plus, MoreHorizontal } from 'lucide-react'
import { SettingsSection, SettingCard, SummaryGrid, CardRow } from '../_components'
import { cn } from '@/lib/utils'

const TEAMS = [
  { name: 'Healthcare Team', lead: 'Lisa Chen',      members: 3, jobs: 12 },
  { name: 'IT Staffing',     lead: 'Emily Thompson', members: 2, jobs: 8  },
  { name: 'Finance',         lead: 'Sarah Mitchell', members: 1, jobs: 3  },
]

const CAPACITY = [
  { name: 'Arun Kumar',      max: 12, current: 8,  warn: 10 },
  { name: 'Sarah Mitchell',  max: 10, current: 9,  warn: 8  },
  { name: 'James Rodriguez', max: 12, current: 5,  warn: 10 },
  { name: 'Emily Thompson',  max: 10, current: 7,  warn: 8  },
  { name: 'David Park',      max: 8,  current: 8,  warn: 7  },
  { name: 'Lisa Chen',       max: 12, current: 3,  warn: 10 },
]

// Team grouping and recruiter capacity limits — a separate concern from
// roles/permissions, still mocked pending its own pass.
export function LegacySettingsSections() {
  const [capacity, setCapacity] = useState(CAPACITY)

  return (
    <>
      <SettingsSection
        title="Teams"
        description="Organize recruiters into focused groups"
        action={
          <button className="h-7 px-2.5 text-sm rounded-lg border border-border hover:bg-muted/60 transition-colors flex items-center gap-1.5">
            <Plus className="size-3.5" />New team
          </button>
        }
      >
        {TEAMS.map(t => (
          <div key={t.name} className="flex items-center justify-between px-5 py-4 border-b border-border/40 last:border-0">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700">
                {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-sm text-muted-foreground">Lead: {t.lead} · {t.members} members · {t.jobs} active jobs</p>
              </div>
            </div>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <MoreHorizontal className="size-4" />
            </button>
          </div>
        ))}
      </SettingsSection>

      <SettingsSection
        title="Recruiter Capacity"
        description="Set warn and max thresholds per recruiter. Changes save immediately."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Recruiter', 'Current', 'Warn at', 'Maximum'].map(h => (
                  <th key={h} className={cn('px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide', h === 'Recruiter' ? 'text-left' : 'text-center')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {capacity.map((r, i) => (
                <tr key={r.name} className="border-b border-border/40 last:border-0">
                  <td className="px-5 py-3 text-sm font-medium">{r.name}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={cn('font-bold tabular-nums text-sm', r.current >= r.max ? 'text-red-600' : r.current >= r.warn ? 'text-amber-600' : 'text-emerald-600')}>
                      {r.current}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <input type="number" value={r.warn} min={1} max={r.max}
                      onChange={e => setCapacity(c => c.map((x, j) => j === i ? { ...x, warn: +e.target.value } : x))}
                      className="w-16 h-7 text-center text-sm rounded-lg border border-input bg-background focus-visible:outline-none focus-visible:border-[#D1D5DB]" />
                  </td>
                  <td className="px-5 py-3 text-center">
                    <input type="number" value={r.max} min={1}
                      onChange={e => setCapacity(c => c.map((x, j) => j === i ? { ...x, max: +e.target.value } : x))}
                      className="w-16 h-7 text-center text-sm rounded-lg border border-input bg-background focus-visible:outline-none focus-visible:border-[#D1D5DB]" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsSection>

      <SettingCard
        title="User Defaults"
        description="Applied automatically when a new user accepts an invite"
        summary={
          <SummaryGrid items={[
            { label: 'Default role',      value: 'Recruiter' },
            { label: 'Default dashboard', value: 'Dashboard' },
            { label: 'Online status',     value: 'Auto (based on login)' },
          ]} />
        }
      >
        <div className="space-y-3">
          <CardRow label="Default role" description="Role assigned when a new user accepts their invite">
            <select defaultValue="Recruiter" className="h-8 px-2 text-sm rounded-lg border border-input bg-background focus-visible:outline-none focus-visible:border-[#D1D5DB]">
              <option>Recruiter</option>
              <option>Team Lead</option>
              <option>Manager</option>
            </select>
          </CardRow>
          <CardRow label="Default dashboard">
            <select defaultValue="Dashboard" className="h-8 px-2 text-sm rounded-lg border border-input bg-background focus-visible:outline-none focus-visible:border-[#D1D5DB]">
              <option>Dashboard</option>
              <option>Jobs</option>
              <option>Candidates</option>
            </select>
          </CardRow>
          <CardRow label="Online status visibility">
            <select defaultValue="auto" className="h-8 px-2 text-sm rounded-lg border border-input bg-background focus-visible:outline-none focus-visible:border-[#D1D5DB]">
              <option value="auto">Auto (based on login)</option>
              <option value="always">Always show online</option>
              <option value="off">Do not show</option>
            </select>
          </CardRow>
        </div>
      </SettingCard>
    </>
  )
}
