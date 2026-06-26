'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Star, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

const PENDING = [
  { id: '5',  candidate: 'Lisa Thompson',  job: 'Data Scientist',    client: 'Analytics Co', date: '2026-06-27', interviewer: 'HR Team',       daysSince: 0 },
  { id: '4',  candidate: 'Robert Kim',     job: 'Project Manager',   client: 'BuildRight',   date: '2026-06-27', interviewer: 'Panel',          daysSince: 0 },
  { id: '11', candidate: 'Sandra Davis',   job: 'LPN – Acute Care',  client: 'City Hospital', date: '2026-06-27', interviewer: 'Nurse Manager', daysSince: 0 },
  { id: '7',  candidate: 'Maria Garcia',   job: 'Physical Therapist',client: 'RehabCare',    date: '2026-06-26', interviewer: 'HR Director',    daysSince: 1 },
  { id: '8',  candidate: 'Kevin Brown',    job: 'Network Engineer',  client: 'NetSec Corp',  date: '2026-06-25', interviewer: 'Tech Lead',      daysSince: 2 },
  { id: '2',  candidate: 'James Martinez', job: 'RN – ICU',          client: 'Metro Health', date: '2026-06-28', interviewer: 'Dr. Smith',      daysSince: 0 },
  { id: '3',  candidate: 'Emily Chen',     job: 'DevOps Engineer',   client: 'CloudBase',    date: '2026-06-29', interviewer: 'Tom Wilson',     daysSince: 0 },
]

const RATING_FIELDS = [
  'Communication', 'Technical Skills', 'Problem Solving',
  'Culture Fit', 'Experience', 'Confidence', 'Overall Rating',
]

const RECOMMENDATIONS = [
  { value: 'strong_hire', label: 'Strong Hire',  color: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
  { value: 'hire',        label: 'Hire',         color: 'border-blue-500 bg-blue-50 text-blue-700' },
  { value: 'hold',        label: 'Hold',         color: 'border-amber-500 bg-amber-50 text-amber-700' },
  { value: 'reject',      label: 'Reject',       color: 'border-red-500 bg-red-50 text-red-700' },
]

function dayColor(d: number) {
  if (d > 5) return 'text-red-600'
  if (d > 2) return 'text-amber-600'
  return 'text-muted-foreground'
}

function StarRow({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={cn('size-6', n <= value ? 'text-amber-400' : 'text-muted-foreground/30')}>
          <Star className="size-full fill-current" />
        </button>
      ))}
    </div>
  )
}

export default function FeedbackPage() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [activeFeedback, setActiveFeedback] = useState<typeof PENDING[0] | null>(null)
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [recommendation, setRecommendation] = useState('')
  const [strengths, setStrengths] = useState('')
  const [weaknesses, setWeaknesses] = useState('')
  const [notes, setNotes] = useState('')

  function openFeedback(row: typeof PENDING[0]) {
    setActiveFeedback(row)
    setRatings({})
    setRecommendation('')
    setStrengths('')
    setWeaknesses('')
    setNotes('')
    setSheetOpen(true)
  }

  return (
    <>
      <div className="flex flex-col h-full p-6 gap-5 overflow-y-auto">
        <div>
          <h1 className="text-xl font-semibold">Pending Feedback</h1>
          <p className="text-sm text-muted-foreground">{PENDING.length} interviews awaiting feedback</p>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-muted/80">
              <tr className="border-b border-border">
                {['Candidate','Job','Client','Interview Date','Interviewer','Days Since','Action'].map(h => (
                  <th key={h} className="h-9 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PENDING.map(row => (
                <tr key={row.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-full bg-brand/10 flex items-center justify-center text-brand text-xs font-semibold shrink-0">
                        {row.candidate[0]}
                      </div>
                      <span className="text-sm font-medium">{row.candidate}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{row.job}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{row.client}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{row.date}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{row.interviewer}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${dayColor(row.daysSince)}`}>
                      {row.daysSince === 0 ? 'Today' : `${row.daysSince}d ago`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="h-7 text-xs"
                        onClick={() => openFeedback(row)}>
                        <MessageSquare className="size-3 mr-1" />Submit Feedback
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground">
                        Send Reminder
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[500px] flex flex-col p-0 overflow-hidden" style={{ maxWidth: '500px' }}>
          <SheetHeader className="px-6 py-4 border-b shrink-0">
            <SheetTitle>{activeFeedback?.candidate}</SheetTitle>
            <p className="text-sm text-muted-foreground">{activeFeedback?.job}</p>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Rating sliders */}
            <div className="space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ratings</p>
              {RATING_FIELDS.map(field => (
                <div key={field} className="flex items-center justify-between gap-4">
                  <Label className="text-sm w-36 shrink-0">{field}</Label>
                  <StarRow value={ratings[field] ?? 0} onChange={v => setRatings(r => ({ ...r, [field]: v }))} />
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Candidate Strengths</Label>
              <Textarea value={strengths} onChange={e => setStrengths(e.target.value)}
                placeholder="What did the candidate do well?" className="resize-none h-20 text-sm" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Candidate Weaknesses</Label>
              <Textarea value={weaknesses} onChange={e => setWeaknesses(e.target.value)}
                placeholder="Areas for improvement…" className="resize-none h-20 text-sm" />
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hiring Recommendation</p>
              <div className="grid grid-cols-2 gap-2">
                {RECOMMENDATIONS.map(r => (
                  <button key={r.value} type="button"
                    onClick={() => setRecommendation(r.value)}
                    className={cn(
                      'py-3 rounded-lg border-2 text-sm font-semibold transition-all',
                      recommendation === r.value ? r.color : 'border-border text-muted-foreground hover:bg-muted/50'
                    )}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Additional notes…" className="resize-none h-24 text-sm" />
            </div>
          </div>

          <div className="px-6 py-4 border-t shrink-0">
            <Button className="w-full">Submit Feedback</Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
