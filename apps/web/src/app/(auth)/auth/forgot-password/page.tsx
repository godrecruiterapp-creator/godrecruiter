'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, ArrowLeft, Mail } from 'lucide-react'
import { forgotPasswordAction } from '../../actions'
import { useFormStatus } from 'react-dom'

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
      {pending ? 'Sending…' : 'Send reset link'}
    </Button>
  )
}

export default function ForgotPasswordPage() {
  const [state, action] = useActionState(forgotPasswordAction, null)

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
            <CardTitle className="text-xl">Reset your password</CardTitle>
            <CardDescription>Enter your email and we&apos;ll send you a reset link.</CardDescription>
          </CardHeader>

          <CardContent>
            {state?.error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="size-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            {state?.success ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                  <Mail className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">Check your inbox</p>
                  <p className="text-sm text-muted-foreground mt-1">{state.success}</p>
                </div>
              </div>
            ) : (
              <form action={action} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Work email</Label>
                  <Input id="email" name="email" type="email" placeholder="you@company.com" autoComplete="email" required />
                </div>
                <SubmitBtn />
              </form>
            )}
          </CardContent>

          <CardFooter className="justify-center">
            <Link href="/auth/login" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="size-3.5" />
              Back to sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
