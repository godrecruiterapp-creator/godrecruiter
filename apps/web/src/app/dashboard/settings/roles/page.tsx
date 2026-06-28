'use client'

import { useState } from 'react'
import { Breadcrumb, PageHeader, Toggle, Badge } from '../_components'

type PermKey = 'super' | 'admin' | 'manager' | 'lead' | 'recruiter'

const ROLES: { key: PermKey; label: string }[] = [
  { key: 'super',     label: 'Super Admin' },
  { key: 'admin',     label: 'Company Admin' },
  { key: 'manager',   label: 'Manager' },
  { key: 'lead',      label: 'Team Lead' },
  { key: 'recruiter', label: 'Recruiter' },
]

const PERMISSIONS = [
  { group: 'Jobs', items: [
    { id: 'jobs_view',   label: 'View jobs',               super: true, admin: true,  manager: true,  lead: true,  recruiter: true  },
    { id: 'jobs_create', label: 'Create jobs',             super: true, admin: true,  manager: true,  lead: false, recruiter: false },
    { id: 'jobs_edit',   label: 'Edit jobs',               super: true, admin: true,  manager: true,  lead: false, recruiter: false },
    { id: 'jobs_delete', label: 'Delete jobs',             super: true, admin: true,  manager: false, lead: false, recruiter: false },
    { id: 'jobs_assign', label: 'Assign jobs to recruiters',super: true,admin: true,  manager: true,  lead: true,  recruiter: false },
  ]},
  { group: 'Candidates', items: [
    { id: 'cand_view',   label: 'View candidates',         super: true, admin: true,  manager: true,  lead: true,  recruiter: true  },
    { id: 'cand_add',    label: 'Add candidates',          super: true, admin: true,  manager: true,  lead: true,  recruiter: true  },
    { id: 'cand_delete', label: 'Delete candidates',       super: true, admin: true,  manager: false, lead: false, recruiter: false },
    { id: 'cand_export', label: 'Export candidate data',   super: true, admin: true,  manager: true,  lead: false, recruiter: false },
  ]},
  { group: 'Work Queue', items: [
    { id: 'wq_view',     label: 'View work queue',         super: true, admin: true,  manager: true,  lead: true,  recruiter: true  },
    { id: 'wq_assign',   label: 'Assign from work queue',  super: true, admin: true,  manager: true,  lead: true,  recruiter: false },
    { id: 'wq_reassign', label: 'Reassign jobs',           super: true, admin: true,  manager: true,  lead: false, recruiter: false },
  ]},
  { group: 'Reports & Analytics', items: [
    { id: 'rep_view',    label: 'View reports',            super: true, admin: true,  manager: true,  lead: true,  recruiter: false },
    { id: 'rep_export',  label: 'Export reports',          super: true, admin: true,  manager: true,  lead: false, recruiter: false },
    { id: 'rep_schedule',label: 'Schedule reports',        super: true, admin: true,  manager: false, lead: false, recruiter: false },
  ]},
  { group: 'Settings', items: [
    { id: 'set_view',    label: 'View settings',           super: true, admin: true,  manager: false, lead: false, recruiter: false },
    { id: 'set_edit',    label: 'Edit organization settings',super: true,admin: true, manager: false, lead: false, recruiter: false },
    { id: 'set_billing', label: 'Manage billing',          super: true, admin: false, manager: false, lead: false, recruiter: false },
    { id: 'set_users',   label: 'Invite & manage users',   super: true, admin: true,  manager: false, lead: false, recruiter: false },
  ]},
]

type PermMap = Record<string, Record<PermKey, boolean>>

function buildInitial(): PermMap {
  const out: PermMap = {}
  PERMISSIONS.forEach(g => g.items.forEach(p => {
    out[p.id] = { super: p.super, admin: p.admin, manager: p.manager, lead: p.lead, recruiter: p.recruiter }
  }))
  return out
}

export default function RolesPage() {
  const [perms, setPerms] = useState<PermMap>(buildInitial)

  const toggle = (id: string, key: PermKey) => {
    if (key === 'super') return
    setPerms(p => ({ ...p, [id]: { ...p[id]!, [key]: !p[id]![key] } }))
  }

  return (
    <div className="px-8 py-10">
      <Breadcrumb />
      <PageHeader title="Roles & Permissions" description="Control what each role can see and do across God Recruiter." />

      <div className="rounded-xl border border-border bg-background overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-6 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-64">Permission</th>
                {ROLES.map(r => (
                  <th key={r.key} className="px-4 py-3.5 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wide min-w-[100px]">
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map(group => (
                <>
                  <tr key={group.group} className="bg-muted/20">
                    <td colSpan={6} className="px-6 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {group.group}
                    </td>
                  </tr>
                  {group.items.map(item => (
                    <tr key={item.id} className="border-t border-border/30 hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-3 text-sm">{item.label}</td>
                      {ROLES.map(role => {
                        const checked = perms[item.id]?.[role.key] ?? false
                        return (
                          <td key={role.key} className="px-4 py-3 text-center">
                            {role.key === 'super'
                              ? <Badge variant="success">Always</Badge>
                              : (
                                <div className="flex justify-center">
                                  <Toggle checked={checked} onChange={() => toggle(item.id, role.key)} />
                                </div>
                              )
                            }
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
