'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X, Zap, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CreateAutomationWizard } from '../create-automation-wizard'

type Template = {
  id: string
  name: string
  description: string
  category: string
  popular?: boolean
  ai?: boolean
}

const TEMPLATES: Template[] = [
  { id: '1',  name: 'Auto Welcome Candidate',       category: 'Communication', popular: true,  description: 'Send a welcome email the moment a candidate applies.' },
  { id: '2',  name: 'Interview Reminder',            category: 'Interviews',    popular: true,  description: 'Remind candidates and interviewers 1 day before the interview.' },
  { id: '3',  name: 'Offer Follow-up',               category: 'Communication',                 description: 'Follow up automatically if no response to an offer within 1 day.' },
  { id: '4',  name: 'Credential Expiration',         category: 'Compliance',    popular: true,  description: 'Alert the recruiter when a license or credential expires within 30 days.' },
  { id: '5',  name: 'Compliance Reminder',           category: 'Compliance',                    description: 'Send reminders every morning when compliance documents are missing.' },
  { id: '6',  name: 'Missing Documents',             category: 'Compliance',                    description: 'Request missing onboarding documents from the candidate.' },
  { id: '7',  name: 'No Recruiter Activity',         category: 'Recruiting',                    description: 'Alert the manager when no activity on a job for 3 days.' },
  { id: '8',  name: 'Candidate Birthday',            category: 'Communication',                 description: 'Send a birthday message to active candidates automatically.' },
  { id: '9',  name: 'Redeployment',                 category: 'Placements',    popular: true,  description: 'Reach out to candidates 30 days before their placement ends.' },
  { id: '10', name: 'Placement Ending Soon',         category: 'Placements',                    description: 'Notify the account manager when a placement ends within 30 days.' },
  { id: '11', name: 'Timesheet Reminder',            category: 'Operations',                    description: 'Remind contractors every Monday morning to submit their timesheet.' },
  { id: '12', name: 'Vendor Submission',             category: 'Vendors',                       description: 'Notify the team when a vendor responds to a submission request.' },
  { id: '13', name: 'Rejected Candidate Follow-up',  category: 'Communication',                 description: 'Send a kind follow-up to rejected candidates after 3 days.' },
  { id: '14', name: 'Job Aging Alert',               category: 'Recruiting',                    description: 'Alert the recruiter when a job has been open for more than 30 days.' },
  { id: '15', name: 'High Priority Job Alert',       category: 'Recruiting',    popular: true,  description: 'Immediately notify the team when a high-priority job is created.' },
  { id: '16', name: 'Candidate Re-engagement',       category: 'Recruiting',                    description: 'Send an email to candidates who have been inactive for 60 days.' },
  { id: '17', name: 'Inactive Candidate',            category: 'Recruiting',                    description: 'Flag candidates with no activity for 90 days for review.' },
  { id: '18', name: 'Hot Lead Follow-up',            category: 'Communication',                 description: 'Create a follow-up task the moment a hot lead is marked.' },
  { id: '19', name: 'Reference Reminder',            category: 'Compliance',                    description: 'Remind the recruiter to collect references before an offer is made.' },
  { id: '20', name: 'Manager Approval',              category: 'Operations',                    description: 'Notify the manager and wait for approval before moving forward.' },
  { id: '21', name: 'Auto AI Candidate Summary',     category: 'AI',            ai: true, popular: true, description: 'Generate an AI summary the moment a new candidate is added.' },
  { id: '22', name: 'Resume Screening',              category: 'AI',            ai: true,       description: 'Use AI to screen and score resumes against the job requirements.' },
  { id: '23', name: 'AI Submission Notes',           category: 'AI',            ai: true,       description: 'Auto-generate submission notes before sending a candidate to a client.' },
  { id: '24', name: 'AI Candidate Matching',         category: 'AI',            ai: true, popular: true, description: 'Automatically match new candidates to open jobs using AI.' },
]

const CATS = ['All', 'Communication', 'Interviews', 'Compliance', 'Recruiting', 'Placements', 'Operations', 'Vendors', 'AI']

export default function TemplatesPage() {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const [wizardOpen, setWizardOpen] = useState(false)

  const filtered = TEMPLATES.filter(t => {
    if (cat !== 'All' && t.category !== cat) return false
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <>
      <div className="flex flex-col h-full p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4 shrink-0 flex-wrap gap-3">
          <div>
            <h1 className="text-base font-semibold">Automation Templates</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Pick a ready-made automation and start in seconds.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search templates…" className="h-8 w-52 pl-8 pr-7 text-xs" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-2 flex-wrap pb-4 shrink-0">
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                cat === c
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground'
              )}>
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map(t => (
              <div key={t.id} className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-background hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-2.5">
                  <div className={cn('size-8 rounded-lg flex items-center justify-center shrink-0', t.ai ? 'bg-purple-50' : 'bg-muted')}>
                    {t.ai ? <Bot className="size-4 text-purple-600" /> : <Zap className="size-4 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-semibold">{t.name}</p>
                      {t.popular && (
                        <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">Popular</span>
                      )}
                      {t.ai && (
                        <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wide">AI</span>
                      )}
                    </div>
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-muted/80 text-muted-foreground mt-0.5">
                      {t.category}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                <Button size="sm" variant="outline" className="h-7 text-xs w-full" onClick={() => setWizardOpen(true)}>
                  Use This Template
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <CreateAutomationWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </>
  )
}
