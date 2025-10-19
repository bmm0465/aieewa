'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'

// 동적 임포트로 컴포넌트 로드
const QuestionGenerator = dynamic(() => import('@/components/QuestionGenerator'), {
  loading: () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center py-8 text-gray-600">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        문항 생성 컴포넌트 로딩 중...
      </div>
    </div>
  )
})

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

type TabType = 'home' | 'generate' | 'evaluate'

export default function HomeClient() {
  const [activeTab, setActiveTab] = useState<TabType>('home')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // 기존 카드에 클릭 이벤트 추가 (타입 안전하게)
    const cards = document.querySelectorAll('.cursor-pointer')
    cards.forEach((card, index) => {
      const handleClick = () => {
        if (index === 0) setActiveTab('generate')
        else if (index === 1) setActiveTab('evaluate')
      }
      card.addEventListener('click', handleClick)
      
      // 클린업을 위해 이벤트 리스너 저장
      ;(card as any)._clickHandler = handleClick
    })

    // 네비게이션 추가
    const addNavigation = () => {
      const existingNav = document.querySelector('.client-nav')
      if (!existingNav) {
        const navElement = document.createElement('div')
        navElement.className = 'client-nav fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg p-2'
        navElement.innerHTML = `
          <div class="flex gap-2">
            <button class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700" data-tab="home">
              홈
            </button>
            <button class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200" data-tab="generate">
              문항 생성
            </button>
            <button class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200" data-tab="evaluate">
              답안 평가
            </button>
          </div>
        `
        document.body.appendChild(navElement)
        
        // 이벤트 위임 사용
        navElement.addEventListener('click', (e) => {
          const target = e.target as HTMLElement
          if (target && target.dataset.tab) {
            const tab = target.dataset.tab as TabType
            setActiveTab(tab)
            
            // 버튼 상태 업데이트
            const buttons = navElement.querySelectorAll('[data-tab]')
            buttons.forEach(btn => {
              if (btn instanceof HTMLElement) {
                btn.className = 'px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200'
              }
            })
            target.className = 'px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700'
          }
        })
      }
    }

    const timeoutId = setTimeout(addNavigation, 100)
    
    // 클린업
    return () => {
      clearTimeout(timeoutId)
      cards.forEach(card => {
        if ((card as any)._clickHandler) {
          card.removeEventListener('click', (card as any)._clickHandler)
        }
      })
      const nav = document.querySelector('.client-nav')
      if (nav) {
        nav.remove()
      }
    }
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case 'generate':
        return <QuestionGenerator />
      case 'evaluate':
        return <AnswerEvaluator />
      default:
        return null
    }
  }

  // 마운트되지 않았거나 홈 탭인 경우 null 반환
  if (!isMounted || activeTab === 'home') {
    return null
  }

  // 다른 탭이 활성화된 경우에만 렌더링
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