'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus } from 'lucide-react'

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
      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ request }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '문항 생성에 실패했습니다.')
      }

      setGeneratedQuestion(data.question)
    } catch (error) {
      console.error('문항 생성 오류:', error)
      setError(error instanceof Error ? error.message : '문항 생성에 실패했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            영어 서술형 평가 문항 생성
          </CardTitle>
          <CardDescription>
            AI를 활용하여 초등 영어 서술형 평가 문항과 채점 기준을 생성합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="request" className="block text-sm font-medium mb-2">
              문항 생성 요청
            </label>
            <Textarea
              id="request"
              placeholder="예: 5학년 9단원 My Favorite Subject Is Science 영어 서술형 평가 문항과 채점 기준을 생성해줘."
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              rows={3}
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !request.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                문항 생성 중...
              </>
            ) : (
              '문항 생성하기'
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedQuestion && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>생성된 평가 문항</CardTitle>
              <CardDescription>{generatedQuestion.단원_및_학년}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">예시문</h4>
                <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                  {generatedQuestion.예시문}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">평가 문항</h4>
                <div className="bg-blue-50 p-4 rounded-md">
                  {generatedQuestion.평가문항}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">조건</h4>
                <div className="bg-yellow-50 p-4 rounded-md whitespace-pre-wrap">
                  {generatedQuestion.조건}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">모범 답안 1</h4>
                  <div className="bg-green-50 p-4 rounded-md whitespace-pre-wrap">
                    {generatedQuestion.모범_답안_1}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">모범 답안 2</h4>
                  <div className="bg-green-50 p-4 rounded-md whitespace-pre-wrap">
                    {generatedQuestion.모범_답안_2}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>분석적 채점 기준</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. 과제수행: 내용의 적절성 및 완성도</h4>
                <div className="bg-purple-50 p-4 rounded-md whitespace-pre-wrap">
                  {generatedQuestion.분석적_채점_기준_1}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2. 구성: 응집성 및 일관성</h4>
                <div className="bg-purple-50 p-4 rounded-md whitespace-pre-wrap">
                  {generatedQuestion.분석적_채점_기준_2}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3. 언어사용: 어휘 및 어법의 정확성</h4>
                <div className="bg-purple-50 p-4 rounded-md whitespace-pre-wrap">
                  {generatedQuestion.분석적_채점_기준_3}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>총체적 채점 기준</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-green-700">A 수준</h4>
                  <div className="bg-green-50 p-4 rounded-md whitespace-pre-wrap text-sm">
                    {generatedQuestion.총체적_채점_기준_A}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-yellow-700">B 수준</h4>
                  <div className="bg-yellow-50 p-4 rounded-md whitespace-pre-wrap text-sm">
                    {generatedQuestion.총체적_채점_기준_B}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-red-700">C 수준</h4>
                  <div className="bg-red-50 p-4 rounded-md whitespace-pre-wrap text-sm">
                    {generatedQuestion.총체적_채점_기준_C}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>성취수준별 예시 답안</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-green-700">A 수준 예시</h4>
                  <div className="bg-green-50 p-4 rounded-md whitespace-pre-wrap">
                    {generatedQuestion.성취수준별_예시_답안_A}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-yellow-700">B 수준 예시</h4>
                  <div className="bg-yellow-50 p-4 rounded-md whitespace-pre-wrap">
                    {generatedQuestion.성취수준별_예시_답안_B}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-red-700">C 수준 예시</h4>
                  <div className="bg-red-50 p-4 rounded-md whitespace-pre-wrap">
                    {generatedQuestion.성취수준별_예시_답안_C}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>성취수준별 피드백</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-green-700">A 수준 피드백</h4>
                  <div className="bg-green-50 p-4 rounded-md whitespace-pre-wrap text-sm">
                    {generatedQuestion.성취수준별_평가에_따른_예시_피드백_A}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-yellow-700">B 수준 피드백</h4>
                  <div className="bg-yellow-50 p-4 rounded-md whitespace-pre-wrap text-sm">
                    {generatedQuestion.성취수준별_평가에_따른_예시_피드백_B}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-red-700">C 수준 피드백</h4>
                  <div className="bg-red-50 p-4 rounded-md whitespace-pre-wrap text-sm">
                    {generatedQuestion.성취수준별_평가에_따른_예시_피드백_C}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
