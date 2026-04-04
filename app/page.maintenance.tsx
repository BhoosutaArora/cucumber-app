export default function Maintenance() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#f0faf0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      padding: '24px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '24px' }}>🥒</div>
      <h1 style={{
        fontSize: '28px', fontWeight: 900,
        color: '#2E7D32', marginBottom: '12px'
      }}>
        We are upgrading!
      </h1>
      <p style={{
        fontSize: '16px', color: '#6B7280',
        maxWidth: '400px', lineHeight: 1.6, marginBottom: '32px'
      }}>
        Cucumber is getting better for you. We will be back very soon!
      </p>
      <a
        href="https://instagram.com/cucumbertravel.in"
        target="_blank"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: '#fff', border: '1px solid #d1fae5',
          borderRadius: '12px', padding: '12px 24px',
          textDecoration: 'none', color: '#2E7D32',
          fontWeight: 700, fontSize: '14px'
        }}
      >
        📸 Follow us for updates @cucumbertravel.in
      </a>
    </main>
  )
}