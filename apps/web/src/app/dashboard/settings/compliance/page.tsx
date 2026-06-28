'use client'

import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import { Breadcrumb, PageHeader, SettingCard, SummaryGrid, CardRow, Toggle, Badge } from '../_components'

export default function CompliancePage() {
  const DOCS = [
    { name: 'RN Licenses (TX)',   total: 34, expiring: 3, expired: 1 },
    { name: 'CPR Certifications', total: 28, expiring: 5, expired: 0 },
    { name: 'Background Checks',  total: 41, expiring: 2, expired: 0 },
  ]

  const BG_PROVIDERS = [
    { name: 'Checkr',    desc: 'API-integrated background screening',    connected: false },
    { name: 'Sterling',  desc: 'Enterprise background check services',   connected: false },
    { name: 'HireRight', desc: 'Employment and education verification',  connected: false },
  ]

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <Breadcrumb />
      <PageHeader title="Compliance" description="EEO, OFCCP, document tracking, background checks, and data privacy." />

      <div className="space-y-4">
        {/* EEO */}
        <SettingCard
          title="EEO & OFCCP"
          description="Equal employment opportunity and federal contractor compliance"
          summary={
            <SummaryGrid items={[
              { label: 'EEO collection', value: 'Enabled' },
              { label: 'EEO statement',  value: 'Shown on application' },
              { label: 'OFCCP mode',     value: 'Disabled' },
            ]} />
          }
        >
          <div className="space-y-3">
            <CardRow label="Collect EEO data" description="Ask voluntary EEO questions on candidate applications">
              <Toggle checked={true} onChange={() => {}} />
            </CardRow>
            <CardRow label="Show EEO employer statement">
              <Toggle checked={true} onChange={() => {}} />
            </CardRow>
            <CardRow label="EEO-1 compatible reporting">
              <Toggle checked={false} onChange={() => {}} />
            </CardRow>
            <CardRow label="OFCCP compliance mode" description="Federal contractor tracking requirements">
              <Toggle checked={false} onChange={() => {}} />
            </CardRow>
          </div>
        </SettingCard>

        {/* Document Tracking */}
        <SettingCard
          title="License & Document Tracking"
          description="Monitor expiry for candidate credentials"
          summary={
            <div className="space-y-2">
              {DOCS.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <span className="font-medium">{d.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="size-3" />{d.total}</span>
                    {d.expiring > 0 && <span className="flex items-center gap-1 text-amber-600"><Clock className="size-3" />{d.expiring}</span>}
                    {d.expired > 0 && <span className="flex items-center gap-1 text-red-600"><AlertTriangle className="size-3" />{d.expired}</span>}
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <div className="space-y-3">
            <CardRow label="Track license expiry" description="Alert recruiters when documents near expiry">
              <Toggle checked={true} onChange={() => {}} />
            </CardRow>
            <CardRow label="Alert days before expiry">
              <div className="flex items-center gap-2">
                <input type="number" defaultValue={30} min={7}
                  className="w-16 h-8 text-center text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                <span className="text-xs text-muted-foreground">days</span>
              </div>
            </CardRow>
          </div>
        </SettingCard>

        {/* Background Checks */}
        <SettingCard
          title="Background Checks"
          description="Connect a provider for integrated screening"
          summary={
            <p className="text-xs text-muted-foreground">No background check provider connected.</p>
          }
        >
          <div className="space-y-3 mb-4">
            {BG_PROVIDERS.map(p => (
              <div key={p.name} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{p.connected ? 'Connected' : 'Not connected'}</Badge>
                  <button className="h-7 px-2.5 text-xs rounded-lg border border-border hover:bg-muted/60 transition-colors">Connect</button>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border/40 pt-3 space-y-3">
            <CardRow label="I-9 tracking" description="Track I-9 completion for placed candidates">
              <Toggle checked={true} onChange={() => {}} />
            </CardRow>
            <CardRow label="E-Verify integration">
              <Toggle checked={false} onChange={() => {}} />
            </CardRow>
          </div>
        </SettingCard>

        {/* Data & Privacy */}
        <SettingCard
          title="Data Retention & Privacy"
          description="GDPR, CCPA, and data lifecycle settings"
          summary={
            <SummaryGrid items={[
              { label: 'Candidate retention', value: '3 years' },
              { label: 'Audit log retention',  value: '2 years' },
              { label: 'GDPR deletion',        value: 'Enabled' },
              { label: 'Cookie consent',       value: 'Banner shown' },
            ]} />
          }
        >
          <div className="space-y-3">
            <CardRow label="Candidate data retention">
              <select defaultValue="3years" className="h-8 px-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="1year">1 year</option>
                <option value="2years">2 years</option>
                <option value="3years">3 years (recommended)</option>
                <option value="5years">5 years</option>
              </select>
            </CardRow>
            <CardRow label="Audit log retention">
              <select defaultValue="2years" className="h-8 px-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="1year">1 year</option>
                <option value="2years">2 years</option>
                <option value="5years">5 years</option>
              </select>
            </CardRow>
            <CardRow label="Honor data deletion requests" description="Allow candidates to request all data be deleted">
              <Toggle checked={true} onChange={() => {}} />
            </CardRow>
            <CardRow label="Data export on request">
              <Toggle checked={true} onChange={() => {}} />
            </CardRow>
            <CardRow label="Cookie consent banner">
              <Toggle checked={true} onChange={() => {}} />
            </CardRow>
          </div>
        </SettingCard>
      </div>
    </div>
  )
}
