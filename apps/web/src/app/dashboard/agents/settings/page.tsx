'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, EyeOff } from 'lucide-react'

export default function AgentSettingsPage() {
  const [showKey, setShowKey] = useState(false)
  const [form, setForm] = useState({
    model: 'claude-sonnet-4-6',
    maxConcurrent: '5',
    retryPolicy: 'retry_3x',
    hoursStart: '09:00',
    hoursEnd: '18:00',
    timezone: 'EST',
    notifEmail: 'godrecruiterapp@gmail.com',
    apiKey: 'sk-ant-••••••••••••••••••••••••••••••••',
    auditRetention: '90',
  })
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="flex flex-col h-full p-6 overflow-auto gap-6 max-w-2xl">
      {/* AI Model */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold">AI Model</h2>
        <div className="space-y-1.5">
          <Label>Default AI Model</Label>
          <Select value={form.model} onValueChange={v => set('model', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="claude-sonnet-4-6">claude-sonnet-4-6</SelectItem>
              <SelectItem value="claude-haiku-4-5">claude-haiku-4-5</SelectItem>
              <SelectItem value="gpt-4o">gpt-4o</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Execution */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold">Execution</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Max Concurrent Agents</Label>
            <Input type="number" min={1} max={20} value={form.maxConcurrent} onChange={e => set('maxConcurrent', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Retry Policy</Label>
            <Select value={form.retryPolicy} onValueChange={v => set('retryPolicy', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="no_retry">No Retry</SelectItem>
                <SelectItem value="retry_1x">Retry Once</SelectItem>
                <SelectItem value="retry_3x">Retry 3x</SelectItem>
                <SelectItem value="retry_5x">Retry 5x</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Schedule */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold">Default Schedule</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Working Hours Start</Label>
            <Input type="time" value={form.hoursStart} onChange={e => set('hoursStart', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Working Hours End</Label>
            <Input type="time" value={form.hoursEnd} onChange={e => set('hoursEnd', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Time Zone</Label>
            <Select value={form.timezone} onValueChange={v => set('timezone', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['UTC','EST','CST','MST','PST'].map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold">Notifications</h2>
        <div className="space-y-1.5">
          <Label>Notification Email</Label>
          <Input type="email" value={form.notifEmail} onChange={e => set('notifEmail', e.target.value)} />
        </div>
      </Card>

      {/* API */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold">API</h2>
        <div className="space-y-1.5">
          <Label>API Key</Label>
          <div className="relative">
            <Input type={showKey ? 'text' : 'password'} value={form.apiKey} onChange={e => set('apiKey', e.target.value)} className="pr-9" />
            <button onClick={() => setShowKey(x => !x)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
      </Card>

      {/* Audit */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold">Audit</h2>
        <div className="space-y-1.5">
          <Label>Audit Log Retention</Label>
          <Select value={form.auditRetention} onValueChange={v => set('auditRetention', v)}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['30','60','90','180','365'].map(d => <SelectItem key={d} value={d}>{d} days</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="pb-2">
        <Button size="sm">Save Settings</Button>
      </div>
    </div>
  )
}
