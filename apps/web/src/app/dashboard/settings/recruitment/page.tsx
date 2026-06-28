'use client'

import { useState } from 'react'
import { Plus, GripVertical, Trash2 } from 'lucide-react'
import { Breadcrumb, PageHeader, SettingCard, SummaryGrid, CardRow, Toggle } from '../_components'

type Stage = { id: string; name: string }
type Tag   = { id: string; label: string }

function StageList({ stages, setStages }: { stages: Stage[]; setStages: (s: Stage[]) => void }) {
  const [adding, setAdding] = useState(false)
  const [val, setVal]       = useState('')
  return (
    <div>
      <div className="space-y-1 mb-2">
        {stages.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 py-1.5 group">
            <GripVertical className="size-3.5 text-muted-foreground/40 shrink-0 cursor-grab" />
            <span className="flex-1 text-sm">{s.name}</span>
            <button onClick={() => setStages(stages.filter((_, j) => j !== i))}
              className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-600 transition-all">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
      {adding ? (
        <div className="flex gap-2">
          <input autoFocus value={val} onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && val.trim()) { setStages([...stages, { id: Date.now().toString(), name: val.trim() }]); setVal(''); setAdding(false) } if (e.key === 'Escape') setAdding(false) }}
            className="flex-1 h-8 px-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Stage name…" />
          <button onClick={() => { if (val.trim()) { setStages([...stages, { id: Date.now().toString(), name: val.trim() }]); setVal('') } setAdding(false) }}
            className="h-8 px-3 text-xs rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors">Add</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
          <Plus className="size-3.5" />Add stage
        </button>
      )}
    </div>
  )
}

function TagEditor({ tags, setTags }: { tags: Tag[]; setTags: (t: Tag[]) => void }) {
  const [val, setVal] = useState('')
  return (
    <div className="flex items-center flex-wrap gap-1.5">
      {tags.map(t => (
        <span key={t.id} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-muted border border-border">
          {t.label}
          <button onClick={() => setTags(tags.filter(x => x.id !== t.id))}
            className="text-muted-foreground hover:text-red-600 transition-colors ml-0.5">×</button>
        </span>
      ))}
      <input value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if ((e.key === 'Enter' || e.key === ',') && val.trim()) { e.preventDefault(); setTags([...tags, { id: Date.now().toString(), label: val.trim() }]); setVal('') } }}
        placeholder="Add tag…"
        className="h-7 w-28 px-2 text-xs rounded-full border border-dashed border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
    </div>
  )
}

