import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"
import { Caveat, Press_Start_2P, Gaegu } from 'next/font/google'
import { PERSONAL, PROFILE_LINKS } from '@/lib/data'
import { Analytics } from '@vercel/analytics/next'

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-caveat',
})

const pressStart2P = Press_Start_2P({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-pixel',
})

const gaegu = Gaegu({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-gaegu',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://luvvv.me'),
  title: 'Luv Patel - Full Stack Developer',
  description: 'Computer Science student and Full Stack Developer specializing in React, Next.js, TypeScript, and modern web technologies. Building innovative web applications and solving complex problems.',
  keywords: ['developer', 'portfolio', 'react', 'nextjs', 'typescript', 'full stack', 'web development', 'computer science'],
  authors: [{ name: 'Luv Patel' }],
  creator: 'Luv Patel',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Luv Patel - Full Stack Developer',
    description: 'Computer Science student and Full Stack Developer specializing in React, Next.js, and modern web technologies.',
    url: 'https://luvvv.me',
    siteName: 'Luv Patel Portfolio',
    images: [
      {
        url: 'https://www.luvvv.me/portfolio.png',
        width: 1916,
        height: 1085,
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
    images: ['https://www.luvvv.me/portfolio.png'],
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
    google: 'fRvJPeQuqsOp4rSOEh-_m0hXZNSerwCRGQoVQJPwgFs',
  },
}

// Person structured data (JSON-LD) — helps Google show a rich result /
// Knowledge Panel for the site owner. Built from the same PERSONAL /
// PROFILE_LINKS source as the rest of the site.
const PERSON_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: PERSONAL.name,
  url: 'https://luvvv.me',
  image: 'https://www.luvvv.me' + PERSONAL.avatar,
  jobTitle: 'Full Stack Developer',
  description: PERSONAL.bio,
  email: PROFILE_LINKS.find((link) => link.label === 'Email')?.href.replace('mailto:', ''),
  alumniOf: {
    '@type': 'CollegeOrUniversity',
    name: 'Nirma University',
  },
  sameAs: PROFILE_LINKS
    .filter((link) => link.href.startsWith('http'))
    .map((link) => link.href),
}

// Applied before hydration so the correct theme is painted on the very first frame
// (avoids a flash of the wrong theme). Dark is the default, so only an
// explicit stored "light" preference should paint light on first load.
const THEME_INIT_SCRIPT = `
  try {
    var theme = localStorage.getItem('theme');
    if (theme === 'light') {
      document.documentElement.style.colorScheme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    }
  } catch (e) {}
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_JSON_LD) }}
        />
      </head>
      <body className={`${caveat.variable} ${pressStart2P.variable} ${gaegu.variable}`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
