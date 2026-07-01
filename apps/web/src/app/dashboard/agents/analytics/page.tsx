'use client'

import { Card } from '@/components/ui/card'
import { Bot, TrendingUp, Clock, Users, Mail, FileText, Zap } from 'lucide-react'

const KPIS = [
  { label: 'Most Active Agent',      value: 'Java Sourcer',  icon: Bot },
  { label: 'Total Runs',             value: '1,240',         icon: TrendingUp },
  { label: 'Success Rate',           value: '94.2%',         icon: TrendingUp },
  { label: 'Hours Saved',            value: '186',           icon: Clock },
  { label: 'Candidates Found',       value: '2,840',         icon: Users },
  { label: 'Emails Sent',            value: '1,120',         icon: Mail },
  { label: 'Submissions Generated',  value: '340',           icon: FileText },
  { label: 'AI Credits',             value: '18,400',        icon: Zap },
]

const CHARTS = [
  'Agent Success Rate',
  'Automation Trends',
  'Candidates Found by Agent',
  'AI Credit Usage',
]

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col h-full p-6 overflow-auto gap-6">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {KPIS.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Icon className="size-3.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
            <span className="text-2xl font-bold">{value}</span>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        {CHARTS.map(label => (
          <div key={label} className="rounded-lg border bg-muted/40 h-52 flex flex-col items-center justify-center gap-2">
            <TrendingUp className="size-6 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-sm text-muted-foreground/60">Chart coming soon</p>
          </div>
        ))}
      </div>
    </div>
  )
}
