'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, Plus, X, MoreHorizontal, Pencil, Copy, Archive, Trash2, FolderKanban, Users, Briefcase, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PROJECTS, type Project } from '../_data'

const STATUS_CFG = {
  active:    { label: 'Active',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  paused:    { label: 'Paused',    cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed: { label: 'Completed', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  archived:  { label: 'Archived',  cls: 'bg-muted text-muted-foreground border-border' },
}

function healthColor(score: number) {
  if (score >= 75) return 'text-emerald-600'
  if (score >= 50) return 'text-amber-500'
  return 'text-red-500'
}

function healthBg(score: number) {
  if (score >= 75) return 'bg-emerald-500'
  if (score >= 50) return 'bg-amber-400'
  return 'bg-red-400'
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700', 'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700',
  'bg-pink-100 text-pink-700',
]

export default function MyProjectsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')

  const filtered = useMemo(() => PROJECTS.filter(p => {
    if (status !== 'all' && p.status !== status) return false
    if (type !== 'all' && p.type !== type) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [search, status, type])

  const types = Array.from(new Set(PROJECTS.map(p => p.type)))

  return (
    <div className="flex flex-col h-full p-6 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between pb-4 shrink-0 gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search projects…" className="h-8 w-52 pl-8 pr-7 text-sm" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-8 w-28 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-8 w-40 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" className="h-8 shrink-0" onClick={() => router.push('/dashboard/projects/new')}>
          <Plus className="size-3.5 mr-1.5" />Create Project
        </Button>
      </div>

      {/* Cards grid */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FolderKanban className="size-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No projects found</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Create your first project to start organizing candidates.</p>
            <Button size="sm" className="h-8 text-sm" onClick={() => router.push('/dashboard/projects/new')}>
              <Plus className="size-3.5 mr-1.5" />Create Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function ProjectCard({ project: p }: { project: Project }) {
  const cfg = STATUS_CFG[p.status]
  return (
    <div className="group flex flex-col gap-0 rounded-xl border border-border bg-background hover:shadow-md transition-shadow overflow-hidden">
      {/* Health bar */}
      <div className="h-1 w-full bg-muted">
        <div className={cn('h-1 transition-all', healthBg(p.healthScore))} style={{ width: `${p.healthScore}%` }} />
      </div>

      <div className="flex flex-col gap-3 p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <Link href={`/dashboard/projects/${p.id}`} className="text-sm font-semibold hover:underline truncate">{p.name}</Link>
            </div>
            <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold', cfg.cls)}>
              {cfg.label}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="size-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                <MoreHorizontal className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem asChild><Link href={`/dashboard/projects/${p.id}`}><FolderKanban className="size-3.5 mr-2" />Open</Link></DropdownMenuItem>
              <DropdownMenuItem><Pencil className="size-3.5 mr-2" />Edit</DropdownMenuItem>
              <DropdownMenuItem><Copy className="size-3.5 mr-2" />Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem><Archive className="size-3.5 mr-2" />Archive</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive"><Trash2 className="size-3.5 mr-2" />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{p.description}</p>

        {/* Type badge */}
        <span className="inline-flex items-center self-start rounded-full px-2 py-0.5 text-[10px] font-medium bg-muted/80 text-muted-foreground">
          {p.type}
        </span>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="size-3" />
              <span className="text-[10px]">Candidates</span>
            </div>
            <span className="text-sm font-semibold tabular-nums">{p.candidateCount}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Briefcase className="size-3" />
              <span className="text-[10px]">Open Jobs</span>
            </div>
            <span className="text-sm font-semibold tabular-nums">{p.openJobs}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Activity className="size-3" />
              <span className="text-[10px]">AI Health</span>
            </div>
            <span className={cn('text-sm font-semibold tabular-nums', healthColor(p.healthScore))}>{p.healthScore}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          {/* Team avatars */}
          <div className="flex items-center -space-x-1.5">
            {[p.owner, ...p.team].slice(0, 4).map((m, i) => (
              <div key={m} className={cn('size-6 rounded-full border-2 border-background flex items-center justify-center text-[9px] font-bold', AVATAR_COLORS[i % AVATAR_COLORS.length])}>
                {initials(m)}
              </div>
            ))}
            {p.team.length > 3 && (
              <div className="size-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[9px] font-medium text-muted-foreground">
                +{p.team.length - 3}
              </div>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground">{p.lastActivity}</span>
        </div>
      </div>
    </div>
  )
}
