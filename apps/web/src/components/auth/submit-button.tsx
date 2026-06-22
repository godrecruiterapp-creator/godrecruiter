'use client'

import { useFormStatus } from 'react-dom'

interface SubmitButtonProps {
  label: string
  loadingLabel?: string
}

export function SubmitButton({ label, loadingLabel }: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        width: '100%', height: '40px',
        background: pending ? '#555555' : '#0A0A0A',
        color: '#FFFFFF', border: 'none', borderRadius: '6px',
        fontSize: '14px', fontWeight: '500',
        cursor: pending ? 'not-allowed' : 'pointer',
        transition: 'background 0.12s',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        fontFamily: 'inherit',
        letterSpacing: '-0.01em',
      }}
      onMouseEnter={(e) => { if (!pending) e.currentTarget.style.background = '#222222' }}
      onMouseLeave={(e) => { if (!pending) e.currentTarget.style.background = '#0A0A0A' }}
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
