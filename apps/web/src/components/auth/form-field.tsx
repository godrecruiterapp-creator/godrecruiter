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
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-[13px] font-medium text-foreground">
        {label}
        {required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      <input
        id={name} name={name} type={type}
        placeholder={placeholder} required={required}
        autoComplete={autoComplete} defaultValue={defaultValue}
        className={`w-full h-10 px-3 text-sm text-foreground bg-background rounded-md outline-none transition-colors font-[inherit] ${
          error
            ? 'border border-red-500 focus:border-red-500'
            : 'border border-input focus:border-foreground'
        }`}
      />
      {error && <p className="text-[12px] text-red-600 m-0">{error}</p>}
      {hint && !error && <p className="text-[12px] text-muted-foreground m-0">{hint}</p>}
    </div>
  )
}
