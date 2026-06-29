export function Divider({ label = 'or' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2.5 my-1">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}
