'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import { verifyResetCodeAction } from '../../actions'
import { useFormStatus } from 'react-dom'

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
      {pending ? 'Updating…' : 'Update password'}
    </Button>
  )
}

export function CodeResetForm({ initialEmail }: { initialEmail: string }) {
  const [state, action] = useActionState(verifyResetCodeAction, null)

  return (
    <>
      {state?.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="size-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <form action={action} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" name="email" type="email" placeholder="you@company.com" autoComplete="email"
            defaultValue={initialEmail} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Code from your email</Label>
          <Input id="code" name="code" type="text" inputMode="numeric" placeholder="123456789" autoComplete="one-time-code" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" placeholder="Min. 8 characters" autoComplete="new-password" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input id="confirm" name="confirm" type="password" placeholder="••••••••" autoComplete="new-password" required />
        </div>
        <SubmitBtn />
      </form>
    </>
  )
}
