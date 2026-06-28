'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Plus } from 'lucide-react'
import { Breadcrumb, PageHeader, SettingCard, SummaryGrid, CardRow, Toggle, Badge } from '../_components'

export default function CommunicationPage() {
  const [emailProvider, setEmailProvider]     = useState('Microsoft Outlook')
  const [senderName, setSenderName]           = useState('God Recruiter')
  const [senderEmail, setSenderEmail]         = useState('no-reply@godrecruiter.com')
  const [smsEnabled, setSmsEnabled]           = useState(false)
  const [smsProvider, setSmsProvider]         = useState('Twilio')
  const [calendarEnabled, setCalendarEnabled] = useState(true)
  const [sigEnabled, setSigEnabled]           = useState(true)

  const TEMPLATES = [
    { name: 'Candidate Application Received', trigger: 'On application submit',  status: 'active' },
    { name: 'Interview Scheduled',            trigger: 'On interview create',     status: 'active' },
    { name: 'Offer Extended',                 trigger: 'On offer send',           status: 'active' },
    { name: 'Job Submission Confirmation',    trigger: 'On VMS submission',       status: 'active' },
    { name: 'Candidate Rejection',            trigger: 'On stage reject',         status: 'draft' },
    { name: 'Weekly Status Update',           trigger: 'Every Monday 8AM',        status: 'active' },
  ]

  return (
    <div className="px-8 py-10">
      <Breadcrumb />
      <PageHeader title="Communication" description="Email provider, SMS, calendar integrations, and message templates." />

      <div className="space-y-4">
        {/* Email */}
        <SettingCard
          title="Email"
          description="Outbound email provider and sender identity"
          summary={
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
              <div>
                <span className="font-medium">{emailProvider}</span>
                <span className="text-muted-foreground text-xs ml-2">Connected · {senderEmail}</span>
              </div>
            </div>
          }
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Email provider</label>
              <select value={emailProvider} onChange={e => setEmailProvider(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Microsoft Outlook</option>
                <option>Gmail / Google Workspace</option>
                <option>SendGrid</option>
                <option>Amazon SES</option>
                <option>SMTP (Custom)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Sender name</label>
              <input value={senderName} onChange={e => setSenderName(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Sender email</label>
              <input type="email" value={senderEmail} onChange={e => setSenderEmail(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="border-t border-border/40 pt-3 space-y-3">
            <CardRow label="Email signature" description="Append company signature to all outbound emails">
              <Toggle checked={sigEnabled} onChange={setSigEnabled} />
            </CardRow>
            <CardRow label="Track email opens" description="Log when candidates open emails">
              <Toggle checked={true} onChange={() => {}} />
            </CardRow>
          </div>
        </SettingCard>

        {/* SMS */}
        <SettingCard
          title="SMS"
          description="Text message capabilities for candidate communication"
          summary={
            <div className="flex items-center gap-3 text-sm">
              {smsEnabled
                ? <><CheckCircle2 className="size-4 text-emerald-500" /><span className="font-medium">Twilio connected</span></>
                : <><XCircle className="size-4 text-muted-foreground" /><span className="text-muted-foreground">SMS not enabled</span></>
              }
            </div>
          }
        >
          <CardRow label="Enable SMS" description="Send text messages to candidates and contacts">
            <Toggle checked={smsEnabled} onChange={setSmsEnabled} />
          </CardRow>
          {smsEnabled && (
            <div className="border-t border-border/40 pt-3 grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">SMS provider</label>
                <select value={smsProvider} onChange={e => setSmsProvider(e.target.value)}
                  className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                  <option>Twilio</option>
                  <option>Vonage</option>
                  <option>AWS SNS</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">API key</label>
                <input type="password" defaultValue="twilio_key_••••••••"
                  className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
          )}
        </SettingCard>

        {/* Calendar */}
        <SettingCard
          title="Calendar"
          description="Sync interviews and meetings with your calendar"
          summary={
            <div className="flex items-center gap-3 text-sm">
              {calendarEnabled
                ? <><CheckCircle2 className="size-4 text-emerald-500" /><span className="font-medium">Microsoft Calendar connected</span></>
                : <><XCircle className="size-4 text-muted-foreground" /><span className="text-muted-foreground">Calendar not connected</span></>
              }
            </div>
          }
        >
          <CardRow label="Calendar integration">
            <select defaultValue="outlook" className="h-8 px-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="outlook">Microsoft Outlook</option>
              <option value="google">Google Calendar</option>
              <option value="none">None</option>
            </select>
          </CardRow>
          <div className="border-t border-border/40 pt-3 space-y-3">
            <CardRow label="Auto-create calendar events for interviews">
              <Toggle checked={calendarEnabled} onChange={setCalendarEnabled} />
            </CardRow>
            <CardRow label="Send calendar invites to candidates">
              <Toggle checked={true} onChange={() => {}} />
            </CardRow>
          </div>
        </SettingCard>

        {/* Email Templates */}
        <SettingCard
          title="Email Templates"
          description={`${TEMPLATES.filter(t => t.status === 'active').length} active templates`}
          summary={
            <div className="space-y-2">
              {TEMPLATES.slice(0, 3).map(t => (
                <div key={t.name} className="flex items-center gap-2 text-xs">
                  <Badge variant={t.status === 'active' ? 'success' : 'default'}>{t.status}</Badge>
                  <span className="font-medium">{t.name}</span>
                  <span className="text-muted-foreground">· {t.trigger}</span>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">+ {TEMPLATES.length - 3} more templates</p>
            </div>
          }
          action={
            <button className="h-8 px-3 text-xs rounded-lg border border-border hover:bg-muted/60 transition-colors flex items-center gap-1.5">
              <Plus className="size-3.5" />New template
            </button>
          }
        >
          <div className="space-y-0">
            {TEMPLATES.map(t => (
              <div key={t.name} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.trigger}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={t.status === 'active' ? 'success' : 'default'}>{t.status}</Badge>
                  <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </SettingCard>
      </div>
    </div>
  )
}
