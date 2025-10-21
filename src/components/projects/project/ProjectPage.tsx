'use client'

import { useProject } from '@/hooks/useProjects'
import { useParams } from 'next/navigation'

const ProjectPage = () => {
    const { slug } = useParams<{ slug: string }>()
    const { data: project } = useProject(slug)

    console.log(project)

    return <div>page</div>
}

export default ProjectPage
