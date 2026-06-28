'use client'

import { useState } from 'react'
import { SettingsHeader, SettingsSection, SettingRow, TabNav, SaveBar, Toggle } from '../_components'

const TABS = ['Channels', 'Events', 'Digest', 'Mute Rules']

type NotifState = Record<string, { inApp: boolean; email: boolean; sms: boolean }>

const DEFAULT_NOTIFS: NotifState = {
  'New job assignment':              { inApp: true,  email: true,  sms: true  },
  'Job priority changed to Urgent':  { inApp: true,  email: true,  sms: true  },
  'Job reassigned away from me':     { inApp: true,  email: true,  sms: false },
  'SLA warning (4h remaining)':      { inApp: true,  email: false, sms: true  },
  'SLA breached':                    { inApp: true,  email: true,  sms: true  },
  'Manager note on my job':          { inApp: true,  email: false, sms: false },
  'Candidate submitted by recruiter':{ inApp: true,  email: true,  sms: false },
  'Interview scheduled':             { inApp: true,  email: true,  sms: false },
  'Candidate placed':                { inApp: true,  email: true,  sms: false },
  'No activity alert':               { inApp: true,  email: true,  sms: false },
  'Bulk assignment completed':       { inApp: true,  email: false, sms: false },
  'Daily workload digest':           { inApp: false, email: true,  sms: false },
  'Weekly performance report':       { inApp: false, email: true,  sms: false },
}

export default function NotificationsPage() {
  const [tab, setTab] = useState('Channels')
  const [dirty, setDirty] = useState(false)
  const mark = () => setDirty(true)
  const [notifs, setNotifs] = useState(DEFAULT_NOTIFS)
  const [channels, setChannels] = useState({ inApp: true, email: true, sms: true, desktop: false })

  function setNotif(event: string, channel: 'inApp' | 'email' | 'sms', val: boolean) {
    setNotifs(p => ({ ...p, [event]: { ...p[event]!, [channel]: val } }))
    mark()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 max-w-3xl">
        <SettingsHeader title="Notifications" description="Configure how and when you receive notifications across all channels." />
        <TabNav tabs={TABS} active={tab} onChange={setTab} />

        {tab === 'Channels' && (
          <div className="space-y-4">
            <SettingsSection title="Notification Channels" description="Enable or disable channels globally.">
              <SettingRow label="In-App Notifications" description="Shown in the notification bell inside God Recruiter.">
                <Toggle checked={channels.inApp} onChange={v => { setChannels(p => ({ ...p, inApp: v })); mark() }} />
              </SettingRow>
              <SettingRow label="Email Notifications" description="Delivered to your registered email address.">
                <Toggle checked={channels.email} onChange={v => { setChannels(p => ({ ...p, email: v })); mark() }} />
              </SettingRow>
              <SettingRow label="SMS Notifications" description="Text messages via Twilio (requires SMS credits).">
                <Toggle checked={channels.sms} onChange={v => { setChannels(p => ({ ...p, sms: v })); mark() }} />
              </SettingRow>
              <SettingRow label="Desktop Push Notifications" description="Browser push notifications when tab is in background.">
                <Toggle checked={channels.desktop} onChange={v => { setChannels(p => ({ ...p, desktop: v })); mark() }} />
              </SettingRow>
            </SettingsSection>
            <SettingsSection title="Microsoft Teams" description="Send notifications to a Teams channel.">
              <SettingRow label="Enable Teams notifications" description="Post assignment and SLA alerts to a Teams channel.">
                <Toggle checked={false} onChange={mark} />
              </SettingRow>
            </SettingsSection>
            <SettingsSection title="Slack" description="Send notifications to a Slack channel.">
              <SettingRow label="Enable Slack notifications" description="Post alerts to a Slack channel.">
                <Toggle checked={false} onChange={mark} />
              </SettingRow>
            </SettingsSection>
          </div>
        )}

        {tab === 'Events' && (
          <SettingsSection title="Event Notifications" description="Control which events trigger notifications on each channel.">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Event</th>
                    <th className="text-center px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">In-App</th>
                    <th className="text-center px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Email</th>
                    <th className="text-center px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">SMS</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(notifs).map(([event, cfg]) => (
                    <tr key={event} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                      <td className="px-5 py-2.5 text-sm">{event}</td>
                      <td className="px-3 py-2.5 text-center"><div className="flex justify-center"><Toggle checked={cfg.inApp} onChange={v => setNotif(event, 'inApp', v)} /></div></td>
                      <td className="px-3 py-2.5 text-center"><div className="flex justify-center"><Toggle checked={cfg.email} onChange={v => setNotif(event, 'email', v)} /></div></td>
                      <td className="px-3 py-2.5 text-center"><div className="flex justify-center"><Toggle checked={cfg.sms}   onChange={v => setNotif(event, 'sms',   v)} /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SettingsSection>
        )}

        {tab === 'Digest' && (
          <div className="space-y-4">
            <SettingsSection title="Digest Settings" description="Batch multiple notifications into a single digest email.">
              <SettingRow label="Daily digest" description="Receive a summary of all activity once per day.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="Daily digest time" description="Time the daily digest is delivered.">
                <input type="time" defaultValue="07:00" onChange={mark}
                  className="h-8 px-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
              </SettingRow>
              <SettingRow label="Weekly digest" description="Receive a full performance summary every Monday.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="Digest format" description="How much detail to include in digest emails.">
                <select defaultValue="summary" onChange={mark} className="h-8 px-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="brief">Brief (key numbers only)</option>
                  <option value="summary">Summary (default)</option>
                  <option value="detailed">Detailed (all events)</option>
                </select>
              </SettingRow>
            </SettingsSection>
          </div>
        )}

        {tab === 'Mute Rules' && (
          <SettingsSection title="Mute Rules" description="Suppress notifications during certain times or from certain sources.">
            <SettingRow label="Do Not Disturb" description="Suppress all non-urgent notifications.">
              <Toggle checked={false} onChange={mark} />
            </SettingRow>
            <SettingRow label="DND hours" description="Mute notifications during these hours.">
              <div className="flex items-center gap-1.5 text-xs">
                <input type="time" defaultValue="20:00" onChange={mark}
                  className="h-7 px-2 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
                <span className="text-muted-foreground">to</span>
                <input type="time" defaultValue="08:00" onChange={mark}
                  className="h-7 px-2 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
            </SettingRow>
            <SettingRow label="Mute weekends" description="No non-urgent notifications on Saturday and Sunday.">
              <Toggle checked={true} onChange={mark} />
            </SettingRow>
            <SettingRow label="Always allow Urgent" description="Urgent job and SLA breach alerts bypass all mute rules.">
              <Toggle checked={true} onChange={mark} />
            </SettingRow>
          </SettingsSection>
        )}
      </div>
      <SaveBar dirty={dirty} onSave={() => setDirty(false)} onDiscard={() => setDirty(false)} />
    </div>
  )
}
