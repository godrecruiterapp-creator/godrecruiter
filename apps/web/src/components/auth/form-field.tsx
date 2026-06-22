'use client'

interface FormFieldProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
  autoComplete?: string
  defaultValue?: string
  error?: string
  hint?: string
}

export function FormField({
  label, name, type = 'text', placeholder, required,
  autoComplete, defaultValue, error, hint,
}: FormFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label htmlFor={name} style={{
        fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)',
      }}>
        {label}
        {required && <span style={{ color: 'var(--status-danger)', marginLeft: '2px' }}>*</span>}
      </label>
      <input
        id={name} name={name} type={type}
        placeholder={placeholder} required={required}
        autoComplete={autoComplete} defaultValue={defaultValue}
        style={{
          width: '100%', height: '42px', padding: '0 14px',
          fontSize: '14px', color: 'var(--text-primary)',
          background: 'var(--bg-app)',
          border: `1.5px solid ${error ? 'var(--status-danger)' : 'var(--border-default)'}`,
          borderRadius: '8px', outline: 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? 'var(--status-danger)' : 'var(--accent-primary)'
          e.currentTarget.style.boxShadow = `0 0 0 3px ${error ? 'rgba(220,38,38,0.1)' : 'rgba(3,105,161,0.12)'}`
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? 'var(--status-danger)' : 'var(--border-default)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      />
      {error && <p style={{ fontSize: '12px', color: 'var(--status-danger)' }}>{error}</p>}
      {hint && !error && <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{hint}</p>}
    </div>
  )
}
