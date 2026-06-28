'use client'

import { FolderKanban, ArchiveRestore } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ARCHIVED = [
  { id: 'a1', name: 'Q1 Healthcare Pipeline',  type: 'Talent Pool',     candidates: 156, archivedOn: 'Mar 31, 2026' },
  { id: 'a2', name: 'Winter Nurse Campaign',   type: 'Hiring Campaign', candidates: 78,  archivedOn: 'Jan 15, 2026' },
  { id: 'a3', name: 'Legacy Java Projects',    type: 'Pipeline',        candidates: 44,  archivedOn: 'Feb 28, 2026' },
]

export default function ArchivedProjectsPage() {
  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto">
      <div className="mb-4">
        <h1 className="text-base font-semibold">Archived Projects</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Archived projects are read-only. Restore to make them active again.</p>
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
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 shrink-0">
                <ArchiveRestore className="size-3.5" />Restore
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
