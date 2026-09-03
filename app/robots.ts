import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: 'Twitterbot',
        allow: '/',
      },
    ],
    sitemap: 'https://luvvv.me/sitemap.xml',
  }
}
