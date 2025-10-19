export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '1rem'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        padding: '2rem 1rem'
      }}>
        {/* 헤더 섹션 */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
            fontWeight: '800', 
            color: '#1e293b',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            AIEEWA
          </h1>
          <p style={{ 
            fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', 
            color: '#475569',
            marginBottom: '1.5rem',
            fontWeight: '600'
          }}>
            LLM 기반 초등 영어 서술형 평가 시스템
          </p>
          <p style={{ 
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', 
            color: '#64748b',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            GPT-4o와 RAG, Self-RAG, LLM-as-a-Judge를 활용하여 초등 영어 서술형 평가 문항을 생성하고, 
            학생 답안을 자동 채점하며 맞춤형 피드백을 제공합니다.
          </p>
        </div>
        
        {/* 메인 기능 카드 */}
        <div className="container-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '2rem',
          marginBottom: '4rem'
        }}>
          {/* 문항 생성 카드 */}
          <a href="/generate" style={{ textDecoration: 'none' }}>
            <div className="feature-card" style={{ 
              backgroundColor: 'white',
              padding: '2.5rem',
              borderRadius: '1rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                height: '4px', 
                background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)'
              }}></div>
              
              <div>
                <div style={{ 
                  fontSize: '3rem', 
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}>📝</div>
                <h2 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: '#1e293b',
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  문항 생성
                </h2>
                <p style={{ 
                  color: '#64748b',
                  lineHeight: '1.6',
                  textAlign: 'center'
                }}>
                  AI를 활용하여 초등 영어 서술형 평가 문항과 채점 기준을 자동 생성합니다.
                </p>
              </div>

              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <div style={{ 
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  padding: '0.875rem 2rem',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}>
                  문항 생성하기 →
                </div>
              </div>
            </div>
          </a>

          {/* 답안 평가 카드 */}
          <a href="/evaluate" style={{ textDecoration: 'none' }}>
            <div className="feature-card" style={{ 
              backgroundColor: 'white',
              padding: '2.5rem',
              borderRadius: '1rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                height: '4px', 
                background: 'linear-gradient(90deg, #10b981, #059669)'
              }}></div>
              
              <div>
                <div style={{ 
                  fontSize: '3rem', 
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}>✅</div>
                <h2 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: '#1e293b',
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  답안 평가
                </h2>
                <p style={{ 
                  color: '#64748b',
                  lineHeight: '1.6',
                  textAlign: 'center'
                }}>
                  학생의 서술형 답안을 AI가 자동으로 채점하고 개별화된 피드백을 제공합니다.
                </p>
              </div>

              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <div style={{ 
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  padding: '0.875rem 2rem',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}>
                  답안 평가하기 →
                </div>
              </div>
            </div>
          </a>
        </div>

        {/* 시스템 특징 섹션 */}
        <div style={{ 
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '1rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            color: '#1e293b',
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            시스템 특징
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '2rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '2.5rem', 
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>🧠</div>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#1e293b',
                marginBottom: '1rem'
              }}>
                RAG 기반 문항 생성
              </h3>
              <p style={{ 
                color: '#64748b',
                lineHeight: '1.6'
              }}>
                검색 증강 생성으로 교육과정에 부합하는 고품질 문항을 생성합니다.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '2.5rem', 
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>⚡</div>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#1e293b',
                marginBottom: '1rem'
              }}>
                Self-RAG 품질 관리
              </h3>
              <p style={{ 
                color: '#64748b',
                lineHeight: '1.6'
              }}>
                생성된 문항의 품질을 자동으로 검증하고 개선합니다.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '2.5rem', 
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>🎯</div>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#1e293b',
                marginBottom: '1rem'
              }}>
                AAS 자동 채점
              </h3>
              <p style={{ 
                color: '#64748b',
                lineHeight: '1.6'
              }}>
                Few-shot 학습과 Self-RAG를 활용한 정확하고 일관된 자동 채점과 상세한 피드백을 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}