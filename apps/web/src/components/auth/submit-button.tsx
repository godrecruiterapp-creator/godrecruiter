'use client'

import { useFormStatus } from 'react-dom'

interface SubmitButtonProps {
  label: string
  loadingLabel?: string
  pending?: boolean
}

export function SubmitButton({ label, loadingLabel, pending: pendingProp }: SubmitButtonProps) {
  const { pending: formPending } = useFormStatus()
  const pending = pendingProp ?? formPending

  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        width: '100%', height: '40px',
        background: pending ? '#eb9678' : '#dd7456',
        color: '#FFFFFF', border: 'none', borderRadius: '6px',
        fontSize: '14px', fontWeight: '500',
        cursor: pending ? 'not-allowed' : 'pointer',
        transition: 'background 0.12s',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        fontFamily: 'inherit',
        letterSpacing: '-0.01em',
      }}
      onMouseEnter={(e) => { if (!pending) e.currentTarget.style.background = '#c45e3e' }}
      onMouseLeave={(e) => { if (!pending) e.currentTarget.style.background = '#dd7456' }}
    >
      {pending && (
        <span style={{
          width: '14px', height: '14px',
          border: '1.5px solid rgba(255,255,255,0.3)',
          borderTopColor: '#fff', borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
          display: 'inline-block', flexShrink: 0,
        }} />
      )}
      {pending ? (loadingLabel ?? label) : label}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  )
}
