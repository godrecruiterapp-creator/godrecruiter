'use client'

interface AlertProps {
  type: 'error' | 'success' | 'info'
  message: string
}

const styles = {
  error:   { bg: 'var(--status-danger-bg)',  border: 'var(--status-danger)',  color: '#b91c1c' },
  success: { bg: 'var(--status-success-bg)', border: 'var(--status-success)', color: '#065f46' },
  info:    { bg: 'var(--status-info-bg)',    border: 'var(--status-info)',    color: '#1e40af' },
}

export function Alert({ type, message }: AlertProps) {
  const s = styles[type]
  return (
    <div
      role="alert"
      style={{
        padding: '10px 12px',
        borderRadius: '6px',
        background: s.bg,
        border: `1px solid ${s.border}`,
        fontSize: '12px',
        color: s.color,
        lineHeight: '1.5',
      }}
    >
      {message}
    </div>
  )
}
