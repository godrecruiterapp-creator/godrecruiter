import { createJobAction } from '../actions'

export default function NewJobPage() {
  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px' }}>
          Post a job
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          Fill in the details below. You can save as draft and publish later.
        </p>
      </div>

      <form action={createJobAction as (formData: FormData) => void} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <Card title="Basic information">
          <Field label="Job title" name="title" placeholder="e.g. Senior Software Engineer" required />
          <Row>
            <Field label="Department" name="department" placeholder="e.g. Engineering" />
            <Field label="Location" name="location" placeholder="e.g. New York, NY" />
          </Row>
          <Row>
            <Select label="Work mode" name="work_mode" options={[
              { value: 'onsite',  label: 'On-site'  },
              { value: 'hybrid',  label: 'Hybrid'   },
              { value: 'remote',  label: 'Remote'   },
            ]} />
            <Select label="Job type" name="job_type" options={[
              { value: 'full_time',   label: 'Full-time'   },
              { value: 'part_time',   label: 'Part-time'   },
              { value: 'contract',    label: 'Contract'    },
              { value: 'internship',  label: 'Internship'  },
            ]} />
          </Row>
          <Row>
            <Field label="Min salary (USD/year)" name="salary_min" type="number" placeholder="e.g. 80000" />
            <Field label="Max salary (USD/year)" name="salary_max" type="number" placeholder="e.g. 120000" />
          </Row>
          <Field label="Number of openings" name="openings" type="number" placeholder="1" />
        </Card>

        <Card title="Job description">
          <Textarea label="Description" name="description" placeholder="Describe the role, responsibilities, and what the candidate will be working on…" rows={6} />
          <Textarea label="Requirements" name="requirements" placeholder="List the skills, experience, and qualifications required…" rows={5} />
        </Card>

        <Card title="Publishing">
          <Select label="Status" name="status" options={[
            { value: 'draft',     label: 'Save as draft'       },
            { value: 'published', label: 'Publish immediately' },
          ]} />
        </Card>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            style={{
              padding: '9px 20px',
              background: 'var(--accent-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Save job
          </button>
          <a
            href="/dashboard/jobs"
            style={{
              padding: '9px 20px',
              background: 'var(--bg-subtle)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              textDecoration: 'none',
            }}
          >
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
      background: 'var(--bg-card)',
      border: '1px solid var(--border-default)',
      borderRadius: '10px',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        fontSize: '13px',
        fontWeight: '600',
        color: 'var(--text-primary)',
      }}>
        {title}
      </div>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

function Field({ label, name, type = 'text', placeholder, required }: {
  label: string; name: string; type?: string; placeholder?: string; required?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>
        {label}{required && <span style={{ color: 'var(--status-danger)', marginLeft: 2 }}>*</span>}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        style={{
          height: '36px', padding: '0 12px',
          fontSize: '13px', color: 'var(--text-primary)',
          background: 'var(--bg-app)',
          border: '1px solid var(--border-default)',
          borderRadius: '6px', outline: 'none', width: '100%',
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

function Select({ label, name, options }: {
  label: string; name: string; options: { value: string; label: string }[]
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>{label}</label>
      <select
        name={name}
        defaultValue={options[0]?.value}
        style={{
          height: '36px', padding: '0 12px',
          fontSize: '13px', color: 'var(--text-primary)',
          background: 'var(--bg-app)',
          border: '1px solid var(--border-default)',
          borderRadius: '6px', outline: 'none', width: '100%',
          boxSizing: 'border-box',
        }}
      >
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
      <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>{label}</label>
      <textarea
        name={name}
        placeholder={placeholder}
        rows={rows}
        style={{
          padding: '10px 12px',
          fontSize: '13px', color: 'var(--text-primary)',
          background: 'var(--bg-app)',
          border: '1px solid var(--border-default)',
          borderRadius: '6px', outline: 'none',
          resize: 'vertical', width: '100%',
          boxSizing: 'border-box', lineHeight: '1.5',
          fontFamily: 'inherit',
        }}
      />
    </div>
  )
}
