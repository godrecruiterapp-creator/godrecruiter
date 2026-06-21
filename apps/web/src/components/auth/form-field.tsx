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
  label,
  name,
  type = 'text',
  placeholder,
  required,
  autoComplete,
  defaultValue,
  error,
  hint,
}: FormFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label
        htmlFor={name}
        style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}
      >
        {label}
        {required && <span style={{ color: 'var(--status-danger)', marginLeft: '2px' }}>*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        style={{
          width: '100%',
          height: '36px',
          padding: '0 12px',
          fontSize: '13px',
          color: 'var(--text-primary)',
          background: 'var(--bg-app)',
          border: `1px solid ${error ? 'var(--status-danger)' : 'var(--border-default)'}`,
          borderRadius: '6px',
          outline: 'none',
          transition: 'border-color 0.15s',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error
            ? 'var(--status-danger)'
            : 'var(--border-focus)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error
            ? 'var(--status-danger)'
            : 'var(--border-default)'
        }}
      />
      {error && (
        <p style={{ fontSize: '11px', color: 'var(--status-danger)', marginTop: '2px' }}>
          {error}
        </p>
      )}
      {hint && !error && (
        <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
          {hint}
        </p>
      )}
    </div>
  )
}
