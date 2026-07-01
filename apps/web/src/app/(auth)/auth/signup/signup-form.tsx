'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Mail } from 'lucide-react'
import { signupAction } from '../../actions'
import { useFormStatus } from 'react-dom'

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
      {pending ? 'Creating account…' : 'Create account'}
    </Button>
  )
}

export function SignupForm() {
  const [state, action] = useActionState(signupAction, null)

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
            <CardTitle className="text-xl">Create your account</CardTitle>
            <CardDescription>Start hiring. No credit card required.</CardDescription>
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
                  <p className="font-medium text-sm">Check your email</p>
                  <p className="text-sm text-muted-foreground mt-1">{state.success}</p>
                </div>
              </div>
            ) : (
              <form action={action} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full name</Label>
                  <Input id="full_name" name="full_name" placeholder="Alex Johnson" autoComplete="name" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Work email</Label>
                  <Input id="email" name="email" type="email" placeholder="you@company.com" autoComplete="email" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" placeholder="Min. 8 characters" autoComplete="new-password" required />
                  <p className="text-sm text-muted-foreground">At least 8 characters.</p>
                </div>

                <SubmitBtn />

                <p className="text-sm text-muted-foreground text-center">
                  By creating an account you agree to our{' '}
                  <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">Terms</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">Privacy Policy</Link>.
                </p>
              </form>
            )}
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-foreground font-medium hover:underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
