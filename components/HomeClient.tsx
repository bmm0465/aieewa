'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import dynamic from 'next/dynamic'
import { BookOpen, FileCheck, Brain } from 'lucide-react'

// 동적 임포트로 컴포넌트 로드
const QuestionGenerator = dynamic(() => import('@/components/QuestionGenerator'), {
  ssr: false,
  loading: () => <div className="text-center py-8 text-gray-600">로딩 중...</div>
})

const AnswerEvaluator = dynamic(() => import('@/components/AnswerEvaluator'), {
  ssr: false,
  loading: () => <div className="text-center py-8 text-gray-600">로딩 중...</div>
})

type TabType = 'home' | 'generate' | 'evaluate'

export default function HomeClient() {
  const [activeTab, setActiveTab] = useState<TabType>('home')

  const renderContent = () => {
    switch (activeTab) {
      case 'generate':
        return <QuestionGenerator />
      case 'evaluate':
        return <AnswerEvaluator />
      default:
        return (
          <div className="max-w-6xl mx-auto p-6">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">
                AIEEWA
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                LLM 기반 초등 영어 서술형 평가 시스템
              </p>
              <p className="text-gray-500 max-w-2xl mx-auto">
                GPT-4o와 RAG, Self-RAG, LLM-as-a-Judge를 활용하여 초등 영어 서술형 평가 문항을 생성하고, 
                학생 답안을 자동 채점하며 맞춤형 피드백을 제공합니다.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
                    onClick={() => setActiveTab('generate')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                    문항 생성
                  </CardTitle>
                  <CardDescription>
                    AI를 활용하여 초등 영어 서술형 평가 문항과 채점 기준을 자동 생성합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• RAG 기반 예시문 활용</li>
                    <li>• 분석적/총체적 채점 기준</li>
                    <li>• 성취수준별 피드백</li>
                    <li>• Self-RAG 품질 검증</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setActiveTab('evaluate')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-6 w-6 text-green-600" />
                    답안 평가
                  </CardTitle>
                  <CardDescription>
                    학생의 서술형 답안을 AI가 자동으로 채점하고 개별화된 피드백을 제공합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• 분석적 채점 (3개 영역)</li>
                    <li>• 총체적 평가 (A/B/C)</li>
                    <li>• 자동 피드백 생성</li>
                    <li>• LLM-as-a-Judge 활용</li>
                    <li>• AAS 방식으로 상세한 채점 근거 제공</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-purple-600" />
                  시스템 특징
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">RAG 기반 문항 생성</h4>
                    <p className="text-sm text-gray-600">
                      검색 증강 생성으로 교육과정에 부합하는 고품질 문항을 생성합니다.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Self-RAG 품질 관리</h4>
                    <p className="text-sm text-gray-600">
                      생성된 문항의 품질을 자동으로 검증하고 개선합니다.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">AAS 자동 채점</h4>
                    <p className="text-sm text-gray-600">
                      Few-shot 학습과 Self-RAG를 활용한 정확하고 일관된 자동 채점과 상세한 피드백을 제공합니다.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  if (activeTab !== 'home') {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setActiveTab('home')}
                  className="text-lg font-bold text-blue-600 hover:text-blue-700"
                >
                  AIEEWA
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant={activeTab === 'generate' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('generate')}
                  >
                    문항 생성
                  </Button>
                  <Button 
                    variant={activeTab === 'evaluate' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('evaluate')}
                  >
                    답안 평가
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className="py-6">
          {renderContent()}
        </div>
      </div>
    )
  }

  return renderContent()
}
