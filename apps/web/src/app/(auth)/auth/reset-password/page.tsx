'use client'

import { useActionState } from 'react'
import { AuthCard }           from '@/components/auth/auth-card'
import { FormField }          from '@/components/auth/form-field'
import { SubmitButton }       from '@/components/auth/submit-button'
import { Alert }              from '@/components/auth/alert'
import { resetPasswordAction } from '../actions'

export default function ResetPasswordPage() {
  const [state, action] = useActionState(resetPasswordAction, null)

  return (
    <AuthCard
      title="Choose a new password"
      subtitle="Your new password must be at least 8 characters."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {state?.error && <Alert type="error" message={state.error} />}

        <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <FormField
            label="New password"
            name="password"
            type="password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            required
          />
          <FormField
            label="Confirm new password"
            name="confirm"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
          <SubmitButton label="Update password" loadingLabel="Updating…" />
        </form>
      </div>
    </AuthCard>
  )
}
