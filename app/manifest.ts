import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Luv Patel - Full Stack Developer',
    short_name: 'Luv Patel',
    description:
      'Computer Science student and Full Stack Developer specializing in React, Next.js, TypeScript, and modern web technologies.',
    start_url: '/',
    display: 'standalone',
    background_color: '#101010',
    theme_color: '#101010',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
