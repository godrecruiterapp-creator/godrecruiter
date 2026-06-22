export function Divider({ label = 'or' }: { label?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0' }}>
      <div style={{ flex: 1, height: '1px', background: '#EBEBEB' }} />
      <span style={{ fontSize: '12px', color: '#AAAAAA' }}>{label}</span>
      <div style={{ flex: 1, height: '1px', background: '#EBEBEB' }} />
    </div>
  )
}
