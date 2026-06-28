'use client'

import { useState } from 'react'
import { Shield, Smartphone, Key, Monitor, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { SettingsHeader, SettingsSection, SettingRow, TabNav, SaveBar, Toggle, FieldInput, Badge } from '../_components'

const TABS = ['Password', '2FA & SSO', 'Sessions', 'Access Logs']

export default function SecurityPage() {
  const [tab, setTab] = useState('Password')
  const [dirty, setDirty] = useState(false)
  const mark = () => setDirty(true)

  const [policy, setPolicy] = useState({
    minLength: 12,
    requireUpper: true,
    requireNumber: true,
    requireSymbol: true,
    maxAgeDays: 90,
    preventReuse: 5,
    lockoutAttempts: 5,
    lockoutDurationMin: 15,
  })

  const [twoFA, setTwoFA] = useState({ required: false, methods: { authenticator: true, sms: true, email: false } })
  const [sso, setSso] = useState({ microsoft: false, google: false })

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 max-w-3xl">
        <SettingsHeader title="Security" description="Configure password policies, two-factor authentication, SSO, and access controls." />
        <TabNav tabs={TABS} active={tab} onChange={setTab} />

        {tab === 'Password' && (
          <div className="space-y-4">
            <SettingsSection title="Password Policy">
              <SettingRow label="Minimum length">
                <input type="number" value={policy.minLength} min={8} max={32}
                  onChange={e => { setPolicy(p => ({ ...p, minLength: +e.target.value })); mark() }}
                  className="w-20 h-8 text-center text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
              </SettingRow>
              <SettingRow label="Require uppercase letter" description="At least one A–Z character.">
                <Toggle checked={policy.requireUpper} onChange={v => { setPolicy(p => ({ ...p, requireUpper: v })); mark() }} />
              </SettingRow>
              <SettingRow label="Require number" description="At least one 0–9 digit.">
                <Toggle checked={policy.requireNumber} onChange={v => { setPolicy(p => ({ ...p, requireNumber: v })); mark() }} />
              </SettingRow>
              <SettingRow label="Require symbol" description="At least one special character (!@#$…).">
                <Toggle checked={policy.requireSymbol} onChange={v => { setPolicy(p => ({ ...p, requireSymbol: v })); mark() }} />
              </SettingRow>
            </SettingsSection>

            <SettingsSection title="Password Expiry & Reuse">
              <SettingRow label="Password expires after" description="Users must reset after this many days. Set to 0 to disable.">
                <div className="flex items-center gap-1.5">
                  <input type="number" value={policy.maxAgeDays} min={0}
                    onChange={e => { setPolicy(p => ({ ...p, maxAgeDays: +e.target.value })); mark() }}
                    className="w-20 h-8 text-center text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
                  <span className="text-xs text-muted-foreground">days</span>
                </div>
              </SettingRow>
              <SettingRow label="Prevent reuse of last N passwords">
                <input type="number" value={policy.preventReuse} min={0} max={24}
                  onChange={e => { setPolicy(p => ({ ...p, preventReuse: +e.target.value })); mark() }}
                  className="w-20 h-8 text-center text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
              </SettingRow>
            </SettingsSection>

            <SettingsSection title="Account Lockout">
              <SettingRow label="Lock after N failed attempts">
                <input type="number" value={policy.lockoutAttempts} min={3} max={20}
                  onChange={e => { setPolicy(p => ({ ...p, lockoutAttempts: +e.target.value })); mark() }}
                  className="w-20 h-8 text-center text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
              </SettingRow>
              <SettingRow label="Lockout duration">
                <div className="flex items-center gap-1.5">
                  <input type="number" value={policy.lockoutDurationMin} min={5}
                    onChange={e => { setPolicy(p => ({ ...p, lockoutDurationMin: +e.target.value })); mark() }}
                    className="w-20 h-8 text-center text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
                  <span className="text-xs text-muted-foreground">minutes</span>
                </div>
              </SettingRow>
            </SettingsSection>
          </div>
        )}

        {tab === '2FA & SSO' && (
          <div className="space-y-4">
            <SettingsSection title="Two-Factor Authentication">
              <SettingRow label="Require 2FA for all users" description="Force every user to enroll in 2FA on next login.">
                <Toggle checked={twoFA.required} onChange={v => { setTwoFA(p => ({ ...p, required: v })); mark() }} />
              </SettingRow>
              <SettingRow label="Authenticator App" description="Google Authenticator, Authy, 1Password.">
                <Toggle checked={twoFA.methods.authenticator} onChange={v => { setTwoFA(p => ({ ...p, methods: { ...p.methods, authenticator: v } })); mark() }} />
              </SettingRow>
              <SettingRow label="SMS One-Time Password" description="Send OTP via Twilio SMS.">
                <Toggle checked={twoFA.methods.sms} onChange={v => { setTwoFA(p => ({ ...p, methods: { ...p.methods, sms: v } })); mark() }} />
              </SettingRow>
              <SettingRow label="Email One-Time Password" description="Send OTP via email.">
                <Toggle checked={twoFA.methods.email} onChange={v => { setTwoFA(p => ({ ...p, methods: { ...p.methods, email: v } })); mark() }} />
              </SettingRow>
            </SettingsSection>

            <SettingsSection title="Single Sign-On (SSO)">
              <SettingRow label="Microsoft / Azure AD" description="Allow users to sign in with Microsoft work accounts.">
                <div className="flex items-center gap-2">
                  <Toggle checked={sso.microsoft} onChange={v => { setSso(p => ({ ...p, microsoft: v })); mark() }} />
                  {sso.microsoft && <Badge variant="success"><CheckCircle2 className="size-2.5 mr-0.5 inline" />Active</Badge>}
                </div>
              </SettingRow>
              {sso.microsoft && (
                <div className="px-5 pb-4 grid grid-cols-1 gap-3">
                  <FieldInput label="Tenant ID" value="" onChange={mark} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
                  <FieldInput label="Client ID" value="" onChange={mark} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
                </div>
              )}
              <SettingRow label="Google Workspace" description="Allow users to sign in with Google accounts.">
                <div className="flex items-center gap-2">
                  <Toggle checked={sso.google} onChange={v => { setSso(p => ({ ...p, google: v })); mark() }} />
                  {sso.google && <Badge variant="success"><CheckCircle2 className="size-2.5 mr-0.5 inline" />Active</Badge>}
                </div>
              </SettingRow>
            </SettingsSection>

            <SettingsSection title="Session Settings">
              <SettingRow label="Session timeout" description="Auto-logout after inactivity.">
                <select defaultValue="480" onChange={mark} className="h-8 px-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="60">1 hour</option>
                  <option value="240">4 hours</option>
                  <option value="480">8 hours</option>
                  <option value="1440">24 hours</option>
                  <option value="0">Never</option>
                </select>
              </SettingRow>
              <SettingRow label="Allow multiple sessions" description="Let users be logged in on multiple devices simultaneously.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
            </SettingsSection>
          </div>
        )}

        {tab === 'Sessions' && (
          <div className="space-y-4">
            <SettingsSection title="Access Restrictions">
              <SettingRow label="IP allowlist" description="Restrict login to specific IP ranges only.">
                <Toggle checked={false} onChange={mark} />
              </SettingRow>
              <SettingRow label="Allowed email domains" description="Only allow users with these email domains to sign up.">
                <button onClick={mark} className="h-7 px-2.5 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors">Configure</button>
              </SettingRow>
            </SettingsSection>
            <SettingsSection title="Active Sessions" description="Currently logged-in users across all devices.">
              {[
                { user: 'Arun Kumar',      device: 'Chrome · Windows',      ip: '192.168.1.1',  time: 'Active now' },
                { user: 'Sarah Mitchell',  device: 'Safari · Mac',          ip: '10.0.0.45',    time: '2 min ago' },
                { user: 'Lisa Chen',       device: 'Chrome · Mac',          ip: '10.0.0.83',    time: '5 min ago' },
                { user: 'James Rodriguez', device: 'Firefox · Windows',     ip: '192.168.1.22', time: '18 min ago' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <Monitor className="size-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium">{s.user}</p>
                      <p className="text-[10px] text-muted-foreground">{s.device} · {s.ip} · {s.time}</p>
                    </div>
                  </div>
                  <button className="h-6 px-2 text-[10px] rounded-md border border-border hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                    Revoke
                  </button>
                </div>
              ))}
            </SettingsSection>
          </div>
        )}

        {tab === 'Access Logs' && (
          <SettingsSection title="Recent Access Events">
            {[
              { type: 'success', user: 'Arun Kumar',      event: 'Logged in',                   time: 'Today 10:42 AM', ip: '192.168.1.1',  device: 'Chrome / Windows' },
              { type: 'success', user: 'Sarah Mitchell',  event: 'Logged in',                   time: 'Today 09:15 AM', ip: '10.0.0.45',    device: 'Safari / Mac' },
              { type: 'warning', user: 'mark@godrecruiter.com', event: 'Failed login attempt',  time: 'Today 08:30 AM', ip: '203.0.113.42', device: 'Unknown' },
              { type: 'warning', user: 'mark@godrecruiter.com', event: 'Failed login attempt',  time: 'Today 08:29 AM', ip: '203.0.113.42', device: 'Unknown' },
              { type: 'success', user: 'Lisa Chen',       event: 'Password changed',            time: 'Yesterday 4:00 PM', ip: '10.0.0.83', device: 'Chrome / Mac' },
              { type: 'info',    user: 'Arun Kumar',      event: 'SSO config updated',          time: 'Yesterday 2:00 PM', ip: '192.168.1.1',device: 'Chrome / Windows' },
            ].map((e, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3 border-b border-border/50 last:border-0">
                {e.type === 'success' ? <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  : e.type === 'warning' ? <AlertTriangle className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                  : <Shield className="size-3.5 text-blue-500 shrink-0 mt-0.5" />}
                <div>
                  <p className="text-xs"><span className="font-medium">{e.user}</span> — {e.event}</p>
                  <p className="text-[10px] text-muted-foreground">{e.time} · {e.ip} · {e.device}</p>
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
