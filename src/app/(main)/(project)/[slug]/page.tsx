import ProjectPage from '@/components/projects/project/ProjectPage'
import ProjectPagerNav from '@/components/projects/project/ProjectPagerNav'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublicProjectBySlug, getPublicProjectSitemapEntries } from '@/lib/public-content'
import { SITE_URL } from '@/lib/site-config'

const BASE_URL = SITE_URL
export const dynamicParams = true

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params

    try {
        const project = await getPublicProjectBySlug(slug)

        if (!project) {
            return {
                title: 'Projet non trouvé',
                description: "Ce projet n'existe pas ou n'est plus disponible.",
            }
        }

        const title = project.name
        const description = project.summary || project.subtitle || `Découvrez le projet ${project.name}`
        const imageUrl =
            project.cover_image || 'https://3jrx06emyedlbjzt.public.blob.vercel-storage.com/share-preview.png'

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                url: `${BASE_URL}/${slug}`,
                siteName: 'Arthur Jenck',
                images: [{ url: imageUrl }],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [imageUrl],
            },
            alternates: {
                canonical: `${BASE_URL}/${slug}`,
            },
        }
    } catch (error) {
        console.error('Error generating metadata:', error)
        return {
            title: 'Projet',
            description: 'Découvrez mes projets de développement web',
        }
    }
}

export async function generateStaticParams() {
    try {
        const projects = await getPublicProjectSitemapEntries()

        return projects.map((project) => ({
            slug: project.slug,
        }))
    } catch (error) {
        console.error('Error generating static params:', error)
        return []
    }
}

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params
    const project = await getPublicProjectBySlug(slug)

    if (!project) {
        notFound()
    }

    const projectUrl = `${BASE_URL}/${slug}`

    const creativeWorkSchema = {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: project.name,
        description: project.summary || project.subtitle,
        url: projectUrl,
        ...(project.cover_image ? { image: project.cover_image } : {}),
        author: { '@id': `${SITE_URL}/#person` },
        inLanguage: 'fr-FR',
    }

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Accueil',
                item: SITE_URL,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: project.name,
                item: projectUrl,
            },
        ],
    }

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWorkSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <ProjectPage project={project} />
            <ProjectPagerNav slug={slug} />
        </>
    )
}

export default Page
