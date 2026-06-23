import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { deleteCandidateAction } from '../actions'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default async function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const { data: candidate } = await admin
    .from('candidates')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!candidate) notFound()

  const name = [candidate.first_name, candidate.last_name].filter(Boolean).join(' ')
  const initials = [candidate.first_name?.[0], candidate.last_name?.[0]].filter(Boolean).join('').toUpperCase()

  const typeLabel: Record<string, string> = {
    permanent: 'Permanent', contract: 'Contract', temp: 'Temp', unknown: 'Unknown',
  }

  const chips = [
    candidate.current_title,
    candidate.current_company,
    candidate.location,
    typeLabel[candidate.candidate_type] !== 'Unknown' ? typeLabel[candidate.candidate_type] : null,
    candidate.notice_period ? `${candidate.notice_period} notice` : null,
  ].filter(Boolean)

  const formatCTC = (val: number | null) => val ? `₹${(val / 100000).toFixed(1)}L` : null
  const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/candidates">
            <ArrowLeft className="size-3.5 mr-1.5" />
            Back
          </Link>
        </Button>
        <form action={async () => { 'use server'; await deleteCandidateAction(id) }}>
          <Button type="submit" variant="destructive" size="sm">Delete</Button>
        </form>
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="flex items-start gap-4 mb-3">
            <Avatar className="size-12 flex-shrink-0">
              <AvatarFallback className="text-base font-semibold">{initials || '?'}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">{name}</h1>
              {candidate.email && <p className="text-sm text-muted-foreground mt-0.5">{candidate.email}</p>}
            </div>
          </div>
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {chips.map((val) => (
                <span key={String(val)} className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-md">
                  {String(val)}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Contact</CardTitle></CardHeader>
        <CardContent className="space-y-0 divide-y">
          <InfoRow label="Email" value={candidate.email} href={`mailto:${candidate.email}`} />
          <InfoRow label="Phone" value={candidate.phone} href={candidate.phone ? `tel:${candidate.phone}` : null} />
          <InfoRow label="LinkedIn" value={candidate.linkedin_url ? 'View profile' : null} href={candidate.linkedin_url} external />
          <InfoRow label="Source" value={candidate.source ? capitalise(candidate.source) : null} />
        </CardContent>
      </Card>

      {(candidate.current_ctc || candidate.expected_ctc) && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Compensation</CardTitle></CardHeader>
          <CardContent className="space-y-0 divide-y">
            <InfoRow label="Current CTC" value={formatCTC(candidate.current_ctc as unknown as number)} />
            <InfoRow label="Expected CTC" value={formatCTC(candidate.expected_ctc as unknown as number)} />
          </CardContent>
        </Card>
      )}

      {candidate.notes && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Notes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{candidate.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function InfoRow({ label, value, href, external }: {
  label: string; value: string | null | undefined; href?: string | null; external?: boolean
}) {
  if (!value) return null
  return (
    <div className="flex items-center py-2.5">
      <span className="text-xs text-muted-foreground w-28 flex-shrink-0">{label}</span>
      {href ? (
        <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}
          className="text-sm hover:underline underline-offset-2">
          {value}
        </a>
      ) : (
        <span className="text-sm">{value}</span>
      )}
    </div>
  )
}
