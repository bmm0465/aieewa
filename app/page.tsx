import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AIEEWA - 초등 영어 서술형 평가 시스템',
  description: 'LLM 기반 초등 영어 서술형 평가 문항 생성 및 자동 채점 시스템',
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          AIEEWA
        </h1>
        <p className="text-2xl text-gray-600 mb-8">
          LLM 기반 초등 영어 서술형 평가 시스템
        </p>
        <p className="text-lg text-gray-500 mb-12 max-w-3xl mx-auto">
          GPT-4o와 RAG, Self-RAG, LLM-as-a-Judge를 활용하여 초등 영어 서술형 평가 문항을 생성하고, 
          학생 답안을 자동 채점하며 맞춤형 피드백을 제공합니다.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8 border">
            <div className="text-4xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">문항 생성</h2>
            <p className="text-gray-600 mb-6">
              AI를 활용하여 초등 영어 서술형 평가 문항과 채점 기준을 자동 생성합니다.
            </p>
            <a 
              href="/generate" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              문항 생성하기
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 border">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">답안 평가</h2>
            <p className="text-gray-600 mb-6">
              학생의 서술형 답안을 AI가 자동으로 채점하고 개별화된 피드백을 제공합니다.
            </p>
            <a 
              href="/evaluate" 
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              답안 평가하기
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}