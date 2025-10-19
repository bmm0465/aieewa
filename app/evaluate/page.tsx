import dynamic from 'next/dynamic'

const AnswerEvaluator = dynamic(() => import('@/components/AnswerEvaluator'), {
  loading: () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center py-8 text-gray-600">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        답안 평가 컴포넌트 로딩 중...
      </div>
    </div>
  )
})

export default function EvaluatePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a 
                href="/"
                className="text-lg font-bold text-blue-600 hover:text-blue-700"
              >
                AIEEWA
              </a>
              <div className="flex gap-2">
                <span className="px-3 py-1 text-sm bg-green-600 text-white rounded">
                  답안 평가
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <div className="py-6">
        <AnswerEvaluator />
      </div>
    </div>
  )
}
