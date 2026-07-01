'use client'

import { useState } from 'react'
import { Shield, Monitor, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Breadcrumb, PageHeader, SettingCard, SummaryGrid, CardRow, Toggle, Badge } from '../_components'

const SESSIONS = [
  { device: 'Chrome on macOS',        location: 'Houston, TX',   time: 'Active now',    current: true  },
  { device: 'Safari on iPhone 15',    location: 'Houston, TX',   time: '2 hours ago',   current: false },
  { device: 'Chrome on Windows 11',   location: 'Dallas, TX',    time: 'Yesterday',     current: false },
]

const ACCESS_LOG = [
  { event: 'Login',         user: 'arun@godrecruiter.com',   location: 'Houston, TX',  time: 'Today 10:42 AM', ok: true  },
  { event: 'Login',         user: 'sarah@godrecruiter.com',  location: 'Houston, TX',  time: 'Today 09:15 AM', ok: true  },
  { event: 'Failed login',  user: 'unknown@example.com',     location: 'Unknown',       time: 'Today 07:30 AM', ok: false },
  { event: 'Login',         user: 'james@godrecruiter.com',  location: 'Houston, TX',  time: 'Today 08:30 AM', ok: true  },
  { event: 'Password reset',user: 'emily@godrecruiter.com',  location: 'Austin, TX',   time: 'Yesterday',      ok: true  },
]

