'use client'

import { useProject } from '@/hooks/useProjects'
import Image from 'next/image'
import { useParams } from 'next/navigation'

const ProjectPage = () => {
    const { slug } = useParams<{ slug: string }>()
    const { data: project } = useProject(slug)

    console.log(project)

    return (
        <div className="flex flex-col justify-center items-center">
            <h1>{project?.name}</h1>
            <p>{project?.description}</p>
            {project?.image && <Image src={project?.image} alt={project?.name} width={100} height={100} />}
            <a href={project?.webLink} target="_blank" rel="noopener noreferrer">
                Site web
            </a>
            <a href={project?.githubLink} target="_blank" rel="noopener noreferrer">
                GitHub
            </a>
        </div>
    )
}

export default ProjectPage
