'use client'

import { BarChart3 } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'

export default function ProjectAnalyticsPage() {
  return (
    <div className="h-full overflow-y-auto p-5">
      <EmptyState icon={BarChart3} title="No analytics yet"
        description="Once this project has candidates moving through the pipeline, funnel, source, and recruiter analytics will appear here." />
    </div>
  )
}
