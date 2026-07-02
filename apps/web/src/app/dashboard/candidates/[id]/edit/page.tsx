import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { updateCandidateAction } from '../../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'

const CANDIDATE_TYPES = [
  { value: 'permanent', label: 'Citizen / PR' },
  { value: 'contract',  label: 'Work Visa' },
  { value: 'temp',      label: 'Temp / OPT' },
  { value: 'unknown',   label: 'Unknown' },
]
const SOURCES = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'referral', label: 'Referral' },
  { value: 'inbound',  label: 'Inbound' },
  { value: 'naukri',   label: 'Naukri' },
  { value: 'indeed',   label: 'Indeed' },
  { value: 'import',   label: 'Import' },
  { value: 'other',    label: 'Other' },
]

export default async function EditCandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const { data: candidate } = await admin
    .from('candidates')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!candidate) notFound()

  const action = async (formData: FormData) => {
    'use server'
    await updateCandidateAction(id, formData)
  }

  const name = [candidate.first_name, candidate.last_name].filter(Boolean).join(' ') || 'Candidate'

  return (
    <div className="p-6 overflow-auto flex-1">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="icon" className="size-8" asChild>
          <Link href={`/dashboard/candidates/${id}`}><ArrowLeft className="size-4" /></Link>
        </Button>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Edit candidate</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{name}</p>
        </div>
      </div>

      <form action={action} className="space-y-4">

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Basic information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="first_name">First name <span className="text-destructive">*</span></Label>
                <Input id="first_name" name="first_name" defaultValue={candidate.first_name ?? ''} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last_name">Last name <span className="text-destructive">*</span></Label>
                <Input id="last_name" name="last_name" defaultValue={candidate.last_name ?? ''} required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                <Input id="email" name="email" type="email" defaultValue={candidate.email ?? ''} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" defaultValue={candidate.phone ?? ''} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" defaultValue={candidate.location ?? ''} placeholder="e.g. Houston, TX" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="linkedin_url">LinkedIn</Label>
                <Input id="linkedin_url" name="linkedin_url" type="url" defaultValue={candidate.linkedin_url ?? ''} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Professional details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="current_title">Current title</Label>
                <Input id="current_title" name="current_title" defaultValue={candidate.current_title ?? ''} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="current_company">Current company</Label>
                <Input id="current_company" name="current_company" defaultValue={candidate.current_company ?? ''} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="candidate_type">Type</Label>
                <Select name="candidate_type" defaultValue={candidate.candidate_type ?? 'unknown'}>
                  <SelectTrigger id="candidate_type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CANDIDATE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="source">Source</Label>
                <Select name="source" defaultValue={candidate.source ?? ''}>
                  <SelectTrigger id="source"><SelectValue placeholder="— Select —" /></SelectTrigger>
                  <SelectContent>
                    {SOURCES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notice_period">Notice period</Label>
                <Input id="notice_period" name="notice_period" defaultValue={candidate.notice_period ?? ''} placeholder="e.g. 2 weeks" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="current_ctc">Current CTC</Label>
                <Input id="current_ctc" name="current_ctc" type="number" min="0" defaultValue={candidate.current_ctc ?? ''} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="expected_ctc">Expected CTC</Label>
                <Input id="expected_ctc" name="expected_ctc" type="number" min="0" defaultValue={candidate.expected_ctc ?? ''} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea name="notes" rows={4} defaultValue={candidate.notes ?? ''} />
          </CardContent>
        </Card>

        <div className="flex gap-2 pb-10">
          <Button type="submit">Save changes</Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/candidates/${id}`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
