'use client'

import { useState } from 'react'
import { Plus, Info } from 'lucide-react'
import { SettingsHeader, SettingsSection, TabNav, SaveBar, Toggle } from '../_components'
import { cn } from '@/lib/utils'

const TABS = ['Permission Matrix', 'Roles', 'Field Permissions', 'Audit Log']

const ROLES = ['Super Admin', 'Company Admin', 'Manager', 'Team Lead', 'Recruiter']

type Perm = { label: string; super: boolean; admin: boolean; manager: boolean; lead: boolean; recruiter: boolean }

const PERMISSIONS: { group: string; items: Perm[] }[] = [
  {
    group: 'Jobs',
    items: [
      { label: 'View Jobs',          super: true,  admin: true,  manager: true,  lead: true,  recruiter: true  },
      { label: 'Create Jobs',        super: true,  admin: true,  manager: true,  lead: false, recruiter: false },
      { label: 'Edit Jobs',          super: true,  admin: true,  manager: true,  lead: true,  recruiter: false },
      { label: 'Delete Jobs',        super: true,  admin: true,  manager: false, lead: false, recruiter: false },
      { label: 'Archive Jobs',       super: true,  admin: true,  manager: true,  lead: false, recruiter: false },
      { label: 'Assign Recruiters',  super: true,  admin: true,  manager: true,  lead: true,  recruiter: false },
    ],
  },
  {
    group: 'Candidates',
    items: [
      { label: 'View Candidates',    super: true,  admin: true,  manager: true,  lead: true,  recruiter: true  },
      { label: 'Add Candidates',     super: true,  admin: true,  manager: true,  lead: true,  recruiter: true  },
      { label: 'Edit Candidates',    super: true,  admin: true,  manager: true,  lead: true,  recruiter: true  },
      { label: 'Delete Candidates',  super: true,  admin: true,  manager: false, lead: false, recruiter: false },
      { label: 'Export Candidates',  super: true,  admin: true,  manager: true,  lead: false, recruiter: false },
      { label: 'View Salary Info',   super: true,  admin: true,  manager: true,  lead: false, recruiter: false },
    ],
  },
  {
    group: 'Work Queue',
    items: [
      { label: 'View Work Queue',    super: true,  admin: true,  manager: true,  lead: true,  recruiter: true  },
      { label: 'Assign Jobs',        super: true,  admin: true,  manager: true,  lead: true,  recruiter: false },
      { label: 'Bulk Assign',        super: true,  admin: true,  manager: true,  lead: false, recruiter: false },
      { label: 'View All Recruiter Queues', super: true, admin: true, manager: true, lead: true, recruiter: false },
    ],
  },
  {
    group: 'Reports & Analytics',
    items: [
      { label: 'View Reports',       super: true,  admin: true,  manager: true,  lead: false, recruiter: false },
      { label: 'Create Reports',     super: true,  admin: true,  manager: false, lead: false, recruiter: false },
      { label: 'Export Reports',     super: true,  admin: true,  manager: true,  lead: false, recruiter: false },
      { label: 'View Executive Dashboard', super: true, admin: true, manager: false, lead: false, recruiter: false },
    ],
  },
  {
    group: 'Settings',
    items: [
      { label: 'View Settings',      super: true,  admin: true,  manager: false, lead: false, recruiter: false },
      { label: 'Edit Organization',  super: true,  admin: true,  manager: false, lead: false, recruiter: false },
      { label: 'Manage Users',       super: true,  admin: true,  manager: false, lead: false, recruiter: false },
      { label: 'Manage Integrations',super: true,  admin: false, manager: false, lead: false, recruiter: false },
      { label: 'Billing',            super: true,  admin: false, manager: false, lead: false, recruiter: false },
    ],
  },
]

type PermKey = 'super' | 'admin' | 'manager' | 'lead' | 'recruiter'
const KEYS: PermKey[] = ['super', 'admin', 'manager', 'lead', 'recruiter']

