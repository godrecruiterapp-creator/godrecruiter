export const revalidate = 30

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, ChevronRight, Users } from 'lucide-react'

const TYPE_LABEL: Record<string, string> = {
  permanent: 'Permanent',
  contract: 'Contract',
  temp: 'Temp',
}

export default async function CandidatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  let candidates: Record<string, string | null>[] = []
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
        .select('*')
        .eq('tenant_id', membership.tenant_id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      candidates = data ?? []
    }
  } catch (err) {
    console.error('Candidates fetch error:', err)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
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

      {candidates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center">
              <Users className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">No candidates yet</p>
              <p className="text-sm text-muted-foreground mt-1">Add your first candidate to build your talent pool.</p>
            </div>
            <Button asChild size="sm" className="mt-1">
              <Link href="/dashboard/candidates/new">Add candidate</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y">
            {candidates.map((c) => {
              const name = [c.first_name, c.last_name].filter(Boolean).join(' ')
              const initials = [c.first_name?.[0], c.last_name?.[0]].filter(Boolean).join('').toUpperCase()
              const meta = [c.current_title, c.current_company, c.location].filter(Boolean).join(' · ')
              const type = TYPE_LABEL[c.candidate_type ?? ''] ?? ''

              return (
                <Link
                  key={c.id}
                  href={`/dashboard/candidates/${c.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar className="size-8 flex-shrink-0">
                      <AvatarFallback className="text-xs font-medium">{initials || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{name}</p>
                      {meta && <p className="text-xs text-muted-foreground mt-0.5 truncate">{meta}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    {type && <span className="text-xs text-muted-foreground">{type}</span>}
                    <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                  </div>
                </Link>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
