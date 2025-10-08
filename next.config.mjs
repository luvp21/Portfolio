/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    unoptimized: true, // Keep for now since you're using local images
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons'],
  },
}

export default nextConfig
