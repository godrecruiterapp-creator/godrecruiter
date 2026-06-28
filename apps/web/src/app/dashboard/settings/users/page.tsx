'use client'

import { useState } from 'react'
import { Plus, MoreHorizontal, Mail, Shield, UserX, Search, ChevronDown } from 'lucide-react'
import { SettingsHeader, SettingsSection, TabNav, SaveBar, Badge } from '../_components'
import { cn } from '@/lib/utils'

const TABS = ['Users', 'Teams', 'Recruiter Capacity', 'Defaults']

const MOCK_USERS = [
  { id: '1', name: 'Arun Kumar',      email: 'arun@godrecruiter.com',   role: 'Super Admin',    status: 'active',   lastLogin: 'Today 10:42 AM',  dept: 'Administration' },
  { id: '2', name: 'Sarah Mitchell',  email: 'sarah@godrecruiter.com',  role: 'Manager',        status: 'active',   lastLogin: 'Today 09:15 AM',  dept: 'Healthcare' },
  { id: '3', name: 'James Rodriguez', email: 'james@godrecruiter.com',  role: 'Recruiter',      status: 'active',   lastLogin: 'Today 08:30 AM',  dept: 'Healthcare' },
  { id: '4', name: 'Emily Thompson',  email: 'emily@godrecruiter.com',  role: 'Recruiter',      status: 'active',   lastLogin: 'Yesterday',       dept: 'IT Staffing' },
  { id: '5', name: 'David Park',      email: 'david@godrecruiter.com',  role: 'Recruiter',      status: 'active',   lastLogin: '2 days ago',      dept: 'IT Staffing' },
  { id: '6', name: 'Lisa Chen',       email: 'lisa@godrecruiter.com',   role: 'Team Lead',      status: 'active',   lastLogin: 'Today 11:00 AM',  dept: 'Healthcare' },
  { id: '7', name: 'Mark Wilson',     email: 'mark@godrecruiter.com',   role: 'Recruiter',      status: 'inactive', lastLogin: '2 weeks ago',     dept: 'Finance' },
]

const TEAMS = [
  { name: 'Healthcare Team',  lead: 'Lisa Chen',      members: 3, jobs: 12 },
  { name: 'IT Staffing',      lead: 'Emily Thompson', members: 2, jobs: 8  },
  { name: 'Finance',          lead: 'Sarah Mitchell', members: 1, jobs: 3  },
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
        <h3 className="text-sm font-semibold mb-4">Invite User</h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Email Address</label>
            <input placeholder="colleague@company.com" className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Role</label>
            <select className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring">
              <option>Recruiter</option>
              <option>Team Lead</option>
              <option>Manager</option>
              <option>Company Admin</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Department</label>
            <select className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring">
              <option>Healthcare Recruitment</option>
              <option>IT Staffing</option>
              <option>Finance & Accounting</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="h-8 px-3 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors">Cancel</button>
          <button onClick={onClose} className="h-8 px-3 text-xs rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors flex items-center gap-1.5">
            <Mail className="size-3.5" />Send Invite
          </button>
        </div>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const [tab, setTab] = useState('Users')
  const [showInvite, setShowInvite] = useState(false)
  const [search, setSearch] = useState('')
  const [dirty, setDirty] = useState(false)
  const [capacity, setCapacity] = useState(CAPACITY)

  const filtered = MOCK_USERS.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 max-w-4xl">
        <SettingsHeader title="Users & Teams" description="Manage users, roles, teams, and recruiter capacity." />
        <TabNav tabs={TABS} active={tab} onChange={setTab} />

        {tab === 'Users' && (
          <SettingsSection title={`Users (${MOCK_USERS.length})`} action={
            <button onClick={() => setShowInvite(true)} className="h-7 px-2.5 text-xs rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors flex items-center gap-1.5">
              <Plus className="size-3.5" />Invite User
            </button>
          }>
            <div className="px-5 py-3 border-b">
              <div className="relative max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
                  className="w-full h-8 pl-8 pr-3 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">User</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Role</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Department</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Last Login</th>
                    <th className="px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
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
                      <td className="px-3 py-3">
                        <Badge variant={u.role === 'Super Admin' ? 'danger' : u.role === 'Manager' ? 'warning' : u.role === 'Team Lead' ? 'info' : 'default'}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{u.dept}</td>
                      <td className="px-3 py-3">
                        <Badge variant={u.status === 'active' ? 'success' : 'default'}>
                          {u.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{u.lastLogin}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <button className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Manage permissions">
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
        )}

        {tab === 'Teams' && (
          <SettingsSection title="Teams" action={
            <button onClick={() => setDirty(true)} className="h-7 px-2.5 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors flex items-center gap-1.5">
              <Plus className="size-3.5" />New Team
            </button>
          }>
            {TEAMS.map(t => (
              <div key={t.name} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700">
                    {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">Lead: {t.lead} · {t.members} members · {t.jobs} active jobs</p>
                  </div>
                </div>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <MoreHorizontal className="size-4" />
                </button>
              </div>
            ))}
          </SettingsSection>
        )}

        {tab === 'Recruiter Capacity' && (
          <SettingsSection title="Recruiter Capacity Limits" description="Set max active jobs per recruiter. System will warn at the threshold and block assignments at maximum.">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Recruiter</th>
                    <th className="text-center px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Current</th>
                    <th className="text-center px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Warn At</th>
                    <th className="text-center px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Maximum</th>
                    <th className="px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {capacity.map((r, i) => (
                    <tr key={r.name} className="border-b border-border/50">
                      <td className="px-5 py-3 font-medium">{r.name}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={cn('font-bold tabular-nums', r.current >= r.max ? 'text-red-600' : r.current >= r.warn ? 'text-amber-600' : 'text-emerald-600')}>
                          {r.current}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <input type="number" value={r.warn} min={1} max={r.max}
                          onChange={e => { setCapacity(c => c.map((x, j) => j === i ? { ...x, warn: +e.target.value } : x)); setDirty(true) }}
                          className="w-16 h-7 text-center text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <input type="number" value={r.max} min={1}
                          onChange={e => { setCapacity(c => c.map((x, j) => j === i ? { ...x, max: +e.target.value } : x)); setDirty(true) }}
                          className="w-16 h-7 text-center text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SettingsSection>
        )}

        {tab === 'Defaults' && (
          <SettingsSection title="User Defaults" description="Default settings applied to new users when they join.">
            <SettingRow label="Default Role" description="Assigned when a new user accepts an invitation.">
              <select defaultValue="Recruiter" className="h-8 px-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                <option>Recruiter</option>
                <option>Team Lead</option>
                <option>Manager</option>
              </select>
            </SettingRow>
            <SettingRow label="Default Dashboard" description="The page a user lands on after logging in.">
              <select defaultValue="Work Queue" className="h-8 px-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                <option>Dashboard</option>
                <option>Work Queue</option>
                <option>Jobs</option>
                <option>Candidates</option>
              </select>
            </SettingRow>
            <SettingRow label="Online Status" description="Show recruiter availability in the Work Queue.">
              <select defaultValue="auto" className="h-8 px-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="auto">Auto (based on login)</option>
                <option value="always">Always show online</option>
                <option value="off">Do not show</option>
              </select>
            </SettingRow>
          </SettingsSection>
        )}
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
      <SaveBar dirty={dirty} onSave={() => setDirty(false)} onDiscard={() => setDirty(false)} />
    </div>
  )
}
