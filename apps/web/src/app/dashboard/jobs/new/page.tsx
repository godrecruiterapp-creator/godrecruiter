import { createJobAction } from '../actions'
import Link from 'next/link'

export default function NewJobPage() {
  return (
    <div style={{ maxWidth: '680px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Link href="/dashboard/jobs" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '30px', height: '30px', borderRadius: '6px',
          border: '1px solid #E0E0E0', background: '#FFFFFF',
          textDecoration: 'none', color: '#777777',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#0A0A0A', margin: 0, letterSpacing: '-0.02em' }}>
            Post a job
          </h1>
          <p style={{ fontSize: '13px', color: '#777777', margin: '2px 0 0' }}>
            Save as draft or publish immediately.
          </p>
        </div>
      </div>

      <form action={createJobAction as (formData: FormData) => void} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        <Section title="Basic information">
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
        </Section>

        <Section title="Description">
          <Textarea label="Role description" name="description" placeholder="Describe the role, responsibilities, and what the candidate will be working on…" rows={6} />
          <Textarea label="Requirements" name="requirements" placeholder="List the skills, experience, and qualifications required…" rows={5} />
        </Section>

        <Section title="Publishing">
          <Select label="Status" name="status" options={[
            { value: 'draft',     label: 'Save as draft' },
            { value: 'published', label: 'Publish immediately' },
          ]} />
        </Section>

        <div style={{ display: 'flex', gap: '8px', paddingBottom: '40px' }}>
          <button type="submit" style={{
            padding: '9px 18px', background: '#0A0A0A', color: '#FFFFFF',
            border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Save job
          </button>
          <a href="/dashboard/jobs" style={{
            padding: '9px 14px', background: '#FFFFFF', color: '#555555',
            border: '1px solid #E0E0E0', borderRadius: '6px',
            fontSize: '13px', fontWeight: '500', textDecoration: 'none', display: 'inline-block',
          }}>
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: '8px', overflow: 'hidden',
    }}>
      <div style={{
        padding: '13px 18px', borderBottom: '1px solid #EBEBEB',
        fontSize: '13px', fontWeight: '500', color: '#0A0A0A',
        background: '#FAFAFA',
      }}>
        {title}
      </div>
      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {children}
      </div>
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  height: '38px', padding: '0 12px',
  fontSize: '14px', color: '#0A0A0A',
  background: '#FFFFFF', border: '1px solid #E0E0E0',
  borderRadius: '6px', outline: 'none',
  width: '100%', boxSizing: 'border-box',
  fontFamily: 'inherit',
}

function Field({ label, name, type = 'text', placeholder, required }: {
  label: string; name: string; type?: string; placeholder?: string; required?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '13px', fontWeight: '500', color: '#0A0A0A' }}>
        {label}{required && <span style={{ color: '#DC2626', marginLeft: 2 }}>*</span>}
      </label>
      <input name={name} type={type} placeholder={placeholder} required={required} style={inputStyle} />
    </div>
  )
}

function Select({ label, name, options }: {
  label: string; name: string; options: { value: string; label: string }[]
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '13px', fontWeight: '500', color: '#0A0A0A' }}>{label}</label>
      <select name={name} defaultValue={options[0]?.value} style={{ ...inputStyle, cursor: 'pointer' }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function Textarea({ label, name, placeholder, rows = 4 }: {
  label: string; name: string; placeholder?: string; rows?: number
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '13px', fontWeight: '500', color: '#0A0A0A' }}>{label}</label>
      <textarea name={name} placeholder={placeholder} rows={rows} style={{
        padding: '10px 12px', fontSize: '14px', color: '#0A0A0A',
        background: '#FFFFFF', border: '1px solid #E0E0E0',
        borderRadius: '6px', outline: 'none', resize: 'vertical',
        width: '100%', boxSizing: 'border-box', lineHeight: '1.6',
        fontFamily: 'inherit',
      }} />
    </div>
  )
}
