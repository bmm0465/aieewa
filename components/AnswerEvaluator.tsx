'use client'

import { useState, useEffect } from 'react'

interface Question {
  id: string
  unit_grade: string
  example_text: string
  question: string
  conditions: string
  model_answer_1: string
  model_answer_2: string
  analytical_criteria_1: string
  analytical_criteria_2: string
  analytical_criteria_3: string
  holistic_criteria_a: string
  holistic_criteria_b: string
  holistic_criteria_c: string
  example_answer_a: string
  example_answer_b: string
  example_answer_c: string
}

interface EvaluationResult {
  analytical_score_1: number
  analytical_score_2: number
  analytical_score_3: number
  holistic_score: 'A' | 'B' | 'C'
  total_score: number
  ai_feedback: string
  analytical_reasoning_1?: string
  analytical_reasoning_2?: string
  analytical_reasoning_3?: string
}

export default function AnswerEvaluator() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedQuestionId, setSelectedQuestionId] = useState('')
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [studentName, setStudentName] = useState('')
  const [answer, setAnswer] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null)
  const [error, setError] = useState('')
  const [useAAS, setUseAAS] = useState(false)

  // 문항 목록 로드
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch('/api/questions')
        const data = await response.json()
        if (response.ok) {
          setQuestions(data.questions)
        }
      } catch (error) {
        console.error('문항 목록 로드 오류:', error)
      }
    }

    loadQuestions()
  }, [])

  // 선택된 문항 정보 로드
  useEffect(() => {
    if (selectedQuestionId) {
      const loadQuestion = async () => {
        try {
          const response = await fetch(`/api/questions?id=${selectedQuestionId}`)
          const data = await response.json()
          if (response.ok) {
            setSelectedQuestion(data.question)
          }
        } catch (error) {
          console.error('문항 정보 로드 오류:', error)
        }
      }

      loadQuestion()
    }
  }, [selectedQuestionId])

  const handleEvaluate = async () => {
    if (!selectedQuestionId || !studentName.trim() || !answer.trim()) {
      setError('모든 필드를 입력해주세요.')
      return
    }

    setIsEvaluating(true)
    setError('')

    try {
      console.log('답안 평가 요청 시작:', { selectedQuestionId, studentName, answer })
      
      const endpoint = useAAS ? '/api/evaluate-answer-aas' : '/api/evaluate-answer'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: selectedQuestionId,
          studentName: studentName.trim(),
          answer: answer.trim(),
        }),
      })

      console.log('API 응답 상태:', response.status)
      const data = await response.json()
      console.log('API 응답 데이터:', data)

      if (!response.ok) {
        throw new Error(data.error || '답안 평가에 실패했습니다.')
      }

      // API 응답 구조에 맞게 수정
      if (data.evaluation) {
        setEvaluationResult(data.evaluation)
      } else {
        throw new Error('응답 데이터 형식이 올바르지 않습니다.')
      }
    } catch (error) {
      console.error('답안 평가 오류:', error)
      setError(error instanceof Error ? error.message : '답안 평가에 실패했습니다.')
    } finally {
      setIsEvaluating(false)
    }
  }

  const getScoreColor = (score: number, maxScore: number = 2) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return { color: '#059669', bg: '#f0fdf4' }
    if (percentage >= 60) return { color: '#d97706', bg: '#fefce8' }
    return { color: '#dc2626', bg: '#fef2f2' }
  }

  const getHolisticScoreColor = (level: string) => {
    switch (level) {
      case 'A': return { color: '#059669', bg: '#f0fdf4' }
      case 'B': return { color: '#d97706', bg: '#fefce8' }
      case 'C': return { color: '#dc2626', bg: '#fef2f2' }
      default: return { color: '#6b7280', bg: '#f9fafb' }
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
            background: 'linear-gradient(135deg, #10b981, #059669)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>✅</div>
          <h1 style={{ 
            fontSize: '1.875rem', 
            fontWeight: '700', 
            color: '#1e293b',
            margin: 0
          }}>
            학생 답안 평가
          </h1>
        </div>
        <p style={{ 
          color: '#64748b',
          fontSize: '1.1rem',
          lineHeight: '1.6'
        }}>
          AI를 활용하여 학생의 서술형 답안을 자동 평가하고 피드백을 제공합니다.
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
        {/* 문항 선택 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.75rem'
          }}>
            평가 문항 선택
          </label>
          <select
            value={selectedQuestionId}
            onChange={(e) => setSelectedQuestionId(e.target.value)}
            style={{
              width: '100%',
              padding: '0.875rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box',
              backgroundColor: 'white'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb'
            }}
          >
            <option value="">문항을 선택해주세요</option>
            {questions.map((question) => (
              <option key={question.id} value={question.id}>
                {question.unit_grade} - {question.question.substring(0, 50)}...
              </option>
            ))}
          </select>
        </div>

        {selectedQuestion && (
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ 
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              선택된 문항
            </h4>
            <p style={{ 
              fontSize: '0.875rem',
              color: '#64748b',
              lineHeight: '1.5'
            }}>
              {selectedQuestion.question}
            </p>
          </div>
        )}

        {/* 학생 이름 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.75rem'
          }}>
            학생 이름
          </label>
          <input
            type="text"
            placeholder="학생 이름을 입력하세요"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            style={{
              width: '100%',
              padding: '0.875rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontFamily: 'inherit',
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

        {/* 학생 답안 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.75rem'
          }}>
            학생 답안
          </label>
          <textarea
            placeholder="학생의 답안을 입력하세요"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={8}
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

        {/* AAS 옵션 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: '#f8fafc',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0'
        }}>
          <input
            type="checkbox"
            id="useAAS"
            checked={useAAS}
            onChange={(e) => setUseAAS(e.target.checked)}
            style={{
              width: '1rem',
              height: '1rem',
              accentColor: '#3b82f6'
            }}
          />
          <label htmlFor="useAAS" style={{
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            cursor: 'pointer'
          }}>
            AAS (Automated Answer Scoring) 사용 - 더 상세한 채점 근거와 피드백 제공
          </label>
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

        {/* 평가 버튼 */}
        <button
          onClick={handleEvaluate}
          disabled={isEvaluating || !selectedQuestionId || !studentName.trim() || !answer.trim()}
          style={{
            width: '100%',
            padding: '0.875rem 1.5rem',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: isEvaluating || !selectedQuestionId || !studentName.trim() || !answer.trim() ? 'not-allowed' : 'pointer',
            background: isEvaluating || !selectedQuestionId || !studentName.trim() || !answer.trim() 
              ? '#9ca3af' 
              : 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            boxShadow: isEvaluating || !selectedQuestionId || !studentName.trim() || !answer.trim() 
              ? 'none' 
              : '0 4px 12px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          {isEvaluating ? (
            <>
              <div style={{
                width: '1rem',
                height: '1rem',
                border: '2px solid transparent',
                borderTop: '2px solid currentColor',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              평가 중...
            </>
          ) : (
            '답안 평가하기'
          )}
        </button>
      </div>

      {/* 선택된 문항 상세 정보 */}
      {selectedQuestion && (
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
              문항 상세 정보
            </h2>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ 
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              단원/학년
            </h4>
            <p style={{ color: '#64748b' }}>{selectedQuestion.unit_grade}</p>
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
              backgroundColor: '#eff6ff',
              padding: '1rem',
              borderRadius: '0.5rem',
              border: '1px solid #bfdbfe',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6'
            }}>
              {selectedQuestion.example_text}
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
              {selectedQuestion.conditions}
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
                {selectedQuestion.model_answer_1}
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
                {selectedQuestion.model_answer_2}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 평가 결과 */}
      {evaluationResult && (
        <div>
          {/* 평가 결과 요약 */}
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
              <div style={{ fontSize: '1.5rem' }}>👤</div>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#1e293b',
                margin: 0
              }}>
                평가 결과: {studentName}
              </h2>
            </div>

            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '2rem'
            }}>
              {/* 분석적 채점 결과 */}
              <div>
                <h4 style={{ 
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '1rem'
                }}>
                  분석적 채점 결과
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ 
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#374151'
                      }}>
                        과제수행 (내용의 적절성)
                      </span>
                      <span style={{ 
                        fontWeight: '700',
                        color: getScoreColor(evaluationResult.analytical_score_1).color
                      }}>
                        {evaluationResult.analytical_score_1}/2
                      </span>
                    </div>
                    {evaluationResult.analytical_reasoning_1 && (
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        backgroundColor: '#f9fafb',
                        padding: '0.5rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #e5e7eb'
                      }}>
                        근거: {evaluationResult.analytical_reasoning_1}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ 
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#374151'
                      }}>
                        구성 (응집성 및 일관성)
                      </span>
                      <span style={{ 
                        fontWeight: '700',
                        color: getScoreColor(evaluationResult.analytical_score_2).color
                      }}>
                        {evaluationResult.analytical_score_2}/2
                      </span>
                    </div>
                    {evaluationResult.analytical_reasoning_2 && (
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        backgroundColor: '#f9fafb',
                        padding: '0.5rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #e5e7eb'
                      }}>
                        근거: {evaluationResult.analytical_reasoning_2}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ 
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#374151'
                      }}>
                        언어사용 (어휘 및 어법)
                      </span>
                      <span style={{ 
                        fontWeight: '700',
                        color: getScoreColor(evaluationResult.analytical_score_3).color
                      }}>
                        {evaluationResult.analytical_score_3}/2
                      </span>
                    </div>
                    {evaluationResult.analytical_reasoning_3 && (
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        backgroundColor: '#f9fafb',
                        padding: '0.5rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #e5e7eb'
                      }}>
                        근거: {evaluationResult.analytical_reasoning_3}
                      </div>
                    )}
                  </div>

                  <div style={{ 
                    borderTop: '2px solid #e5e7eb',
                    paddingTop: '1rem',
                    marginTop: '0.5rem'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center'
                    }}>
                      <span style={{ 
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        총점
                      </span>
                      <span style={{ 
                        fontWeight: '700',
                        fontSize: '1.25rem',
                        color: getScoreColor(evaluationResult.total_score, 6).color
                      }}>
                        {evaluationResult.total_score}/6
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 총체적 평가 */}
              <div>
                <h4 style={{ 
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '1rem'
                }}>
                  총체적 평가
                </h4>
                <div style={{
                  padding: '2rem',
                  borderRadius: '0.5rem',
                  textAlign: 'center',
                  fontWeight: '700',
                  fontSize: '1.5rem',
                  color: getHolisticScoreColor(evaluationResult.holistic_score).color,
                  backgroundColor: getHolisticScoreColor(evaluationResult.holistic_score).bg,
                  border: `2px solid ${getHolisticScoreColor(evaluationResult.holistic_score).color}20`
                }}>
                  {evaluationResult.holistic_score} 수준
                </div>
              </div>
            </div>
          </div>

          {/* AI 피드백 */}
          <div style={{ 
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '1.5rem' }}>💬</div>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#1e293b',
                margin: 0
              }}>
                AI 피드백
              </h2>
            </div>
            <div style={{
              backgroundColor: '#eff6ff',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #bfdbfe',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6'
            }}>
              {evaluationResult.ai_feedback}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}