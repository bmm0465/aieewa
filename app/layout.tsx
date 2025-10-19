import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'AIEEWA - 초등 영어 서술형 평가 시스템',
  description: 'LLM 기반 초등 영어 서술형 평가 문항 생성 및 자동 채점 시스템',
  keywords: ['AI', '교육', '영어', '서술형', '평가', 'LLM', 'GPT'],
  authors: [{ name: 'AIEEWA Team' }],
  creator: 'AIEEWA',
  publisher: 'AIEEWA',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body style={{ 
        margin: 0, 
        padding: 0, 
        fontFamily: 'system-ui, sans-serif',
        minHeight: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        {children}
      </body>
    </html>
  )
}
