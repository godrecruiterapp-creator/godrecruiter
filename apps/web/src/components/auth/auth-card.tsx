'use client'

import Link from 'next/link'

interface AuthCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-4 py-6">
      <div className="w-full max-w-[380px]">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline mb-9">
          <div className="w-[26px] h-[26px] rounded-[6px] bg-foreground flex items-center justify-center text-[13px] font-bold text-white">
            G
          </div>
          <span className="text-[14px] font-semibold text-foreground tracking-tight">
            God Recruiter
          </span>
        </Link>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-[20px] font-semibold text-foreground tracking-tight leading-tight m-0 mb-1.5">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[14px] text-muted-foreground leading-relaxed m-0">{subtitle}</p>
          )}
        </div>

        {/* Form */}
        {children}

        {/* Footer */}
        {footer && (
          <div className="mt-5 text-[13px] text-muted-foreground text-center">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
