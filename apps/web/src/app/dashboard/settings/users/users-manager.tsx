'use client'

import { useState } from 'react'
import { Plus, Mail, Search, Loader2 } from 'lucide-react'
import { Badge, SettingsSection } from '../_components'
import { cn } from '@/lib/utils'
import {
  inviteUserAction, updateMemberRoleAction, setMemberActiveAction, removeMemberAction,
  type MemberRow, type RoleOption,
} from './actions'

function InviteModal({ roles, onClose, onInvited }: { roles: RoleOption[]; onClose: () => void; onInvited: (m: MemberRow) => void }) {
  const [email, setEmail] = useState('')
  const [roleId, setRoleId] = useState(roles.find(r => !r.is_system)?.id ?? roles[0]?.id ?? '')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    if (!email.trim() || !roleId) return
    setPending(true); setError(null)
    const res = await inviteUserAction(email, roleId)
    setPending(false)
    if ('error' in res) { setError(res.error); return }
    const role = roles.find(r => r.id === roleId)
    onInvited({
      membership_id: '', platform_user_id: '', full_name: email.split('@')[0]!, email, avatar_url: null,
      role_id: roleId, role_name: role?.name ?? '', is_system_role: role?.is_system ?? false,
      status: 'invited', invited_at: new Date().toISOString(), joined_at: null,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl border border-border shadow-xl w-full max-w-md p-6">
        <h3 className="text-sm font-semibold mb-4">Invite Team Member</h3>
        {error && <p className="text-sm text-destructive mb-3">{error}</p>}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Email address</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="colleague@company.com"
              className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus-visible:outline-none focus-visible:border-[#D1D5DB]" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Role</label>
            <select value={roleId} onChange={e => setRoleId(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus-visible:outline-none focus-visible:border-[#D1D5DB]">
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="h-8 px-3 text-sm rounded-lg border border-border hover:bg-muted/60 transition-colors">Cancel</button>
          <button onClick={handleSend} disabled={pending || !email.trim()}
            className="h-8 px-3 text-sm rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors flex items-center gap-1.5 disabled:opacity-40">
            {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Mail className="size-3.5" />}
            Send invite
          </button>
        </div>
      </div>
    </div>
  )
}

const STATUS_VARIANT = { active: 'success', invited: 'warning', deactivated: 'default' } as const
const STATUS_LABEL    = { active: 'Active', invited: 'Invited', deactivated: 'Deactivated' } as const

export function UsersManager({ initialMembers, initialRoles }: { initialMembers: MemberRow[]; initialRoles: RoleOption[] }) {
  const [members, setMembers] = useState(initialMembers)
  const [search, setSearch]   = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filtered = members.filter(m =>
    !search || m.full_name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())
  )

  async function handleRoleChange(m: MemberRow, roleId: string) {
    setError(null)
    const res = await updateMemberRoleAction(m.membership_id, roleId)
    if ('error' in res) { setError(res.error); return }
    const role = initialRoles.find(r => r.id === roleId)
    setMembers(prev => prev.map(x => x.membership_id === m.membership_id
      ? { ...x, role_id: roleId, role_name: role?.name ?? x.role_name, is_system_role: role?.is_system ?? false } : x))
  }

  async function handleToggleActive(m: MemberRow) {
    setError(null)
    const nextActive = m.status !== 'active'
    const res = await setMemberActiveAction(m.membership_id, nextActive)
    if ('error' in res) { setError(res.error); return }
    setMembers(prev => prev.map(x => x.membership_id === m.membership_id ? { ...x, status: nextActive ? 'active' : 'deactivated' } : x))
  }

  async function handleRemove(m: MemberRow) {
    setError(null)
    const res = await removeMemberAction(m.membership_id)
    if ('error' in res) { setError(res.error); return }
    setMembers(prev => prev.filter(x => x.membership_id !== m.membership_id))
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowInvite(true)}
          className="h-9 px-4 text-sm rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors flex items-center gap-1.5 font-medium">
          <Plus className="size-3.5" />Invite user
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/60 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <SettingsSection title={`Users (${members.length})`} description="All team members and their current access level">
        <div className="px-5 py-3 border-b border-border/40">
          <div className="relative max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
              className="w-full h-8 pl-8 pr-3 text-sm rounded-lg border border-input bg-background focus-visible:outline-none focus-visible:border-[#D1D5DB]" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['User', 'Role', 'Status', ''].map(h => (
                  <th key={h} className={cn('px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide', h ? 'text-left' : '')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.membership_id || m.email} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-700 shrink-0">
                        {m.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{m.full_name}</p>
                        <p className="text-[10px] text-muted-foreground">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {m.is_system_role || !m.membership_id ? (
                      <Badge variant="info">{m.role_name}</Badge>
                    ) : (
                      <select value={m.role_id} onChange={e => handleRoleChange(m, e.target.value)}
                        className="h-7 px-2 text-xs rounded-md border border-input bg-background focus-visible:outline-none focus-visible:border-[#D1D5DB]">
                        {initialRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    )}
                  </td>
                  <td className="px-5 py-3"><Badge variant={STATUS_VARIANT[m.status]}>{STATUS_LABEL[m.status]}</Badge></td>
                  <td className="px-5 py-3">
                    {m.membership_id && (
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => handleToggleActive(m)}
                          className="h-7 px-2.5 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors">
                          {m.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleRemove(m)}
                          className="h-7 px-2.5 text-xs rounded-md border border-border hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsSection>

      {showInvite && (
        <InviteModal roles={initialRoles} onClose={() => setShowInvite(false)}
          onInvited={m => setMembers(prev => [m, ...prev])} />
      )}
    </>
  )
}
