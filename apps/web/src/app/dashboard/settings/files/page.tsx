'use client'

import { Breadcrumb, PageHeader, SettingCard, SummaryGrid, CardRow, Toggle } from '../_components'
import { cn } from '@/lib/utils'

const STORAGE = [
  { label: 'Resumes',   used: 12.1, color: 'bg-blue-500' },
  { label: 'Documents', used: 4.8,  color: 'bg-violet-500' },
  { label: 'Other',     used: 1.5,  color: 'bg-muted-foreground' },
]
const totalUsed  = STORAGE.reduce((s, x) => s + x.used, 0)
const totalLimit = 50
const pct        = Math.round((totalUsed / totalLimit) * 100)

export default function FilesPage() {
  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <Breadcrumb />
      <PageHeader title="Files & Storage" description="Storage usage, upload limits, and document processing settings." />

      <div className="space-y-4">
        {/* Storage Usage */}
        <div className="rounded-xl border border-border bg-background p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Storage Usage</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{totalUsed} GB of {totalLimit} GB used</p>
            </div>
            <span className={cn('text-sm font-bold tabular-nums', pct >= 90 ? 'text-red-600' : pct >= 75 ? 'text-amber-600' : 'text-foreground')}>
              {pct}%
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div className={cn('h-2.5 rounded-full transition-all', pct >= 90 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-500' : 'bg-blue-500')}
              style={{ width: `${pct}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-5">
            {STORAGE.map(s => (
              <div key={s.label} className="flex items-center gap-2 text-xs">
                <span className={`size-2.5 rounded-full shrink-0 ${s.color}`} />
                <span className="text-muted-foreground">{s.label}</span>
                <span className="font-medium ml-auto">{s.used} GB</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Limits */}
        <SettingCard
          title="Upload Limits"
          description="File size and type restrictions for uploads"
          summary={
            <SummaryGrid items={[
              { label: 'Max file size',   value: '10 MB' },
              { label: 'Allowed types',   value: 'PDF, DOC, DOCX, RTF, TXT, PNG, JPG' },
              { label: 'Max batch size',  value: '50 files at once' },
            ]} />
          }
        >
          <div className="space-y-3">
            <CardRow label="Maximum file size">
              <select defaultValue="10" className="h-8 px-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="5">5 MB</option>
                <option value="10">10 MB</option>
                <option value="20">20 MB</option>
                <option value="50">50 MB</option>
              </select>
            </CardRow>
            <CardRow label="Maximum batch upload">
              <select defaultValue="50" className="h-8 px-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="10">10 files</option>
                <option value="50">50 files</option>
                <option value="100">100 files</option>
              </select>
            </CardRow>
          </div>
        </SettingCard>

        {/* Cloud Storage */}
        <SettingCard
          title="Cloud Storage"
          description="Where files are stored"
          summary={
            <SummaryGrid items={[
              { label: 'Provider',  value: 'God Recruiter Cloud' },
              { label: 'Region',    value: 'us-east-1' },
              { label: 'Redundancy',value: '3× replicated' },
            ]} />
          }
        >
          <CardRow label="Primary storage provider">
            <select defaultValue="internal" className="h-8 px-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="internal">God Recruiter Cloud (default)</option>
              <option value="gdrive">Google Drive</option>
              <option value="onedrive">OneDrive</option>
              <option value="s3">Amazon S3</option>
            </select>
          </CardRow>
        </SettingCard>

        {/* Document Processing */}
        <SettingCard
          title="Document Processing"
          description="Automated processing applied to uploaded files"
          summary={
            <p className="text-xs text-muted-foreground">OCR, virus scan, auto-parse, and expiry alerts all active.</p>
          }
        >
          <div className="space-y-3">
            <CardRow label="OCR on upload" description="Extract text from scanned PDFs and images">
              <Toggle checked={true} onChange={() => {}} />
            </CardRow>
            <CardRow label="Virus scan" description="Scan all uploads for malware before saving">
              <Toggle checked={true} onChange={() => {}} />
            </CardRow>
            <CardRow label="Auto-parse resumes" description="Run AI resume parsing immediately on upload">
              <Toggle checked={true} onChange={() => {}} />
            </CardRow>
            <CardRow label="Document expiry alerts" description="Alert when candidate documents are about to expire">
              <Toggle checked={true} onChange={() => {}} />
            </CardRow>
            <CardRow label="Auto-organize by candidate" description="Store files in folders named by candidate">
              <Toggle checked={true} onChange={() => {}} />
            </CardRow>
          </div>
        </SettingCard>
      </div>
    </div>
  )
}
