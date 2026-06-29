'use client'

interface AlertProps {
  type: 'error' | 'success' | 'info'
  message: string
}

const config = {
  error:   'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400',
  success: 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400',
  info:    'bg-muted border-border text-muted-foreground',
}

const dotColor = {
  error:   'bg-red-500',
  success: 'bg-emerald-500',
  info:    'bg-foreground',
}

export function Alert({ type, message }: AlertProps) {
  return (
    <div role="alert" className={`flex gap-2 items-start px-3.5 py-2.5 rounded-md border text-[13px] leading-relaxed ${config[type]}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-[5px] ${dotColor[type]}`} />
      <span>{message}</span>
    </div>
  )
}
