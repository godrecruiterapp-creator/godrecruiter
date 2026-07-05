'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MODULES, type ModuleKey } from '@/lib/modules'
import { Badge } from '../_components'
import {
  createRoleAction, renameRoleAction, deleteRoleAction, updateRolePermissionAction,
  type RoleRow,
} from './actions'

const ACTIONS = [
  { field: 'can_view' as const,   label: 'View' },
  { field: 'can_create' as const, label: 'Create' },
  { field: 'can_edit' as const,   label: 'Edit' },
  { field: 'can_delete' as const, label: 'Delete' },
]

export function RolesManager({ initialRoles }: { initialRoles: RoleRow[] }) {
  const [roles, setRoles] = useState(initialRoles)
  const [selectedId, setSelectedId] = useState(initialRoles[0]?.id ?? '')
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const selected = roles.find(r => r.id === selectedId) ?? null

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true); setError(null)
    const res = await createRoleAction(newName)
    setCreating(false)
    if ('error' in res) { setError(res.error); return }
    setNewName('')
    setRoles(prev => [...prev, {
      id: res.roleId, name: newName.trim(), is_system: false, member_count: 0,
      permissions: MODULES.map(m => ({ module: m.key, can_view: false, can_create: false, can_edit: false, can_delete: false })),
    }])
    setSelectedId(res.roleId)
  }

  async function handleRename(roleId: string) {
    if (!renameValue.trim()) return
    const res = await renameRoleAction(roleId, renameValue)
    if ('error' in res) { setError(res.error); return }
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, name: renameValue.trim() } : r))
    setRenamingId(null)
  }

  async function handleDelete(roleId: string) {
    setError(null)
    const res = await deleteRoleAction(roleId)
    if ('error' in res) { setError(res.error); return }
    setRoles(prev => prev.filter(r => r.id !== roleId))
    if (selectedId === roleId) setSelectedId(roles.find(r => r.id !== roleId)?.id ?? '')
  }

  async function handleToggle(roleId: string, moduleKey: ModuleKey, field: typeof ACTIONS[number]['field'], value: boolean) {
    setRoles(prev => prev.map(r => r.id !== roleId ? r : {
      ...r, permissions: r.permissions.map(p => p.module === moduleKey ? { ...p, [field]: value } : p),
    }))
    const res = await updateRolePermissionAction(roleId, moduleKey, field, value)
    if ('error' in res) {
      setError(res.error)
      // Revert on failure
      setRoles(prev => prev.map(r => r.id !== roleId ? r : {
        ...r, permissions: r.permissions.map(p => p.module === moduleKey ? { ...p, [field]: !value } : p),
      }))
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/60 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-5">
        {/* Role list */}
        <div className="col-span-12 lg:col-span-4 rounded-xl border border-border bg-background overflow-hidden">
          <div className="divide-y divide-border/60">
            {roles.map(r => (
              <div key={r.id}
                className={cn('flex items-center justify-between gap-2 px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors',
                  selectedId === r.id && 'bg-muted/60')}
                onClick={() => setSelectedId(r.id)}
              >
                {renamingId === r.id ? (
                  <div className="flex items-center gap-1.5 flex-1" onClick={e => e.stopPropagation()}>
                    <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleRename(r.id)}
                      className="h-7 flex-1 px-2 text-sm rounded-md border border-input bg-background" />
                    <button onClick={() => handleRename(r.id)} className="text-emerald-600"><Check className="size-3.5" /></button>
                    <button onClick={() => setRenamingId(null)} className="text-muted-foreground"><X className="size-3.5" /></button>
                  </div>
                ) : (
                  <>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.member_count} member{r.member_count === 1 ? '' : 's'}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {r.is_system
                        ? <Badge variant="success">System</Badge>
                        : (
                          <>
                            <button onClick={e => { e.stopPropagation(); setRenamingId(r.id); setRenameValue(r.name) }}
                              className="size-6 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                              <Pencil className="size-3.5" />
                            </button>
                            <button onClick={e => { e.stopPropagation(); handleDelete(r.id) }}
                              disabled={r.member_count > 0}
                              title={r.member_count > 0 ? 'Reassign members before deleting this role' : undefined}
                              className="size-6 flex items-center justify-center rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-30 disabled:pointer-events-none">
                              <Trash2 className="size-3.5" />
                            </button>
                          </>
                        )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleCreate} className="flex items-center gap-2 p-3 border-t border-border bg-muted/20">
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New role name"
              className="h-8 flex-1 px-2.5 text-sm rounded-lg border border-input bg-background focus-visible:outline-none focus-visible:border-[#D1D5DB]" />
            <button type="submit" disabled={creating || !newName.trim()}
              className="h-8 px-3 text-sm rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-40 flex items-center gap-1.5 font-medium">
              {creating ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
              Add
            </button>
          </form>
        </div>

        {/* Permission grid */}
        <div className="col-span-12 lg:col-span-8 rounded-xl border border-border bg-background overflow-hidden">
          {!selected ? (
            <p className="text-sm text-muted-foreground p-6">Select a role to view its permissions.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-6 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Module</th>
                  {ACTIONS.map(a => (
                    <th key={a.field} className="px-4 py-3.5 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-24">
                      {a.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES.map(m => {
                  const perm = selected.permissions.find(p => p.module === m.key)
                  return (
                    <tr key={m.key} className="border-t border-border/30 hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-3 font-medium">{m.label}</td>
                      {ACTIONS.map(a => (
                        <td key={a.field} className="px-4 py-3 text-center">
                          {selected.is_system ? (
                            <Badge variant="success">Always</Badge>
                          ) : (
                            <input type="checkbox" checked={perm?.[a.field] ?? false}
                              onChange={e => handleToggle(selected.id, m.key, a.field, e.target.checked)}
                              className="size-4 accent-foreground cursor-pointer" />
                          )}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
