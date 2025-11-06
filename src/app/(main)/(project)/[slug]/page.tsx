import ProjectPage from '@/components/projects/project/ProjectPage'
import { Metadata } from 'next'
import connectDB from '@/lib/mongodb'
import Project, { IProject } from '@/models/Project'

const BASE_URL = 'https://arthurjenck.com'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params

    try {
        await connectDB()
        const project = (await Project.findOne({ slug }).lean()) as unknown as IProject | null

        if (!project) {
            return {
                title: 'Projet non trouvé - Arthur Jenck',
                description: "Ce projet n'existe pas ou n'est plus disponible.",
            }
        }

        const title = `${project.name} - Arthur Jenck`
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
            title: 'Projet - Arthur Jenck',
            description: 'Découvrez mes projets de développement web',
        }
    }
}

export async function generateStaticParams() {
    try {
        await connectDB()
        const projects = (await Project.find({}, 'slug').lean()) as unknown as Pick<IProject, 'slug'>[]

        return projects.map((project) => ({
            slug: project.slug,
        }))
    } catch (error) {
        console.error('Error generating static params:', error)
        return []
    }
}

const page = () => {
    return <ProjectPage />
}

export default page
