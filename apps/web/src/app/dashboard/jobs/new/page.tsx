import { createJobAction } from '../actions'
import Link from 'next/link'

export default function NewJobPage() {
  return (
    <div style={{ maxWidth: '760px' }}>
      {/* Page header */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/dashboard/jobs" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '34px', height: '34px', borderRadius: '8px',
          border: '1px solid var(--border-subtle)', background: '#fff',
          textDecoration: 'none', color: 'var(--text-secondary)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.025em' }}>
            Post a job
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '3px 0 0' }}>
            Fill in the details below. Save as draft or publish immediately.
          </p>
        </div>
      </div>

      <form action={createJobAction as (formData: FormData) => void} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <Card title="Basic Information">
          <Field label="Job title" name="title" placeholder="e.g. Senior Software Engineer" required />
          <Row>
            <Field label="Department" name="department" placeholder="e.g. Engineering" />
            <Field label="Location" name="location" placeholder="e.g. Bengaluru, India" />
          </Row>
          <Row>
            <Select label="Work mode" name="work_mode" options={[
              { value: 'onsite', label: 'On-site' },
              { value: 'hybrid', label: 'Hybrid' },
              { value: 'remote', label: 'Remote' },
            ]} />
            <Select label="Job type" name="job_type" options={[
              { value: 'full_time',  label: 'Full-time' },
              { value: 'part_time',  label: 'Part-time' },
              { value: 'contract',   label: 'Contract' },
              { value: 'internship', label: 'Internship' },
            ]} />
          </Row>
          <Row>
            <Field label="Min salary (₹/year)" name="salary_min" type="number" placeholder="e.g. 800000" />
            <Field label="Max salary (₹/year)" name="salary_max" type="number" placeholder="e.g. 1200000" />
          </Row>
          <Field label="Number of openings" name="openings" type="number" placeholder="1" />
        </Card>

        <Card title="Job Description">
          <Textarea label="Description" name="description" placeholder="Describe the role, responsibilities, and what the candidate will be working on…" rows={6} />
          <Textarea label="Requirements" name="requirements" placeholder="List the skills, experience, and qualifications required…" rows={5} />
        </Card>

        <Card title="Publishing">
          <Select label="Status" name="status" options={[
            { value: 'draft',     label: 'Save as draft' },
            { value: 'published', label: 'Publish immediately' },
          ]} />
        </Card>

        <div style={{ display: 'flex', gap: '12px', paddingBottom: '32px' }}>
          <button type="submit" style={{
            padding: '11px 24px',
            background: 'var(--color-primary)', color: '#fff',
            border: 'none', borderRadius: '8px',
            fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            transition: 'background 0.15s',
          }}>
            Save job
          </button>
          <a href="/dashboard/jobs" style={{
            padding: '11px 20px',
            background: '#fff', color: 'var(--text-secondary)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px', fontSize: '14px', fontWeight: '500',
            textDecoration: 'none',
          }}>
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--border-subtle)',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-card)',
    }}>
      <div style={{
        padding: '16px 22px',
        borderBottom: '1px solid var(--border-subtle)',
        fontSize: '14px', fontWeight: '600',
        color: 'var(--text-primary)',
        background: 'var(--bg-subtle)',
      }}>
        {title}
      </div>
      <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {children}
      </div>
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      {children}
    </div>
  )
}

const inputBase = {
  height: '42px', padding: '0 14px',
  fontSize: '14px', color: 'var(--text-primary)',
  background: 'var(--bg-app)',
  border: '1.5px solid var(--border-default)',
  borderRadius: '8px', outline: 'none',
  width: '100%', boxSizing: 'border-box' as const,
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
}

function Field({ label, name, type = 'text', placeholder, required }: {
  label: string; name: string; type?: string; placeholder?: string; required?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>
        {label}{required && <span style={{ color: 'var(--status-danger)', marginLeft: 2 }}>*</span>}
      </label>
      <input name={name} type={type} placeholder={placeholder} required={required} style={inputBase} />
    </div>
  )
}

function Select({ label, name, options }: {
  label: string; name: string; options: { value: string; label: string }[]
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{label}</label>
      <select name={name} defaultValue={options[0]?.value} style={{ ...inputBase, cursor: 'pointer' }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function Textarea({ label, name, placeholder, rows = 4 }: {
  label: string; name: string; placeholder?: string; rows?: number
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{label}</label>
      <textarea
        name={name} placeholder={placeholder} rows={rows}
        style={{
          padding: '12px 14px',
          fontSize: '14px', color: 'var(--text-primary)',
          background: 'var(--bg-app)',
          border: '1.5px solid var(--border-default)',
          borderRadius: '8px', outline: 'none',
          resize: 'vertical', width: '100%',
          boxSizing: 'border-box', lineHeight: '1.6',
          fontFamily: 'inherit',
        }}
      />
    </div>
  )
}