export default function SecurityPage() {
  const [minLen, setMinLen]             = useState(12)
  const [lockout, setLockout]           = useState(5)
  const [expireDays, setExpireDays]     = useState(90)
  const [require2fa, setRequire2fa]     = useState(false)
  const [authApp, setAuthApp]           = useState(true)
  const [sms2fa, setSms2fa]             = useState(false)
  const [email2fa, setEmail2fa]         = useState(true)
  const [ssoEnabled, setSsoEnabled]     = useState(false)
  const [tenantId, setTenantId]         = useState('')
  const [clientId, setClientId]         = useState('')

  return (
    <div className="px-8 py-10">
      <Breadcrumb />
      <PageHeader title="Security" description="Password policy, two-factor authentication, SSO, and access monitoring." />

      <div className="space-y-4">
        {/* Password Policy */}
        <SettingCard
          title="Password Policy"
          description="Requirements enforced when users set or change their password"
          summary={
            <SummaryGrid items={[
              { label: 'Min length',        value: `${minLen} characters` },
              { label: 'Lockout after',     value: `${lockout} failed attempts` },
              { label: 'Expires every',     value: `${expireDays} days` },
              { label: 'Complexity',        value: 'Upper, lower, number, symbol' },
            ]} />
          }
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Minimum length</label>
              <div className="flex items-center gap-2">
                <input type="number" value={minLen} min={8} max={32} onChange={e => setMinLen(+e.target.value)}
                  className="w-20 h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-center" />
                <span className="text-sm text-muted-foreground">characters</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Lockout after</label>
              <div className="flex items-center gap-2">
                <input type="number" value={lockout} min={3} max={20} onChange={e => setLockout(+e.target.value)}
                  className="w-20 h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-center" />
                <span className="text-sm text-muted-foreground">failed attempts</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Password expires every</label>
              <div className="flex items-center gap-2">
                <input type="number" value={expireDays} min={0} max={365} onChange={e => setExpireDays(+e.target.value)}
                  className="w-20 h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-center" />
                <span className="text-sm text-muted-foreground">days (0 = never)</span>
              </div>
            </div>
          </div>
          <div className="border-t border-border/40 pt-4 space-y-3">
            <CardRow label="Require uppercase letters"><Toggle checked={true} onChange={() => {}} /></CardRow>
            <CardRow label="Require numbers"><Toggle checked={true} onChange={() => {}} /></CardRow>
            <CardRow label="Require special characters"><Toggle checked={true} onChange={() => {}} /></CardRow>
            <CardRow label="Prevent password reuse" description="Block last 5 passwords">
              <Toggle checked={true} onChange={() => {}} />
            </CardRow>
          </div>
        </SettingCard>

        {/* Two-Factor Authentication */}
        <SettingCard
          title="Two-Factor Authentication"
          description="Require a second factor when users log in"
          summary={
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-sm">
                <Shield className={`size-3.5 ${require2fa ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                <span>{require2fa ? 'Required for all users' : 'Optional for users'}</span>
              </div>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">
                Methods: {[authApp && 'Authenticator app', sms2fa && 'SMS', email2fa && 'Email'].filter(Boolean).join(', ') || 'None'}
              </span>
            </div>
          }
        >
          <div className="space-y-3">
            <CardRow label="Require 2FA for all users" description="All users must enroll before accessing the app">
              <Toggle checked={require2fa} onChange={setRequire2fa} />
            </CardRow>
            <div className="border-t border-border/40 pt-3 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Allowed Methods</p>
              <CardRow label="Authenticator app" description="TOTP via Google Authenticator, Authy, etc.">
                <Toggle checked={authApp} onChange={setAuthApp} />
              </CardRow>
              <CardRow label="SMS one-time code">
                <Toggle checked={sms2fa} onChange={setSms2fa} />
              </CardRow>
              <CardRow label="Email one-time code">
                <Toggle checked={email2fa} onChange={setEmail2fa} />
              </CardRow>
            </div>
          </div>
        </SettingCard>

        {/* SSO */}
        <SettingCard
          title="Single Sign-On (SSO)"
          description="Allow users to log in with your identity provider"
          summary={
            <div className="flex items-center gap-2 text-sm">
              {ssoEnabled
                ? <><CheckCircle2 className="size-4 text-emerald-500" /><span>Microsoft Entra ID configured</span></>
                : <><span className="text-muted-foreground text-sm">SSO is not enabled. Users log in with email and password.</span></>
              }
            </div>
          }
        >
          <CardRow label="Enable SSO" description="Redirect login to your identity provider">
            <Toggle checked={ssoEnabled} onChange={setSsoEnabled} />
          </CardRow>
          {ssoEnabled && (
            <div className="border-t border-border/40 pt-4 grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Azure Tenant ID</label>
                <input value={tenantId} onChange={e => setTenantId(e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Client ID</label>
                <input value={clientId} onChange={e => setClientId(e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono" />
              </div>
            </div>
          )}
        </SettingCard>

        {/* Active Sessions */}
        <SettingCard
          title="Active Sessions"
          description="Devices and browsers currently logged in"
          summary={
            <div className="space-y-2.5">
              {SESSIONS.map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <Monitor className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="font-medium">{s.device}</span>
                  <span className="text-muted-foreground text-sm">· {s.location} · {s.time}</span>
                  {s.current && <Badge variant="success">Current</Badge>}
                </div>
              ))}
            </div>
          }
        >
          <div className="space-y-2">
            {SESSIONS.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                <div className="flex items-center gap-3">
                  <Monitor className="size-4 text-muted-foreground shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{s.device}</p>
                      {s.current && <Badge variant="success">Current</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{s.location} · {s.time}</p>
                  </div>
                </div>
                {!s.current && (
                  <button className="h-7 px-2.5 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </SettingCard>

        {/* Access Log */}
        <SettingCard
          title="Recent Access Log"
          description="Last 30 days of login activity"
          summary={
            <div className="space-y-1.5">
              {ACCESS_LOG.slice(0, 3).map((log, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm">
                  {log.ok
                    ? <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                    : <AlertTriangle className="size-3.5 text-red-500 shrink-0" />
                  }
                  <span className="font-medium">{log.event}</span>
                  <span className="text-muted-foreground">{log.user}</span>
                  <span className="text-muted-foreground ml-auto">{log.time}</span>
                </div>
              ))}
              <p className="text-sm text-muted-foreground pt-1">+ {ACCESS_LOG.length - 3} more events</p>
            </div>
          }
        >
          <div className="space-y-0">
            {ACCESS_LOG.map((log, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
                {log.ok
                  ? <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  : <AlertTriangle className="size-4 text-red-500 shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{log.event}</p>
                  <p className="text-sm text-muted-foreground">{log.user} · {log.location}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{log.time}</span>
              </div>
            ))}
          </div>
        </SettingCard>
      </div>
    </div>
  )
}
