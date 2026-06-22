'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { AuthCard }     from '@/components/auth/auth-card'
import { FormField }    from '@/components/auth/form-field'
import { SubmitButton } from '@/components/auth/submit-button'
import { GoogleButton } from '@/components/auth/google-button'
import { Divider }      from '@/components/auth/divider'
import { Alert }        from '@/components/auth/alert'
import { loginAction }  from '../../actions'

interface Props {
  redirectTo?: string | undefined
  reset?: string | undefined
}

export function LoginForm({ redirectTo, reset }: Props) {
  const [state, action] = useActionState(loginAction, null)

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your God Recruiter workspace."
      footer={
        <span>
          No account?{' '}
          <Link
            href="/auth/signup"
            style={{ color: 'var(--accent-primary)', fontWeight: '500', textDecoration: 'none' }}
          >
            Create one free
          </Link>
        </span>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {reset === 'success' && (
          <Alert type="success" message="Password updated. Sign in with your new password." />
        )}

        {state?.error && <Alert type="error" message={state.error} />}

        <GoogleButton label="Continue with Google" />

        <Divider />

        <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input type="hidden" name="redirectTo" value={redirectTo ?? ''} />

          <FormField
            label="Work email"
            name="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            required
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label
                htmlFor="password"
                style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}
              >
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                style={{ fontSize: '12px', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: '500' }}
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              style={{
                width: '100%', height: '42px', padding: '0 14px',
                fontSize: '14px', color: 'var(--text-primary)',
                background: 'var(--bg-app)',
                border: '1.5px solid var(--border-default)',
                borderRadius: '8px', outline: 'none',
                transition: 'border-color 0.15s',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(3,105,161,0.12)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>

          <SubmitButton label="Sign in" loadingLabel="Signing in…" />
        </form>

      </div>
    </AuthCard>
  )
}
