'use client'

import { useState } from 'react'
import { HardDrive } from 'lucide-react'
import { SettingsHeader, SettingsSection, SettingRow, SaveBar, Toggle } from '../_components'

export default function FilesPage() {
  const [dirty, setDirty] = useState(false)
  const mark = () => setDirty(true)

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 max-w-3xl">
        <SettingsHeader title="Files & Storage" description="Configure resume storage, file types, size limits, and document processing." />

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-background p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Storage Usage</h3>
              <span className="text-xs text-muted-foreground">18.4 GB / 50 GB</span>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div className="h-2.5 rounded-full bg-blue-500 w-[37%]" />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 text-xs">
              {[
                { label: 'Resumes',   size: '12.1 GB', color: 'bg-blue-500' },
                { label: 'Documents', size: '4.8 GB',  color: 'bg-violet-500' },
                { label: 'Other',     size: '1.5 GB',  color: 'bg-muted-foreground' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <div className={`size-2 rounded-full ${s.color}`} />
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-medium ml-auto">{s.size}</span>
                </div>
              ))}
            </div>
          </div>

          <SettingsSection title="Upload Limits">
            <SettingRow label="Maximum file size" description="Per file upload limit.">
              <select defaultValue="10" onChange={mark} className="h-8 px-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="5">5 MB</option>
                <option value="10">10 MB</option>
                <option value="20">20 MB</option>
                <option value="50">50 MB</option>
              </select>
            </SettingRow>
            <SettingRow label="Allowed file types" description="File extensions accepted for upload.">
              <span className="text-xs text-muted-foreground">PDF, DOC, DOCX, RTF, TXT, PNG, JPG</span>
            </SettingRow>
          </SettingsSection>

          <SettingsSection title="Cloud Storage">
            <SettingRow label="Primary storage" description="Where files are stored.">
              <select defaultValue="internal" onChange={mark} className="h-8 px-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="internal">God Recruiter Cloud (default)</option>
                <option value="gdrive">Google Drive</option>
                <option value="onedrive">OneDrive</option>
                <option value="s3">Amazon S3</option>
              </select>
            </SettingRow>
          </SettingsSection>

          <SettingsSection title="Document Processing">
            <SettingRow label="OCR on upload" description="Extract text from scanned PDFs and images.">
              <Toggle checked={true} onChange={mark} />
            </SettingRow>
            <SettingRow label="Virus scan" description="Scan all uploads for malware before saving.">
              <Toggle checked={true} onChange={mark} />
            </SettingRow>
            <SettingRow label="Auto-parse resumes" description="Run AI resume parsing immediately on upload.">
              <Toggle checked={true} onChange={mark} />
            </SettingRow>
            <SettingRow label="Document expiry alerts" description="Alert when candidate documents are about to expire.">
              <Toggle checked={true} onChange={mark} />
            </SettingRow>
          </SettingsSection>

          <SettingsSection title="Folder Structure">
            <SettingRow label="Auto-organize by candidate" description="Store files in folders named by candidate.">
              <Toggle checked={true} onChange={mark} />
            </SettingRow>
            <SettingRow label="Include date in path" description="Add year/month to folder path for chronological organization.">
              <Toggle checked={false} onChange={mark} />
            </SettingRow>
          </SettingsSection>
        </div>
      </div>
      <SaveBar dirty={dirty} onSave={() => setDirty(false)} onDiscard={() => setDirty(false)} />
    </div>
  )
}
