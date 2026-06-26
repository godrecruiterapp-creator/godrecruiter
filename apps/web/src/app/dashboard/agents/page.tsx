'use client'

import { Card } from '@/components/ui/card'
import { Bot, Play, Clock, CheckCircle2, AlertCircle, Timer, Users, Mail, Zap, Bell, CalendarClock } from 'lucide-react'

const KPIS = [
  { label: 'Total Agents',       value: '12',    icon: Bot },
  { label: 'Running',            value: '3',     icon: Play },
  { label: 'Scheduled',          value: '7',     icon: Clock },
  { label: 'Completed Today',    value: '24',    icon: CheckCircle2 },
  { label: 'Failed Runs',        value: '2',     icon: AlertCircle },
  { label: 'Time Saved',         value: '48h',   icon: Timer },
  { label: 'Candidates Found',   value: '186',   icon: Users },
  { label: 'Emails Sent',        value: '94',    icon: Mail },
  { label: 'AI Credits Used',    value: '2,340', icon: Zap },
]

const FEATURED = [
  { name: 'Candidate Finder', desc: 'Search and rank candidates from ATS database', category: 'Recruiting' },
  { name: 'AI Sourcer', desc: 'AI-powered sourcing using Boolean search and job boards', category: 'Recruiting' },
  { name: 'Job Health Monitor', desc: 'Alert when jobs have no submissions or activity', category: 'Job' },
]

const RECENT_EXEC = [
  { agent: 'Java Developer Sourcer', status: 'completed', time: '2 hours ago', records: 14 },
  { agent: 'License Expiry Monitor', status: 'completed', time: '3 hours ago', records: 3 },
  { agent: 'Candidate Follow-up',    status: 'running',   time: '30 min ago',  records: 7 },
  { agent: 'Missing Documents Alert',status: 'failed',    time: '1 hour ago',  records: 0 },
]

const UPCOMING = [
  { agent: 'Resume Watcher',        time: 'In 1 hour' },
  { agent: 'Pipeline Analytics',    time: 'Tomorrow 6 AM' },
  { agent: 'License Expiry Monitor',time: 'Mon 8 AM' },
]

const NOTIFICATIONS = [
  { text: 'Java Developer Sourcer found 14 candidates', time: '2h ago', type: 'success' },
  { text: 'Missing Documents Alert failed — retry in 2h', time: '1h ago', type: 'error' },
  { text: 'Candidate Follow-up sent 7 emails', time: '30m ago', type: 'success' },
  { text: 'Pipeline Analytics report ready', time: '4h ago', type: 'info' },
  { text: 'License Expiry Monitor: 3 expiring soon', time: '3h ago', type: 'warning' },
]

const STATUS_BADGE: Record<string, string> = {
  completed: 'bg-slate-100 text-slate-600 border-slate-200',
  running:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed:    'bg-red-50 text-red-700 border-red-200',
}

const NOTIF_DOT: Record<string, string> = {
  success: 'bg-emerald-500',
  error:   'bg-red-500',
  warning: 'bg-amber-500',
  info:    'bg-blue-500',
}

export default function AgentsDashboard() {
  return (
    <div className="flex flex-col h-full p-6 overflow-auto gap-6">
      {/* KPIs */}
      <div className="grid grid-cols-3 md:grid-cols-5 xl:grid-cols-9 gap-3">
        {KPIS.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-4 flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Icon className="size-3.5 shrink-0" />
              <span className="text-xs truncate">{label}</span>
            </div>
            <span className="text-2xl font-bold">{value}</span>
          </Card>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left 2/3 */}
        <div className="col-span-2 flex flex-col gap-6">
          {/* Featured Templates */}
          <div>
            <h2 className="text-sm font-semibold mb-3">Featured Templates</h2>
            <div className="grid grid-cols-3 gap-3">
              {FEATURED.map(t => (
                <Card key={t.name} className="p-4 flex flex-col gap-2 hover:border-brand/40 transition-colors cursor-pointer">
                  <div className="size-8 rounded-md bg-brand-muted flex items-center justify-center">
                    <Bot className="size-4 text-brand" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{t.desc}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 border-blue-200 w-fit mt-auto">
                    {t.category}
                  </span>
                </Card>
              ))}
            </div>
          </div>

          {/* Recently Executed */}
          <div>
            <h2 className="text-sm font-semibold mb-3">Recently Executed Agents</h2>
            <Card className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/60">
                  <tr className="border-b">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Agent</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Time</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Records</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_EXEC.map((r, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="px-4 py-2.5 text-sm font-medium">{r.agent}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[r.status]}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.time}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground tabular-nums">{r.records}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          {/* Upcoming Scheduled */}
          <div>
            <h2 className="text-sm font-semibold mb-3">Upcoming Scheduled Runs</h2>
            <Card className="divide-y">
              {UPCOMING.map((u, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="size-3.5 text-muted-foreground" />
                    <span className="text-sm">{u.agent}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{u.time}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>

        {/* Right 1/3 — Notifications */}
        <div>
          <h2 className="text-sm font-semibold mb-3">Recent Notifications</h2>
          <Card className="divide-y">
            {NOTIFICATIONS.map((n, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <div className={`size-2 rounded-full mt-1.5 shrink-0 ${NOTIF_DOT[n.type]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-snug">{n.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}
