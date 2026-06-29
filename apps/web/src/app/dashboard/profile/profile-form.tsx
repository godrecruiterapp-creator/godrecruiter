'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2, AlertCircle, User, Lock, Building2, PanelLeft } from 'lucide-react'
import { updateProfileAction, updatePasswordAction } from './actions'
import { useSidebarBehavior, type SidebarBehavior } from '@/hooks/use-sidebar-behavior'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Props {
  fullName: string
  email: string
  tenantName: string | null
  role: string | null
  memberSince: string
}

export function ProfileForm({ fullName, email, tenantName, role, memberSince }: Props) {
  const initials = fullName.split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase() || '?'
  const { behavior, setBehavior } = useSidebarBehavior()

  const [nameValue, setNameValue]     = useState(fullName)
  const [nameStatus, setNameStatus]   = useState<{ ok?: boolean; msg?: string } | null>(null)
  const [namePending, setNamePending] = useState(false)

  const [pwStatus, setPwStatus]   = useState<{ ok?: boolean; msg?: string } | null>(null)
  const [pwPending, setPwPending] = useState(false)
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' })

  async function handleName(e: React.FormEvent) {
    e.preventDefault()
    setNamePending(true); setNameStatus(null)
    const fd = new FormData(); fd.set('full_name', nameValue)
    const res = await updateProfileAction(fd)
    setNameStatus(res.error ? { ok: false, msg: res.error } : { ok: true, msg: 'Name updated successfully.' })
    setNamePending(false)
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwPending(true); setPwStatus(null)
    const fd = new FormData()
    Object.entries(pwForm).forEach(([k, v]) => fd.set(k, v))
    const res = await updatePasswordAction(fd)
    if (res.error) {
      setPwStatus({ ok: false, msg: res.error })
    } else {
      setPwStatus({ ok: true, msg: 'Password changed successfully.' })
      setPwForm({ current_password: '', new_password: '', confirm_password: '' })
    }
    setPwPending(false)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* ── Profile card ───────────────────────────────────────────── */}
        <div className="flex items-center gap-5 p-6 bg-background border border-border rounded-xl">
          <Avatar className="size-16 shrink-0">
            <AvatarFallback className="text-xl font-semibold bg-brand-muted text-brand">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold truncate">{fullName}</h2>
            <p className="text-sm text-muted-foreground truncate">{email}</p>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {tenantName && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="size-3" />{tenantName}
                </span>
              )}
              {role && (
                <span className="inline-flex items-center rounded-full border border-brand/30 bg-brand-muted text-brand px-2 py-0.5 text-xs font-medium capitalize">
                  {role}
                </span>
              )}
              <span className="text-xs text-muted-foreground">Member since {memberSince}</span>
            </div>
          </div>
        </div>

        {/* ── Personal info ───────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <User className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Personal information</h3>
          </div>
          <div className="bg-background border border-border rounded-xl p-6 space-y-5">
            {nameStatus && (
              <Alert variant={nameStatus.ok ? 'default' : 'destructive'} className={nameStatus.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : ''}>
                {nameStatus.ok ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
                <AlertDescription>{nameStatus.msg}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleName} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" value={nameValue} onChange={e => setNameValue(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Work email</Label>
                <Input value={email} disabled className="bg-muted/50 text-muted-foreground cursor-not-allowed" />
                <p className="text-xs text-muted-foreground">Email cannot be changed here. Contact your admin.</p>
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={namePending || nameValue.trim() === fullName}>
                  {namePending && <Loader2 className="size-3.5 mr-1.5 animate-spin" />}
                  Save changes
                </Button>
              </div>
            </form>
          </div>
        </section>

        {/* ── Sidebar behavior ────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <PanelLeft className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Sidebar behavior</h3>
          </div>
          <div className="bg-background border border-border rounded-xl p-6 space-y-4">
            <p className="text-sm text-muted-foreground">Choose your preferred sidebar behavior: open, closed, or expand on hover.</p>
            <div className="space-y-1.5">
              <Label>Behavior</Label>
              <Select value={behavior} onValueChange={v => setBehavior(v as SidebarBehavior)}>
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expanded">Expanded</SelectItem>
                  <SelectItem value="collapsed">Collapsed</SelectItem>
                  <SelectItem value="hover">Expand on hover</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* ── Change password ─────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Change password</h3>
          </div>
          <div className="bg-background border border-border rounded-xl p-6 space-y-5">
            {pwStatus && (
              <Alert variant={pwStatus.ok ? 'default' : 'destructive'} className={pwStatus.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : ''}>
                {pwStatus.ok ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
                <AlertDescription>{pwStatus.msg}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handlePassword} className="space-y-4">
              {(['current_password', 'new_password', 'confirm_password'] as const).map(field => (
                <div key={field} className="space-y-1.5">
                  <Label htmlFor={field}>
                    {field === 'current_password' ? 'Current password' : field === 'new_password' ? 'New password' : 'Confirm new password'}
                  </Label>
                  <Input
                    id={field}
                    type="password"
                    value={pwForm[field]}
                    onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
                    autoComplete={field === 'current_password' ? 'current-password' : 'new-password'}
                    required
                  />
                </div>
              ))}
              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={pwPending}>
                  {pwPending && <Loader2 className="size-3.5 mr-1.5 animate-spin" />}
                  Update password
                </Button>
              </div>
            </form>
          </div>
        </section>

      </div>
    </div>
  )
}
