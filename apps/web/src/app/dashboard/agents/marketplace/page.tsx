'use client'

import { Card } from '@/components/ui/card'
import { Bot, Lock, Sparkles } from 'lucide-react'

const PREVIEW = [
  { name: 'Community Sourcer', category: 'Recruiting',    desc: 'Community-built agent for advanced sourcing workflows' },
  { name: 'LinkedIn Outreach', category: 'Communication', desc: 'Automated LinkedIn connection and message sequences' },
  { name: 'ATS Sync Bot',      category: 'Productivity',  desc: 'Sync candidates between multiple ATS platforms' },
  { name: 'Salary Benchmarker',category: 'Analytics',     desc: 'Compare compensation data across market sources' },
  { name: 'DEI Monitor',       category: 'Compliance',    desc: 'Track diversity metrics across pipeline stages' },
  { name: 'Offer Negotiator',  category: 'Communication', desc: 'AI-assisted offer negotiation email sequences' },
]

export default function MarketplacePage() {
  return (
    <div className="flex flex-col h-full p-6 overflow-auto gap-6">
      {/* Coming Soon Banner */}
      <div className="flex items-center gap-3 px-5 py-4 rounded-xl border border-brand/30 bg-brand-muted">
        <Sparkles className="size-5 text-brand shrink-0" />
        <div>
          <p className="text-sm font-semibold text-brand">Marketplace Coming Soon</p>
          <p className="text-xs text-muted-foreground mt-0.5">Browse and install community-built agents. We are onboarding our first batch of agent creators — check back soon.</p>
        </div>
      </div>

      {/* Preview Grid */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Preview — Community Agents</p>
        <div className="grid grid-cols-3 gap-4">
          {PREVIEW.map(t => (
            <div key={t.name} className="relative overflow-hidden rounded-xl border">
              <Card className="p-4 flex flex-col gap-3 border-0 rounded-none">
                <div className="size-9 rounded-md bg-muted flex items-center justify-center">
                  <Bot className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                </div>
                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-muted/60 text-muted-foreground border-border w-fit">{t.category}</span>
              </Card>
              {/* Blur overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 backdrop-blur-[2px] bg-background/60 rounded-xl">
                <Lock className="size-5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Coming Soon</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
