'use client'

import { useState } from 'react'
import { Plus, MoreHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'

const SCHEDULED = [
  { report: 'Weekly Submission Dashboard', schedule: 'Every Monday', next: 'Jun 30, 2026', recipients: 'admin@co.com', format: 'Excel', status: 'Active' },
  { report: 'Monthly Revenue Summary', schedule: 'Monthly (1st)', next: 'Jul 1, 2026', recipients: '3 recipients', format: 'PDF', status: 'Active' },
  { report: 'Active Job Aging Alert', schedule: 'Daily', next: 'Jun 28, 2026', recipients: 'team@co.com', format: 'CSV', status: 'Active' },
  { report: 'Compliance Expiry Watch', schedule: 'Weekly (Fri)', next: 'Jun 28, 2026', recipients: '2 recipients', format: 'Excel', status: 'Paused' },
  { report: 'Executive Monthly Brief', schedule: 'Monthly (1st)', next: 'Jul 1, 2026', recipients: 'exec@co.com', format: 'PDF', status: 'Active' },
  { report: 'Recruiter Leaderboard', schedule: 'Every Friday', next: 'Jun 28, 2026', recipients: 'all@co.com', format: 'Excel', status: 'Active' },
]

export default function ScheduledReports() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [emails, setEmails] = useState<string[]>([])

  function addEmail() {
    const trimmed = email.trim()
    if (trimmed && !emails.includes(trimmed)) setEmails([...emails, trimmed])
    setEmail('')
  }

  return (
    <div className="flex flex-col h-full p-6 gap-4 overflow-y-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Scheduled Reports</h1>
          <p className="text-sm text-muted-foreground">Manage automated report delivery schedules</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="size-3.5" />
          New Schedule
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b">
              <th className="py-3 px-4 text-left font-medium">Report</th>
              <th className="py-3 px-4 text-left font-medium">Schedule</th>
              <th className="py-3 px-4 text-left font-medium">Next Run</th>
              <th className="py-3 px-4 text-left font-medium">Recipients</th>
              <th className="py-3 px-4 text-left font-medium">Format</th>
              <th className="py-3 px-4 text-left font-medium">Status</th>
              <th className="py-3 px-4 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {SCHEDULED.map((r) => (
              <tr key={r.report} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-3 px-4 font-medium">{r.report}</td>
                <td className="py-3 px-4 text-muted-foreground">{r.schedule}</td>
                <td className="py-3 px-4 text-muted-foreground">{r.next}</td>
                <td className="py-3 px-4 text-muted-foreground">{r.recipients}</td>
                <td className="py-3 px-4">
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">{r.format}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${r.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{r.status}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <button className="h-6 px-2 text-[10px] border rounded hover:bg-muted transition-colors">Edit</button>
                    <button className="h-6 px-2 text-[10px] border rounded hover:bg-muted transition-colors">{r.status === 'Active' ? 'Pause' : 'Resume'}</button>
                    <button className="h-6 px-2 text-[10px] border rounded hover:bg-muted transition-colors">Run Now</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Schedule Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-[420px] flex flex-col gap-5 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>New Scheduled Report</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm">Report</Label>
              <select className="h-8 text-sm border rounded-md px-2 bg-background">
                <option>Weekly Submission Dashboard</option>
                <option>Recruiter Leaderboard</option>
                <option>Monthly Revenue Summary</option>
                <option>Job Aging Report</option>
                <option>Executive Monthly Brief</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm">Schedule</Label>
              <select className="h-8 text-sm border rounded-md px-2 bg-background">
                <option>Hourly</option>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Yearly</option>
                <option>Custom</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm">Recipients</Label>
              <div className="flex gap-2">
                <input
                  className="flex-1 h-8 px-2.5 text-sm border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Enter email and press Enter"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addEmail()}
                />
                <Button size="sm" variant="outline" onClick={addEmail}>Add</Button>
              </div>
              {emails.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {emails.map((e) => (
                    <span key={e} className="flex items-center gap-1 px-2 py-0.5 text-xs bg-muted rounded-full">
                      {e}
                      <button onClick={() => setEmails(emails.filter((x) => x !== e))}><X className="size-2.5" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm">Format</Label>
              <div className="flex items-center gap-4">
                {['Excel', 'PDF', 'CSV'].map((f) => (
                  <label key={f} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="checkbox" defaultChecked={f === 'Excel'} className="size-3" />
                    {f}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm">Message (optional)</Label>
              <textarea
                className="min-h-[72px] px-2.5 py-2 text-sm border rounded-md bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Add a message to include in the report email..."
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button size="sm" className="flex-1">Schedule Report</Button>
              <Button size="sm" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
