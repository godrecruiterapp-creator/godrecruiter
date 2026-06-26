import { ReportsNav } from './reports-nav'

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full overflow-hidden">
      <ReportsNav />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
