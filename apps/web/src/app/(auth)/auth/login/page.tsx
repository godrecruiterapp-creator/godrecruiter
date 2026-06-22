import type { Metadata } from 'next'
import { LoginForm } from './login-form'

export const metadata: Metadata = { title: 'Sign in' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; reset?: string }>
}) {
  const params = await searchParams
  return <LoginForm redirectTo={params.redirectTo} reset={params.reset} />
}
