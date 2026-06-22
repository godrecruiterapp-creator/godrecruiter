'use client'

interface AlertProps {
  type: 'error' | 'success' | 'info'
  message: string
}

const config = {
  error:   { bg: '#FFF1F1', border: '#FECACA', color: '#991B1B', dot: '#DC2626' },
  success: { bg: '#F0FDF4', border: '#BBF7D0', color: '#166534', dot: '#16A34A' },
  info:    { bg: '#F9F9F9', border: '#E0E0E0', color: '#333333', dot: '#0A0A0A' },
}

export function Alert({ type, message }: AlertProps) {
  const c = config[type]
  return (
    <div role="alert" style={{
      padding: '11px 14px',
      borderRadius: '6px',
      background: c.bg,
      border: `1px solid ${c.border}`,
      fontSize: '13px', color: c.color,
      lineHeight: 1.5,
      display: 'flex', gap: '8px', alignItems: 'flex-start',
    }}>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: c.dot, flexShrink: 0, marginTop: '5px',
      }} />
      <span>{message}</span>
    </div>
  )
}
