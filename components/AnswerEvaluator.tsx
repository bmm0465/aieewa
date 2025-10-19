'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, FileCheck, User, MessageSquare } from 'lucide-react'

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

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '답안 평가에 실패했습니다.')
      }

      setEvaluationResult(data.evaluation)
    } catch (error) {
      console.error('답안 평가 오류:', error)
      setError(error instanceof Error ? error.message : '답안 평가에 실패했습니다.')
    } finally {
      setIsEvaluating(false)
    }
  }

  const getScoreColor = (score: number, maxScore: number = 2) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHolisticScoreColor = (level: string) => {
    switch (level) {
      case 'A': return 'text-green-600 bg-green-50'
      case 'B': return 'text-yellow-600 bg-yellow-50'
      case 'C': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            학생 답안 평가
          </CardTitle>
          <CardDescription>
            AI를 활용하여 학생의 서술형 답안을 자동 평가하고 피드백을 제공합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="question" className="block text-sm font-medium mb-2">
              평가 문항 선택
            </label>
            <select
              id="question"
              value={selectedQuestionId}
              onChange={(e) => setSelectedQuestionId(e.target.value)}
              className="w-full p-2 border rounded-md"
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
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-semibold mb-2">선택된 문항</h4>
              <p className="text-sm text-gray-700">{selectedQuestion.question}</p>
            </div>
          )}

          <div>
            <label htmlFor="studentName" className="block text-sm font-medium mb-2">
              학생 이름
            </label>
            <Input
              id="studentName"
              placeholder="학생 이름을 입력하세요"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="answer" className="block text-sm font-medium mb-2">
              학생 답안
            </label>
            <Textarea
              id="answer"
              placeholder="학생의 답안을 입력하세요"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={8}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="useAAS"
              checked={useAAS}
              onChange={(e) => setUseAAS(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="useAAS" className="text-sm font-medium">
              AAS (Automated Answer Scoring) 사용 - 더 상세한 채점 근거와 피드백 제공
            </label>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button 
            onClick={handleEvaluate} 
            disabled={isEvaluating || !selectedQuestionId || !studentName.trim() || !answer.trim()}
            className="w-full"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                평가 중...
              </>
            ) : (
              <>
                <FileCheck className="mr-2 h-4 w-4" />
                답안 평가하기
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {selectedQuestion && (
        <Card>
          <CardHeader>
            <CardTitle>문항 상세 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">단원/학년</h4>
              <p>{selectedQuestion.unit_grade}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">예시문</h4>
              <div className="bg-blue-50 p-4 rounded-md whitespace-pre-wrap">
                {selectedQuestion.example_text}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">조건</h4>
              <div className="bg-yellow-50 p-4 rounded-md whitespace-pre-wrap">
                {selectedQuestion.conditions}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">모범 답안 1</h4>
                <div className="bg-green-50 p-4 rounded-md whitespace-pre-wrap">
                  {selectedQuestion.model_answer_1}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">모범 답안 2</h4>
                <div className="bg-green-50 p-4 rounded-md whitespace-pre-wrap">
                  {selectedQuestion.model_answer_2}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {evaluationResult && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                평가 결과: {studentName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">분석적 채점 결과</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">과제수행 (내용의 적절성)</span>
                        <span className={`font-bold ${getScoreColor(evaluationResult.analytical_score_1)}`}>
                          {evaluationResult.analytical_score_1}/2
                        </span>
                      </div>
                      {evaluationResult.analytical_reasoning_1 && (
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          근거: {evaluationResult.analytical_reasoning_1}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">구성 (응집성 및 일관성)</span>
                        <span className={`font-bold ${getScoreColor(evaluationResult.analytical_score_2)}`}>
                          {evaluationResult.analytical_score_2}/2
                        </span>
                      </div>
                      {evaluationResult.analytical_reasoning_2 && (
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          근거: {evaluationResult.analytical_reasoning_2}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">언어사용 (어휘 및 어법)</span>
                        <span className={`font-bold ${getScoreColor(evaluationResult.analytical_score_3)}`}>
                          {evaluationResult.analytical_score_3}/2
                        </span>
                      </div>
                      {evaluationResult.analytical_reasoning_3 && (
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          근거: {evaluationResult.analytical_reasoning_3}
                        </div>
                      )}
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">총점</span>
                        <span className={`font-bold text-lg ${getScoreColor(evaluationResult.total_score, 6)}`}>
                          {evaluationResult.total_score}/6
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">총체적 평가</h4>
                  <div className={`p-4 rounded-md text-center font-bold text-lg ${getHolisticScoreColor(evaluationResult.holistic_score)}`}>
                    {evaluationResult.holistic_score} 수준
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI 피드백
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-6 rounded-md whitespace-pre-wrap">
                {evaluationResult.ai_feedback}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
