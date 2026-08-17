import { MetadataRoute } from 'next'
import { getPublicCv, getPublicProjectSitemapEntries } from '@/lib/public-content'
import { SITE_URL } from '@/lib/site-config'

const BASE_URL = SITE_URL

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    try {
        const [projects, cv] = await Promise.all([getPublicProjectSitemapEntries(), getPublicCv()])
        const latestProjectUpdate = projects[0] ? new Date(projects[0].updatedAt) : new Date()

        // URLs statiques
        const staticRoutes: MetadataRoute.Sitemap = [
            {
                url: BASE_URL,
                lastModified: latestProjectUpdate,
                changeFrequency: 'weekly',
                priority: 1,
            },
            {
                url: `${BASE_URL}/cv`,
                lastModified: cv ? new Date(cv.uploadedAt) : latestProjectUpdate,
                changeFrequency: 'monthly',
                priority: 0.8,
            },
        ]

        // URLs dynamiques des projets
        const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
            url: `${BASE_URL}/${project.slug}`,
            lastModified: new Date(project.updatedAt),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        }))

        return [...staticRoutes, ...projectRoutes]
    } catch (error) {
        console.error('Error generating sitemap:', error)
        // En cas d'erreur, retourner au moins les routes statiques
        return [
            {
                url: BASE_URL,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 1,
            },
            {
                url: `${BASE_URL}/cv`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.8,
            },
        ]
    }
}
