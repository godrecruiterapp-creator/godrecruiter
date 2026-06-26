'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

type Template = {
  name: string; category: string; desc: string; timeSaved: string; difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
}

const TEMPLATES: Template[] = [
  { name: 'Candidate Finder',      category: 'Recruiting',    desc: 'Search and rank candidates from ATS database',                       timeSaved: '5 hrs/week',  difficulty: 'Beginner' },
  { name: 'AI Sourcer',            category: 'Recruiting',    desc: 'AI-powered sourcing using Boolean search and job boards',             timeSaved: '8 hrs/week',  difficulty: 'Intermediate' },
  { name: 'Resume Watcher',        category: 'Recruiting',    desc: 'Monitor new resume uploads and auto-screen',                          timeSaved: '3 hrs/week',  difficulty: 'Beginner' },
  { name: 'Candidate Rediscovery', category: 'Recruiting',    desc: 'Find previously sourced candidates matching new jobs',                timeSaved: '4 hrs/week',  difficulty: 'Intermediate' },
  { name: 'Candidate Follow-up',   category: 'Communication', desc: 'Automated follow-up sequence for non-responsive candidates',          timeSaved: '6 hrs/week',  difficulty: 'Beginner' },
  { name: 'No Response Workflow',  category: 'Communication', desc: 'Multi-touch outreach for cold candidates',                            timeSaved: '4 hrs/week',  difficulty: 'Intermediate' },
  { name: 'Interview Reminder',    category: 'Communication', desc: 'Send automated reminders before scheduled interviews',                timeSaved: '2 hrs/week',  difficulty: 'Beginner' },
  { name: 'Job Health Monitor',    category: 'Job',           desc: 'Alert when jobs have no submissions or activity',                     timeSaved: '3 hrs/week',  difficulty: 'Beginner' },
  { name: 'Job Refresh',           category: 'Job',           desc: 'Periodically republish stale job postings',                          timeSaved: '2 hrs/week',  difficulty: 'Beginner' },
  { name: 'Duplicate Job Detector',category: 'Job',           desc: 'Detect and flag duplicate job entries',                              timeSaved: '1 hr/week',   difficulty: 'Beginner' },
  { name: 'License Expiration',    category: 'Compliance',    desc: 'Monitor and alert on expiring candidate licenses',                    timeSaved: '4 hrs/week',  difficulty: 'Intermediate' },
  { name: 'Missing Documents',     category: 'Compliance',    desc: 'Identify candidates with incomplete document sets',                   timeSaved: '3 hrs/week',  difficulty: 'Beginner' },
  { name: 'Credential Monitor',    category: 'Compliance',    desc: 'Track credential expiry and renewal status',                         timeSaved: '5 hrs/week',  difficulty: 'Advanced' },
  { name: 'Recruiter Performance', category: 'Analytics',     desc: 'Weekly performance report per recruiter',                            timeSaved: '2 hrs/week',  difficulty: 'Beginner' },
  { name: 'Pipeline Monitor',      category: 'Analytics',     desc: 'Real-time pipeline health and bottleneck alerts',                    timeSaved: '3 hrs/week',  difficulty: 'Intermediate' },
  { name: 'Source Performance',    category: 'Analytics',     desc: 'Compare candidate quality by source',                                timeSaved: '2 hrs/week',  difficulty: 'Intermediate' },
]

const CATEGORIES = ['All', 'Recruiting', 'Communication', 'Job', 'Compliance', 'Analytics']

const DIFFICULTY_BADGE: Record<string, string> = {
  Beginner:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  Intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
  Advanced:     'bg-red-50 text-red-700 border-red-200',
}

export default function TemplatesPage() {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')

  const filtered = TEMPLATES.filter(t => {
    if (cat !== 'All' && t.category !== cat) return false
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.desc.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="flex flex-col h-full p-6 overflow-auto gap-4">
      {/* Filter bar */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates…" className="h-8 w-52 pl-8 text-xs" />
        </div>
        <div className="flex items-center gap-1">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={cn('h-8 px-3 text-xs font-medium rounded-md transition-colors',
                cat === c ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground')}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map(t => (
          <Card key={t.name} className="p-4 flex flex-col gap-3 hover:border-brand/40 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="size-9 rounded-md bg-brand-muted flex items-center justify-center shrink-0">
                <Bot className="size-4 text-brand" />
              </div>
              <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', DIFFICULTY_BADGE[t.difficulty])}>
                {t.difficulty}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{t.desc}</p>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">{t.category}</span>
                <span className="text-xs text-muted-foreground">Est. {t.timeSaved}</span>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs">Install</Button>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <Search className="size-6 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No templates match your filters</p>
        </div>
      )}
    </div>
  )
}
