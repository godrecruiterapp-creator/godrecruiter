export default function DashboardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'Active Jobs',       value: '0', sub: 'No jobs yet'       },
          { label: 'Total Candidates',  value: '0', sub: 'No candidates yet' },
          { label: 'Interviews Today',  value: '0', sub: 'Nothing scheduled' },
          { label: 'Offers Pending',    value: '0', sub: 'All clear'         },
        ].map(({ label, value, sub }) => (
          <div key={label} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '10px',
            padding: '20px',
          }}>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '0 0 6px', fontWeight: '500' }}>{label}</p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>{value}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Getting started */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: '10px',
        padding: '28px',
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px' }}>
          Welcome to God Recruiter
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 20px' }}>
          Your workspace is set up. Start by creating your first job.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          {[
            { label: 'Post a job',        href: '/dashboard/jobs/new',   primary: true  },
            { label: 'Add a candidate',   href: '/dashboard/candidates/new', primary: false },
          ].map(({ label, href, primary }) => (
            <a
              key={label}
              href={href}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                textDecoration: 'none',
                background: primary ? 'var(--accent-primary)' : 'var(--bg-subtle)',
                color: primary ? '#fff' : 'var(--text-primary)',
                border: primary ? 'none' : '1px solid var(--border-default)',
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </div>

    </div>
  )
}
