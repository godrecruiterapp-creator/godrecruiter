'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

function Toaster({ ...props }: ToasterProps) {
  const { resolvedTheme } = useTheme()

  return (
    <Sonner
      theme={(resolvedTheme === 'dark' ? 'dark' : resolvedTheme === 'light' ? 'light' : 'system') as 'light' | 'dark' | 'system'}
      className="toaster group"
      style={{
        '--normal-bg': 'var(--popover)',
        '--normal-text': 'var(--popover-foreground)',
        '--normal-border': 'var(--border)',
      } as React.CSSProperties}
      {...props}
    />
  )
}

export { Toaster }