export default function RolesPage() {
  const [tab, setTab] = useState('Permission Matrix')
  const [dirty, setDirty] = useState(false)
  const [perms, setPerms] = useState(PERMISSIONS)

  function toggle(groupIdx: number, itemIdx: number, role: PermKey) {
    if (role === 'super') return // Super Admin cannot be restricted
    setPerms(p => p.map((g, gi) =>
      gi === groupIdx
        ? { ...g, items: g.items.map((item, ii) => ii === itemIdx ? { ...item, [role]: !item[role] } : item) }
        : g
    ))
    setDirty(true)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 max-w-5xl">
        <SettingsHeader title="Roles & Permissions" description="Define what each role can see and do across God Recruiter." />
        <TabNav tabs={TABS} active={tab} onChange={setTab} />

        {tab === 'Permission Matrix' && (
          <SettingsSection title="Permission Matrix" description="Toggle permissions per role. Super Admin always has full access.">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-52">Permission</th>
                    {ROLES.map(r => (
                      <th key={r} className="text-center px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{r}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {perms.map((group, gi) => (
                    <>
                      <tr key={`g-${gi}`} className="bg-muted/20">
                        <td colSpan={6} className="px-5 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{group.group}</td>
                      </tr>
                      {group.items.map((item, ii) => (
                        <tr key={`${gi}-${ii}`} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                          <td className="px-5 py-2.5 text-sm">{item.label}</td>
                          {KEYS.map(k => (
                            <td key={k} className="px-3 py-2.5 text-center">
                              {k === 'super' ? (
                                <span className="text-emerald-600 text-base">✓</span>
                              ) : (
                                <div className="flex justify-center">
                                  <Toggle checked={item[k]} onChange={() => toggle(gi, ii, k)} />
                                </div>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </SettingsSection>
        )}

        {tab === 'Roles' && (
          <SettingsSection title="System Roles" action={
            <button className="h-7 px-2.5 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors flex items-center gap-1.5">
              <Plus className="size-3.5" />Create Role
            </button>
          }>
            {[
              { role: 'Super Admin',    desc: 'Full access to all settings, data, and configurations.', users: 1,  color: 'bg-red-100 text-red-700' },
              { role: 'Company Admin',  desc: 'Manage organization settings, users, and integrations.', users: 1,  color: 'bg-orange-100 text-orange-700' },
              { role: 'Manager',        desc: 'Assign jobs, view analytics, manage team settings.',     users: 2,  color: 'bg-amber-100 text-amber-700' },
              { role: 'Team Lead',      desc: 'Assign within team, view team reports.',                 users: 1,  color: 'bg-blue-100 text-blue-700' },
              { role: 'Recruiter',      desc: 'Source candidates, work assigned jobs, submit.',         users: 4,  color: 'bg-muted text-muted-foreground' },
            ].map(r => (
              <div key={r.role} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className={cn('text-[10px] font-semibold px-2 py-1 rounded', r.color)}>{r.role}</span>
                  <div>
                    <p className="text-sm font-medium">{r.role}</p>
                    <p className="text-xs text-muted-foreground">{r.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">{r.users} {r.users === 1 ? 'user' : 'users'}</span>
                  <button className="h-7 px-2.5 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors">Edit</button>
                </div>
              </div>
            ))}
          </SettingsSection>
        )}

        {tab === 'Field Permissions' && (
          <SettingsSection title="Field-Level Permissions" description="Control which roles can view or edit specific candidate and job fields.">
            {[
              { field: 'Candidate Salary / Bill Rate', view: ['Super Admin','Manager'], edit: ['Super Admin'] },
              { field: 'Candidate SSN',               view: ['Super Admin'],           edit: ['Super Admin'] },
              { field: 'Candidate Contact Info',       view: ['Super Admin','Manager','Recruiter'], edit: ['Super Admin','Recruiter'] },
              { field: 'Client Contact Details',       view: ['Super Admin','Manager'], edit: ['Super Admin','Manager'] },
              { field: 'Job Margin / Spread',          view: ['Super Admin','Manager'], edit: ['Super Admin'] },
              { field: 'Offer Letter Terms',           view: ['Super Admin','Manager'], edit: ['Super Admin'] },
            ].map(f => (
              <div key={f.field} className="px-5 py-3 border-b border-border/50">
                <p className="text-sm font-medium mb-2">{f.field}</p>
                <div className="flex gap-6 text-xs">
                  <div>
                    <span className="text-muted-foreground mr-2">Can view:</span>
                    {f.view.map(r => <span key={r} className="mr-1 inline-flex text-[10px] bg-muted px-1.5 py-0.5 rounded">{r}</span>)}
                  </div>
                  <div>
                    <span className="text-muted-foreground mr-2">Can edit:</span>
                    {f.edit.map(r => <span key={r} className="mr-1 inline-flex text-[10px] bg-muted px-1.5 py-0.5 rounded">{r}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </SettingsSection>
        )}

        {tab === 'Audit Log' && (
          <SettingsSection title="Permission Change Audit Log">
            {[
              { user: 'Arun Kumar', action: 'Enabled "Export Candidates" for Manager role', time: 'Today 09:30 AM', ip: '192.168.1.1' },
              { user: 'Arun Kumar', action: 'Disabled "Delete Jobs" for Team Lead role',    time: 'Yesterday 4:00 PM', ip: '192.168.1.1' },
              { user: 'Arun Kumar', action: 'Created role "Regional Manager"',              time: 'Jun 25 2:00 PM', ip: '192.168.1.1' },
            ].map((e, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3 border-b border-border/50">
                <Info className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs">{e.action}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">By {e.user} · {e.time} · {e.ip}</p>
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
