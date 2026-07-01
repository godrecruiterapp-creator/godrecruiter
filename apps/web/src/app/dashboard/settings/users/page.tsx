'use client'

import { useState } from 'react'
import { Plus, MoreHorizontal, Mail, Shield, UserX, Search } from 'lucide-react'
import { Breadcrumb, PageHeader, SettingsSection, SettingCard, SummaryGrid, CardRow, Toggle, Badge } from '../_components'
import { cn } from '@/lib/utils'

const MOCK_USERS = [
  { id: '1', name: 'Arun Kumar',      email: 'arun@godrecruiter.com',   role: 'Super Admin', status: 'active',   lastLogin: 'Today 10:42 AM',  dept: 'Administration' },
  { id: '2', name: 'Sarah Mitchell',  email: 'sarah@godrecruiter.com',  role: 'Manager',     status: 'active',   lastLogin: 'Today 09:15 AM',  dept: 'Healthcare' },
  { id: '3', name: 'James Rodriguez', email: 'james@godrecruiter.com',  role: 'Recruiter',   status: 'active',   lastLogin: 'Today 08:30 AM',  dept: 'Healthcare' },
  { id: '4', name: 'Emily Thompson',  email: 'emily@godrecruiter.com',  role: 'Recruiter',   status: 'active',   lastLogin: 'Yesterday',       dept: 'IT Staffing' },
  { id: '5', name: 'David Park',      email: 'david@godrecruiter.com',  role: 'Recruiter',   status: 'active',   lastLogin: '2 days ago',      dept: 'IT Staffing' },
  { id: '6', name: 'Lisa Chen',       email: 'lisa@godrecruiter.com',   role: 'Team Lead',   status: 'active',   lastLogin: 'Today 11:00 AM',  dept: 'Healthcare' },
  { id: '7', name: 'Mark Wilson',     email: 'mark@godrecruiter.com',   role: 'Recruiter',   status: 'inactive', lastLogin: '2 weeks ago',     dept: 'Finance' },
]

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

function InviteModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl border border-border shadow-xl w-full max-w-md p-6">
        <h3 className="text-sm font-semibold mb-4">Invite Team Member</h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Email address</label>
            <input placeholder="colleague@company.com"
              className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Role</label>
            <select className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option>Recruiter</option>
              <option>Team Lead</option>
              <option>Manager</option>
              <option>Company Admin</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Department</label>
            <select className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option>Healthcare Recruitment</option>
              <option>IT Staffing</option>
              <option>Finance & Accounting</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="h-8 px-3 text-sm rounded-lg border border-border hover:bg-muted/60 transition-colors">Cancel</button>
          <button onClick={onClose} className="h-8 px-3 text-sm rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors flex items-center gap-1.5">
            <Mail className="size-3.5" />Send invite
          </button>
        </div>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const [showInvite, setShowInvite] = useState(false)
  const [search, setSearch]         = useState('')
  const [capacity, setCapacity]     = useState(CAPACITY)

  const filtered = MOCK_USERS.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="px-8 py-10">
      <Breadcrumb />
      <PageHeader
        title="Users & Teams"
        description="Manage team members, roles, and recruiter capacity limits."
        action={
          <button onClick={() => setShowInvite(true)}
            className="h-9 px-4 text-sm rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors flex items-center gap-1.5 font-medium">
            <Plus className="size-3.5" />Invite user
          </button>
        }
      />

      <div className="space-y-4">
        {/* Users table */}
        <SettingsSection
          title={`Users (${MOCK_USERS.length})`}
          description="All team members and their current access level"
        >
          <div className="px-5 py-3 border-b border-border/40">
            <div className="relative max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
                className="w-full h-8 pl-8 pr-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['User', 'Role', 'Department', 'Status', 'Last login', ''].map(h => (
                    <th key={h} className={cn('px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide', h ? 'text-left' : '')}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="size-7 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-700 shrink-0">
                          {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-[10px] text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={u.role === 'Super Admin' ? 'danger' : u.role === 'Manager' ? 'warning' : u.role === 'Team Lead' ? 'info' : 'default'}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{u.dept}</td>
                    <td className="px-5 py-3"><Badge variant={u.status === 'active' ? 'success' : 'default'}>{u.status}</Badge></td>
                    <td className="px-5 py-3 text-muted-foreground">{u.lastLogin}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Permissions">
                          <Shield className="size-3.5" />
                        </button>
                        <button className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-red-600" title="Deactivate">
                          <UserX className="size-3.5" />
                        </button>
                        <button className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingsSection>

        {/* Teams */}
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

        {/* Recruiter Capacity */}
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
                        className="w-16 h-7 text-center text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <input type="number" value={r.max} min={1}
                        onChange={e => setCapacity(c => c.map((x, j) => j === i ? { ...x, max: +e.target.value } : x))}
                        className="w-16 h-7 text-center text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingsSection>

        {/* User Defaults */}
        <SettingCard
          title="User Defaults"
          description="Applied automatically when a new user accepts an invite"
          summary={
            <SummaryGrid items={[
              { label: 'Default role',      value: 'Recruiter' },
              { label: 'Default dashboard', value: 'Work Queue' },
              { label: 'Online status',     value: 'Auto (based on login)' },
            ]} />
          }
        >
          <div className="space-y-3">
            <CardRow label="Default role" description="Role assigned when a new user accepts their invite">
              <select defaultValue="Recruiter" className="h-8 px-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Recruiter</option>
                <option>Team Lead</option>
                <option>Manager</option>
              </select>
            </CardRow>
            <CardRow label="Default dashboard">
              <select defaultValue="Work Queue" className="h-8 px-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Dashboard</option>
                <option>Work Queue</option>
                <option>Jobs</option>
                <option>Candidates</option>
              </select>
            </CardRow>
            <CardRow label="Online status visibility">
              <select defaultValue="auto" className="h-8 px-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="auto">Auto (based on login)</option>
                <option value="always">Always show online</option>
                <option value="off">Do not show</option>
              </select>
            </CardRow>
          </div>
        </SettingCard>
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </div>
  )
}
