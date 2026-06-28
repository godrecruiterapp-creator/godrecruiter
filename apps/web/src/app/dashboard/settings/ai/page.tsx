'use client'

import { useState } from 'react'
import { Sparkles, TrendingUp } from 'lucide-react'
import { SettingsHeader, SettingsSection, SettingRow, TabNav, SaveBar, Toggle, FieldInput, FieldSelect } from '../_components'

const TABS = ['AI Engine', 'Scoring', 'Agents & Automation', 'Usage']

export default function AISettingsPage() {
  const [tab, setTab] = useState('AI Engine')
  const [dirty, setDirty] = useState(false)
  const mark = () => setDirty(true)

  const [thresholds, setThresholds] = useState({ hotJob: 88, autoAssign: 80, skipReview: 70, flagHardFill: 50 })

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 max-w-3xl">
        <SettingsHeader title="AI Settings" description="Configure AI providers, scoring thresholds, agents, and usage limits." />
        <TabNav tabs={TABS} active={tab} onChange={setTab} />

        {tab === 'AI Engine' && (
          <div className="space-y-4">
            <SettingsSection title="AI Provider" description="Select the underlying AI model used across God Recruiter.">
              <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldSelect label="Default Provider" value="anthropic" onChange={mark} options={[
                  { value: 'anthropic', label: 'Anthropic (Claude)' },
                  { value: 'openai',    label: 'OpenAI (GPT-4)' },
                  { value: 'azure',     label: 'Azure OpenAI' },
                ]} />
                <FieldSelect label="Model" value="claude-sonnet-4-6" onChange={mark} options={[
                  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (Recommended)' },
                  { value: 'claude-haiku-4-5',  label: 'Claude Haiku 4.5 (Fast)' },
                  { value: 'claude-opus-4-8',   label: 'Claude Opus 4.8 (Most Capable)' },
                ]} />
                <FieldInput label="API Key" value="••••••••••••••••••••••••" onChange={mark} type="password" />
              </div>
            </SettingsSection>

            <SettingsSection title="Core AI Features">
              <SettingRow label="Resume Parsing" description="Automatically parse and extract structured data from resumes.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="Candidate Matching" description="AI-powered match scoring between candidates and jobs.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="Job Scoring" description="Score each job's fill probability when it enters the queue.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="AI Summaries" description="Generate candidate and job summaries automatically.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="AI Screening Questions" description="Generate role-specific screening questions.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="AI Outreach Messages" description="Draft personalized outreach for recruiters to review.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="Duplicate Detection" description="Detect and flag duplicate candidate profiles.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="AI Suggestions" description="Show inline suggestions in forms and candidate profiles.">
                <Toggle checked={false} onChange={mark} />
              </SettingRow>
            </SettingsSection>

            <SettingsSection title="AI Auto-Actions" description="Let AI take these actions automatically (requires review before applying).">
              <SettingRow label="Auto-assign recruiters" description="AI assigns incoming jobs to best-matched available recruiter.">
                <Toggle checked={false} onChange={mark} />
              </SettingRow>
              <SettingRow label="Auto-flag hot jobs" description="Automatically set priority when AI score exceeds threshold.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="Auto-suggest candidates" description="Surface existing candidates when new matching jobs arrive.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
            </SettingsSection>
          </div>
        )}

        {tab === 'Scoring' && (
          <div className="space-y-4">
            <SettingsSection title="AI Score Thresholds" description="Configure when the system triggers actions based on AI scores (0–100).">
              {(Object.keys(thresholds) as (keyof typeof thresholds)[]).map(key => {
                const labels: Record<string, { label: string; desc: string; color: string }> = {
                  hotJob:     { label: 'Hot Job Threshold',         desc: 'Jobs above this score are flagged as Hot.',                color: 'text-amber-600' },
                  autoAssign: { label: 'Auto-Assign Threshold',     desc: 'AI will suggest auto-assignment at this score.',          color: 'text-blue-600' },
                  skipReview: { label: 'Skip Review Threshold',     desc: 'Candidates above this score bypass manual review.',       color: 'text-violet-600' },
                  flagHardFill:{ label: 'Hard-to-Fill Threshold',   desc: 'Jobs below this score are flagged as hard to fill.',      color: 'text-red-600' },
                }
                const info = labels[key]!
                return (
                  <SettingRow key={key} label={info.label} description={info.desc}>
                    <div className="flex items-center gap-3">
                      <input type="range" min={0} max={100} value={thresholds[key]}
                        onChange={e => { setThresholds(p => ({ ...p, [key]: +e.target.value })); mark() }}
                        className="w-24 accent-foreground" />
                      <span className={`text-sm font-bold tabular-nums w-8 text-right ${info.color}`}>{thresholds[key]}</span>
                    </div>
                  </SettingRow>
                )
              })}
            </SettingsSection>

            <SettingsSection title="AI Prompt Templates" description="Customize the instructions sent to the AI for specific tasks.">
              {['Job Summary', 'Candidate Summary', 'Outreach Message', 'Screening Questions'].map(t => (
                <div key={t} className="flex items-center justify-between px-5 py-3 border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-3.5 text-purple-500" />
                    <span className="text-sm">{t}</span>
                  </div>
                  <button className="h-6 px-2 text-[10px] rounded-md border border-border hover:bg-muted/60 transition-colors">Edit Prompt</button>
                </div>
              ))}
            </SettingsSection>
          </div>
        )}

        {tab === 'Agents & Automation' && (
          <SettingsSection title="AI Agents" description="Configure which AI agents are active in your system.">
            {[
              { name: 'Job Score Agent',        desc: 'Scores every incoming job automatically.',              active: true  },
              { name: 'Recruiter Match Agent',  desc: 'Recommends best-fit recruiters for each job.',         active: true  },
              { name: 'Idle Job Monitor',       desc: 'Detects jobs with no activity and alerts manager.',    active: true  },
              { name: 'Workload Balancer',      desc: 'Recommends rebalancing when recruiters are overloaded.',active: false },
              { name: 'Duplicate Detector',    desc: 'Flags potential duplicate candidate profiles.',         active: true  },
              { name: 'SLA Warning Agent',      desc: 'Sends alerts before SLA breach on high-priority jobs.',active: true  },
              { name: 'Historical Match Agent', desc: 'Surfaces similar filled jobs to guide current work.',  active: false },
              { name: 'Briefing Generator',     desc: 'Creates daily recruiter briefings each morning.',      active: false },
            ].map(a => (
              <SettingRow key={a.name} label={a.name} description={a.desc}>
                <Toggle checked={a.active} onChange={mark} />
              </SettingRow>
            ))}
          </SettingsSection>
        )}

        {tab === 'Usage' && (
          <div className="space-y-4">
            <SettingsSection title="AI Usage This Month">
              <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Tokens Used',         value: '2.4M',  sub: 'of 10M included' },
                  { label: 'Resumes Parsed',       value: '847',   sub: 'this month' },
                  { label: 'Jobs Scored',          value: '312',   sub: 'this month' },
                  { label: 'Messages Generated',   value: '1,204', sub: 'outreach + summaries' },
                ].map(m => (
                  <div key={m.label} className="rounded-lg border border-border p-3">
                    <p className="text-[10px] text-muted-foreground">{m.label}</p>
                    <p className="text-xl font-bold tabular-nums mt-1">{m.value}</p>
                    <p className="text-[10px] text-muted-foreground">{m.sub}</p>
                  </div>
                ))}
              </div>
              <div className="px-5 pb-4">
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <span className="text-muted-foreground">Token usage</span>
                  <span className="font-medium">24%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-2 rounded-full bg-emerald-500 w-[24%]" />
                </div>
              </div>
            </SettingsSection>
            <SettingsSection title="Usage Limits">
              <SettingRow label="Monthly token limit" description="Alert when approaching this limit.">
                <input type="number" defaultValue={10000000} onChange={mark}
                  className="w-32 h-8 px-3 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
              </SettingRow>
              <SettingRow label="Alert threshold" description="Send alert when usage reaches this % of limit.">
                <select defaultValue="80" onChange={mark} className="h-8 px-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="60">60%</option><option value="80">80%</option><option value="90">90%</option>
                </select>
              </SettingRow>
            </SettingsSection>
          </div>
        )}
      </div>
      <SaveBar dirty={dirty} onSave={() => setDirty(false)} onDiscard={() => setDirty(false)} />
    </div>
  )
}
