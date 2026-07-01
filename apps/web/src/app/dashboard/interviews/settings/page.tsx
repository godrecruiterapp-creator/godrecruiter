'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Plus, PenLine } from 'lucide-react'

const INTERVIEW_TYPES_DEFAULT = [
  'Phone Screen', 'Video Interview', 'Technical Interview', 'Panel Interview',
  'Client Interview', 'Final Interview', 'HR Interview', 'Manager Interview', 'Onsite Interview',
]

const ROUNDS_DEFAULT = ['Round 1', 'Round 2', 'Round 3', 'Final', 'HR Screen', 'Technical Screen']

const EMAIL_TEMPLATES = ['Invitation', 'Reminder', 'Reschedule', 'Cancellation', 'Thank You', 'Feedback Request']

const CALENDAR_INTEGRATIONS = [
  { name: 'Microsoft Outlook', icon: '📧' },
  { name: 'Google Calendar',   icon: '📅' },
  { name: 'Microsoft Teams',   icon: '💼' },
  { name: 'Zoom',              icon: '🎥' },
  { name: 'Google Meet',       icon: '🤝' },
]

const EVENT_TYPES = ['Interview Scheduled', 'Interview Confirmed', 'Interview Cancelled', 'No Show', 'Feedback Received']

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-5 space-y-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </div>
  )
}

function EditableList({ items, onRemove }: { items: string[]; onRemove: (i: number) => void }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input value={item} readOnly className="h-8 text-sm flex-1" />
          <button onClick={() => onRemove(i)} className="size-8 flex items-center justify-center rounded border hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

export default function SettingsPage() {
  const [types, setTypes]   = useState(INTERVIEW_TYPES_DEFAULT)
  const [rounds, setRounds] = useState(ROUNDS_DEFAULT)
  const [calToggles, setCalToggles] = useState<Record<string, boolean>>({})
  const [notifToggles, setNotifToggles] = useState<Record<string, Record<string, boolean>>>({})

  function toggleCal(name: string) {
    setCalToggles(t => ({ ...t, [name]: !t[name] }))
  }
  function toggleNotif(event: string, channel: string) {
    setNotifToggles(t => ({
      ...t,
      [event]: { ...(t[event] ?? {}), [channel]: !(t[event]?.[channel]) }
    }))
  }

  return (
    <div className="flex flex-col h-full p-6 gap-5 overflow-y-auto">
      <div>
        <h1 className="text-xl font-semibold">Interview Settings</h1>
        <p className="text-sm text-muted-foreground">Configure interview types, defaults, and integrations</p>
      </div>

      {/* Interview Types */}
      <Section title="Interview Types">
        <EditableList items={types} onRemove={i => setTypes(t => t.filter((_, j) => j !== i))} />
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-sm" onClick={() => setTypes(t => [...t, ''])}>
          <Plus className="size-3.5" />Add Type
        </Button>
        <div className="flex justify-end"><Button size="sm">Save</Button></div>
      </Section>

      {/* Interview Rounds */}
      <Section title="Interview Rounds">
        <EditableList items={rounds} onRemove={i => setRounds(r => r.filter((_, j) => j !== i))} />
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-sm" onClick={() => setRounds(r => [...r, ''])}>
          <Plus className="size-3.5" />Add Round
        </Button>
        <div className="flex justify-end"><Button size="sm">Save</Button></div>
      </Section>

      {/* Defaults */}
      <Section title="Defaults">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Default Duration</Label>
            <Select defaultValue="60">
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['30','45','60','90','120'].map(d => <SelectItem key={d} value={d}>{d} min</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Default Time Zone</Label>
            <Select defaultValue="EST">
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['EST','CST','MST','PST','GMT','IST'].map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end"><Button size="sm">Save</Button></div>
      </Section>

      {/* Calendar Integrations */}
      <Section title="Calendar Integrations">
        <div className="space-y-2">
          {CALENDAR_INTEGRATIONS.map(ci => (
            <div key={ci.name} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">{ci.icon}</span>
                <span className="text-sm">{ci.name}</span>
              </div>
              <button type="button"
                onClick={() => toggleCal(ci.name)}
                className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${calToggles[ci.name] ? 'bg-brand' : 'bg-muted'}`}>
                <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${calToggles[ci.name] ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Email Templates */}
      <Section title="Email Templates">
        <div className="space-y-2">
          {EMAIL_TEMPLATES.map(t => (
            <div key={t} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="text-sm">{t}</span>
              <Button variant="outline" size="sm" className="h-7 text-sm gap-1">
                <PenLine className="size-3" />Edit
              </Button>
            </div>
          ))}
        </div>
      </Section>

      {/* Reminder Rules */}
      <Section title="Reminder Rules">
        <div className="flex items-center gap-3">
          <span className="text-sm">Send reminder</span>
          <Select defaultValue="24">
            <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['1','2','4','12','24','48'].map(h => <SelectItem key={h} value={h}>{h} hours before</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end"><Button size="sm">Save</Button></div>
      </Section>

      {/* Notification Preferences */}
      <Section title="Notification Preferences">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-2 text-left font-medium text-muted-foreground">Event</th>
                {['Email','SMS','In-App','Teams','Slack'].map(c => (
                  <th key={c} className="pb-2 text-center font-medium text-muted-foreground">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EVENT_TYPES.map(ev => (
                <tr key={ev} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium">{ev}</td>
                  {['Email','SMS','In-App','Teams','Slack'].map(ch => (
                    <td key={ch} className="py-2 text-center">
                      <input type="checkbox"
                        checked={notifToggles[ev]?.[ch] ?? false}
                        onChange={() => toggleNotif(ev, ch)}
                        className="size-4 rounded accent-brand cursor-pointer" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end"><Button size="sm">Save</Button></div>
      </Section>
    </div>
  )
}
