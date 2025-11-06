import { MetadataRoute } from 'next'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'

const BASE_URL = 'https://arthurjenck.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    try {
        await connectDB()

        // Récupérer tous les projets avec leurs slugs et dates de mise à jour
        const projects = await Project.find({}, 'slug updatedAt').lean()

        // URLs statiques
        const staticRoutes: MetadataRoute.Sitemap = [
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

        // URLs dynamiques des projets
        const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
            url: `${BASE_URL}/${project.slug}`,
            lastModified: project.updatedAt || new Date(),
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
