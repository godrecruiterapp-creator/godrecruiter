'use client'

import { useEffect, useState, useTransition } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, AlertCircle, Loader2 } from 'lucide-react'
import { getProjectAction, updateProjectAction, archiveProjectAction, deleteProjectAction } from '../../actions'

export default function ProjectSettingsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [status, setStatus] = useState('active')
  const [visibility, setVisibility] = useState('team')
  const [msg, setMsg] = useState<string | null>(null)
  const [saving, startSave] = useTransition()

  useEffect(() => {
    if (!params.id) return
    getProjectAction(params.id).then(p => {
      if (!p) return
      setName(p.name); setDesc(p.description); setStatus(p.status); setVisibility(p.visibility)
    })
  }, [params.id])

  const save = () => {
    setMsg(null)
    startSave(async () => {
      const res = await updateProjectAction(params.id, { name, description: desc, status, visibility })
      setMsg(res?.error ?? 'Saved.')
    })
  }

  const archive = () => startSave(async () => {
    const res = await archiveProjectAction(params.id)
    if (res?.error) setMsg(res.error)
    else router.push('/dashboard/projects/my-projects')
  })

  const remove = () => {
    if (!confirm('Delete this project? Candidates remain in the ATS.')) return
    startSave(async () => {
      const res = await deleteProjectAction(params.id)
      if (res?.error) setMsg(res.error)
      else router.push('/dashboard/projects/my-projects')
    })
  }

  return (
    <div className="h-full overflow-y-auto p-5">
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h2 className="text-sm font-semibold mb-4">Project Settings</h2>
          <div className="rounded-xl border border-border bg-background divide-y divide-border overflow-hidden">
            <div className="px-4 py-4 space-y-1.5">
              <label className="text-sm font-semibold text-muted-foreground">Project Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} className="text-sm" />
            </div>
            <div className="px-4 py-4 space-y-1.5">
              <label className="text-sm font-semibold text-muted-foreground">Description</label>
              <Textarea value={desc} onChange={e => setDesc(e.target.value)} className="text-sm min-h-20 resize-none" />
            </div>
            <div className="px-4 py-4 space-y-1.5">
              <label className="text-sm font-semibold text-muted-foreground">Status</label>
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
              <label className="text-sm font-semibold text-muted-foreground">Visibility</label>
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
          <div className="flex items-center gap-3 mt-3">
            <Button size="sm" className="h-8 text-sm" disabled={saving || !name.trim()} onClick={save}>
              {saving ? <><Loader2 className="size-3.5 mr-1.5 animate-spin" />Saving…</> : 'Save Changes'}
            </Button>
            {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-1 text-destructive flex items-center gap-1.5"><AlertCircle className="size-3.5" />Danger Zone</h2>
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Archive this project</p>
                <p className="text-[10px] text-muted-foreground">Candidates and data are preserved but the project becomes read-only.</p>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-sm shrink-0" disabled={saving} onClick={archive}>Archive</Button>
            </div>
            <div className="flex items-center justify-between border-t border-destructive/20 pt-3">
              <div>
                <p className="text-sm font-semibold text-destructive">Delete this project</p>
                <p className="text-[10px] text-muted-foreground">Permanently deletes the project. Candidates remain in the ATS.</p>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-sm shrink-0 text-destructive border-destructive/30 hover:bg-destructive/10" disabled={saving} onClick={remove}>
                <Trash2 className="size-3 mr-1" />Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
