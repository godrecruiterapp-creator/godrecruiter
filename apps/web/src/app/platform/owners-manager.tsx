'use client'

import { useState } from 'react'
import { Plus, Mail, Loader2 } from 'lucide-react'
import { SettingsSection } from '@/app/dashboard/settings/_components'
import { invitePlatformOwnerAction, removePlatformOwnerAction, type OwnerRow } from './actions'

function InviteModal({ onClose, onInvited }: { onClose: () => void; onInvited: (email: string) => void }) {
  const [email, setEmail] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    if (!email.trim()) return
    setPending(true); setError(null)
    const res = await invitePlatformOwnerAction(email)
    setPending(false)
    if ('error' in res) { setError(res.error); return }
    onInvited(email)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl border border-border shadow-xl w-full max-w-md p-6">
        <h3 className="text-sm font-semibold mb-4">Invite Platform Owner</h3>
        {error && <p className="text-sm text-destructive mb-3">{error}</p>}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">Email address</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="owner@godrecruiter.com"
            className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus-visible:outline-none focus-visible:border-[#D1D5DB]" />
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

export function OwnersManager({ initialOwners }: { initialOwners: OwnerRow[] }) {
  const [owners, setOwners] = useState(initialOwners)
  const [showInvite, setShowInvite] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRemove(o: OwnerRow) {
    setError(null)
    const res = await removePlatformOwnerAction(o.platform_user_id)
    if ('error' in res) { setError(res.error); return }
    setOwners(prev => prev.filter(x => x.platform_user_id !== o.platform_user_id))
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowInvite(true)}
          className="h-9 px-4 text-sm rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors flex items-center gap-1.5 font-medium">
          <Plus className="size-3.5" />Invite Platform Owner
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/60 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <SettingsSection title={`Platform Owners (${owners.length})`} description="Full control over every tenant, billing, and platform-wide settings">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Owner', 'Granted', ''].map(h => (
                  <th key={h} className="px-5 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {owners.map(o => (
                <tr key={o.platform_user_id} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-700 shrink-0">
                        {o.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{o.full_name}{o.is_self && <span className="text-muted-foreground font-normal"> (you)</span>}</p>
                        <p className="text-[10px] text-muted-foreground">{o.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{new Date(o.granted_at).toLocaleDateString('en-US')}</td>
                  <td className="px-5 py-3 text-right">
                    {!o.is_self && (
                      <button onClick={() => handleRemove(o)}
                        className="h-7 px-2.5 text-xs rounded-md border border-border hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsSection>

      {showInvite && (
        <InviteModal onClose={() => setShowInvite(false)}
          onInvited={email => setOwners(prev => [...prev, {
            platform_user_id: `pending-${email}`, full_name: email.split('@')[0]!, email, avatar_url: null,
            granted_at: new Date().toISOString(), is_self: false,
          }])} />
      )}
    </>
  )
}
