'use client'

import { Button } from '@/components/ui/button'
import { FolderKanban, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { EmptyState } from '@/components/ui/empty-state'

type Template = { id: string; name: string; type: string; desc: string }
// TODO: load real saved templates once template creation is wired.
const TEMPLATES: Template[] = []

export default function ProjectTemplatesPage() {
  const router = useRouter()
  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto">
      <div className="mb-4">
        <h1 className="text-base font-semibold">Project Templates</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Start a new project from a pre-built template and be up and running in seconds.</p>
      </div>
      {TEMPLATES.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No templates yet"
          description="Save a project as a template to quickly spin up similar ones later."
          action={
            <Button size="sm" className="h-8 text-sm gap-1.5" onClick={() => router.push('/dashboard/projects/new')}>
              <Plus className="size-3.5" />New Project
            </Button>
          } />
      ) : (
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
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{t.desc}</p>
              <Button size="sm" variant="outline" className="h-7 text-sm w-full"
                onClick={() => router.push('/dashboard/projects/new')}>
                Use Template
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
