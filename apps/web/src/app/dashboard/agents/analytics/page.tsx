import { Card } from '@/components/ui/card'
import { Bot, TrendingUp, Clock, Users, Mail, FileText, Zap, CheckCircle2 } from 'lucide-react'
import { getAgentStatsAction } from '../actions'

const CHARTS = [
  'Agent Success Rate',
  'Automation Trends',
  'Candidates Found by Agent',
  'AI Credit Usage',
]

export default async function AnalyticsPage() {
  const stats = await getAgentStatsAction()

  // Only agent counts are real today; run-derived metrics stay empty until an
  // execution engine records runs.
  const kpis = [
    { label: 'Total Agents',          value: String(stats.total),  icon: Bot },
    { label: 'Active Agents',         value: String(stats.active), icon: CheckCircle2 },
    { label: 'Total Runs',            value: '0',  icon: TrendingUp },
    { label: 'Success Rate',          value: '—',  icon: TrendingUp },
    { label: 'Hours Saved',           value: '0',  icon: Clock },
    { label: 'Candidates Found',      value: '0',  icon: Users },
    { label: 'Emails Sent',           value: '0',  icon: Mail },
    { label: 'AI Credits',            value: '0',  icon: Zap },
  ]

  return (
    <div className="flex flex-col h-full p-6 overflow-auto gap-6">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {kpis.map(({ label, value, icon: Icon }) => (
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
            <p className="text-sm text-muted-foreground/60">No run data yet</p>
          </div>
        ))}
      </div>
    </div>
  )
}
