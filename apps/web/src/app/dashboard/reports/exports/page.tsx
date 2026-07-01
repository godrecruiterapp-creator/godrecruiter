'use client'

import { Download } from 'lucide-react'

const EXPORTS = [
  { date: 'Jun 26, 2026 09:14', report: 'Weekly Submission Dashboard', format: 'Excel', size: '124 KB', status: 'Completed' },
  { date: 'Jun 25, 2026 17:32', report: 'Executive Monthly Brief', format: 'PDF', size: '2.1 MB', status: 'Completed' },
  { date: 'Jun 25, 2026 14:08', report: 'Job Aging Report', format: 'CSV', size: '48 KB', status: 'Completed' },
  { date: 'Jun 25, 2026 11:45', report: 'Compliance Expiry Watch', format: 'Excel', size: '88 KB', status: 'Completed' },
  { date: 'Jun 24, 2026 16:20', report: 'Revenue Dashboard', format: 'PDF', size: '1.4 MB', status: 'Completed' },
  { date: 'Jun 24, 2026 12:00', report: 'Recruiter Leaderboard', format: 'Excel', size: '—', status: 'Processing' },
  { date: 'Jun 23, 2026 09:55', report: 'Candidate Source Report', format: 'CSV', size: '—', status: 'Failed' },
  { date: 'Jun 22, 2026 15:30', report: 'Monthly Revenue Summary', format: 'PDF', size: '1.8 MB', status: 'Completed' },
  { date: 'Jun 21, 2026 10:10', report: 'Team Performance', format: 'Excel', size: '96 KB', status: 'Completed' },
  { date: 'Jun 20, 2026 08:40', report: 'Client Pipeline Health', format: 'CSV', size: '52 KB', status: 'Completed' },
]

function statusBadge(status: string) {
  if (status === 'Completed') return 'bg-emerald-100 text-emerald-700'
  if (status === 'Processing') return 'bg-blue-100 text-blue-700'
  return 'bg-red-100 text-red-700'
}

export default function ExportHistory() {
  return (
    <div className="flex flex-col h-full p-6 gap-4 overflow-y-auto">
      <div>
        <h1 className="text-xl font-semibold">Export History</h1>
        <p className="text-sm text-muted-foreground">All report exports generated in this account</p>
      </div>

      <div className="rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b">
              <th className="py-3 px-4 text-left font-medium">Date</th>
              <th className="py-3 px-4 text-left font-medium">Report</th>
              <th className="py-3 px-4 text-left font-medium">Format</th>
              <th className="py-3 px-4 text-left font-medium">Size</th>
              <th className="py-3 px-4 text-left font-medium">Status</th>
              <th className="py-3 px-4 text-left font-medium">Download</th>
            </tr>
          </thead>
          <tbody>
            {EXPORTS.map((r, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">{r.date}</td>
                <td className="py-3 px-4 font-medium">{r.report}</td>
                <td className="py-3 px-4">
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">{r.format}</span>
                </td>
                <td className="py-3 px-4 text-muted-foreground">{r.size}</td>
                <td className="py-3 px-4">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${statusBadge(r.status)}`}>{r.status}</span>
                </td>
                <td className="py-3 px-4">
                  {r.status === 'Completed' ? (
                    <button className="flex items-center gap-1 h-6 px-2 text-[10px] border rounded hover:bg-muted transition-colors">
                      <Download className="size-2.5" />Download
                    </button>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
