import { InterviewsNav } from './interviews-nav'

export default function InterviewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full overflow-hidden">
      <InterviewsNav />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
