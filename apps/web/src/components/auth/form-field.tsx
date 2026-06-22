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
      <label htmlFor={name} style={{ fontSize: '13px', fontWeight: '500', color: '#0A0A0A' }}>
        {label}
        {required && <span style={{ color: '#DC2626', marginLeft: '2px' }}>*</span>}
      </label>
      <input
        id={name} name={name} type={type}
        placeholder={placeholder} required={required}
        autoComplete={autoComplete} defaultValue={defaultValue}
        style={{
          width: '100%', height: '40px', padding: '0 12px',
          fontSize: '14px', color: '#0A0A0A',
          background: '#FFFFFF',
          border: `1px solid ${error ? '#DC2626' : '#E0E0E0'}`,
          borderRadius: '6px', outline: 'none',
          transition: 'border-color 0.12s',
          fontFamily: 'inherit',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? '#DC2626' : '#0A0A0A'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? '#DC2626' : '#E0E0E0'
        }}
      />
      {error && <p style={{ fontSize: '12px', color: '#DC2626', margin: 0 }}>{error}</p>}
      {hint && !error && <p style={{ fontSize: '12px', color: '#999999', margin: 0 }}>{hint}</p>}
    </div>
  )
}
