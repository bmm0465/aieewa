'use client'

import { useState } from 'react'

interface GeneratedQuestion {
  단원_및_학년: string
  예시문: string
  평가문항: string
  조건: string
  모범_답안_1: string
  모범_답안_2: string
  분석적_채점_기준_1: string
  분석적_채점_기준_2: string
  분석적_채점_기준_3: string
  총체적_채점_기준_A: string
  총체적_채점_기준_B: string
  총체적_채점_기준_C: string
  성취수준별_예시_답안_A: string
  성취수준별_예시_답안_B: string
  성취수준별_예시_답안_C: string
  성취수준별_평가에_따른_예시_피드백_A: string
  성취수준별_평가에_따른_예시_피드백_B: string
  성취수준별_평가에_따른_예시_피드백_C: string
}

export default function QuestionGenerator() {
  const [request, setRequest] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuestion, setGeneratedQuestion] = useState<GeneratedQuestion | null>(null)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!request.trim()) {
      setError('문항 생성 요청을 입력해주세요.')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      console.log('문항 생성 요청 시작:', request)
      
      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ request }),
      })

      console.log('API 응답 상태:', response.status)
      const data = await response.json()
      console.log('API 응답 데이터:', data)

      if (!response.ok) {
        throw new Error(data.error || '문항 생성에 실패했습니다.')
      }

      // API 응답 구조에 맞게 수정
      if (data.success && data.question) {
        setGeneratedQuestion(data.question)
      } else {
        throw new Error('응답 데이터 형식이 올바르지 않습니다.')
      }
    } catch (error) {
      console.error('문항 생성 오류:', error)
      setError(error instanceof Error ? error.message : '문항 생성에 실패했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '2rem',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          <div style={{ 
            fontSize: '1.5rem',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>📝</div>
          <h1 style={{ 
            fontSize: '1.875rem', 
            fontWeight: '700', 
            color: '#1e293b',
            margin: 0
          }}>
            영어 서술형 평가 문항 생성
          </h1>
        </div>
        <p style={{ 
          color: '#64748b',
          fontSize: '1.1rem',
          lineHeight: '1.6'
        }}>
          AI를 활용하여 초등 영어 서술형 평가 문항과 채점 기준을 생성합니다.
        </p>
      </div>

      {/* 입력 폼 */}
      <div style={{ 
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0',
        marginBottom: '2rem'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.75rem'
          }}>
            문항 생성 요청
          </label>
          <textarea
            placeholder="예: 5학년 9단원 My Favorite Subject Is Science 영어 서술형 평가 문항과 채점 기준을 생성해줘."
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              padding: '0.875rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb'
            }}
          />
        </div>
        
        {error && (
          <div style={{
            color: '#dc2626',
            fontSize: '0.875rem',
            backgroundColor: '#fef2f2',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid #fecaca',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !request.trim()}
          style={{
            width: '100%',
            padding: '0.875rem 1.5rem',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: isGenerating || !request.trim() ? 'not-allowed' : 'pointer',
            background: isGenerating || !request.trim() 
              ? '#9ca3af' 
              : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white',
            boxShadow: isGenerating || !request.trim() 
              ? 'none' 
              : '0 4px 12px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          {isGenerating ? (
            <>
              <div style={{
                width: '1rem',
                height: '1rem',
                border: '2px solid transparent',
                borderTop: '2px solid currentColor',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              문항 생성 중...
            </>
          ) : (
            '문항 생성하기'
          )}
        </button>
      </div>

      {/* 생성된 문항 결과 */}
      {generatedQuestion && (
        <div style={{ marginTop: '2rem' }}>
          {/* 평가 문항 */}
          <div style={{ 
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            marginBottom: '2rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '1.5rem' }}>📋</div>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#1e293b',
                margin: 0
              }}>
                생성된 평가 문항
              </h2>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ 
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                단원 및 학년
              </h4>
              <div style={{
                backgroundColor: '#f1f5f9',
                padding: '1rem',
                borderRadius: '0.5rem',
                border: '1px solid #e2e8f0'
              }}>
                {generatedQuestion.단원_및_학년}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ 
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                예시문
              </h4>
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '1rem',
                borderRadius: '0.5rem',
                border: '1px solid #e2e8f0',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6'
              }}>
                {generatedQuestion.예시문}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ 
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                평가 문항
              </h4>
              <div style={{
                backgroundColor: '#eff6ff',
                padding: '1rem',
                borderRadius: '0.5rem',
                border: '1px solid #bfdbfe',
                lineHeight: '1.6'
              }}>
                {generatedQuestion.평가문항}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ 
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                조건
              </h4>
              <div style={{
                backgroundColor: '#fefce8',
                padding: '1rem',
                borderRadius: '0.5rem',
                border: '1px solid #fed7aa',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6'
              }}>
                {generatedQuestion.조건}
              </div>
            </div>

            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <h4 style={{ 
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  모범 답안 1
                </h4>
                <div style={{
                  backgroundColor: '#f0fdf4',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #bbf7d0',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6'
                }}>
                  {generatedQuestion.모범_답안_1}
                </div>
              </div>
              <div>
                <h4 style={{ 
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  모범 답안 2
                </h4>
                <div style={{
                  backgroundColor: '#f0fdf4',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #bbf7d0',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6'
                }}>
                  {generatedQuestion.모범_답안_2}
                </div>
              </div>
            </div>
          </div>

          {/* 분석적 채점 기준 */}
          <div style={{ 
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            marginBottom: '2rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '1.5rem' }}>📊</div>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#1e293b',
                margin: 0
              }}>
                분석적 채점 기준
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <h4 style={{ 
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  1. 과제수행: 내용의 적절성 및 완성도
                </h4>
                <div style={{
                  backgroundColor: '#faf5ff',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e9d5ff',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6'
                }}>
                  {generatedQuestion.분석적_채점_기준_1}
                </div>
              </div>
              
              <div>
                <h4 style={{ 
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  2. 구성: 응집성 및 일관성
                </h4>
                <div style={{
                  backgroundColor: '#faf5ff',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e9d5ff',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6'
                }}>
                  {generatedQuestion.분석적_채점_기준_2}
                </div>
              </div>
              
              <div>
                <h4 style={{ 
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  3. 언어사용: 어휘 및 어법의 정확성
                </h4>
                <div style={{
                  backgroundColor: '#faf5ff',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e9d5ff',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6'
                }}>
                  {generatedQuestion.분석적_채점_기준_3}
                </div>
              </div>
            </div>
          </div>

          {/* 총체적 채점 기준 */}
          <div style={{ 
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            marginBottom: '2rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '1.5rem' }}>🎯</div>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#1e293b',
                margin: 0
              }}>
                총체적 채점 기준
              </h2>
            </div>

            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <h4 style={{ 
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#059669',
                  marginBottom: '0.5rem'
                }}>
                  A 수준
                </h4>
                <div style={{
                  backgroundColor: '#f0fdf4',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #bbf7d0',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6',
                  fontSize: '0.875rem'
                }}>
                  {generatedQuestion.총체적_채점_기준_A}
                </div>
              </div>
              
              <div>
                <h4 style={{ 
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#d97706',
                  marginBottom: '0.5rem'
                }}>
                  B 수준
                </h4>
                <div style={{
                  backgroundColor: '#fefce8',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #fed7aa',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6',
                  fontSize: '0.875rem'
                }}>
                  {generatedQuestion.총체적_채점_기준_B}
                </div>
              </div>
              
              <div>
                <h4 style={{ 
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#dc2626',
                  marginBottom: '0.5rem'
                }}>
                  C 수준
                </h4>
                <div style={{
                  backgroundColor: '#fef2f2',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #fecaca',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6',
                  fontSize: '0.875rem'
                }}>
                  {generatedQuestion.총체적_채점_기준_C}
                </div>
              </div>
            </div>
          </div>

          {/* 추가 섹션들 (성취수준별 예시 답안 및 피드백) */}
          <div style={{ 
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: '#1e293b',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{ fontSize: '1.5rem' }}>💡</div>
              성취수준별 예시 및 피드백
            </h2>
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {/* A 수준 */}
              <div>
                <h4 style={{ 
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#059669',
                  marginBottom: '1rem',
                  padding: '0.5rem',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '0.5rem'
                }}>
                  A 수준
                </h4>
                
                <div style={{ marginBottom: '1rem' }}>
                  <h5 style={{ 
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    예시 답안
                  </h5>
                  <div style={{
                    backgroundColor: '#f0fdf4',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #bbf7d0',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.5',
                    fontSize: '0.875rem'
                  }}>
                    {generatedQuestion.성취수준별_예시_답안_A}
                  </div>
                </div>
                
                <div>
                  <h5 style={{ 
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    피드백
                  </h5>
                  <div style={{
                    backgroundColor: '#f0fdf4',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #bbf7d0',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.5',
                    fontSize: '0.875rem'
                  }}>
                    {generatedQuestion.성취수준별_평가에_따른_예시_피드백_A}
                  </div>
                </div>
              </div>

              {/* B 수준 */}
              <div>
                <h4 style={{ 
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#d97706',
                  marginBottom: '1rem',
                  padding: '0.5rem',
                  backgroundColor: '#fefce8',
                  borderRadius: '0.5rem'
                }}>
                  B 수준
                </h4>
                
                <div style={{ marginBottom: '1rem' }}>
                  <h5 style={{ 
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    예시 답안
                  </h5>
                  <div style={{
                    backgroundColor: '#fefce8',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #fed7aa',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.5',
                    fontSize: '0.875rem'
                  }}>
                    {generatedQuestion.성취수준별_예시_답안_B}
                  </div>
                </div>
                
                <div>
                  <h5 style={{ 
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    피드백
                  </h5>
                  <div style={{
                    backgroundColor: '#fefce8',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #fed7aa',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.5',
                    fontSize: '0.875rem'
                  }}>
                    {generatedQuestion.성취수준별_평가에_따른_예시_피드백_B}
                  </div>
                </div>
              </div>

              {/* C 수준 */}
              <div>
                <h4 style={{ 
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#dc2626',
                  marginBottom: '1rem',
                  padding: '0.5rem',
                  backgroundColor: '#fef2f2',
                  borderRadius: '0.5rem'
                }}>
                  C 수준
                </h4>
                
                <div style={{ marginBottom: '1rem' }}>
                  <h5 style={{ 
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    예시 답안
                  </h5>
                  <div style={{
                    backgroundColor: '#fef2f2',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #fecaca',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.5',
                    fontSize: '0.875rem'
                  }}>
                    {generatedQuestion.성취수준별_예시_답안_C}
                  </div>
                </div>
                
                <div>
                  <h5 style={{ 
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    피드백
                  </h5>
                  <div style={{
                    backgroundColor: '#fef2f2',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #fecaca',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.5',
                    fontSize: '0.875rem'
                  }}>
                    {generatedQuestion.성취수준별_평가에_따른_예시_피드백_C}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}