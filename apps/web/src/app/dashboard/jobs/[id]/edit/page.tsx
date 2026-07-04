import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { updateJobAction } from '../../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

// Plain native <select> — the Radix Select's hidden native-select shim mispositions
// itself inside this page's nested scroll container, which made the whole document
// scroll far past the visible content. A native select has no such shim.
function NativeSelect({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    />
  )
}

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const { data: job } = await admin
    .from('jobs')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!job) notFound()

  const action = async (formData: FormData) => {
    'use server'
    await updateJobAction(id, formData)
  }

  const salaryMin = job.salary_min ? String(Math.round(job.salary_min / 100)) : ''
  const salaryMax = job.salary_max ? String(Math.round(job.salary_max / 100)) : ''

  return (
    <div className="p-6 overflow-auto flex-1">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="size-8" asChild>
            <Link href={`/dashboard/jobs/${id}`}><ArrowLeft className="size-4" /></Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Edit job</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {job.display_id && <span className="font-mono mr-1">{job.display_id} ·</span>}
              {job.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/jobs/${id}`}>Cancel</Link>
          </Button>
          <Button type="submit" form="edit-job-form">Save changes</Button>
        </div>
      </div>

      <form action={action} id="edit-job-form" className="space-y-4 pb-10">

        {/* Basic info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Basic information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Job title <span className="text-destructive">*</span></Label>
                <Input id="title" name="title" defaultValue={job.title ?? ''} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="client">Client / Company</Label>
                <Input id="client" name="client" defaultValue={job.client ?? ''} placeholder="e.g. Acme Corp" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="client_job_id">Client Job ID</Label>
                <Input id="client_job_id" name="client_job_id" defaultValue={job.client_job_id ?? ''} placeholder="The client's own requisition/job number" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" defaultValue={job.city ?? ''} placeholder="e.g. Bengaluru" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" defaultValue={job.state ?? ''} placeholder="e.g. Karnataka" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" defaultValue={job.department ?? ''} placeholder="e.g. Engineering" />
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
                <NativeSelect id="employment_type" name="employment_type" defaultValue={job.employment_type ?? 'full_time'}>
                  <option value="full_time">Full-Time</option>
                  <option value="contract">Contract</option>
                  <option value="cth">Contract to Hire (CTH)</option>
                  <option value="direct_hire">Direct Hire</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </NativeSelect>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="work_mode">Work mode</Label>
                <NativeSelect id="work_mode" name="work_mode" defaultValue={job.work_mode ?? 'onsite'}>
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="remote">Remote</option>
                </NativeSelect>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="client_type">Client type</Label>
                <NativeSelect id="client_type" name="client_type" defaultValue={job.client_type ?? ''}>
                  <option value="">— Select —</option>
                  <option value="direct">Direct Client</option>
                  <option value="vms">VMS</option>
                </NativeSelect>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="openings">Openings</Label>
                <Input id="openings" name="openings" type="number" min="1" defaultValue={job.openings ?? 1} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="recruiter_name">Assigned recruiter</Label>
                <Input id="recruiter_name" name="recruiter_name" defaultValue={job.recruiter_name ?? ''} placeholder="Recruiter name" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="salary_min">Min salary (₹/year)</Label>
                <Input id="salary_min" name="salary_min" type="number" defaultValue={salaryMin} placeholder="e.g. 800000" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="salary_max">Max salary (₹/year)</Label>
                <Input id="salary_max" name="salary_max" type="number" defaultValue={salaryMax} placeholder="e.g. 1200000" />
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
              <Textarea id="description" name="description" rows={5} defaultValue={job.description ?? ''} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea id="requirements" name="requirements" rows={4} defaultValue={job.requirements ?? ''} />
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
                <NativeSelect id="status" name="status" defaultValue={job.status ?? 'open'}>
                  <option value="open">Open</option>
                  <option value="on_hold">On Hold</option>
                  <option value="closed">Closed</option>
                  <option value="filled">Filled</option>
                </NativeSelect>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="priority">Priority</Label>
                <NativeSelect id="priority" name="priority" defaultValue={job.priority ?? 'medium'}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </NativeSelect>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
