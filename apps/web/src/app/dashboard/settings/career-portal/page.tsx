'use client'

import { useState } from 'react'
import { Globe, ExternalLink } from 'lucide-react'
import { SettingsHeader, SettingsSection, SettingRow, TabNav, SaveBar, Toggle, FieldInput } from '../_components'

const TABS = ['Career Site', 'Application', 'Privacy & Legal', 'Candidate Login']

export default function CareerPortalPage() {
  const [tab, setTab] = useState('Career Site')
  const [dirty, setDirty] = useState(false)
  const mark = () => setDirty(true)

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 max-w-3xl">
        <SettingsHeader title="Career Portal" description="Configure your public job listing site, application form, and candidate experience." />
        <TabNav tabs={TABS} active={tab} onChange={setTab} />

        {tab === 'Career Site' && (
          <div className="space-y-4">
            <SettingsSection title="Career Site Settings">
              <SettingRow label="Career portal is live" description="Make your career site publicly accessible.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="Career site URL" description="Your current public job listing URL.">
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">careers.godrecruiter.com</code>
                  <button className="text-muted-foreground hover:text-foreground transition-colors"><ExternalLink className="size-3.5" /></button>
                </div>
              </SettingRow>
            </SettingsSection>
            <SettingsSection title="SEO & Sharing">
              <div className="px-5 py-4 space-y-4">
                <FieldInput label="Page Title" value="Careers at God Recruiter" onChange={mark} />
                <FieldInput label="Meta Description" value="Explore open opportunities at God Recruiter. Join our team of talented recruiters." onChange={mark} />
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Social Sharing Image</label>
                  <div className="h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-xs text-muted-foreground bg-muted/20">
                    Upload OG image (1200×630px)
                  </div>
                </div>
              </div>
            </SettingsSection>
            <SettingsSection title="Talent Community">
              <SettingRow label="Enable talent community" description="Allow candidates to join without applying to a specific job.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="Job alerts" description="Let candidates subscribe to alerts for new matching jobs.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
            </SettingsSection>
          </div>
        )}

        {tab === 'Application' && (
          <div className="space-y-4">
            <SettingsSection title="Application Form Fields">
              {[
                { field: 'Full Name',           required: true,  enabled: true  },
                { field: 'Email Address',        required: true,  enabled: true  },
                { field: 'Phone Number',         required: true,  enabled: true  },
                { field: 'Resume / CV',          required: true,  enabled: true  },
                { field: 'LinkedIn Profile URL', required: false, enabled: true  },
                { field: 'Location',             required: false, enabled: true  },
                { field: 'Work Authorization',   required: false, enabled: true  },
                { field: 'Desired Salary',       required: false, enabled: false },
                { field: 'Cover Letter',         required: false, enabled: false },
                { field: 'Portfolio / Website',  required: false, enabled: false },
              ].map(f => (
                <div key={f.field} className="flex items-center justify-between px-5 py-2.5 border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{f.field}</span>
                    {f.required && <span className="text-[9px] bg-red-100 text-red-700 px-1 py-0.5 rounded">Required</span>}
                  </div>
                  <Toggle checked={f.enabled} onChange={mark} />
                </div>
              ))}
            </SettingsSection>
            <SettingsSection title="Application Workflow">
              <SettingRow label="Auto-acknowledge applications" description="Send confirmation email when application is received.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="AI screening" description="Auto-score applications with AI before recruiter review.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="Duplicate check" description="Flag if the same candidate has applied before.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
            </SettingsSection>
          </div>
        )}

        {tab === 'Privacy & Legal' && (
          <div className="space-y-4">
            <SettingsSection title="Legal Pages">
              {[
                { name: 'Privacy Policy',    status: 'configured' },
                { name: 'Terms of Service',  status: 'configured' },
                { name: 'Cookie Policy',     status: 'missing'    },
              ].map(p => (
                <div key={p.name} className="flex items-center justify-between px-5 py-3 border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-2">
                    <Globe className="size-3.5 text-muted-foreground" />
                    <span className="text-sm">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${p.status === 'configured' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {p.status}
                    </span>
                    <button className="h-6 px-2 text-[10px] rounded-md border border-border hover:bg-muted/60 transition-colors">Edit</button>
                  </div>
                </div>
              ))}
            </SettingsSection>
            <SettingsSection title="Compliance">
              <SettingRow label="Show cookie consent banner" description="Display GDPR/CCPA cookie consent on first visit.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
              <SettingRow label="GDPR data deletion" description="Allow candidates to request data deletion from the portal.">
                <Toggle checked={true} onChange={mark} />
              </SettingRow>
            </SettingsSection>
          </div>
        )}

        {tab === 'Candidate Login' && (
          <SettingsSection title="Candidate Portal Access">
            <SettingRow label="Candidate registration" description="Allow candidates to create accounts and track applications.">
              <Toggle checked={true} onChange={mark} />
            </SettingRow>
            <SettingRow label="Social login (Google)" description="Candidates can sign up / sign in with Google.">
              <Toggle checked={true} onChange={mark} />
            </SettingRow>
            <SettingRow label="Social login (LinkedIn)" description="Candidates can sign up / sign in with LinkedIn.">
              <Toggle checked={false} onChange={mark} />
            </SettingRow>
            <SettingRow label="Application status visibility" description="Candidates can see their application stage.">
              <Toggle checked={true} onChange={mark} />
            </SettingRow>
          </SettingsSection>
        )}
      </div>
      <SaveBar dirty={dirty} onSave={() => setDirty(false)} onDiscard={() => setDirty(false)} />
    </div>
  )
}
