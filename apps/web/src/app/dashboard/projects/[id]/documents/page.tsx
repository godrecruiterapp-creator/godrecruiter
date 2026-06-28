'use client'

import { Button } from '@/components/ui/button'
import { Upload, FileText, Download, MoreHorizontal, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const DOCS = [
  { id: '1', name: 'Client Requirements — Houston Methodist.pdf', type: 'PDF',  size: '245 KB', uploaded: 'Jun 24', by: 'Arun Kumar' },
  { id: '2', name: 'Rate Card Q3 2026.xlsx',                      type: 'XLSX', size: '88 KB',  uploaded: 'Jun 24', by: 'Arun Kumar' },
  { id: '3', name: 'Submission Template — ICU RN.docx',           type: 'DOCX', size: '112 KB', uploaded: 'Jun 20', by: 'Sarah M.' },
  { id: '4', name: 'Interview Guide — Clinical.pdf',              type: 'PDF',  size: '320 KB', uploaded: 'Jun 18', by: 'Emily T.' },
  { id: '5', name: 'Offer Letter Template.docx',                  type: 'DOCX', size: '67 KB',  uploaded: 'Jun 15', by: 'Arun Kumar' },
  { id: '6', name: 'Compliance Checklist Q3.pdf',                 type: 'PDF',  size: '156 KB', uploaded: 'Jun 10', by: 'James R.' },
]

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
          <Input placeholder="Search documents…" className="h-8 w-52 pl-8 text-xs" />
        </div>
        <Button size="sm" className="h-8 text-xs gap-1.5 shrink-0"><Upload className="size-3.5" />Upload</Button>
      </div>
      <div className="flex-1 overflow-auto border border-border rounded-lg">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
            <tr className="border-b border-border">
              {['Name', 'Type', 'Size', 'Uploaded', 'By', ''].map(h => (
                <th key={h} className="h-9 px-4 text-left align-middle">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</span>
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
                    <span className="text-xs font-medium">{d.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${TYPE_CFG[d.type] ?? ''}`}>{d.type}</span>
                </td>
                <td className="px-4 py-3"><span className="text-xs text-muted-foreground">{d.size}</span></td>
                <td className="px-4 py-3"><span className="text-xs text-muted-foreground">{d.uploaded}</span></td>
                <td className="px-4 py-3"><span className="text-xs text-muted-foreground">{d.by}</span></td>
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
    </div>
  )
}
