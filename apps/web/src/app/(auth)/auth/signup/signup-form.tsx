'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { AuthCard }      from '@/components/auth/auth-card'
import { FormField }     from '@/components/auth/form-field'
import { SubmitButton }  from '@/components/auth/submit-button'
import { GoogleButton }  from '@/components/auth/google-button'
import { Divider }       from '@/components/auth/divider'
import { Alert }         from '@/components/auth/alert'
import { signupAction }  from '../../actions'

export function SignupForm() {
  const [state, action] = useActionState(signupAction, null)

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start your 14-day free trial. No credit card required."
      footer={
        <span>
          Already have an account?{' '}
          <Link
            href="/auth/login"
            style={{ color: 'var(--accent-primary)', fontWeight: '500', textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </span>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {state?.error   && <Alert type="error"   message={state.error}   />}
        {state?.success && <Alert type="success" message={state.success} />}

        {!state?.success && (
          <>
            <GoogleButton label="Sign up with Google" />

            <Divider />

            <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <FormField
                label="Full name"
                name="full_name"
                placeholder="Alex Johnson"
                autoComplete="name"
                required
              />
              <FormField
                label="Work email"
                name="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
              <FormField
                label="Password"
                name="password"
                type="password"
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                required
                hint="At least 8 characters."
              />

              <SubmitButton label="Create account" loadingLabel="Creating account…" />

              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center', lineHeight: '1.5' }}>
                By creating an account you agree to our{' '}
                <Link href="/terms" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </>
        )}
      </div>
    </AuthCard>
  )
}
