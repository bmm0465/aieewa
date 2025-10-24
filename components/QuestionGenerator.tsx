'use client'

import { useState, useRef, useEffect } from 'react'

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

// 학년별 단원 데이터
const GRADE_LESSONS = {
  '5학년': [
    { value: 'lesson9', label: 'Lesson 9. My Favorite Subject Is Science' },
    { value: 'lesson10', label: 'Lesson 10. What a Nice House!' },
    { value: 'lesson11', label: 'Lesson 11. I Want to Be a Movie Director' }
  ],
  '6학년': [
    { value: 'lesson9', label: 'Lesson 9. What Do You Think?' },
    { value: 'lesson10', label: 'Lesson 10. Who Wrote the Book?' },
    { value: 'lesson11', label: 'Lesson 11. We Should Save the Earth' }
  ]
}

export default function QuestionGenerator() {
  const [request, setRequest] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuestion, setGeneratedQuestion] = useState<GeneratedQuestion | null>(null)
  const [error, setError] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedGrade, setSelectedGrade] = useState<string>('')
  const [selectedLesson, setSelectedLesson] = useState<string>('')
  const [defaultPdfStatus, setDefaultPdfStatus] = useState<{
    totalDocuments: number
    totalChunks: number
    documents: Array<{filename: string, chunk_count: number}>
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 학년 선택 핸들러
  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade)
    setSelectedLesson('') // 단원 초기화
  }

  // 단원 선택 핸들러
  const handleLessonChange = (lesson: string) => {
    setSelectedLesson(lesson)
  }

  // 선택된 단원 정보를 기반으로 요청 생성
  const generateRequestFromLesson = () => {
    if (!selectedGrade || !selectedLesson) return ''
    
    const lessonInfo = GRADE_LESSONS[selectedGrade as keyof typeof GRADE_LESSONS]
      .find(lesson => lesson.value === selectedLesson)
    
    if (!lessonInfo) return ''
    
    return `${selectedGrade} ${lessonInfo.label} 단원에 대한 서술형 평가 문항을 생성해주세요. 이 단원의 핵심 학습 내용을 바탕으로 학생들의 이해도와 표현력을 평가할 수 있는 문항을 만들어주세요.`
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('PDF 파일만 업로드할 수 있습니다.')
      return
    }

    // Vercel 배포를 위한 파일 크기 제한
    const maxSizeMB = process.env.NODE_ENV === 'production' ? 4 : 10
    const maxFileSize = maxSizeMB * 1024 * 1024
    
    if (file.size > maxFileSize) {
      setError(`파일 크기는 ${maxSizeMB}MB를 초과할 수 없습니다.`)
      return
    }

    setIsUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-document', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '파일 업로드에 실패했습니다.')
      }

      setUploadedFiles(prev => [...prev, file.name])
      console.log('파일 업로드 성공:', data)
    } catch (error) {
      console.error('파일 업로드 오류:', error)
      setError(error instanceof Error ? error.message : '파일 업로드에 실패했습니다.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // 기본 PDF 상태 확인
  const checkDefaultPdfStatus = async () => {
    try {
      const response = await fetch('/api/preprocess-pdfs')
      const data = await response.json()
      
      if (response.ok && data.success) {
        setDefaultPdfStatus({
          totalDocuments: data.totalDocuments,
          totalChunks: data.totalChunks,
          documents: data.documents || []
        })
      }
    } catch (error) {
      console.error('기본 PDF 상태 확인 오류:', error)
    }
  }

  // 기본 PDF 전처리 실행
  const preprocessDefaultPdfs = async (force = false) => {
    try {
      setIsUploading(true)
      setError('')
      
      const url = force ? '/api/preprocess-pdfs?force=true' : '/api/preprocess-pdfs'
      const response = await fetch(url, { method: 'POST' })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || '전처리에 실패했습니다.')
      }
      
      console.log('기본 PDF 전처리 완료:', data)
      
      // 상태 다시 확인
      await checkDefaultPdfStatus()
      
    } catch (error) {
      console.error('기본 PDF 전처리 오류:', error)
      setError(error instanceof Error ? error.message : '전처리에 실패했습니다.')
    } finally {
      setIsUploading(false)
    }
  }

  // 컴포넌트 마운트 시 기본 PDF 상태 확인
  useEffect(() => {
    checkDefaultPdfStatus()
  }, [])

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
        body: JSON.stringify({ 
          request,
          selectedGrade,
          selectedLesson
        }),
      })

      console.log('API 응답 상태:', response.status)
      const data = await response.json()
      console.log('API 응답 데이터:', data)

      if (!response.ok) {
        // 더 구체적인 에러 메시지 제공
        let errorMessage = data.error || '문항 생성에 실패했습니다.'
        
        if (response.status === 500) {
          if (data.error?.includes('API 키')) {
            errorMessage = 'AI 서비스 설정에 문제가 있습니다. 관리자에게 문의해주세요.'
          } else if (data.error?.includes('네트워크')) {
            errorMessage = '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.'
          } else if (data.error?.includes('시간')) {
            errorMessage = '요청 시간이 초과되었습니다. 다시 시도해주세요.'
          }
        }
        
        throw new Error(errorMessage)
      }

      // API 응답 구조에 맞게 수정
      if (data.success && data.question) {
        setGeneratedQuestion(data.question)
        if (data.warning) {
          console.warn('데이터베이스 저장 경고:', data.warning)
        }
      } else if (data.success && !data.question) {
        throw new Error('문항이 생성되었지만 데이터를 가져올 수 없습니다.')
      } else {
        throw new Error('응답 데이터 형식이 올바르지 않습니다.')
      }
    } catch (error) {
      console.error('문항 생성 오류:', error)
      
      let errorMessage = '문항 생성에 실패했습니다.'
      
      if (error instanceof Error) {
        errorMessage = error.message
        
        // 네트워크 오류 처리
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = '서버와의 연결에 실패했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.'
        }
      }
      
      setError(errorMessage)
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
        {/* 학년 및 단원 선택 */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#1e293b',
            marginBottom: '1rem'
          }}>
            📚 학년 및 단원 선택
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            {/* 학년 선택 */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                학년 선택
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => handleGradeChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">학년을 선택하세요</option>
                <option value="5학년">5학년</option>
                <option value="6학년">6학년</option>
              </select>
            </div>

            {/* 단원 선택 */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                단원 선택
              </label>
              <select
                value={selectedLesson}
                onChange={(e) => handleLessonChange(e.target.value)}
                disabled={!selectedGrade}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: selectedGrade ? 'white' : '#f9fafb',
                  cursor: selectedGrade ? 'pointer' : 'not-allowed',
                  opacity: selectedGrade ? 1 : 0.6
                }}
              >
                <option value="">단원을 선택하세요</option>
                {selectedGrade && GRADE_LESSONS[selectedGrade as keyof typeof GRADE_LESSONS]?.map((lesson) => (
                  <option key={lesson.value} value={lesson.value}>
                    {lesson.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 선택된 단원으로 자동 요청 생성 버튼 */}
          {selectedGrade && selectedLesson && (
            <div style={{ 
              padding: '1rem',
              backgroundColor: '#f0f9ff',
              border: '1px solid #0ea5e9',
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#0369a1',
                margin: '0 0 0.5rem 0'
              }}>
                선택된 단원: <strong>{selectedGrade} {GRADE_LESSONS[selectedGrade as keyof typeof GRADE_LESSONS]?.find(l => l.value === selectedLesson)?.label}</strong>
              </p>
              <button
                onClick={() => setRequest(generateRequestFromLesson())}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#0ea5e9',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0ea5e9'}
              >
                이 단원으로 문항 생성하기
              </button>
            </div>
          )}
        </div>
        {/* 기본 PDF 상태 섹션 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.75rem'
          }}>
            기본 참고 자료 (PDF 폴더)
          </label>
          
          {defaultPdfStatus && (
            <div style={{
              padding: '1rem',
              backgroundColor: defaultPdfStatus.totalDocuments > 0 ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${defaultPdfStatus.totalDocuments > 0 ? '#bbf7d0' : '#fecaca'}`,
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                  처리된 문서: {defaultPdfStatus.totalDocuments}개 ({defaultPdfStatus.totalChunks}개 청크)
                </span>
                <button
                  onClick={() => preprocessDefaultPdfs(true)}
                  disabled={isUploading}
                  style={{
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.75rem',
                    backgroundColor: defaultPdfStatus.totalDocuments > 0 ? '#059669' : '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: isUploading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isUploading ? '처리 중...' : (defaultPdfStatus.totalDocuments > 0 ? '재처리' : '처리')}
                </button>
              </div>
              
              {defaultPdfStatus.documents.length > 0 && (
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  포함된 파일: {defaultPdfStatus.documents.map(doc => doc.filename.replace('pdf/', '')).join(', ')}
                </div>
              )}
            </div>
          )}
          
          {!defaultPdfStatus && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                  기본 교과서와 평가 자료가 준비되어 있지 않습니다.
                </p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  로컬 환경: pdf/ 폴더의 파일을 처리합니다.<br/>
                  온라인 환경: 관리자가 미리 설정한 자료를 사용합니다.
                </p>
              </div>
              <button
                onClick={() => preprocessDefaultPdfs()}
                disabled={isUploading}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                {isUploading ? '처리 중...' : '기본 PDF 파일 처리하기'}
              </button>
            </div>
          )}
        </div>

        {/* 파일 업로드 섹션 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.75rem'
          }}>
            추가 참고 문서 업로드 (선택사항)
          </label>
          <div style={{ marginBottom: '1rem' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={isUploading}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              style={{
                padding: '0.75rem 1rem',
                border: '2px dashed #3b82f6',
                borderRadius: '0.5rem',
                backgroundColor: isUploading ? '#f3f4f6' : '#f8faff',
                color: '#3b82f6',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              {isUploading ? (
                <>
                  <div style={{
                    width: '1rem',
                    height: '1rem',
                    border: '2px solid transparent',
                    borderTop: '2px solid currentColor',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  업로드 중...
                </>
              ) : (
                <>
                  📄 PDF 파일 선택하기
                </>
              )}
            </button>
            <p style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              marginTop: '0.5rem',
              textAlign: 'center'
            }}>
              기본 PDF 파일과 함께 추가로 업로드할 수 있습니다. (최대 10MB)
            </p>
          </div>
          
          {/* 업로드된 파일 목록 */}
          {uploadedFiles.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                업로드된 파일:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {uploadedFiles.map((filename, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#e0f2fe',
                      color: '#0369a1',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}
                  >
                    📄 {filename}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

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