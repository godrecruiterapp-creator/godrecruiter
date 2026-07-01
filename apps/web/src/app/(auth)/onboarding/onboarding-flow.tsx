'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import { createWorkspaceAction } from './actions'

interface Props {
  userEmail: string
  userFullName: string
}

export function OnboardingFlow({ userEmail, userFullName }: Props) {
  const [step, setStep]     = useState<'workspace' | 'creating'>('workspace')
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
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Setting up your workspace…</CardTitle>
              <CardDescription>This only takes a moment.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-foreground flex items-center justify-center text-background font-bold text-sm">G</div>
            <span className="text-lg font-semibold tracking-tight">God Recruiter</span>
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Create your workspace</CardTitle>
            <CardDescription>Welcome, {userFullName || userEmail}. Set up your God Recruiter workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="size-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Workspace name <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Acme Staffing"
                  required
                />
                <p className="text-sm text-muted-foreground">Usually your company or agency name.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slug">Workspace URL <span className="text-destructive">*</span></Label>
                <div className="flex rounded-md border border-input overflow-hidden focus-within:ring-1 focus-within:ring-ring">
                  <span className="flex items-center px-3 bg-muted text-muted-foreground text-sm border-r border-input whitespace-nowrap">
                    app.godrecruiter.com/
                  </span>
                  <input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(toSlug(e.target.value))}
                    placeholder="acme-staffing"
                    required
                    className="flex-1 h-9 px-3 text-sm bg-transparent outline-none"
                  />
                </div>
                <p className="text-sm text-muted-foreground">Lowercase letters, numbers, and hyphens only.</p>
              </div>

              <Button type="submit" className="w-full" disabled={isPending || !name || !slug}>
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Create workspace →
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
