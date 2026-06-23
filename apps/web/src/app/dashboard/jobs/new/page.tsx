import { createJobAction } from '../actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function NewJobPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="icon" className="size-8" asChild>
          <Link href="/dashboard/jobs">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Post a job</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Save as draft or publish immediately.</p>
        </div>
      </div>

      <form action={createJobAction as (formData: FormData) => void} className="space-y-4">

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Basic information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Job title <span className="text-destructive">*</span></Label>
              <Input id="title" name="title" placeholder="e.g. Senior Software Engineer" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" placeholder="e.g. Engineering" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="e.g. Bengaluru, India" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="work_mode">Work mode</Label>
                <select id="work_mode" name="work_mode" defaultValue="onsite"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="job_type">Job type</Label>
                <select id="job_type" name="job_type" defaultValue="full_time"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="salary_min">Min salary (₹/year)</Label>
                <Input id="salary_min" name="salary_min" type="number" placeholder="e.g. 800000" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="salary_max">Max salary (₹/year)</Label>
                <Input id="salary_max" name="salary_max" type="number" placeholder="e.g. 1200000" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="openings">Number of openings</Label>
              <Input id="openings" name="openings" type="number" placeholder="1" className="max-w-32" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="description">Role description</Label>
              <Textarea id="description" name="description" rows={6}
                placeholder="Describe the role, responsibilities, and what the candidate will be working on…" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea id="requirements" name="requirements" rows={5}
                placeholder="List the skills, experience, and qualifications required…" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Publishing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <select id="status" name="status" defaultValue="draft"
                className="flex h-9 w-48 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="draft">Save as draft</option>
                <option value="published">Publish immediately</option>
              </select>
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
