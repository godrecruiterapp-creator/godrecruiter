'use client'

import { useState } from 'react'
import { Plus, Mail, MessageSquare, CheckCircle2, XCircle, ExternalLink } from 'lucide-react'
import { SettingsHeader, SettingsSection, SettingRow, TabNav, SaveBar, Toggle, FieldInput, Badge } from '../_components'

const TABS = ['Email', 'Templates', 'SMS', 'Integrations', 'Calendar']

const EMAIL_TEMPLATES = [
  { name: 'New Candidate Introduction',   type: 'Email',   trigger: 'Manual',          status: 'active' },
  { name: 'Interview Confirmation',        type: 'Email',   trigger: 'Interview Scheduled', status: 'active' },
  { name: 'Submission Notification',       type: 'Email',   trigger: 'On Submission',   status: 'active' },
  { name: 'Offer Letter',                  type: 'Email',   trigger: 'Offer Stage',     status: 'active' },
  { name: 'Rejection Email',               type: 'Email',   trigger: 'Rejected',        status: 'active' },
  { name: 'Follow-Up Reminder',            type: 'Email',   trigger: 'Auto (3 days)',   status: 'active' },
  { name: 'Placement Congratulations',     type: 'Email',   trigger: 'Placed',          status: 'draft'  },
  { name: 'New Job Assignment SMS',        type: 'SMS',     trigger: 'Job Assigned',    status: 'active' },
  { name: 'SLA Warning SMS',              type: 'SMS',     trigger: 'Auto (SLA < 4h)', status: 'active' },
]

const INTEGRATIONS = [
  { name: 'Outlook / Microsoft 365', icon: '📧', connected: true,  desc: 'Send emails and sync calendar via Microsoft 365' },
  { name: 'Gmail / Google Workspace',icon: '📨', connected: false, desc: 'Send emails and sync calendar via Google' },
  { name: 'Microsoft Teams',         icon: '💬', connected: false, desc: 'Send notifications and messages to Teams channels' },
  { name: 'Slack',                   icon: '⚡', connected: false, desc: 'Post notifications to Slack channels' },
  { name: 'Twilio SMS',              icon: '📱', connected: true,  desc: 'Send SMS messages to candidates and recruiters' },
  { name: 'Zoom',                    icon: '🎥', connected: true,  desc: 'Generate Zoom links for interviews' },
  { name: 'Google Meet',             icon: '🎬', connected: false, desc: 'Generate Google Meet links for interviews' },
  { name: 'Microsoft Teams Meetings',icon: '📹', connected: false, desc: 'Generate Teams meeting links for interviews' },
]

export default function CommunicationPage() {
  const [tab, setTab] = useState('Email')
  const [dirty, setDirty] = useState(false)
  const mark = () => setDirty(true)
  const [smtp, setSmtp] = useState({ host: 'smtp.office365.com', port: '587', user: 'noreply@godrecruiter.com', from: 'God Recruiter <noreply@godrecruiter.com>', tls: true })

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 max-w-3xl">
        <SettingsHeader title="Communication" description="Configure email, SMS, templates, and messaging integrations." />
        <TabNav tabs={TABS} active={tab} onChange={setTab} />

        {tab === 'Email' && (
          <div className="space-y-4">
            <SettingsSection title="SMTP Configuration" description="Configure your outbound email server.">
              <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldInput label="SMTP Host" value={smtp.host} onChange={v => { setSmtp(p => ({ ...p, host: v })); mark() }} placeholder="smtp.example.com" />
                <FieldInput label="SMTP Port" value={smtp.port} onChange={v => { setSmtp(p => ({ ...p, port: v })); mark() }} placeholder="587" />
                <FieldInput label="Username" value={smtp.user} onChange={v => { setSmtp(p => ({ ...p, user: v })); mark() }} />
                <FieldInput label="From Address" value={smtp.from} onChange={v => { setSmtp(p => ({ ...p, from: v })); mark() }} />
              </div>
              <SettingRow label="TLS / STARTTLS" description="Encrypt SMTP connection.">
                <Toggle checked={smtp.tls} onChange={v => { setSmtp(p => ({ ...p, tls: v })); mark() }} />
              </SettingRow>
              <div className="px-5 pb-4">
                <button className="h-7 px-3 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors flex items-center gap-1.5">
                  <Mail className="size-3.5" />Send Test Email
                </button>
              </div>
            </SettingsSection>

            <SettingsSection title="Email Signature" description="Default signature appended to all outbound emails.">
              <div className="px-5 py-4">
                <textarea
                  rows={4}
                  defaultValue={'Best regards,\n{recruiter_name}\n{company_name}\n{recruiter_phone}'}
                  onChange={mark}
                  className="w-full px-3 py-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring resize-none font-mono"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Use: {'{recruiter_name}'}, {'{company_name}'}, {'{recruiter_phone}'}, {'{recruiter_email}'}</p>
              </div>
            </SettingsSection>

            <SettingsSection title="Email Preferences">
              <SettingRow label="Reply-To Override" description="Route all replies to a dedicated inbox.">
                <Toggle checked={false} onChange={mark} />
              </SettingRow>
              <SettingRow label="Email Tracking" description="Track open and click rates on outbound emails.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="Unsubscribe Footer" description="Automatically append unsubscribe link to mass emails.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
            </SettingsSection>
          </div>
        )}

        {tab === 'Templates' && (
          <SettingsSection title="Message Templates" action={
            <button onClick={mark} className="h-7 px-2.5 text-xs rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors flex items-center gap-1.5">
              <Plus className="size-3.5" />New Template
            </button>
          }>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Template</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Type</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Trigger</th>
                    <th className="text-center px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {EMAIL_TEMPLATES.map((t, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3 font-medium">{t.name}</td>
                      <td className="px-3 py-3">
                        <Badge variant={t.type === 'SMS' ? 'info' : 'default'}>
                          {t.type === 'SMS' ? <><MessageSquare className="size-2.5 mr-0.5 inline" />{t.type}</> : <><Mail className="size-2.5 mr-0.5 inline" />{t.type}</>}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{t.trigger}</td>
                      <td className="px-3 py-3 text-center">
                        <Badge variant={t.status === 'active' ? 'success' : 'default'}>{t.status}</Badge>
                      </td>
                      <td className="px-3 py-3">
                        <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SettingsSection>
        )}

        {tab === 'SMS' && (
          <div className="space-y-4">
            <SettingsSection title="Twilio Configuration">
              <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldInput label="Account SID" value="AC••••••••••••••••••••••••••••••••" onChange={mark} />
                <FieldInput label="Auth Token" value="••••••••••••••••••••••••••••••••" onChange={mark} type="password" />
                <FieldInput label="From Number" value="+1 (713) 555-0199" onChange={mark} />
              </div>
            </SettingsSection>
            <SettingsSection title="SMS Preferences">
              <SettingRow label="SMS Opt-Out" description="Honor STOP/UNSUBSCRIBE replies automatically.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="Delivery Reports" description="Track SMS delivery status.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
            </SettingsSection>
          </div>
        )}

        {tab === 'Integrations' && (
          <SettingsSection title="Messaging & Calendar Integrations">
            {INTEGRATIONS.map(int => (
              <div key={int.name} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl shrink-0">{int.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{int.name}</p>
                    <p className="text-xs text-muted-foreground">{int.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {int.connected
                    ? <Badge variant="success"><CheckCircle2 className="size-2.5 mr-0.5 inline" />Connected</Badge>
                    : <Badge variant="default"><XCircle className="size-2.5 mr-0.5 inline" />Not Connected</Badge>}
                  <button className="h-7 px-2.5 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors flex items-center gap-1">
                    {int.connected ? 'Configure' : 'Connect'}
                    <ExternalLink className="size-2.5 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </SettingsSection>
        )}

        {tab === 'Calendar' && (
          <div className="space-y-4">
            <SettingsSection title="Calendar Sync">
              <SettingRow label="Auto-create calendar events" description="Create calendar events when interviews are scheduled.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="Send calendar invites" description="Email calendar invites to all interview participants.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="Default interview duration" description="Pre-fill when scheduling interviews.">
                <select defaultValue="60" onChange={mark} className="h-8 px-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                </select>
              </SettingRow>
            </SettingsSection>
            <SettingsSection title="Video Meeting Providers">
              <SettingRow label="Default provider" description="Auto-generate meeting links using this provider.">
                <select defaultValue="zoom" onChange={mark} className="h-8 px-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="zoom">Zoom</option>
                  <option value="teams">Microsoft Teams</option>
                  <option value="meet">Google Meet</option>
                  <option value="none">No auto-generate</option>
                </select>
              </SettingRow>
            </SettingsSection>
          </div>
        )}
      </div>
      <SaveBar dirty={dirty} onSave={() => setDirty(false)} onDiscard={() => setDirty(false)} />
    </div>
  )
}
