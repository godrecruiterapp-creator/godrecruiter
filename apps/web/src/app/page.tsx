import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

// Root page — forwards auth codes from Supabase email confirmations to the
// callback handler, then redirects all other visitors to login.
export default async function RootPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const code = params['code']

  if (code) {
    redirect(`/auth/callback?code=${code}`)
  }

  redirect('/auth/login')
}
