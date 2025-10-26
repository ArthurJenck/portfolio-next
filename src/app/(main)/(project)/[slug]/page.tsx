import ProjectPage from '@/components/projects/project/ProjectPage'
import { Metadata } from 'next'
import { getProject } from '@/api/projectsApi'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const { slug } = await params
    const project = await getProject(slug)

    return {
        title: `Arthur Jenck • ${project?.name}`,
    }
}

const page = () => {
    return <ProjectPage />
}

export default page
