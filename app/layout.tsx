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
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            @media (hover: hover) {
              .feature-card:hover {
                transform: translateY(-8px) !important;
                box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 8px 16px -4px rgba(0, 0, 0, 0.1) !important;
              }
            }
            
            @media (max-width: 768px) {
              .feature-card {
                margin: 0.5rem;
                padding: 1.5rem !important;
              }
              
              h1 {
                font-size: 2.5rem !important;
              }
              
              .container-grid {
                grid-template-columns: 1fr !important;
                gap: 1rem !important;
              }
            }
          `
        }} />
      </head>
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
