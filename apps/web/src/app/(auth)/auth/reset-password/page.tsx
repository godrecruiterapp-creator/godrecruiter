import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SessionResetForm } from './session-form'
import { CodeResetForm } from './code-form'

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2.5">
            <img src="/logo-icon-square.png" alt="" className="size-10 object-contain" />
            <span className="text-lg font-semibold tracking-tight">God Recruiter</span>
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Choose a new password</CardTitle>
            <CardDescription>
              {user ? 'Must be at least 8 characters.' : 'Enter the 6-digit code from your email, then choose a new password.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user ? <SessionResetForm /> : <CodeResetForm initialEmail={email ?? ''} />}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
