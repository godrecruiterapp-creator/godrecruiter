'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, AlertCircle } from 'lucide-react'

export default function ProjectSettingsPage() {
  const [name, setName] = useState('Texas ICU Nurses')
  const [desc, setDesc] = useState('Healthcare pipeline for critical care nurses across Texas hospitals.')
  const [status, setStatus] = useState('active')
  const [visibility, setVisibility] = useState('team')

  return (
    <div className="h-full overflow-y-auto p-5">
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h2 className="text-sm font-semibold mb-4">Project Settings</h2>
          <div className="rounded-xl border border-border bg-background divide-y divide-border overflow-hidden">
            <div className="px-4 py-4 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Project Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} className="text-sm" />
            </div>
            <div className="px-4 py-4 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Description</label>
              <Textarea value={desc} onChange={e => setDesc(e.target.value)} className="text-sm min-h-20 resize-none" />
            </div>
            <div className="px-4 py-4 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="px-4 py-4 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Visibility</label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private — only you</SelectItem>
                  <SelectItem value="team">Team — assigned members</SelectItem>
                  <SelectItem value="organization">Organization — everyone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button size="sm" className="mt-3 h-8 text-xs">Save Changes</Button>
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-1 text-destructive flex items-center gap-1.5"><AlertCircle className="size-3.5" />Danger Zone</h2>
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold">Archive this project</p>
                <p className="text-[10px] text-muted-foreground">Candidates and data are preserved but the project becomes read-only.</p>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs shrink-0">Archive</Button>
            </div>
            <div className="flex items-center justify-between border-t border-destructive/20 pt-3">
              <div>
                <p className="text-xs font-semibold text-destructive">Delete this project</p>
                <p className="text-[10px] text-muted-foreground">Permanently deletes the project. Candidates remain in the ATS.</p>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs shrink-0 text-destructive border-destructive/30 hover:bg-destructive/10">
                <Trash2 className="size-3 mr-1" />Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
