'use client'

import { FolderKanban, ArchiveRestore } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ArchivedProject = { id: string; name: string; type: string; candidates: number; archivedOn: string }
// TODO: load archived projects from the DB (status = 'archived').
const ARCHIVED: ArchivedProject[] = []

export default function ArchivedProjectsPage() {
  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto">
      <div className="mb-4">
        <h1 className="text-base font-semibold">Archived Projects</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Archived projects are read-only. Restore to make them active again.</p>
      </div>
      {ARCHIVED.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <FolderKanban className="size-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No archived projects.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {ARCHIVED.map(p => (
            <div key={p.id} className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border bg-background hover:bg-muted/30 transition-colors">
              <FolderKanban className="size-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-[10px] text-muted-foreground">{p.type} · {p.candidates} candidates · Archived {p.archivedOn}</p>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-sm gap-1.5 shrink-0">
                <ArchiveRestore className="size-3.5" />Restore
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