export default function RecruitmentPage() {
  const [candidateStages, setCandidateStages] = useState<Stage[]>([
    { id: '1', name: 'New' }, { id: '2', name: 'Screening' }, { id: '3', name: 'Shortlisted' },
    { id: '4', name: 'Submitted to Client' }, { id: '5', name: 'Interview Scheduled' },
    { id: '6', name: 'Interviewed' }, { id: '7', name: 'Offered' }, { id: '8', name: 'Placed' },
    { id: '9', name: 'Rejected' }, { id: '10', name: 'Withdrawn' },
  ])

  const [jobStatuses, setJobStatuses] = useState<Stage[]>([
    { id: '1', name: 'Draft' }, { id: '2', name: 'Active' }, { id: '3', name: 'On Hold' },
    { id: '4', name: 'Filled' }, { id: '5', name: 'Cancelled' },
  ])

  const [skills, setSkills] = useState<Tag[]>([
    { id: '1', label: 'RN' }, { id: '2', label: 'CNA' }, { id: '3', label: 'ICU' },
    { id: '4', label: 'Python' }, { id: '5', label: 'Java' }, { id: '6', label: 'React' },
    { id: '7', label: 'CPA' }, { id: '8', label: 'ACLS' }, { id: '9', label: 'BLS' },
  ])

  const [sources, setSources] = useState<Tag[]>([
    { id: '1', label: 'Beeline' }, { id: '2', label: 'Fieldglass' }, { id: '3', label: 'IQNavigator' },
    { id: '4', label: 'LinkedIn' }, { id: '5', label: 'Indeed' }, { id: '6', label: 'Referral' },
  ])

  const [hotThreshold, setHotThreshold] = useState(7)
  const [autoHot, setAutoHot]           = useState(true)

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <Breadcrumb />
      <PageHeader title="Recruitment" description="Configure pipeline stages, job statuses, skills, and sourcing preferences." />

      <div className="space-y-4">
        {/* Candidate Pipeline Stages */}
        <SettingCard
          title="Candidate Pipeline Stages"
          description={`${candidateStages.length} stages · drag to reorder`}
          summary={
            <div className="flex flex-wrap gap-1.5">
              {candidateStages.map((s, i) => (
                <div key={s.id} className="flex items-center gap-1.5 text-xs">
                  <span className="size-1.5 rounded-full bg-muted-foreground/30" />
                  <span>{s.name}</span>
                  {i < candidateStages.length - 1 && <span className="text-muted-foreground/30">›</span>}
                </div>
              ))}
            </div>
          }
        >
          <StageList stages={candidateStages} setStages={setCandidateStages} />
        </SettingCard>

        {/* Job Statuses */}
        <SettingCard
          title="Job Statuses"
          description={`${jobStatuses.length} statuses`}
          summary={
            <div className="flex flex-wrap gap-2">
              {jobStatuses.map(s => (
                <span key={s.id} className="text-xs bg-muted px-2.5 py-1 rounded-full">{s.name}</span>
              ))}
            </div>
          }
        >
          <StageList stages={jobStatuses} setStages={setJobStatuses} />
        </SettingCard>

        {/* Skills Library */}
        <SettingCard
          title="Skills Library"
          description={`${skills.length} skills available for candidate and job matching`}
          summary={
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 8).map(s => (
                <span key={s.id} className="text-xs bg-muted px-2 py-0.5 rounded-full">{s.label}</span>
              ))}
              {skills.length > 8 && <span className="text-xs text-muted-foreground">+{skills.length - 8} more</span>}
            </div>
          }
        >
          <TagEditor tags={skills} setTags={setSkills} />
        </SettingCard>

        {/* Candidate Sources */}
        <SettingCard
          title="Candidate Sources"
          description="Track where candidates originate"
          summary={
            <div className="flex flex-wrap gap-1.5">
              {sources.map(s => (
                <span key={s.id} className="text-xs bg-muted px-2 py-0.5 rounded-full">{s.label}</span>
              ))}
            </div>
          }
        >
          <TagEditor tags={sources} setTags={setSources} />
        </SettingCard>

        {/* Hot Job Rules */}
        <SettingCard
          title="Hot Job Rules"
          description="Criteria for automatically flagging a job as high priority"
          summary={
            <SummaryGrid items={[
              { label: 'SLA threshold',    value: `${hotThreshold} hours remaining` },
              { label: 'Auto-flag',        value: autoHot ? 'Enabled' : 'Disabled' },
              { label: 'Notify manager',   value: 'On flag' },
            ]} />
          }
        >
          <div className="space-y-3">
            <CardRow label="Auto-flag as Hot when SLA ≤" description="Jobs near their SLA deadline are automatically marked urgent">
              <div className="flex items-center gap-2">
                <input type="number" value={hotThreshold} min={1} max={48} onChange={e => setHotThreshold(+e.target.value)}
                  className="w-16 h-8 text-center text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                <span className="text-xs text-muted-foreground">hours</span>
              </div>
            </CardRow>
            <CardRow label="Auto-flag enabled">
              <Toggle checked={autoHot} onChange={setAutoHot} />
            </CardRow>
            <CardRow label="Notify manager on flag">
              <Toggle checked={true} onChange={() => {}} />
            </CardRow>
            <CardRow label="Notify recruiter on flag">
              <Toggle checked={true} onChange={() => {}} />
            </CardRow>
          </div>
        </SettingCard>
      </div>
    </div>
  )
}
