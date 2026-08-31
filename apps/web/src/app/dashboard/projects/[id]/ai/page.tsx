'use client'

import { Sparkles } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'

export default function ProjectAIPage() {
  return (
    <div className="h-full overflow-y-auto p-5">
      <EmptyState icon={Sparkles} title="No AI insights yet"
        description="Add candidates to this project and AI ranking, outreach drafts, and insights will appear here." />
    </div>
  )
}
