import { Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { logoutAction } from '../../actions'

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <img src="/logo-icon-square.png" alt="" className="size-12 object-contain" />
            <span className="text-xl font-semibold tracking-tight">God Recruiter</span>
          </div>
        </div>

        <Card>
          <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-6">
            <div className="suspended-icon relative">
              <div className="size-20 rounded-full bg-[#dd7456]/10 flex items-center justify-center">
                <Moon className="size-8 text-[#dd7456]" />
              </div>
              <span className="zzz zzz-1">z</span>
              <span className="zzz zzz-2">z</span>
              <span className="zzz zzz-3">z</span>
            </div>

            <div>
              <h1 className="text-xl font-semibold">This workspace is taking a nap</h1>
              <p className="text-sm text-muted-foreground mt-2 max-w-[300px] mx-auto">
                Your company's workspace has been paused by a God Recruiter admin.
                Contact your workspace owner or God Recruiter support to wake it back up.
              </p>
            </div>

            <form action={logoutAction} className="w-full">
              <Button type="submit" className="w-full">Back to login</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <style>{`
        .suspended-icon {
          animation: suspended-bob 2.6s ease-in-out infinite;
        }
        .zzz {
          position: absolute;
          top: -4px;
          right: -8px;
          font-size: 14px;
          font-weight: 600;
          color: #dd7456;
          opacity: 0;
          animation: zzz-float 2.6s ease-in-out infinite;
        }
        .zzz-2 { top: -10px; right: -16px; font-size: 11px; animation-delay: 0.4s; }
        .zzz-3 { top: -16px; right: -24px; font-size: 9px; animation-delay: 0.8s; }
        @keyframes suspended-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes zzz-float {
          0% { opacity: 0; transform: translateY(4px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
