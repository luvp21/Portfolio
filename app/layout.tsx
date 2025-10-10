import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  metadataBase: new URL('https://portfolio-luvp21s-projects.vercel.app'),
  title: 'Luv Patel - Full Stack Developer',
  description: 'Computer Science student and Full Stack Developer specializing in React, Next.js, TypeScript, and modern web technologies. Building innovative web applications and solving complex problems.',
  keywords: ['developer', 'portfolio', 'react', 'nextjs', 'typescript', 'full stack', 'web development', 'computer science'],
  authors: [{ name: 'Luv Patel' }],
  creator: 'Luv Patel',
  openGraph: {
    title: 'Luv Patel - Full Stack Developer',
    description: 'Computer Science student and Full Stack Developer specializing in React, Next.js, and modern web technologies.',
    url: 'https://portfolio-luvp21s-projects.vercel.app',
    siteName: 'Luv Patel Portfolio',
    images: [
      {
        url: '/portfolio.png',
        width: 1200,
        height: 630,
        alt: 'Luv Patel Portfolio',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luv Patel - Full Stack Developer',
    description: 'Computer Science student and Full Stack Developer specializing in React, Next.js, and modern web technologies.',
    images: ['/portfolio.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'fRvJPeQuqsOp4rSOEh-_m0hXZNSerwCRGQoVQJPwgFs', // Add your actual verification code
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
      <ThemeProvider>
        {children}
      </ThemeProvider>
      </body>
    </html>
  )
}
