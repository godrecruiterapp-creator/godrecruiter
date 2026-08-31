'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Pin, Bot, MoreHorizontal, Plus, Sparkles, StickyNote } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'

type Note = { id: string; author: string; time: string; pinned: boolean; body: string }
const NOTES: Note[] = []

export default function ProjectNotesPage() {
  const [notes, setNotes] = useState(NOTES)
  const [draft, setDraft] = useState('')

  function addNote() {
    if (!draft.trim()) return
    setNotes(prev => [{ id: String(Date.now()), author: 'You', time: 'Just now', pinned: false, body: draft.trim() }, ...prev])
    setDraft('')
  }

  return (
    <div className="flex flex-col h-full overflow-hidden p-5">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-sm font-semibold">Notes</h2>
        <Button size="sm" variant="outline" className="h-8 text-sm gap-1.5">
          <Sparkles className="size-3.5" />AI Summarize Notes
        </Button>
      </div>

      {/* Compose */}
      <div className="border border-border rounded-xl p-3 mb-4 shrink-0 bg-background">
        <Textarea value={draft} onChange={e => setDraft(e.target.value)}
          placeholder="Write a note… Use @name to mention teammates"
          className="min-h-20 border-0 bg-transparent resize-none text-sm p-0 focus-visible:ring-0" />
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
          <Button size="sm" variant="ghost" className="h-7 text-sm gap-1.5 text-muted-foreground">
            <Bot className="size-3.5" />Ask AI
          </Button>
          <Button size="sm" className="h-7 text-sm" disabled={!draft.trim()} onClick={addNote}>
            <Plus className="size-3 mr-1" />Add Note
          </Button>
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {notes.length === 0 && (
          <EmptyState icon={StickyNote} title="No notes yet"
            description="Add a note to capture client requirements, call summaries, or team updates." />
        )}
        {notes.map(n => (
          <div key={n.id} className={cn('rounded-xl border bg-background p-4 group', n.pinned ? 'border-amber-200 bg-amber-50/30' : 'border-border')}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">{n.author.split(' ').map(x => x[0]).join('')}</div>
                <span className="text-sm font-semibold">{n.author}</span>
                <span className="text-[10px] text-muted-foreground">{n.time}</span>
                {n.pinned && <span className="inline-flex items-center gap-1 text-[10px] text-amber-600"><Pin className="size-2.5" />Pinned</span>}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="size-6 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted/60 transition-all text-muted-foreground">
                    <MoreHorizontal className="size-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem><Pin className="size-3.5 mr-2" />{n.pinned ? 'Unpin' : 'Pin'}</DropdownMenuItem>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{n.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
