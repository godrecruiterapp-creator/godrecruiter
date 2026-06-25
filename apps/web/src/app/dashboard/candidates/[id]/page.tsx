import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CandidateDetailClient } from './candidate-detail-client'
import type { CandidateDetailData } from './candidate-detail-client'

export default async function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const { data: candidate } = await admin
    .from('candidates')
    .select('id, candidate_number, first_name, last_name, email, phone, location, linkedin_url, source, current_title, current_company, candidate_type, notice_period, current_ctc, expected_ctc, notes, created_at, updated_at')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!candidate) notFound()

  return <CandidateDetailClient candidate={candidate as CandidateDetailData} />
}
