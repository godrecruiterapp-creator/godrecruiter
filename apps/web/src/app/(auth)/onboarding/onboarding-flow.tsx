'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AuthCard }     from '@/components/auth/auth-card'
import { FormField }    from '@/components/auth/form-field'
import { SubmitButton } from '@/components/auth/submit-button'
import { Alert }        from '@/components/auth/alert'
import { createWorkspaceAction } from './actions'

interface Props {
  userEmail: string
  userFullName: string
}

type Step = 'workspace' | 'creating' | 'done'

export function OnboardingFlow({ userEmail, userFullName }: Props) {
  const [step, setStep]     = useState<Step>('workspace')
  const [error, setError]   = useState<string | null>(null)
  const [slug, setSlug]     = useState('')
  const [name, setName]     = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function toSlug(val: string) {
    return val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setName(val)
    setSlug(toSlug(val))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setStep('creating')

    startTransition(async () => {
      const result = await createWorkspaceAction({ name, slug })
      if (result?.error) {
        setError(result.error)
        setStep('workspace')
      } else if (result?.redirectTo) {
        router.push(result.redirectTo)
      }
    })
  }

  if (step === 'creating') {
    return (
      <AuthCard title="Setting up your workspace…" subtitle="This only takes a moment.">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '16px 0' }}>
          <div style={{
            width: '40px', height: '40px',
            border: '3px solid var(--border-subtle)',
            borderTopColor: 'var(--accent-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Creating your private workspace…
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Create your workspace"
      subtitle={`Welcome, ${userFullName || userEmail}. Set up your God Recruiter workspace.`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
          {['Workspace', 'Invite team', 'Done'].map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: i === 0 ? 'var(--accent-primary)' : 'var(--bg-subtle)',
                border: `1px solid ${i === 0 ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: '700',
                color: i === 0 ? '#fff' : 'var(--text-tertiary)',
                flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <span style={{ fontSize: '10px', color: i === 0 ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: i === 0 ? '600' : '400' }}>
                {label}
              </span>
              {i < 2 && <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />}
            </div>
          ))}
        </div>

        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>
              Workspace name <span style={{ color: 'var(--status-danger)' }}>*</span>
            </label>
            <input
              name="name"
              value={name}
              onChange={handleNameChange}
              placeholder="Acme Staffing"
              required
              style={{
                width: '100%', height: '36px', padding: '0 12px',
                fontSize: '13px', color: 'var(--text-primary)',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-default)',
                borderRadius: '6px', outline: 'none',
              }}
            />
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              This is usually your company or agency name.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>
              Workspace URL <span style={{ color: 'var(--status-danger)' }}>*</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-default)', borderRadius: '6px', overflow: 'hidden', background: 'var(--bg-app)' }}>
              <span style={{
                padding: '0 10px', height: '36px', display: 'flex', alignItems: 'center',
                fontSize: '12px', color: 'var(--text-tertiary)',
                background: 'var(--bg-subtle)',
                borderRight: '1px solid var(--border-default)',
                whiteSpace: 'nowrap',
              }}>
                app.godrecruiter.com/
              </span>
              <input
                name="slug"
                value={slug}
                onChange={(e) => setSlug(toSlug(e.target.value))}
                placeholder="acme-staffing"
                required
                style={{
                  flex: 1, height: '36px', padding: '0 10px',
                  fontSize: '13px', color: 'var(--text-primary)',
                  background: 'transparent', border: 'none', outline: 'none',
                }}
              />
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              Only lowercase letters, numbers, and hyphens.
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending || !name || !slug}
            style={{
              width: '100%', height: '38px',
              background: (!name || !slug) ? 'var(--text-disabled)' : 'var(--accent-primary)',
              color: '#fff', border: 'none', borderRadius: '6px',
              fontSize: '13px', fontWeight: '600',
              cursor: (!name || !slug) ? 'not-allowed' : 'pointer',
            }}
          >
            Create workspace →
          </button>
        </form>
      </div>
    </AuthCard>
  )
}
