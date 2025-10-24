'use client'

import ImgLink from '@/components/ImgLink'
import { useProject } from '@/hooks/useProjects'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import Markdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import ProjectStackTag from './ProjectStackTag'

const ProjectPage = () => {
    const { slug } = useParams<{ slug: string }>()
    const { data: project } = useProject(slug)

    console.log(project)

    if (!project) return <div>Projet non trouvé</div>

    const medias =
        project.medias && project.medias.length > 0
            ? project.medias
            : [{ url: project.cover_image, type: 'image' as const }]

    return (
        <div className="flex flex-col justify-start items-center gap-24 max-w-[80vw]">
            <div className="flex flex-col items-center gap-0.5">
                <h1 className="text-5xl font-bold">{project?.name}</h1>
                <h2 className="text-2xl italic">{project?.subtitle}</h2>
            </div>
            <div className="flex gap-28 flex-1">
                <div className="flex-1/2">
                    <div className="text-md tracking-wider markdown">
                        <Markdown remarkPlugins={[remarkBreaks]}>{project?.description}</Markdown>
                    </div>
                    {project?.webLink && <ImgLink type="projet" link={project?.webLink} className="size-10" />}
                    {project?.githubLink && <ImgLink type="github" link={project?.githubLink} className="size-10" />}
                </div>
                <div className="flex flex-col gap-4 flex-1/2">
                    {medias.map((media, index) => (
                        <div key={index}>
                            {media.type === 'image' ? (
                                <Image
                                    src={media.url}
                                    alt={`${project.name} - Media ${index + 1}`}
                                    width={714}
                                    height={402}
                                    className="w-full h-auto"
                                />
                            ) : (
                                <video src={media.url} controls className="w-full h-auto" preload="metadata">
                                    Votre navigateur ne supporte pas la lecture de vidéos.
                                </video>
                            )}
                        </div>
                    ))}
                    <div className="flex flex-wrap items-center gap-2">
                        {project.stack.map((skill) => (
                            <ProjectStackTag key={skill.id} skill={skill} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProjectPage
