'use client'

import { useState } from 'react'
import { Breadcrumb, PageHeader, SettingCard, SummaryGrid, CardRow, Toggle } from '../_components'

type Channel = 'inApp' | 'email' | 'sms'

const EVENTS = [
  { id: 'job_assigned',       label: 'Job assigned to me',            inApp: true,  email: true,  sms: false },
  { id: 'job_urgent',         label: 'Job marked urgent',             inApp: true,  email: true,  sms: true  },
  { id: 'sla_warning',        label: 'SLA deadline approaching',      inApp: true,  email: true,  sms: true  },
  { id: 'candidate_apply',    label: 'New candidate application',     inApp: true,  email: false, sms: false },
  { id: 'interview_sched',    label: 'Interview scheduled',           inApp: true,  email: true,  sms: false },
  { id: 'offer_accepted',     label: 'Offer accepted',                inApp: true,  email: true,  sms: false },
  { id: 'submission_confirm', label: 'VMS submission confirmed',      inApp: true,  email: false, sms: false },
  { id: 'capacity_warn',      label: 'Recruiter near capacity',       inApp: true,  email: true,  sms: false },
  { id: 'team_update',        label: 'Team assignment changes',       inApp: true,  email: false, sms: false },
  { id: 'report_ready',       label: 'Scheduled report delivered',    inApp: false, email: true,  sms: false },
  { id: 'system_alert',       label: 'System health alerts',          inApp: true,  email: true,  sms: false },
  { id: 'ai_briefing',        label: 'Daily AI briefing ready',       inApp: true,  email: false, sms: false },
]

export default function NotificationsPage() {
  const [channels, setChannels] = useState({ inApp: true, email: true, sms: false })
  const [events, setEvents]     = useState(EVENTS)
  const [digest, setDigest]     = useState(false)
  const [quietFrom, setQuietFrom] = useState('22:00')
  const [quietTo, setQuietTo]     = useState('07:00')

  const toggle = (id: string, ch: Channel) =>
    setEvents(p => p.map(e => e.id === id ? { ...e, [ch]: !e[ch] } : e))

  return (
    <div className="px-8 py-10">
      <Breadcrumb />
      <PageHeader title="Notifications" description="Control how and when God Recruiter sends you notifications." />

      <div className="space-y-4">
        {/* Channels */}
        <SettingCard
          title="Notification Channels"
          description="Global on/off for each delivery method"
          summary={
            <div className="flex items-center gap-4">
              {Object.entries(channels).map(([ch, on]) => (
                <div key={ch} className="flex items-center gap-1.5 text-xs">
                  <span className={`size-2 rounded-full ${on ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
                  <span className="capitalize">{ch === 'inApp' ? 'In-app' : ch}</span>
                </div>
              ))}
            </div>
          }
        >
          <div className="space-y-3">
            <CardRow label="In-app notifications" description="Shown inside the product as badge alerts">
              <Toggle checked={channels.inApp} onChange={v => setChannels(c => ({ ...c, inApp: v }))} />
            </CardRow>
            <CardRow label="Email notifications" description="Sent to your work email address">
              <Toggle checked={channels.email} onChange={v => setChannels(c => ({ ...c, email: v }))} />
            </CardRow>
            <CardRow label="SMS notifications" description="Requires SMS to be configured in Communication settings">
              <Toggle checked={channels.sms} onChange={v => setChannels(c => ({ ...c, sms: v }))} />
            </CardRow>
          </div>
        </SettingCard>

        {/* Event Matrix */}
        <SettingCard
          title="Notification Events"
          description="Choose which events trigger notifications per channel"
          summary={
            <p className="text-xs text-muted-foreground">
              {events.filter(e => e.inApp).length} in-app · {events.filter(e => e.email).length} email · {events.filter(e => e.sms).length} SMS events active
            </p>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Event</th>
                  <th className="text-center px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">In-app</th>
                  <th className="text-center px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Email</th>
                  <th className="text-center px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">SMS</th>
                </tr>
              </thead>
              <tbody>
                {events.map(e => (
                  <tr key={e.id} className="border-b border-border/40 last:border-0">
                    <td className="py-3 text-sm">{e.label}</td>
                    {(['inApp', 'email', 'sms'] as Channel[]).map(ch => (
                      <td key={ch} className="px-3 py-3 text-center">
                        <div className="flex justify-center">
                          <Toggle checked={e[ch]} onChange={() => toggle(e.id, ch)} />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingCard>

        {/* Digest & Quiet Hours */}
        <SettingCard
          title="Digest & Quiet Hours"
          description="Batch notifications and silence them during off-hours"
          summary={
            <SummaryGrid items={[
              { label: 'Email digest', value: digest ? 'Daily digest' : 'Immediate' },
              { label: 'Quiet hours', value: `${quietFrom} – ${quietTo}` },
            ]} />
          }
        >
          <div className="space-y-3">
            <CardRow label="Daily email digest" description="Bundle email notifications into one daily summary instead of individual emails">
              <Toggle checked={digest} onChange={setDigest} />
            </CardRow>
            <div className="border-t border-border/40 pt-3">
              <p className="text-sm font-medium mb-3">Quiet hours</p>
              <div className="flex items-center gap-3 text-xs">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">From</label>
                  <input type="time" value={quietFrom} onChange={e => setQuietFrom(e.target.value)}
                    className="h-8 px-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <span className="text-muted-foreground mt-5">to</span>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">To</label>
                  <input type="time" value={quietTo} onChange={e => setQuietTo(e.target.value)}
                    className="h-8 px-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Notifications are held and delivered after quiet hours end.</p>
            </div>
          </div>
        </SettingCard>
      </div>
    </div>
  )
}
