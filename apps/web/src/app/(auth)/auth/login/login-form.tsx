'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'

interface Props {
  redirectTo?: string | undefined
  reset?: string | undefined
}

export function LoginForm({ redirectTo, reset }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [linkExpired, setLinkExpired] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // Supabase redirects failed email-link verifications (expired/already-used
  // recovery or invite links) here with the error in the URL hash — the server
  // never sees a hash, so this has to be read client-side.
  useEffect(() => {
    if (!window.location.hash) return
    const params = new URLSearchParams(window.location.hash.slice(1))
    if (params.get('error')) setLinkExpired(true)
    history.replaceState(null, '', window.location.pathname + window.location.search)
  }, [])

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
        body: JSON.stringify({ email, password, rememberMe }),
        credentials: 'same-origin',
      })

      const data = await res.json()

      if (!res.ok) {
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

      window.location.replace(data.redirectTo ?? redirectTo ?? '/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
      setPending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <img src="/logo-icon-square.png" alt="" className="size-12 object-contain" />
            <span className="text-xl font-semibold tracking-tight">God Recruiter</span>
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your workspace</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {reset === 'success' && (
                <Alert className="border-success/30 bg-success/5 text-success">
                  <CheckCircle2 className="size-4" />
                  <AlertDescription>Password updated. Sign in with your new password.</AlertDescription>
                </Alert>
              )}

              {linkExpired && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>
                    That link expired or was already used.{' '}
                    <Link href="/auth/forgot-password" className="font-medium underline underline-offset-2">
                      Request a new code
                    </Link>{' '}
                    instead.
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/auth/forgot-password" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span key={String(showPassword)} className="inline-block eye-wink">
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="remember" checked={rememberMe} onCheckedChange={v => setRememberMe(v === true)} />
                <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground cursor-pointer">
                  Remember me
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={pending}>
                {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
                {pending ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <style>{`
        .eye-wink { animation: eye-wink 0.4s ease; }
        @keyframes eye-wink {
          0%   { transform: scaleY(1); }
          40%  { transform: scaleY(0.1); }
          70%  { transform: scaleY(1.2); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  )
}
