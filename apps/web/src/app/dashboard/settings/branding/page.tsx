'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Breadcrumb, PageHeader, SettingCard, SummaryGrid, CardRow, Toggle } from '../_components'

export default function BrandingPage() {
  const [primaryColor, setPrimaryColor]   = useState('#0f172a')
  const [accentColor, setAccentColor]     = useState('#6366f1')
  const [logoUrl, setLogoUrl]             = useState('/logo-placeholder.png')
  const [companyName, setCompanyName]     = useState('God Recruiter')
  const [tagline, setTagline]             = useState('The smartest way to staff.')
  const [whiteLabel, setWhiteLabel]       = useState(false)
  const [hideAttribution, setHideAttrib]  = useState(false)
  const [customDomain, setCustomDomain]   = useState('')

  return (
    <div className="px-8 py-10">
      <Breadcrumb />
      <PageHeader title="Branding" description="Logo, colors, white-label settings, and custom domain." />

      <div className="space-y-4">
        {/* Logo & Identity */}
        <SettingCard
          title="Logo & Identity"
          description="Your brand mark shown across the product and career portal"
          summary={
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-muted flex items-center justify-center text-lg font-bold">
                GR
              </div>
              <div>
                <p className="text-sm font-medium">{companyName}</p>
                <p className="text-xs text-muted-foreground">{tagline}</p>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Logo</p>
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-xl bg-muted border border-border flex items-center justify-center text-xl font-bold">
                  GR
                </div>
                <button className="h-9 px-4 text-xs rounded-lg border border-border hover:bg-muted/60 transition-colors flex items-center gap-2">
                  <Upload className="size-3.5" />Upload logo
                </button>
                <p className="text-xs text-muted-foreground">PNG, SVG. Max 2 MB.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Display name</label>
                <input value={companyName} onChange={e => setCompanyName(e.target.value)}
                  className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Tagline</label>
                <input value={tagline} onChange={e => setTagline(e.target.value)}
                  className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
          </div>
        </SettingCard>

        {/* Colors */}
        <SettingCard
          title="Brand Colors"
          description="Primary and accent colors used in the UI and emails"
          summary={
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="size-5 rounded-md border border-border" style={{ background: primaryColor }} />
                <span className="text-xs text-muted-foreground">Primary</span>
                <span className="text-xs font-mono font-medium">{primaryColor}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-5 rounded-md border border-border" style={{ background: accentColor }} />
                <span className="text-xs text-muted-foreground">Accent</span>
                <span className="text-xs font-mono font-medium">{accentColor}</span>
              </div>
            </div>
          }
        >
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Primary color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                  className="size-10 rounded-lg border border-input cursor-pointer p-0.5 bg-background" />
                <input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                  className="flex-1 h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Accent color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)}
                  className="size-10 rounded-lg border border-input cursor-pointer p-0.5 bg-background" />
                <input value={accentColor} onChange={e => setAccentColor(e.target.value)}
                  className="flex-1 h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono" />
              </div>
            </div>
          </div>
        </SettingCard>

        {/* White-Label */}
        <SettingCard
          title="White-Label"
          description="Remove God Recruiter branding for client-facing portals"
          summary={
            <SummaryGrid items={[
              { label: 'White-label mode',    value: whiteLabel ? 'Enabled' : 'Disabled' },
              { label: 'Hide attribution',     value: hideAttribution ? 'Yes' : 'No' },
              { label: 'Custom domain',        value: customDomain || 'Not configured' },
            ]} />
          }
        >
          <div className="space-y-3">
            <CardRow label="Enable white-label mode" description="Replace God Recruiter branding with your own">
              <Toggle checked={whiteLabel} onChange={setWhiteLabel} />
            </CardRow>
            <CardRow label="Hide 'Powered by' attribution" description="Remove the footer attribution link">
              <Toggle checked={hideAttribution} onChange={setHideAttrib} />
            </CardRow>
            <div className="border-t border-border/40 pt-3 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Custom domain</label>
              <input value={customDomain} onChange={e => setCustomDomain(e.target.value)}
                placeholder="careers.yourcompany.com"
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              <p className="text-xs text-muted-foreground">Point a CNAME record to portal.godrecruiter.com</p>
            </div>
          </div>
        </SettingCard>

        {/* Email Templates */}
        <SettingCard
          title="Email Branding"
          description="How outbound emails appear to candidates and clients"
          summary={
            <SummaryGrid items={[
              { label: 'From name',    value: companyName },
              { label: 'Email footer', value: 'Logo + tagline' },
              { label: 'Social links', value: 'LinkedIn, Twitter' },
            ]} />
          }
        >
          <div className="space-y-3">
            <CardRow label="Show logo in emails"><Toggle checked={true} onChange={() => {}} /></CardRow>
            <CardRow label="Show tagline in footer"><Toggle checked={true} onChange={() => {}} /></CardRow>
            <CardRow label="Include social links"><Toggle checked={false} onChange={() => {}} /></CardRow>
            <CardRow label="HTML emails" description="Rich HTML vs plain text">
              <Toggle checked={true} onChange={() => {}} />
            </CardRow>
          </div>
        </SettingCard>
      </div>
    </div>
  )
}
