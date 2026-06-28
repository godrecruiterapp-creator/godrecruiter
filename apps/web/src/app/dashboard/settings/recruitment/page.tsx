'use client'

import { useState } from 'react'
import { Plus, GripVertical, Trash2 } from 'lucide-react'
import { SettingsHeader, SettingsSection, SettingRow, TabNav, SaveBar, Toggle } from '../_components'

const TABS = ['Stages', 'Job Settings', 'Candidate Sources', 'Skills & Tags']

const DEFAULT_STAGES = {
  candidate: ['New','Reviewed','Contacted','Phone Screen','Submitted','Interview','Offer','Placed','Rejected','Future'],
  job:       ['Draft','Open','On Hold','Filled','Cancelled','Archived'],
  offer:     ['Pending','Verbal Accept','Written Offer','Accepted','Rejected','Rescinded'],
}

function StageList({ stages, onChange }: { stages: string[]; onChange: (s: string[]) => void }) {
  const [newVal, setNewVal] = useState('')
  return (
    <div className="divide-y divide-border/40">
      {stages.map((s, i) => (
        <div key={i} className="flex items-center gap-2 px-5 py-2.5 group">
          <GripVertical className="size-3.5 text-muted-foreground/40 cursor-grab" />
          <span className="flex-1 text-sm">{s}</span>
          <button onClick={() => onChange(stages.filter((_, j) => j !== i))}
            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1">
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ))}
      <div className="flex gap-2 px-5 py-3">
        <input value={newVal} onChange={e => setNewVal(e.target.value)} placeholder="New stage…"
          className="flex-1 h-7 px-2.5 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          onKeyDown={e => { if (e.key === 'Enter' && newVal.trim()) { onChange([...stages, newVal.trim()]); setNewVal('') } }} />
        <button onClick={() => { if (newVal.trim()) { onChange([...stages, newVal.trim()]); setNewVal('') } }}
          className="h-7 px-2.5 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors flex items-center gap-1">
          <Plus className="size-3.5" />Add
        </button>
      </div>
    </div>
  )
}

function TagEditor({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState('')
  return (
    <div className="px-5 py-4">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {tags.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
            {t}
            <button onClick={() => onChange(tags.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-foreground ml-0.5">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Add item…"
          className="flex-1 h-7 px-2.5 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          onKeyDown={e => { if (e.key === 'Enter' && input.trim()) { onChange([...tags, input.trim()]); setInput('') } }} />
        <button onClick={() => { if (input.trim()) { onChange([...tags, input.trim()]); setInput('') } }}
          className="h-7 px-2.5 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors flex items-center gap-1">
          <Plus className="size-3.5" />Add
        </button>
      </div>
    </div>
  )
}

export default function RecruitmentPage() {
  const [tab, setTab] = useState('Stages')
  const [dirty, setDirty] = useState(false)
  const [stages, setStages] = useState(DEFAULT_STAGES)
  const [sources, setSources] = useState(['LinkedIn','Indeed','Dice','Monster','Referral','Direct','Career Portal','Rehire','Email','Phone Call','ZipRecruiter','CareerBuilder'])
  const [skills, setSkills] = useState(['Java','Python','React','Node.js','AWS','ICU','ER','OR','NICU','CCRN','Travel Nurse','Healthcare','Kubernetes','DevOps'])
  const [tags, setTags] = useState(['Hot','Travel OK','Visa Risk','Priority','Hard to Fill','Rare Tech','Preferred Client'])
  const [rejectReasons, setRejectReasons] = useState(['Not interested','Found another job','Salary mismatch','Location issue','Visa restriction','No response','Skill mismatch','Client decline'])

  function markDirty() { setDirty(true) }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 max-w-3xl">
        <SettingsHeader title="Recruitment Settings" description="Configure candidate stages, job statuses, sources, skills, and classification tags." />
        <TabNav tabs={TABS} active={tab} onChange={setTab} />

        {tab === 'Stages' && (
          <div className="space-y-4">
            <SettingsSection title="Candidate Stages" description="The pipeline stages for tracking candidate progress.">
              <StageList stages={stages.candidate} onChange={s => { setStages(p => ({ ...p, candidate: s })); markDirty() }} />
            </SettingsSection>
            <SettingsSection title="Job Statuses" description="Status options for open jobs.">
              <StageList stages={stages.job} onChange={s => { setStages(p => ({ ...p, job: s })); markDirty() }} />
            </SettingsSection>
            <SettingsSection title="Offer Stages" description="Track the offer process from verbal to acceptance.">
              <StageList stages={stages.offer} onChange={s => { setStages(p => ({ ...p, offer: s })); markDirty() }} />
            </SettingsSection>
          </div>
        )}

        {tab === 'Job Settings' && (
          <div className="space-y-4">
            <SettingsSection title="Employment Types">
              <TagEditor tags={['Contract','Full Time','Part Time','Contract to Hire','Temp to Perm','Internship','Per Diem','Travel']} onChange={markDirty} />
            </SettingsSection>
            <SettingsSection title="Work Authorization Types">
              <TagEditor tags={['USC','GC','GC-EAD','H1B','H4-EAD','TN','OPT','CPT','L2-EAD','No Sponsorship']} onChange={markDirty} />
            </SettingsSection>
            <SettingsSection title="Job Categories">
              <TagEditor tags={['ICU Nursing','ER Nursing','Travel Nursing','Physician','Software Engineering','DevOps','Data Engineering','Finance','Healthcare Admin']} onChange={markDirty} />
            </SettingsSection>
            <SettingsSection title="Rejection Reasons">
              <TagEditor tags={rejectReasons} onChange={r => { setRejectReasons(r); markDirty() }} />
            </SettingsSection>
            <SettingsSection title="Hot Job Rules">
              <SettingRow label="Auto-flag Urgent" description="Automatically mark jobs as Urgent when SLA is within 4 hours.">
                <Toggle checked={true} onChange={markDirty} />
              </SettingRow>
              <SettingRow label="Hot Job Priority Threshold" description="AI score threshold for auto-flagging as Hot Job.">
                <input type="number" defaultValue={90} min={50} max={99}
                  onChange={markDirty}
                  className="w-20 h-8 px-3 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
              </SettingRow>
              <SettingRow label="Job Expiration" description="Auto-archive jobs after this many days with no activity.">
                <div className="flex items-center gap-1.5 text-xs">
                  <input type="number" defaultValue={30} min={7}
                    onChange={markDirty}
                    className="w-16 h-8 px-2 text-center rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
                  <span className="text-muted-foreground">days</span>
                </div>
              </SettingRow>
            </SettingsSection>
          </div>
        )}

        {tab === 'Candidate Sources' && (
          <SettingsSection title="Candidate Sources" description="Track where your candidates come from.">
            <TagEditor tags={sources} onChange={s => { setSources(s); markDirty() }} />
          </SettingsSection>
        )}

        {tab === 'Skills & Tags' && (
          <div className="space-y-4">
            <SettingsSection title="Skills Library" description="Global skills list used for matching and search.">
              <TagEditor tags={skills} onChange={s => { setSkills(s); markDirty() }} />
            </SettingsSection>
            <SettingsSection title="Recruitment Tags" description="Tags for classifying candidates and jobs.">
              <TagEditor tags={tags} onChange={t => { setTags(t); markDirty() }} />
            </SettingsSection>
          </div>
        )}
      </div>
      <SaveBar dirty={dirty} onSave={() => setDirty(false)} onDiscard={() => setDirty(false)} />
    </div>
  )
}
