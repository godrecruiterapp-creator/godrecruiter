export const revalidate = 60

export default function DashboardPage() {
  const stats = [
    { label: 'Active Jobs',      value: '0', sub: 'No jobs posted yet'     },
    { label: 'Total Candidates', value: '0', sub: 'No candidates yet'      },
    { label: 'Interviews Today', value: '0', sub: 'Nothing scheduled'      },
    { label: 'Offers Pending',   value: '0', sub: 'All clear'              },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '960px' }}>

      {/* Page title */}
      <div>
        <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#0A0A0A', margin: 0, letterSpacing: '-0.02em' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '13px', color: '#777777', margin: '4px 0 0' }}>
          Here&apos;s a summary of your workspace.
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {stats.map(({ label, value, sub }) => (
          <div key={label} style={{
            background: '#FFFFFF',
            border: '1px solid #EBEBEB',
            borderRadius: '8px',
            padding: '18px 20px',
          }}>
            <p style={{ fontSize: '12px', fontWeight: '500', color: '#999999', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {label}
            </p>
            <p style={{ fontSize: '28px', fontWeight: '600', color: '#0A0A0A', margin: '0 0 4px', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {value}
            </p>
            <p style={{ fontSize: '12px', color: '#AAAAAA', margin: 0 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Getting started */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #EBEBEB',
        borderRadius: '8px',
        padding: '24px',
      }}>
        <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#0A0A0A', margin: '0 0 6px', letterSpacing: '-0.015em' }}>
          Get started
        </h2>
        <p style={{ fontSize: '13px', color: '#777777', margin: '0 0 18px', lineHeight: 1.6 }}>
          Your workspace is ready. Post your first job to start receiving applications.
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <a href="/dashboard/jobs/new" style={{
            padding: '8px 16px', borderRadius: '6px',
            fontSize: '13px', fontWeight: '500',
            textDecoration: 'none',
            background: '#0A0A0A', color: '#FFFFFF',
            display: 'inline-block',
          }}>
            Post a job
          </a>
          <a href="/dashboard/candidates/new" style={{
            padding: '8px 16px', borderRadius: '6px',
            fontSize: '13px', fontWeight: '500',
            textDecoration: 'none',
            background: '#FFFFFF', color: '#0A0A0A',
            border: '1px solid #E0E0E0',
            display: 'inline-block',
          }}>
            Add candidate
          </a>
        </div>
      </div>

    </div>
  )
}
