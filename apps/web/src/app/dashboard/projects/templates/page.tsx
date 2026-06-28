'use client'

import { Button } from '@/components/ui/button'
import { FolderKanban } from 'lucide-react'
import { useRouter } from 'next/navigation'

const TEMPLATES = [
  { id: 't1', name: 'Healthcare Hiring',      type: 'Hiring Campaign', desc: 'Pre-configured for ICU, ER, and OR nurse pipelines. Includes compliance stages and credential tracking.' },
  { id: 't2', name: 'Travel Nurses',           type: 'Hiring Campaign', desc: 'Optimized for travel nurse recruitment with availability, location, and pay rate tracking built in.' },
  { id: 't3', name: 'Java Developers',         type: 'Pipeline',        desc: 'Tech hiring pipeline with skill-based stages, code assessment tracking, and client submission flow.' },
  { id: 't4', name: 'Data Engineers',          type: 'Pipeline',        desc: 'Data engineering pipeline with skills matrix for Python, Spark, Kafka, and cloud platforms.' },
  { id: 't5', name: 'Bench Redeployment',      type: 'Redeployment',    desc: 'Track consultants nearing end of placement and match them proactively to new opportunities.' },
  { id: 't6', name: 'Executive Search',        type: 'Client Specific', desc: 'High-touch executive hiring with stakeholder alignment, assessment tracking, and board approval stages.' },
  { id: 't7', name: 'Campus Hiring',           type: 'Hiring Campaign', desc: 'University recruiting pipeline with event tracking, internship conversions, and offer management.' },
  { id: 't8', name: 'Urgent Hiring',           type: 'Hiring Campaign', desc: 'Fast-track pipeline for critical roles with accelerated stages and daily activity tracking.' },
  { id: 't9', name: 'Seasonal Hiring',         type: 'Talent Pool',     desc: 'Recurrent seasonal pipeline for hospitality, retail, or healthcare surge staffing.' },
]

export default function ProjectTemplatesPage() {
  const router = useRouter()
  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto">
      <div className="mb-4">
        <h1 className="text-base font-semibold">Project Templates</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Start a new project from a pre-built template and be up and running in seconds.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {TEMPLATES.map(t => (
          <div key={t.id} className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-background hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <FolderKanban className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{t.name}</p>
                <span className="text-[10px] text-muted-foreground">{t.type}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed flex-1">{t.desc}</p>
            <Button size="sm" variant="outline" className="h-7 text-xs w-full"
              onClick={() => router.push('/dashboard/projects/new')}>
              Use Template
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
