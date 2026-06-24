import { createJobAction } from '../actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'

export default function NewJobPage() {
  return (
    <div className="p-6 overflow-auto flex-1">
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
                <Select name="employment_type" defaultValue="full_time">
                  <SelectTrigger id="employment_type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full-Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="cth">Contract to Hire (CTH)</SelectItem>
                    <SelectItem value="direct_hire">Direct Hire</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="work_mode">Work mode</Label>
                <Select name="work_mode" defaultValue="onsite">
                  <SelectTrigger id="work_mode"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onsite">On-site</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="client_type">Client type</Label>
                <Select name="client_type" defaultValue="">
                  <SelectTrigger id="client_type"><SelectValue placeholder="— Select —" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">— Select —</SelectItem>
                    <SelectItem value="direct">Direct Client</SelectItem>
                    <SelectItem value="vms">VMS</SelectItem>
                  </SelectContent>
                </Select>
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
                <Select name="status" defaultValue="open">
                  <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="filled">Filled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="priority">Priority</Label>
                <Select name="priority" defaultValue="medium">
                  <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
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
