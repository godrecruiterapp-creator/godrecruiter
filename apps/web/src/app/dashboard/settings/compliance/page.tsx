'use client'

import { useState } from 'react'
import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import { SettingsHeader, SettingsSection, SettingRow, TabNav, SaveBar, Toggle, Badge } from '../_components'

const TABS = ['EEO & OFCCP', 'Document Tracking', 'Background Checks', 'Data & Privacy']

export default function CompliancePage() {
  const [tab, setTab] = useState('EEO & OFCCP')
  const [dirty, setDirty] = useState(false)
  const mark = () => setDirty(true)

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 max-w-3xl">
        <SettingsHeader title="Compliance" description="Configure EEO, OFCCP, document tracking, background checks, and data privacy settings." />
        <TabNav tabs={TABS} active={tab} onChange={setTab} />

        {tab === 'EEO & OFCCP' && (
          <div className="space-y-4">
            <SettingsSection title="EEO Collection">
              <SettingRow label="Collect EEO data" description="Ask candidates voluntary EEO questions (race, gender, disability, veteran status) on application.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="EEO statement on application" description="Show standard EEO employer statement.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="EEO reporting" description="Generate periodic EEO-1 compatible reports.">
                <Toggle checked={false} onChange={mark} />
              </SettingRow>
            </SettingsSection>
            <SettingsSection title="OFCCP">
              <SettingRow label="OFCCP compliance mode" description="Enable OFCCP-specific tracking for federal contractors.">
                <Toggle checked={false} onChange={mark} />
              </SettingRow>
              <SettingRow label="Internet Applicant definition" description="Apply the OFCCP internet applicant definition when filtering applications.">
                <Toggle checked={false} onChange={mark} />
              </SettingRow>
            </SettingsSection>
          </div>
        )}

        {tab === 'Document Tracking' && (
          <div className="space-y-4">
            <SettingsSection title="License & Certification Tracking">
              <SettingRow label="Track license expiry" description="Alert recruiters when candidate licenses are near expiry.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="Alert days before expiry" description="Send alert this many days before a license expires.">
                <div className="flex items-center gap-1.5">
                  <input type="number" defaultValue={30} min={7} onChange={mark}
                    className="w-20 h-8 text-center text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
                  <span className="text-xs text-muted-foreground">days</span>
                </div>
              </SettingRow>
            </SettingsSection>
            <SettingsSection title="Document Status Overview">
              {[
                { name: 'RN Licenses (TX)',    total: 34, expiring: 3, expired: 1 },
                { name: 'CPR Certifications',  total: 28, expiring: 5, expired: 0 },
                { name: 'Background Checks',   total: 41, expiring: 2, expired: 0 },
              ].map(d => (
                <div key={d.name} className="flex items-center justify-between px-5 py-3 border-b border-border/40 last:border-0">
                  <p className="text-sm font-medium">{d.name}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="size-3" />{d.total} valid</span>
                    {d.expiring > 0 && <span className="flex items-center gap-1 text-amber-600"><Clock className="size-3" />{d.expiring} expiring</span>}
                    {d.expired > 0 && <span className="flex items-center gap-1 text-red-600"><AlertTriangle className="size-3" />{d.expired} expired</span>}
                  </div>
                </div>
              ))}
            </SettingsSection>
          </div>
        )}

        {tab === 'Background Checks' && (
          <div className="space-y-4">
            <SettingsSection title="Background Check Providers">
              {[
                { name: 'Checkr',    connected: false, desc: 'API-integrated background screening' },
                { name: 'Sterling',  connected: false, desc: 'Enterprise background check services' },
                { name: 'HireRight', connected: false, desc: 'Employment and education verification' },
              ].map(p => (
                <div key={p.name} className="flex items-center justify-between px-5 py-3.5 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{p.connected ? 'Connected' : 'Not Connected'}</Badge>
                    <button className="h-7 px-2.5 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors">Connect</button>
                  </div>
                </div>
              ))}
            </SettingsSection>
            <SettingsSection title="I-9 & E-Verify">
              <SettingRow label="E-Verify integration" description="Connect to the E-Verify system for work authorization.">
                <Toggle checked={false} onChange={mark} />
              </SettingRow>
              <SettingRow label="I-9 tracking" description="Track I-9 completion status for placed candidates.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
            </SettingsSection>
          </div>
        )}

        {tab === 'Data & Privacy' && (
          <div className="space-y-4">
            <SettingsSection title="Data Retention">
              <SettingRow label="Candidate data retention" description="Auto-archive inactive candidate profiles after this period.">
                <select defaultValue="3years" onChange={mark} className="h-8 px-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="1year">1 year</option>
                  <option value="2years">2 years</option>
                  <option value="3years">3 years (recommended)</option>
                  <option value="5years">5 years</option>
                  <option value="forever">Keep forever</option>
                </select>
              </SettingRow>
              <SettingRow label="Audit log retention" description="How long to keep activity and audit logs.">
                <select defaultValue="2years" onChange={mark} className="h-8 px-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="1year">1 year</option>
                  <option value="2years">2 years</option>
                  <option value="5years">5 years</option>
                </select>
              </SettingRow>
            </SettingsSection>
            <SettingsSection title="GDPR & CCPA">
              <SettingRow label="Honor data deletion requests" description="Allow candidates to request all personal data be deleted.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="Data export on request" description="Allow candidates to download all their data.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="Cookie consent banner" description="Show consent banner to new visitors.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
            </SettingsSection>
          </div>
        )}
      </div>
      <SaveBar dirty={dirty} onSave={() => setDirty(false)} onDiscard={() => setDirty(false)} />
    </div>
  )
}
