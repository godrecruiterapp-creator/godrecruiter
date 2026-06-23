'use client'

import { useActionState } from 'react'
import { createCandidateAction } from '../actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'

const initialState = { error: '' }

const selectClass = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"

export default function NewCandidatePage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await createCandidateAction(formData)
      return result ?? initialState
    },
    initialState
  )

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="icon" className="size-8" asChild>
          <Link href="/dashboard/candidates"><ArrowLeft className="size-4" /></Link>
        </Button>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Add candidate</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Add a candidate to your talent pool.</p>
        </div>
      </div>

      {state.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="size-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <form action={formAction} className="space-y-4">

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Personal information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="first_name">First name <span className="text-destructive">*</span></Label>
                <Input id="first_name" name="first_name" placeholder="e.g. Priya" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last_name">Last name <span className="text-destructive">*</span></Label>
                <Input id="last_name" name="last_name" placeholder="e.g. Sharma" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
              <Input id="email" name="email" type="email" placeholder="priya@example.com" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Professional details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="current_title">Current title</Label>
                <Input id="current_title" name="current_title" placeholder="e.g. Senior Engineer" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="current_company">Current company</Label>
                <Input id="current_company" name="current_company" placeholder="e.g. Infosys" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="e.g. Bengaluru, Karnataka" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input id="linkedin_url" name="linkedin_url" type="url" placeholder="https://linkedin.com/in/priya-sharma" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Recruitment details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="candidate_type">Candidate type</Label>
                <select id="candidate_type" name="candidate_type" defaultValue="permanent" className={selectClass}>
                  <option value="permanent">Permanent</option>
                  <option value="contract">Contract</option>
                  <option value="temp">Temp</option>
                  <option value="unknown">Not specified</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notice_period">Notice period</Label>
                <select id="notice_period" name="notice_period" defaultValue="" className={selectClass}>
                  <option value="">Not specified</option>
                  <option value="Immediate">Immediate</option>
                  <option value="1 Week">1 Week</option>
                  <option value="2 Weeks">2 Weeks</option>
                  <option value="1 Month">1 Month</option>
                  <option value="2 Months">2 Months</option>
                  <option value="3 Months">3 Months</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="current_ctc">Current CTC (₹/year)</Label>
                <Input id="current_ctc" name="current_ctc" type="number" placeholder="e.g. 1200000" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="expected_ctc">Expected CTC (₹/year)</Label>
                <Input id="expected_ctc" name="expected_ctc" type="number" placeholder="e.g. 1600000" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="source">Source</Label>
              <select id="source" name="source" defaultValue="" className={selectClass}>
                <option value="">Not specified</option>
                <option value="linkedin">LinkedIn</option>
                <option value="referral">Referral</option>
                <option value="inbound">Inbound</option>
                <option value="naukri">Naukri</option>
                <option value="indeed">Indeed</option>
                <option value="import">Import</option>
                <option value="other">Other</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Notes</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Internal notes</Label>
              <Textarea id="notes" name="notes" rows={4} placeholder="Any additional context about this candidate…" />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 pb-10">
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {pending ? 'Saving…' : 'Save candidate'}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/candidates">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
