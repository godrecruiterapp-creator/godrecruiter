'use client'

interface AlertProps {
  type: 'error' | 'success' | 'info'
  message: string
}

const styles = {
  error:   { bg: '#FEF2F2', border: '#FECACA', color: '#991B1B', icon: '✕' },
  success: { bg: '#F0FDF4', border: '#BBF7D0', color: '#166534', icon: '✓' },
  info:    { bg: '#EFF6FF', border: '#BFDBFE', color: '#1E40AF', icon: 'ℹ' },
}

export function Alert({ type, message }: AlertProps) {
  const s = styles[type]
  return (
    <div role="alert" style={{
      padding: '12px 14px',
      borderRadius: '8px',
      background: s.bg,
      border: `1px solid ${s.border}`,
      fontSize: '13px',
      color: s.color,
      lineHeight: '1.5',
      display: 'flex',
      gap: '10px',
      alignItems: 'flex-start',
    }}>
      <span style={{ fontWeight: '700', flexShrink: 0, fontSize: '12px', marginTop: '1px' }}>{s.icon}</span>
      <span>{message}</span>
    </div>
  )
}
