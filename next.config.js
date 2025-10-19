/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@langchain/openai', '@langchain/core']
  },
  poweredByHeader: false,
  reactStrictMode: false,
  swcMinify: true
}

module.exports = nextConfig