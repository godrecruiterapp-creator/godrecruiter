'use client'

import { ReactNode } from 'react'

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <div className="h-full overflow-y-auto bg-background">{children}</div>
}
