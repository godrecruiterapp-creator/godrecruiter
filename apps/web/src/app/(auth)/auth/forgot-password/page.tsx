'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { AuthCard }            from '@/components/auth/auth-card'
import { FormField }           from '@/components/auth/form-field'
import { SubmitButton }        from '@/components/auth/submit-button'
import { Alert }               from '@/components/auth/alert'
import { forgotPasswordAction } from '../../actions'

export default function ForgotPasswordPage() {
  const [state, action] = useActionState(forgotPasswordAction, null)

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link
          href="/auth/login"
          style={{ color: 'var(--accent-primary)', fontWeight: '500', textDecoration: 'none' }}
        >
          ← Back to sign in
        </Link>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {state?.error   && <Alert type="error"   message={state.error}   />}
        {state?.success && <Alert type="success" message={state.success} />}

        {!state?.success && (
          <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <FormField
              label="Work email"
              name="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              required
            />
            <SubmitButton label="Send reset link" loadingLabel="Sending…" />
          </form>
        )}
      </div>
    </AuthCard>
  )
}
