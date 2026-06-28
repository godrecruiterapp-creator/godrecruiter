'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Mail, Eye, MessageSquare, Sparkles, ChevronDown } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const EMAILS = [
  { id: '1', subject: 'ICU RN Opportunity — Houston Methodist',   to: 14, sent: 'Today 9:00 AM',    opens: 9,  replies: 3, status: 'sent' },
  { id: '2', subject: 'Interview Confirmation — June 30',          to: 3,  sent: 'Yesterday 3:00 PM', opens: 3,  replies: 3, status: 'sent' },
  { id: '3', subject: 'We\'d love to reconnect!',                  to: 8,  sent: 'Jun 25',            opens: 5,  replies: 1, status: 'sent' },
  { id: '4', subject: 'Travel Nurse Opportunities — Summer 2026',  to: 22, sent: 'Jun 24',            opens: 14, replies: 6, status: 'sent' },
  { id: '5', subject: 'Offer Letter — Maria Lopez',                to: 1,  sent: 'Jun 23',            opens: 1,  replies: 1, status: 'sent' },
  { id: '6', subject: 'Follow-up: Are you still interested?',      to: 12, sent: 'Scheduled Jun 30',  opens: 0,  replies: 0, status: 'scheduled' },
]

const STA_CFG: Record<string, string> = {
  sent:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  draft:     'bg-muted text-muted-foreground border-border',
}

export default function ProjectEmailsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden p-5">
      <div className="flex items-center justify-between mb-4 shrink-0 gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input placeholder="Search emails…" className="h-8 w-52 pl-8 text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
            <Sparkles className="size-3.5" />AI Write
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-8 text-xs gap-1.5">
                <Plus className="size-3.5" />Compose <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem><Mail className="size-3.5 mr-2" />Single Email</DropdownMenuItem>
              <DropdownMenuItem><MessageSquare className="size-3.5 mr-2" />Bulk Email</DropdownMenuItem>
              <DropdownMenuItem>Use Template</DropdownMenuItem>
              <DropdownMenuItem>Schedule Email</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex-1 overflow-auto border border-border rounded-lg">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
            <tr className="border-b border-border">
              {['Subject', 'Recipients', 'Sent', 'Opens', 'Replies', 'Status', ''].map(h => (
                <th key={h} className="h-9 px-4 text-left align-middle">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EMAILS.map(e => (
              <tr key={e.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Mail className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs font-medium">{e.subject}</span>
                  </div>
                </td>
                <td className="px-4 py-3"><span className="text-xs text-muted-foreground">{e.to} recipients</span></td>
                <td className="px-4 py-3"><span className="text-xs text-muted-foreground whitespace-nowrap">{e.sent}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Eye className="size-3 text-muted-foreground" />
                    <span className="text-xs tabular-nums">{e.opens}</span>
                    {e.to > 0 && <span className="text-[10px] text-muted-foreground">({Math.round(e.opens / e.to * 100)}%)</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs font-semibold tabular-nums', e.replies > 0 ? 'text-emerald-600' : 'text-muted-foreground')}>{e.replies}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold', STA_CFG[e.status])}>{e.status}</span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
