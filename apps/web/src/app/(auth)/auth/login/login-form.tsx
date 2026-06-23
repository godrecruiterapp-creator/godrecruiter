'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthCard }     from '@/components/auth/auth-card'
import { FormField }    from '@/components/auth/form-field'
import { SubmitButton } from '@/components/auth/submit-button'
import { GoogleButton } from '@/components/auth/google-button'
import { Divider }      from '@/components/auth/divider'
import { Alert }        from '@/components/auth/alert'

interface Props {
  redirectTo?: string | undefined
  reset?: string | undefined
}

export function LoginForm({ redirectTo, reset }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const form = e.currentTarget
    const email    = (form.elements.namedItem('email')    as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'same-origin',
      })

      if (!res.ok) {
        const data = await res.json()
        const msg = data.error ?? 'Something went wrong.'
        if (msg.includes('Invalid login') || msg.includes('invalid_credentials')) {
          setError('Incorrect email or password.')
        } else if (msg.includes('Email not confirmed')) {
          setError('Please verify your email before signing in.')
        } else {
          setError(msg)
        }
        setPending(false)
        return
      }

      // Cookies are now set — do a full page navigation
      window.location.replace(redirectTo ?? '/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
      setPending(false)
    }
  }

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

        {error && <Alert type="error" message={error} />}

        <GoogleButton label="Continue with Google" />

        <Divider />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
              <label htmlFor="password" style={{ fontSize: '13px', fontWeight: '500', color: '#0A0A0A' }}>
                Password
              </label>
              <Link href="/auth/forgot-password" style={{ fontSize: '12px', color: '#555555', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>
            <input
              id="password" name="password" type="password"
              placeholder="••••••••" autoComplete="current-password" required
              style={{
                width: '100%', height: '40px', padding: '0 12px',
                fontSize: '14px', color: '#0A0A0A',
                background: '#FFFFFF', border: '1px solid #E0E0E0',
                borderRadius: '6px', outline: 'none',
                transition: 'border-color 0.12s', fontFamily: 'inherit',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#0A0A0A' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E0E0E0' }}
            />
          </div>

          <SubmitButton label="Sign in" loadingLabel="Signing in…" pending={pending} />
        </form>

      </div>
    </AuthCard>
  )
}
