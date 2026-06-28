'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Breadcrumb, PageHeader, SettingCard, SummaryGrid, CardRow, Toggle, Badge } from '../_components'

const AGENTS = [
  { name: 'Resume Parser',          desc: 'Extracts structured data from uploaded resumes',       enabled: true  },
  { name: 'Job Score Engine',       desc: 'Scores candidates against job requirements (0–100)',    enabled: true  },
  { name: 'Recruiter Recommender',  desc: 'Suggests best-fit recruiters for new job assignments',  enabled: true  },
  { name: 'AI Briefing Generator',  desc: 'Creates daily work briefings for each recruiter',       enabled: true  },
  { name: 'Auto-Draft Submission',  desc: 'AI drafts the submission email — recruiter approves',   enabled: false },
  { name: 'Interview Scheduler',    desc: 'Suggests interview slots based on calendar availability',enabled: false },
  { name: 'Offer Drafter',          desc: 'Drafts offer letters from job and candidate data',       enabled: false },
]

export default function AISettingsPage() {
  const [provider, setProvider] = useState('Anthropic')
  const [model, setModel]       = useState('claude-sonnet-4-6')
  const [apiKey, setApiKey]     = useState('sk-ant-••••••••••••••••7a3f')
  const [showKey, setShowKey]   = useState(false)

  const [hotScore, setHotScore]   = useState(90)
  const [goodScore, setGoodScore] = useState(70)
  const [weakScore, setWeakScore] = useState(50)

  const [agents, setAgents] = useState(AGENTS)

  const tokenUsed = 24
  const tokenPct  = tokenUsed

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <Breadcrumb />
      <PageHeader title="AI Settings" description="Configure the AI provider, scoring thresholds, and active agents." />

      <div className="space-y-4">
        {/* Provider & Model */}
        <SettingCard
          title="AI Provider"
          description="Model and credentials used across all AI features"
          summary={
            <SummaryGrid items={[
              { label: 'Provider',  value: provider },
              { label: 'Model',     value: model },
              { label: 'API key',   value: 'sk-ant-••••••••7a3f' },
              { label: 'Status',    value: 'Connected' },
            ]} />
          }
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Provider</label>
              <select value={provider} onChange={e => setProvider(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Anthropic</option>
                <option>OpenAI</option>
                <option>Azure OpenAI</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Model</label>
              <select value={model} onChange={e => setModel(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
                <option value="claude-opus-4-8">Claude Opus 4.8</option>
                <option value="claude-haiku-4-5">Claude Haiku 4.5</option>
              </select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">API Key</label>
              <div className="flex gap-2">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  className="flex-1 h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                />
                <button onClick={() => setShowKey(s => !s)}
                  className="h-9 px-3 text-xs rounded-lg border border-border hover:bg-muted/60 transition-colors">
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>
        </SettingCard>

        {/* Scoring Thresholds */}
        <SettingCard
          title="Scoring Thresholds"
          description="Define cutoffs for hot, good, and weak candidate ratings"
          summary={
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-muted-foreground text-xs">Hot ≥</span>
                <span className="font-semibold">{hotScore}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-blue-500 shrink-0" />
                <span className="text-muted-foreground text-xs">Good ≥</span>
                <span className="font-semibold">{goodScore}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-muted-foreground text-xs">Weak ≥</span>
                <span className="font-semibold">{weakScore}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-red-400 shrink-0" />
                <span className="text-muted-foreground text-xs">Poor &lt;</span>
                <span className="font-semibold">{weakScore}</span>
              </div>
            </div>
          }
        >
          <div className="space-y-5">
            {[
              { label: 'Hot threshold',  color: 'text-emerald-600', val: hotScore,  set: setHotScore },
              { label: 'Good threshold', color: 'text-blue-600',    val: goodScore, set: setGoodScore },
              { label: 'Weak threshold', color: 'text-amber-600',   val: weakScore, set: setWeakScore },
            ].map(t => (
              <div key={t.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{t.label}</label>
                  <span className={`text-sm font-bold tabular-nums ${t.color}`}>{t.val}</span>
                </div>
                <input type="range" min={0} max={100} value={t.val}
                  onChange={e => t.set(+e.target.value)}
                  className="w-full h-1.5 appearance-none rounded-full bg-muted cursor-pointer" />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Scores below the weak threshold are classified as Poor.</p>
          </div>
        </SettingCard>

        {/* AI Agents */}
        <SettingCard
          title="AI Agents"
          description="Enable or disable individual AI automation features"
          summary={
            <div className="flex items-center gap-3 flex-wrap">
              {agents.filter(a => a.enabled).map(a => (
                <div key={a.name} className="flex items-center gap-1.5 text-xs">
                  <Sparkles className="size-3 text-purple-500" />
                  <span>{a.name}</span>
                </div>
              ))}
              {agents.filter(a => !a.enabled).length > 0 && (
                <span className="text-xs text-muted-foreground">
                  + {agents.filter(a => !a.enabled).length} inactive
                </span>
              )}
            </div>
          }
        >
          <div className="space-y-1">
            {agents.map((a, i) => (
              <div key={a.name} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{a.name}</p>
                    {!a.enabled && <Badge>inactive</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
                </div>
                <Toggle checked={a.enabled}
                  onChange={v => setAgents(p => p.map((x, j) => j === i ? { ...x, enabled: v } : x))} />
              </div>
            ))}
          </div>
        </SettingCard>

        {/* Token Usage */}
        <SettingCard
          title="Usage"
          description="AI token consumption this billing period"
          summary={
            <div>
              <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
                <span>Token usage</span>
                <span className="font-medium text-foreground">{tokenUsed}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-2 rounded-full bg-purple-500 transition-all" style={{ width: `${tokenPct}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">240K / 1M tokens used · Resets July 1</p>
            </div>
          }
        >
          <div className="space-y-3">
            <CardRow label="Monthly token limit" description="Hard cap per billing period">
              <select defaultValue="1m" className="h-8 px-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="500k">500K tokens</option>
                <option value="1m">1M tokens</option>
                <option value="5m">5M tokens</option>
                <option value="unlimited">Unlimited</option>
              </select>
            </CardRow>
            <CardRow label="Alert at 80% usage" description="Send notification when nearing limit">
              <Toggle checked={true} onChange={() => {}} />
            </CardRow>
          </div>
        </SettingCard>
      </div>
    </div>
  )
}
