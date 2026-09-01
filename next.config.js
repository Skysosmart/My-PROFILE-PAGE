/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // the PDF renderer brings its own reconciler; bundling it breaks it
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
    // the CV embeds fonts read from disk at render time
    outputFileTracingIncludes: { '/resume.pdf': ['./assets/fonts/*'] },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    unoptimized: false,
  },
}

module.exports = nextConfig

