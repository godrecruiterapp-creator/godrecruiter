'use client'

import { useActionState } from 'react'
import { createCandidateAction } from '../actions'
import Link from 'next/link'

const initialState = { error: '' }

export default function NewCandidatePage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await createCandidateAction(formData)
      return result ?? initialState
    },
    initialState
  )

  return (
    <div style={{ maxWidth: '680px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Link href="/dashboard/candidates" style={{
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
            Add candidate
          </h1>
          <p style={{ fontSize: '13px', color: '#777777', margin: '2px 0 0' }}>
            Add a candidate to your talent pool.
          </p>
        </div>
      </div>

      {state.error && (
        <div style={{
          padding: '12px 16px', marginBottom: '16px',
          background: '#FFF1F1', border: '1px solid #FECACA',
          borderRadius: '6px', fontSize: '13px', color: '#DC2626',
        }}>
          {state.error}
        </div>
      )}

      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        <Section title="Personal information">
          <Row>
            <Field label="First name" name="first_name" placeholder="e.g. Priya" required />
            <Field label="Last name" name="last_name" placeholder="e.g. Sharma" required />
          </Row>
          <Field label="Email" name="email" type="email" placeholder="priya@example.com" required />
          <Field label="Phone" name="phone" type="tel" placeholder="+91 98765 43210" />
        </Section>

        <Section title="Professional details">
          <Row>
            <Field label="Current title" name="current_title" placeholder="e.g. Senior Engineer" />
            <Field label="Current company" name="current_company" placeholder="e.g. Infosys" />
          </Row>
          <Field label="Location" name="location" placeholder="e.g. Bengaluru, Karnataka" />
          <Field label="LinkedIn URL" name="linkedin_url" type="url" placeholder="https://linkedin.com/in/priya-sharma" />
        </Section>

        <Section title="Recruitment details">
          <Row>
            <Select label="Candidate type" name="candidate_type" options={[
              { value: 'permanent', label: 'Permanent' },
              { value: 'contract', label: 'Contract' },
              { value: 'temp', label: 'Temp' },
              { value: 'unknown', label: 'Not specified' },
            ]} />
            <Select label="Notice period" name="notice_period" options={[
              { value: '', label: 'Not specified' },
              { value: 'Immediate', label: 'Immediate' },
              { value: '1 Week', label: '1 Week' },
              { value: '2 Weeks', label: '2 Weeks' },
              { value: '1 Month', label: '1 Month' },
              { value: '2 Months', label: '2 Months' },
              { value: '3 Months', label: '3 Months' },
            ]} />
          </Row>
          <Row>
            <Field label="Current CTC (₹/year)" name="current_ctc" type="number" placeholder="e.g. 1200000" />
            <Field label="Expected CTC (₹/year)" name="expected_ctc" type="number" placeholder="e.g. 1600000" />
          </Row>
          <Select label="Source" name="source" options={[
            { value: '', label: 'Not specified' },
            { value: 'linkedin', label: 'LinkedIn' },
            { value: 'referral', label: 'Referral' },
            { value: 'inbound', label: 'Inbound' },
            { value: 'naukri', label: 'Naukri' },
            { value: 'indeed', label: 'Indeed' },
            { value: 'import', label: 'Import' },
            { value: 'other', label: 'Other' },
          ]} />
        </Section>

        <Section title="Notes">
          <Textarea label="Internal notes" name="notes" placeholder="Any additional context about this candidate…" rows={4} />
        </Section>

        <div style={{ display: 'flex', gap: '8px', paddingBottom: '40px' }}>
          <button type="submit" disabled={pending} style={{
            padding: '9px 18px', background: pending ? '#555555' : '#0A0A0A', color: '#FFFFFF',
            border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500',
            cursor: pending ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          }}>
            {pending ? 'Saving…' : 'Save candidate'}
          </button>
          <a href="/dashboard/candidates" style={{
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
    <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: '8px', overflow: 'hidden' }}>
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
