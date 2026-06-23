import { createJobAction } from '../actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

const sel = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"

export default function NewJobPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="icon" className="size-8" asChild>
          <Link href="/dashboard/jobs"><ArrowLeft className="size-4" /></Link>
        </Button>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Post a job</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Fill in the details and save.</p>
        </div>
      </div>

      <form action={createJobAction as (formData: FormData) => void} className="space-y-4">

        {/* Basic info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Basic information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Job title <span className="text-destructive">*</span></Label>
                <Input id="title" name="title" placeholder="e.g. Senior Software Engineer" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="client">Client / Company</Label>
                <Input id="client" name="client" placeholder="e.g. Acme Corp" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" placeholder="e.g. Bengaluru" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" placeholder="e.g. Karnataka" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" placeholder="e.g. Engineering" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Job details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="employment_type">Employment type</Label>
                <select id="employment_type" name="employment_type" defaultValue="full_time" className={sel}>
                  <option value="full_time">Full-Time</option>
                  <option value="contract">Contract</option>
                  <option value="cth">Contract to Hire (CTH)</option>
                  <option value="direct_hire">Direct Hire</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="work_mode">Work mode</Label>
                <select id="work_mode" name="work_mode" defaultValue="onsite" className={sel}>
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="client_type">Client type</Label>
                <select id="client_type" name="client_type" defaultValue="" className={sel}>
                  <option value="">— Select —</option>
                  <option value="direct">Direct Client</option>
                  <option value="vms">VMS</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="openings">Openings</Label>
                <Input id="openings" name="openings" type="number" min="1" placeholder="1" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="recruiter_name">Assigned recruiter</Label>
                <Input id="recruiter_name" name="recruiter_name" placeholder="Recruiter name" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="salary_min">Min salary (₹/year)</Label>
                <Input id="salary_min" name="salary_min" type="number" placeholder="e.g. 800000" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="salary_max">Max salary (₹/year)</Label>
                <Input id="salary_max" name="salary_max" type="number" placeholder="e.g. 1200000" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="description">Role description</Label>
              <Textarea id="description" name="description" rows={5}
                placeholder="Describe the role, responsibilities, and what the candidate will be working on…" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea id="requirements" name="requirements" rows={4}
                placeholder="List the skills, experience, and qualifications required…" />
            </div>
          </CardContent>
        </Card>

        {/* Status & Priority */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Status &amp; Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <select id="status" name="status" defaultValue="open" className={sel}>
                  <option value="open">Open</option>
                  <option value="on_hold">On Hold</option>
                  <option value="closed">Closed</option>
                  <option value="filled">Filled</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="priority">Priority</Label>
                <select id="priority" name="priority" defaultValue="medium" className={sel}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 pb-10">
          <Button type="submit">Save job</Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/jobs">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
