import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // the PDF renderer brings its own reconciler; bundling it breaks it
  serverExternalPackages: ['@react-pdf/renderer'],
  // the CV embeds fonts read from disk at render time
  outputFileTracingIncludes: { '/resume.pdf': ['./assets/fonts/*'] },
}

export default nextConfig
