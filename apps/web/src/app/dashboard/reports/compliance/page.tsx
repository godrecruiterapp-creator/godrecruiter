'use client'

import { BarChart3, Sparkles, TrendingUp, AlertTriangle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

const REPORT_CARDS = [
  { name: 'License Expiration', desc: 'Upcoming and expired licenses' },
  { name: 'Credential Status', desc: 'Active vs expired credential overview' },
  { name: 'Missing Documents', desc: 'Candidates with incomplete compliance files' },
  { name: 'Compliance Completion', desc: 'Percentage of fully compliant candidates' },
  { name: 'Background Checks', desc: 'Status of background check requests' },
  { name: 'Drug Screens', desc: 'Drug screening status across candidates' },
  { name: 'Immunization Status', desc: 'Vaccination and immunization records' },
  { name: 'Certification Expiration', desc: 'Certifications expiring in next 90 days' },
]

function daysColor(days: number) {
  if (days < 0) return 'text-red-600 font-semibold'
  if (days <= 30) return 'text-amber-600 font-semibold'
  return 'text-muted-foreground'
}

function statusBadge(status: string) {
  if (status === 'Expired') return 'bg-red-100 text-red-700'
  if (status === 'Expiring Soon') return 'bg-amber-100 text-amber-700'
  return 'bg-emerald-100 text-emerald-700'
}

const LICENSES = [
  { candidate: 'Maria Lopez', type: 'RN License', expiry: 'Jun 15, 2026', days: -12, status: 'Expired' },
  { candidate: 'Thomas Reed', type: 'LPN License', expiry: 'Jul 8, 2026', days: 11, status: 'Expiring Soon' },
  { candidate: 'Priya Singh', type: 'CNA Certification', expiry: 'Jul 18, 2026', days: 21, status: 'Expiring Soon' },
  { candidate: 'James Carter', type: 'BLS Certification', expiry: 'Jul 28, 2026', days: 31, status: 'Active' },
  { candidate: 'Susan Kim', type: 'ACLS Certification', expiry: 'May 30, 2026', days: -28, status: 'Expired' },
  { candidate: 'Brian Hall', type: 'RN License', expiry: 'Aug 5, 2026', days: 39, status: 'Active' },
  { candidate: 'Amy Chen', type: 'Phlebotomy Cert', expiry: 'Jul 3, 2026', days: 6, status: 'Expiring Soon' },
  { candidate: 'David Ross', type: 'OSHA Training', expiry: 'Sep 12, 2026', days: 77, status: 'Active' },
]

const INSIGHTS = [
  '2 candidates have expired licenses — submissions may be blocked.',
  '3 candidates have licenses expiring within 30 days — proactive renewal recommended.',
  'Compliance completion rate is 82% — up from 76% last month.',
  'Background check average turnaround is 3.8 days — within 5-day SLA.',
]

export default function ComplianceReports() {
  return (
    <div className="flex flex-col h-full p-6 gap-4 overflow-y-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Compliance Reports</h1>
          <p className="text-sm text-muted-foreground">Track licenses, credentials, and compliance status across candidates</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-8 text-sm border rounded-md px-2 bg-background"><option>All Candidates</option></select>
          <Button size="sm" variant="outline" className="gap-1.5"><Download className="size-3.5" />Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {REPORT_CARDS.map((r) => (
          <div key={r.name} className="rounded-lg border bg-card p-4 hover:shadow-md hover:border-brand/30 cursor-pointer transition-all">
            <div className="flex items-start gap-3">
              <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                <BarChart3 className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{r.name}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{r.desc}</p>
                <p className="text-sm text-brand mt-2">View Report →</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm font-semibold mb-3">License Expiration Alert</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b">
              <th className="pb-2 text-left font-medium">Candidate</th>
              <th className="pb-2 text-left font-medium">License Type</th>
              <th className="pb-2 text-left font-medium">Expiry Date</th>
              <th className="pb-2 text-right font-medium">Days Remaining</th>
              <th className="pb-2 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {LICENSES.map((r) => (
              <tr key={r.candidate + r.type} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-2 font-medium">{r.candidate}</td>
                <td className="py-2 text-muted-foreground">{r.type}</td>
                <td className="py-2 text-muted-foreground">{r.expiry}</td>
                <td className={`py-2 text-right ${daysColor(r.days)}`}>{r.days < 0 ? `${Math.abs(r.days)}d overdue` : `${r.days}d`}</td>
                <td className="py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] ${statusBadge(r.status)}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-brand/20 bg-brand-muted/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="size-4 text-brand" />
          <span className="text-sm font-semibold">AI Insights</span>
          <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Powered by Claude</span>
        </div>
        <ul className="space-y-2">
          {INSIGHTS.map((insight, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              {i <= 1 ? <AlertTriangle className="size-3.5 mt-0.5 shrink-0 text-amber-600" /> : <TrendingUp className="size-3.5 mt-0.5 shrink-0 text-emerald-600" />}
              {insight}
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {['Summarize', 'Explain Trends', 'Detect Anomalies', 'Forecast', 'Recommend Actions'].map((a) => (
            <button key={a} className="h-7 px-3 text-sm border border-border rounded-md hover:bg-muted transition-colors">{a}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
