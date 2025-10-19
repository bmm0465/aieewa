import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// 클라이언트 컴포넌트를 동적으로 로드하여 SSR 문제 방지
const HomeClient = dynamic(() => import('@/components/HomeClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  )
})

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">AIEEWA</h1>
            <p className="text-xl text-gray-600">LLM 기반 초등 영어 서술형 평가 시스템</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mt-8"></div>
          </div>
        </div>
      }>
        <HomeClient />
      </Suspense>
    </div>
  )
}