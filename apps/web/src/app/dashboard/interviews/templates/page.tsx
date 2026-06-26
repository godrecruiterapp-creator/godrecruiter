'use client'

import { Button } from '@/components/ui/button'
import { FileText, ClipboardList, Plus } from 'lucide-react'

const TEMPLATES = [
  { icon: FileText,      name: 'Phone Screen Template',    duration: '30 min', questions: 5,  target: 'All roles',    category: 'standard' },
  { icon: ClipboardList, name: 'Technical Interview',      duration: '60 min', questions: 8,  target: 'Engineering',  category: 'technical' },
  { icon: FileText,      name: 'Healthcare Clinical',      duration: '45 min', questions: 7,  target: 'Healthcare',   category: 'clinical' },
  { icon: ClipboardList, name: 'Leadership Assessment',    duration: '60 min', questions: 6,  target: 'Management',   category: 'leadership' },
  { icon: FileText,      name: 'Culture Fit Interview',    duration: '30 min', questions: 5,  target: 'All roles',    category: 'culture' },
  { icon: ClipboardList, name: 'Final Round Template',     duration: '90 min', questions: 10, target: 'Senior roles', category: 'final' },
  { icon: FileText,      name: 'HR Onboarding Screen',     duration: '20 min', questions: 4,  target: 'All roles',    category: 'hr' },
  { icon: ClipboardList, name: 'Panel Interview Guide',    duration: '60 min', questions: 12, target: 'Senior roles', category: 'panel' },
]

const CATEGORY_COLORS: Record<string, string> = {
  standard:  'bg-slate-100 text-slate-600',
  technical: 'bg-blue-50 text-blue-700',
  clinical:  'bg-emerald-50 text-emerald-700',
  leadership:'bg-violet-50 text-violet-700',
  culture:   'bg-amber-50 text-amber-700',
  final:     'bg-brand-muted text-brand',
  hr:        'bg-slate-100 text-slate-600',
  panel:     'bg-blue-50 text-blue-700',
}

export default function TemplatesPage() {
  return (
    <div className="flex flex-col h-full p-6 gap-5 overflow-y-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Interview Templates</h1>
          <p className="text-sm text-muted-foreground">Reusable interview guides and question sets</p>
        </div>
        <Button size="sm">
          <Plus className="size-3.5 mr-1.5" />Create Template
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {TEMPLATES.map(t => {
          const Icon = t.icon
          return (
            <div key={t.name} className="rounded-lg border bg-card p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                  <Icon className="size-5 text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.target}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t.duration}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[t.category] ?? ''}`}>
                  {t.questions} questions
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t">
                <Button size="sm" className="h-7 text-xs flex-1">Use Template</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs flex-1">Preview</Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
