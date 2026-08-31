'use client'

import { Button } from '@/components/ui/button'
import { Upload, FileText, Download, MoreHorizontal, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'

type Doc = { id: string; name: string; type: string; size: string; uploaded: string; by: string }
const DOCS: Doc[] = []

const TYPE_CFG: Record<string, string> = {
  PDF:  'bg-red-50 text-red-700',
  XLSX: 'bg-emerald-50 text-emerald-700',
  DOCX: 'bg-blue-50 text-blue-700',
}

export default function ProjectDocumentsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden p-5">
      <div className="flex items-center justify-between mb-4 shrink-0 gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input placeholder="Search documents…" className="h-8 w-52 pl-8 text-sm" />
        </div>
        <Button size="sm" className="h-8 text-sm gap-1.5 shrink-0"><Upload className="size-3.5" />Upload</Button>
      </div>
      {DOCS.length === 0 ? (
        <EmptyState icon={FileText} title="No documents yet"
          description="Upload requirement docs, rate cards, or templates to keep them with this project." />
      ) : (
      <div className="flex-1 overflow-auto border border-border rounded-lg">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
            <tr className="border-b border-border">
              {['Name', 'Type', 'Size', 'Uploaded', 'By', ''].map(h => (
                <th key={h} className="h-9 px-4 text-left align-middle">
                  <span className="table-header-cell whitespace-nowrap">{h}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DOCS.map(d => (
              <tr key={d.id} className="border-b border-border hover:bg-muted/30 transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-muted-foreground shrink-0" />
                    <span className="table-cell-primary">{d.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${TYPE_CFG[d.type] ?? ''}`}>{d.type}</span>
                </td>
                <td className="px-4 py-3"><span className="table-cell-secondary">{d.size}</span></td>
                <td className="px-4 py-3"><span className="table-cell-secondary">{d.uploaded}</span></td>
                <td className="px-4 py-3"><span className="table-cell-secondary">{d.by}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="size-7 flex items-center justify-center rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors">
                      <Download className="size-3.5" />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="size-7 flex items-center justify-center rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors">
                          <MoreHorizontal className="size-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem>Preview</DropdownMenuItem>
                        <DropdownMenuItem>Download</DropdownMenuItem>
                        <DropdownMenuItem>Version History</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  )
}
