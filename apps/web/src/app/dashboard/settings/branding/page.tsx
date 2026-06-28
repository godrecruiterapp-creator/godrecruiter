'use client'

import { useState } from 'react'
import { Upload, Globe } from 'lucide-react'
import { SettingsHeader, SettingsSection, SettingRow, TabNav, SaveBar, Toggle, FieldInput } from '../_components'

const TABS = ['Logo & Colors', 'Typography', 'Portals', 'Custom Domain']

const FONT_OPTIONS = [
  { value: 'inter',   label: 'Inter (Default)' },
  { value: 'geist',  label: 'Geist' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'poppins',label: 'Poppins' },
  { value: 'outfit', label: 'Outfit' },
]

export default function BrandingPage() {
  const [tab, setTab] = useState('Logo & Colors')
  const [dirty, setDirty] = useState(false)
  const mark = () => setDirty(true)
  const [primary, setPrimary] = useState('#000000')
  const [accent, setAccent] = useState('#6366f1')
  const [whiteLabel, setWhiteLabel] = useState(false)

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 max-w-3xl">
        <SettingsHeader title="Branding" description="Customize your company logo, colors, typography, and portal appearance." />
        <TabNav tabs={TABS} active={tab} onChange={setTab} />

        {tab === 'Logo & Colors' && (
          <div className="space-y-4">
            <SettingsSection title="Company Logo">
              <div className="px-5 py-5 flex flex-col sm:flex-row items-start gap-5">
                <div className="size-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30 shrink-0">
                  <div className="size-12 rounded-lg bg-foreground flex items-center justify-center text-background font-bold text-xl">G</div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Company Logo</p>
                  <p className="text-xs text-muted-foreground mb-3">Recommended: 200×60px, PNG or SVG with transparent background. Max 2MB.</p>
                  <button onClick={mark} className="h-8 px-3 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors flex items-center gap-1.5">
                    <Upload className="size-3.5" />Upload Logo
                  </button>
                </div>
              </div>
            </SettingsSection>

            <SettingsSection title="Favicon">
              <div className="px-5 py-4 flex items-center gap-4">
                <div className="size-10 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
                  <span className="text-lg">G</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">32×32px ICO or PNG.</p>
                  <button onClick={mark} className="h-7 px-2.5 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors flex items-center gap-1.5">
                    <Upload className="size-3" />Upload Favicon
                  </button>
                </div>
              </div>
            </SettingsSection>

            <SettingsSection title="Brand Colors">
              <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={primary} onChange={e => { setPrimary(e.target.value); mark() }}
                      className="size-10 rounded-lg border border-border cursor-pointer bg-transparent p-0.5" />
                    <input value={primary} onChange={e => { setPrimary(e.target.value); mark() }}
                      className="flex-1 h-9 px-3 text-sm font-mono rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring uppercase" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Used for buttons, active states, and navigation highlights.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={accent} onChange={e => { setAccent(e.target.value); mark() }}
                      className="size-10 rounded-lg border border-border cursor-pointer bg-transparent p-0.5" />
                    <input value={accent} onChange={e => { setAccent(e.target.value); mark() }}
                      className="flex-1 h-9 px-3 text-sm font-mono rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring uppercase" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Used for highlights, badges, and secondary actions.</p>
                </div>
              </div>
            </SettingsSection>

            <SettingsSection title="Login Screen">
              <SettingRow label="Show company logo on login" description="Display your logo on the login and sign-up screens.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="Custom login background" description="Upload a background image for the login page.">
                <button onClick={mark} className="h-7 px-2.5 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors flex items-center gap-1.5">
                  <Upload className="size-3" />Upload
                </button>
              </SettingRow>
            </SettingsSection>
          </div>
        )}

        {tab === 'Typography' && (
          <SettingsSection title="Typography Settings">
            <div className="px-5 py-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Primary Font</label>
                <select defaultValue="inter" onChange={mark}
                  className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                  {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Base Font Size</label>
                <select defaultValue="14" onChange={mark}
                  className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="13">13px (Compact)</option>
                  <option value="14">14px (Default)</option>
                  <option value="15">15px (Comfortable)</option>
                  <option value="16">16px (Large)</option>
                </select>
              </div>
            </div>
            <SettingRow label="Table density" description="Adjust row height in tables and lists.">
              <select defaultValue="default" onChange={mark} className="h-8 px-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="compact">Compact</option>
                <option value="default">Default</option>
                <option value="comfortable">Comfortable</option>
              </select>
            </SettingRow>
          </SettingsSection>
        )}

        {tab === 'Portals' && (
          <div className="space-y-4">
            {[
              { name: 'Email Branding',     desc: 'Header and footer applied to all outbound emails.' },
              { name: 'Offer Letter',       desc: 'Logo and footer on offer letters.' },
              { name: 'Career Portal',      desc: 'Branding shown on your public job listing site.' },
              { name: 'Candidate Portal',   desc: 'Branding shown to candidates logging into their portal.' },
            ].map(p => (
              <SettingsSection key={p.name} title={p.name} description={p.desc}>
                <div className="px-5 py-4 flex items-center gap-3">
                  <div className="flex-1 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/20 text-xs text-muted-foreground">
                    Preview not available in settings
                  </div>
                  <button onClick={mark} className="h-8 px-3 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors flex items-center gap-1.5 shrink-0">
                    <Upload className="size-3.5" />Customize
                  </button>
                </div>
              </SettingsSection>
            ))}
          </div>
        )}

        {tab === 'Custom Domain' && (
          <div className="space-y-4">
            <SettingsSection title="Custom Domain" description="Use your own domain for the career portal and candidate-facing links.">
              <div className="px-5 py-4 space-y-4">
                <FieldInput label="Career Portal Domain" value="careers.godrecruiter.com" onChange={mark} placeholder="careers.yourcompany.com" />
                <div className="rounded-lg bg-muted/30 border border-border p-3 text-xs text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">DNS Configuration Required</p>
                  <p>Add a CNAME record pointing your domain to <code className="font-mono bg-muted px-1 rounded">portal.godrecruiter.com</code></p>
                </div>
                <button onClick={mark} className="h-8 px-3 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors flex items-center gap-1.5">
                  <Globe className="size-3.5" />Verify Domain
                </button>
              </div>
            </SettingsSection>
            <SettingsSection title="White Label">
              <SettingRow label="Enable White Label" description="Remove 'Powered by God Recruiter' from all candidate-facing pages.">
                <Toggle checked={whiteLabel} onChange={v => { setWhiteLabel(v); mark() }} />
              </SettingRow>
            </SettingsSection>
          </div>
        )}
      </div>
      <SaveBar dirty={dirty} onSave={() => setDirty(false)} onDiscard={() => setDirty(false)} />
    </div>
  )
}
