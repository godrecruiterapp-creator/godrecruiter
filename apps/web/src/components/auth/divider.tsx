export function Divider({ label = 'or' }: { label?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        margin: '4px 0',
      }}
    >
      <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '500' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
    </div>
  )
}
