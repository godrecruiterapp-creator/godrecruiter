'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import { resetPasswordAction } from '../../actions'
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

export default function ResetPasswordPage() {
  const [state, action] = useActionState(resetPasswordAction, null)

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
            <CardTitle className="text-xl">Choose a new password</CardTitle>
            <CardDescription>Must be at least 8 characters.</CardDescription>
          </CardHeader>
          <CardContent>
            {state?.error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="size-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            <form action={action} className="space-y-4">
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
