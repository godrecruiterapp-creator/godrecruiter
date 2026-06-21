import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingFlow } from './onboarding-flow'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const fullName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    ''

  return <OnboardingFlow userEmail={user.email!} userFullName={fullName} />
}
