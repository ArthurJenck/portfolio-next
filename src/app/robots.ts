import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-config'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            disallow: ['/admin/', '/api/'],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
    }
}
