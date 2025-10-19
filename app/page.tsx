export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ 
        textAlign: 'center', 
        maxWidth: '800px', 
        padding: '2rem' 
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold', 
          color: '#111827',
          marginBottom: '1rem'
        }}>
          AIEEWA
        </h1>
        <p style={{ 
          fontSize: '1.5rem', 
          color: '#6b7280',
          marginBottom: '2rem'
        }}>
          LLM 기반 초등 영어 서술형 평가 시스템
        </p>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#9ca3af',
          marginBottom: '3rem',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          GPT-4o와 RAG, Self-RAG, LLM-as-a-Judge를 활용하여 초등 영어 서술형 평가 문항을 생성하고, 
          학생 답안을 자동 채점하며 맞춤형 피드백을 제공합니다.
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem',
          marginTop: '2rem'
        }}>
          <div style={{ 
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📝</div>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '1rem'
            }}>
              문항 생성
            </h2>
            <p style={{ 
              color: '#6b7280',
              marginBottom: '1.5rem'
            }}>
              AI를 활용하여 초등 영어 서술형 평가 문항과 채점 기준을 자동 생성합니다.
            </p>
            <a 
              href="/generate" 
              style={{ 
                display: 'inline-block',
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              문항 생성하기
            </a>
          </div>

          <div style={{ 
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '1rem'
            }}>
              답안 평가
            </h2>
            <p style={{ 
              color: '#6b7280',
              marginBottom: '1.5rem'
            }}>
              학생의 서술형 답안을 AI가 자동으로 채점하고 개별화된 피드백을 제공합니다.
            </p>
            <a 
              href="/evaluate" 
              style={{ 
                display: 'inline-block',
                backgroundColor: '#16a34a',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              답안 평가하기
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}