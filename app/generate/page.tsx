import dynamic from 'next/dynamic'

const QuestionGenerator = dynamic(() => import('@/components/QuestionGenerator'), {
  loading: () => (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        color: '#6b7280'
      }}>
        <div style={{
          width: '2rem',
          height: '2rem',
          border: '2px solid #e5e7eb',
          borderTop: '2px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        문항 생성 컴포넌트 로딩 중...
      </div>
    </div>
  )
})

export default function GeneratePage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* 네비게이션 */}
      <nav style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a 
              href="/"
              style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textDecoration: 'none'
              }}
            >
              AIEEWA
            </a>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{
                padding: '0.25rem 0.75rem',
                fontSize: '0.875rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '0.5rem',
                fontWeight: '500'
              }}>
                문항 생성
              </span>
            </div>
          </div>
        </div>
      </nav>
      
      <QuestionGenerator />
      
    </div>
  )
}