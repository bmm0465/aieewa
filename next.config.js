/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@langchain/openai', '@langchain/core']
  },
  poweredByHeader: false,
  reactStrictMode: false,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  // 정적 파일 처리 및 라우팅 최적화
  async headers() {
    return [
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  // 라우팅 문제 방지
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
}

module.exports = nextConfig
