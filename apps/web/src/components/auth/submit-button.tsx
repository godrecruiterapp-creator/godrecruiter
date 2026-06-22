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
        width: '100%', height: '44px',
        background: pending ? 'var(--border-strong)' : 'var(--color-primary)',
        color: '#fff', border: 'none', borderRadius: '10px',
        fontSize: '14px', fontWeight: '600',
        cursor: pending ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s, transform 0.1s',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        letterSpacing: '-0.01em',
      }}
      onMouseEnter={(e) => { if (!pending) e.currentTarget.style.background = 'var(--color-primary-hover)' }}
      onMouseLeave={(e) => { if (!pending) e.currentTarget.style.background = 'var(--color-primary)' }}
    >
      {pending && (
        <span style={{
          width: '16px', height: '16px',
          border: '2px solid rgba(255,255,255,0.3)',
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
