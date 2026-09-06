import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // the day this build was made: the profile label prints it as its REV,
  // and the CV prints it as its date
  env: { NEXT_PUBLIC_BUILT: new Date().toISOString().slice(0, 10) },
  // the PDF renderer brings its own reconciler; bundling it breaks it
  serverExternalPackages: ['@react-pdf/renderer'],
  // the CV embeds fonts read from disk at render time
  outputFileTracingIncludes: { '/resume.pdf': ['./assets/fonts/*'] },
}

export default nextConfig
