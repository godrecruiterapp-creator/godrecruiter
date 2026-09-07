import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Bot, Play, Pause, FileText, CheckCircle2, AlertCircle, Timer, Users, Zap } from 'lucide-react'
import { getAgentStatsAction } from './actions'

// Featured templates are the product's own catalog (see /agents/templates), not tenant data.
const FEATURED = [
  { name: 'Candidate Finder', desc: 'Search and rank candidates from ATS database', category: 'Recruiting' },
  { name: 'AI Sourcer', desc: 'AI-powered sourcing using Boolean search and job boards', category: 'Recruiting' },
  { name: 'Job Health Monitor', desc: 'Alert when jobs have no submissions or activity', category: 'Job' },
]

function EmptyPanel({ text }: { text: string }) {
  return (
    <Card className="flex items-center justify-center py-10">
      <p className="text-sm text-muted-foreground">{text}</p>
    </Card>
  )
}

export default async function AgentsDashboard() {
  const stats = await getAgentStatsAction()

  // Run-derived metrics stay at 0 until an execution engine records runs.
  const kpis = [
    { label: 'Total Agents',     value: String(stats.total),  icon: Bot },
    { label: 'Active',           value: String(stats.active), icon: Play },
    { label: 'Paused',           value: String(stats.paused), icon: Pause },
    { label: 'Drafts',           value: String(stats.draft),  icon: FileText },
    { label: 'Completed Today',  value: '0',   icon: CheckCircle2 },
    { label: 'Failed Runs',      value: '0',   icon: AlertCircle },
    { label: 'Time Saved',       value: '0h',  icon: Timer },
    { label: 'Candidates Found', value: '0',   icon: Users },
    { label: 'AI Credits Used',  value: '0',   icon: Zap },
  ]

  return (
    <div className="flex flex-col h-full p-6 overflow-auto gap-6">
      {/* KPIs */}
      <div className="grid grid-cols-3 md:grid-cols-5 xl:grid-cols-9 gap-3">
        {kpis.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-4 flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Icon className="size-3.5 shrink-0" />
              <span className="text-sm truncate">{label}</span>
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
                <Link key={t.name} href="/dashboard/agents/templates">
                  <Card className="p-4 flex flex-col gap-2 h-full hover:border-brand/40 transition-colors cursor-pointer">
                    <div className="size-8 rounded-md bg-brand-muted flex items-center justify-center">
                      <Bot className="size-4 text-brand" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{t.desc}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 w-fit mt-auto">
                      {t.category}
                    </span>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recently Executed */}
          <div>
            <h2 className="text-sm font-semibold mb-3">Recently Executed Agents</h2>
            <EmptyPanel text="No agent runs yet. Runs will appear here once your agents execute." />
          </div>

          {/* Upcoming Scheduled */}
          <div>
            <h2 className="text-sm font-semibold mb-3">Upcoming Scheduled Runs</h2>
            <EmptyPanel text="No scheduled runs yet." />
          </div>
        </div>

        {/* Right 1/3 — Notifications */}
        <div>
          <h2 className="text-sm font-semibold mb-3">Recent Notifications</h2>
          <EmptyPanel text="No notifications yet." />
        </div>
      </div>
    </div>
  )
}
