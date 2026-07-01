'use client'

import { Button } from '@/components/ui/button'
import { Sparkles, Bot, Users, Mail, AlertCircle, Copy, RefreshCw, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const AI_INSIGHTS = [
  { icon: '⚡', text: '42 candidates haven\'t been contacted in 7+ days.', action: 'Send Bulk Email', severity: 'warn' },
  { icon: '🎯', text: '15 candidates are a strong match for Job #1023 ICU RN.', action: 'View Matches', severity: 'info' },
  { icon: '🚀', text: '5 candidates are ready for immediate client submission.', action: 'Submit Now', severity: 'success' },
  { icon: '⚠️', text: '3 H1B candidates have visas expiring within 60 days.', action: 'Review', severity: 'warn' },
  { icon: '📉', text: 'Project activity has slowed — contact rate dropped 20% this week.', action: 'Check Activity', severity: 'warn' },
  { icon: '🔄', text: '8 candidates from a previous project may be duplicates.', action: 'Review Duplicates', severity: 'info' },
]

const RANKED = [
  { name: 'Maria Lopez',   score: 96, reason: 'CCRN certified, immediate availability, Houston location match', tag: 'Best Fit' },
  { name: 'Linda Torres',  score: 93, reason: 'OR specialist, perfect pay range, strong client history',       tag: 'Ready to Submit' },
  { name: 'Anna Kim',      score: 87, reason: 'Travel OK, ICU & ER experience, fast responder',               tag: 'Most Active' },
  { name: 'Sarah Chen',    score: 84, reason: 'ER background, 6 years exp, local candidate',                  tag: 'High Potential' },
  { name: 'James Wilson',  score: 91, reason: 'Java architect, Spring + AWS, GC holder, senior level',        tag: 'Best Fit' },
]

const TAG_CFG: Record<string, string> = {
  'Best Fit':       'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Ready to Submit':'bg-blue-50 text-blue-700 border-blue-200',
  'Most Active':    'bg-violet-50 text-violet-700 border-violet-200',
  'High Potential': 'bg-amber-50 text-amber-700 border-amber-200',
}

const OUTREACH_TYPES = [
  { label: 'Email',            icon: Mail,     desc: 'Personalized outreach email' },
  { label: 'SMS',              icon: Mail,     desc: 'Short, punchy text message' },
  { label: 'LinkedIn Message', icon: Users,    desc: 'Professional connection message' },
  { label: 'Call Script',      icon: Mail,     desc: 'Talking points for a phone call' },
  { label: 'Follow-up',        icon: RefreshCw,desc: 'Gentle follow-up after no reply' },
]

const CAPABILITIES = [
  {
    title: 'AI Project Summary',
    desc: 'Get a plain-English summary of project progress, risks, and recruiter activity.',
    icon: Bot,
    color: 'border-violet-200 bg-violet-50/40',
    iconColor: 'text-violet-600',
    cta: 'Generate Summary',
  },
  {
    title: 'Duplicate Detection',
    desc: 'Find and merge duplicate candidates across this project and your ATS.',
    icon: Copy,
    color: 'border-amber-200 bg-amber-50/40',
    iconColor: 'text-amber-600',
    cta: 'Scan for Duplicates',
  },
  {
    title: 'Resume Review',
    desc: 'AI summarizes resumes, extracts missing information, and highlights risks.',
    icon: Sparkles,
    color: 'border-blue-200 bg-blue-50/40',
    iconColor: 'text-blue-600',
    cta: 'Review Resumes',
  },
  {
    title: 'Skill Analysis',
    desc: 'Identify most common, missing, and rare skills across your talent pool.',
    icon: AlertCircle,
    color: 'border-emerald-200 bg-emerald-50/40',
    iconColor: 'text-emerald-600',
    cta: 'Analyze Skills',
  },
]

export default function ProjectAIPage() {
  return (
    <div className="h-full overflow-y-auto p-5">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* AI Insights */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-4 text-purple-500" />
            <h2 className="text-sm font-semibold">AI Insights</h2>
            <span className="text-[10px] text-muted-foreground ml-auto">Updated just now</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {AI_INSIGHTS.map((ins, i) => (
              <div key={i} className={cn(
                'flex items-start gap-3 p-3.5 rounded-xl border',
                ins.severity === 'warn' ? 'border-amber-200 bg-amber-50/50' :
                ins.severity === 'success' ? 'border-emerald-200 bg-emerald-50/50' :
                'border-border bg-background'
              )}>
                <span className="text-lg leading-none shrink-0">{ins.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">{ins.text}</p>
                  <button className="text-[10px] font-semibold text-foreground mt-1.5 hover:underline">{ins.action} →</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* AI Candidate Ranking */}
          <div className="rounded-xl border border-border bg-background p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">AI Candidate Ranking</h3>
              <Button size="sm" variant="outline" className="h-7 text-sm gap-1.5">
                <RefreshCw className="size-3" />Re-rank
              </Button>
            </div>
            <div className="space-y-3">
              {RANKED.map((r, i) => (
                <div key={r.name} className="flex items-start gap-3">
                  <span className="text-sm font-bold text-muted-foreground w-4 shrink-0 pt-0.5">{i + 1}</span>
                  <div className="size-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                    {r.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold">{r.name}</span>
                      <span className={cn('text-[9px] font-semibold rounded-full border px-1.5 py-px', TAG_CFG[r.tag] ?? '')}>{r.tag}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-snug">{r.reason}</p>
                  </div>
                  <span className={cn('text-sm font-bold tabular-nums shrink-0', r.score >= 90 ? 'text-emerald-600' : r.score >= 75 ? 'text-amber-500' : 'text-red-500')}>
                    {r.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Outreach Generator */}
          <div className="rounded-xl border border-border bg-background p-5">
            <h3 className="text-sm font-semibold mb-4">AI Outreach Generator</h3>
            <p className="text-sm text-muted-foreground mb-3">Generate personalized outreach for any candidate in seconds.</p>
            <div className="space-y-2">
              {OUTREACH_TYPES.map(o => {
                const Icon = o.icon
                return (
                  <button key={o.label}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border border-border hover:bg-muted/40 hover:border-muted-foreground transition-colors text-left group">
                    <div className="size-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Sparkles className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{o.label}</p>
                      <p className="text-[10px] text-muted-foreground">{o.desc}</p>
                    </div>
                    <ChevronRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* AI Capabilities grid */}
        <div>
          <h3 className="text-sm font-semibold mb-3">More AI Tools</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CAPABILITIES.map(cap => {
              const Icon = cap.icon
              return (
                <div key={cap.title} className={cn('rounded-xl border p-4', cap.color)}>
                  <div className="flex items-start gap-3 mb-3">
                    <Icon className={cn('size-5 shrink-0', cap.iconColor)} />
                    <div>
                      <p className="text-sm font-semibold">{cap.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-snug">{cap.desc}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-sm gap-1.5 w-full bg-background">
                    <Sparkles className="size-3" />{cap.cta}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
