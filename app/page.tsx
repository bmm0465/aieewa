import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Client enhancement component
const ClientEnhancement = dynamic(() => import('@/components/HomeClient'), {
  ssr: false,
  loading: () => null
})

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
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
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                📝
              </div>
              <h2 className="text-xl font-semibold text-gray-800">문항 생성</h2>
            </div>
            <p className="text-gray-600 mb-4">
              AI를 활용하여 초등 영어 서술형 평가 문항과 채점 기준을 자동 생성합니다.
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>• RAG 기반 예시문 활용</li>
              <li>• 분석적/총체적 채점 기준</li>
              <li>• 성취수준별 피드백</li>
              <li>• Self-RAG 품질 검증</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                ✅
              </div>
              <h2 className="text-xl font-semibold text-gray-800">답안 평가</h2>
            </div>
            <p className="text-gray-600 mb-4">
              학생의 서술형 답안을 AI가 자동으로 채점하고 개별화된 피드백을 제공합니다.
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>• 분석적 채점 (3개 영역)</li>
              <li>• 총체적 평가 (A/B/C)</li>
              <li>• 자동 피드백 생성</li>
              <li>• LLM-as-a-Judge 활용</li>
              <li>• AAS 방식으로 상세한 채점 근거 제공</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
              🧠
            </div>
            <h2 className="text-xl font-semibold text-gray-800">시스템 특징</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-gray-800">RAG 기반 문항 생성</h4>
              <p className="text-sm text-gray-600">
                검색 증강 생성으로 교육과정에 부합하는 고품질 문항을 생성합니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-gray-800">Self-RAG 품질 관리</h4>
              <p className="text-sm text-gray-600">
                생성된 문항의 품질을 자동으로 검증하고 개선합니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-gray-800">AAS 자동 채점</h4>
              <p className="text-sm text-gray-600">
                Few-shot 학습과 Self-RAG를 활용한 정확하고 일관된 자동 채점과 상세한 피드백을 제공합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Client-side enhancement */}
        <Suspense fallback={null}>
          <ClientEnhancement />
        </Suspense>
      </div>
    </div>
  )
}