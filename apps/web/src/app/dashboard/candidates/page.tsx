export const revalidate = 30

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CandidatesTable } from './candidates-table'
import type { CandidateRow } from './candidates-table'

export default async function CandidatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  let candidates: CandidateRow[] = []
  try {
    const admin = createAdminClient()
    const { data: membership } = await admin
      .from('platform_user_tenants')
      .select('tenant_id')
      .eq('platform_user_id', user.id)
      .eq('is_active', true)
      .single()

    if (membership) {
      const { data } = await admin
        .from('candidates')
        .select('id, first_name, last_name, current_title, current_company, email, phone, location, candidate_type, notice_period, expected_ctc, source, created_at, updated_at')
        .eq('tenant_id', membership.tenant_id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      candidates = (data ?? []) as CandidateRow[]
    }
  } catch (err) {
    console.error('Candidates fetch error:', err)
  }

  return (
    <div className="flex flex-col h-full p-6 gap-4 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Candidates</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {candidates.length} {candidates.length === 1 ? 'candidate' : 'candidates'}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard/candidates/new">
            <Plus className="size-3.5 mr-1.5" />
            Add candidate
          </Link>
        </Button>
      </div>

      <CandidatesTable candidates={candidates} />
    </div>
  )
}
