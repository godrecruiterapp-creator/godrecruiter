'use client'

import { ReactNode } from 'react'

export function AuthBackground({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-muted/30">
      <div
        className="auth-bg-pan absolute inset-0"
        style={{ backgroundImage: "url('/auth-bg.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      <div className="relative z-10 w-full flex items-center justify-center">{children}</div>

      <style>{`
        .auth-bg-pan {
          animation: auth-bg-pan 24s ease-in-out infinite alternate;
        }
        @keyframes auth-bg-pan {
          0%   { transform: scale(1)     translate(0, 0); }
          50%  { transform: scale(1.08)  translate(-1.5%, 1%); }
          100% { transform: scale(1)     translate(0, 0); }
        }
      `}</style>
    </div>
  )
}
