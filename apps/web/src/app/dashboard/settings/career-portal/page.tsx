'use client'

import { useState } from 'react'
import { Globe, ExternalLink } from 'lucide-react'
import { Breadcrumb, PageHeader, SettingCard, SummaryGrid, CardRow, Toggle } from '../_components'

export default function CareerPortalPage() {
  const [enabled, setEnabled]       = useState(true)
  const [subdomain, setSubdomain]   = useState('godrecruiter')
  const [title, setTitle]           = useState('Work With Us')
  const [desc, setDesc]             = useState('Join the God Recruiter team and build the future of healthcare staffing.')
  const [applyEnabled, setApply]    = useState(true)
  const [linkedinApply, setLinkedin] = useState(true)
  const [showSalary, setShowSalary] = useState(false)
  const [seoTitle, setSeoTitle]     = useState('Healthcare Staffing Jobs — God Recruiter')

  return (
    <div className="px-8 py-10">
      <Breadcrumb />
      <PageHeader title="Career Portal" description="Your public job site and candidate-facing experience." />

      <div className="space-y-4">
        {/* Status + URL */}
        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`size-2.5 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
              <div>
                <p className="text-sm font-semibold">{enabled ? 'Portal is live' : 'Portal is offline'}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {subdomain}.godrecruiter.com/careers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {enabled && (
                <button className="h-8 px-3 text-sm rounded-lg border border-border hover:bg-muted/60 transition-colors flex items-center gap-1.5">
                  <ExternalLink className="size-3.5" />Preview
                </button>
              )}
              <Toggle checked={enabled} onChange={setEnabled} />
            </div>
          </div>
        </div>

        {/* Portal Settings */}
        <SettingCard
          title="Portal Settings"
          description="URL, title, and description shown on the public job site"
          summary={
            <SummaryGrid items={[
              { label: 'URL',         value: `${subdomain}.godrecruiter.com/careers` },
              { label: 'Page title',  value: title },
            ]} />
          }
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Subdomain</label>
              <div className="flex items-center gap-0">
                <input value={subdomain} onChange={e => setSubdomain(e.target.value)}
                  className="flex-1 h-9 px-3 text-sm rounded-l-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                <span className="h-9 px-3 flex items-center text-sm text-muted-foreground bg-muted border border-l-0 border-input rounded-r-lg">
                  .godrecruiter.com/careers
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Page title</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
          </div>
        </SettingCard>

        {/* Application Settings */}
        <SettingCard
          title="Application Settings"
          description="How candidates apply to your jobs"
          summary={
            <SummaryGrid items={[
              { label: 'Online apply',     value: applyEnabled ? 'Enabled' : 'Disabled' },
              { label: 'LinkedIn Apply',   value: linkedinApply ? 'Enabled' : 'Disabled' },
              { label: 'Salary display',   value: showSalary ? 'Visible' : 'Hidden' },
            ]} />
          }
        >
          <div className="space-y-3">
            <CardRow label="Enable online apply" description="Candidates can apply directly from the portal">
              <Toggle checked={applyEnabled} onChange={setApply} />
            </CardRow>
            <CardRow label="LinkedIn Easy Apply" description="Let candidates apply with their LinkedIn profile">
              <Toggle checked={linkedinApply} onChange={setLinkedin} />
            </CardRow>
            <CardRow label="Show salary / bill rate" description="Display pay range on job listings">
              <Toggle checked={showSalary} onChange={setShowSalary} />
            </CardRow>
            <CardRow label="Require resume upload" description="Make resume mandatory on all applications">
              <Toggle checked={true} onChange={() => {}} />
            </CardRow>
          </div>
        </SettingCard>

        {/* SEO */}
        <SettingCard
          title="SEO"
          description="Search engine optimization for your career portal"
          summary={
            <SummaryGrid items={[
              { label: 'Meta title',    value: seoTitle },
              { label: 'Sitemap',       value: 'Auto-generated' },
              { label: 'Schema markup', value: 'JobPosting (enabled)' },
            ]} />
          }
        >
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Meta title</label>
              <input value={seoTitle} onChange={e => setSeoTitle(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <CardRow label="Auto-generate sitemap">
              <Toggle checked={true} onChange={() => {}} />
            </CardRow>
            <CardRow label="JobPosting schema markup" description="Improves Google for Jobs indexing">
              <Toggle checked={true} onChange={() => {}} />
            </CardRow>
            <CardRow label="Canonical URL enforcement">
              <Toggle checked={true} onChange={() => {}} />
            </CardRow>
          </div>
        </SettingCard>
      </div>
    </div>
  )
}
