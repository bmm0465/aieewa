/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@langchain/openai', '@langchain/core']
  }
}

module.exports = nextConfig
