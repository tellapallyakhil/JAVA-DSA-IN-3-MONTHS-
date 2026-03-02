import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/profile/'],
        },
        sitemap: 'https://java-dsa-in-3-months.vercel.app/sitemap.xml',
    }
}
