'use client'

import ImgLink from '@/components/ImgLink'
import { useProject } from '@/hooks/useProjects'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import Markdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import ProjectStackTag from './ProjectStackTag'
import ProjectPageSkeleton from './ProjectPageSkeleton'

const ProjectPage = () => {
    const { slug } = useParams<{ slug: string }>()
    const { data: project, isLoading, isError } = useProject(slug)

    if (isLoading) {
        return <ProjectPageSkeleton />
    }

    if (isError || !project) {
        return (
            <div className="flex flex-col justify-center items-center gap-4 min-h-[50vh]">
                <p className="text-2xl font-bold">Projet non trouvé</p>
                <p className="text-lg">Le projet que vous recherchez n'existe pas ou n'est plus disponible.</p>
            </div>
        )
    }

    const medias =
        project.medias && project.medias.length > 0
            ? project.medias
            : [{ url: project.cover_image, type: 'image' as const }]

    return (
        <div className="flex flex-col justify-start md:items-center gap-8 pl-[4vw] pr-[calc(8vw+28px)] md:pr-0 md:gap-24 md:max-w-[80vw] mb-12 md:mb-[10vh]">
            <div className="flex flex-col items-start md:items-center gap-0.5 w-full">
                <h1 className="text-4xl md:text-5xl font-bol    d">{project?.name}</h1>
                <h2 className="text-2xl italic">{project?.subtitle}</h2>
            </div>
            <div className="flex flex-col-reverse md:flex-row gap-4 md:gap-28 flex-1">
                <div className="flex-1/2 flex flex-col gap-4">
                    <div className="text-md tracking-wider markdown">
                        <Markdown remarkPlugins={[remarkBreaks]}>
                            {project?.description &&
                                'lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.  exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?'}
                        </Markdown>
                    </div>
                    <div className="flex items-center gap-4">
                        {project?.webLink && <ImgLink type="projet" link={project?.webLink} className="size-11" />}
                        {project?.githubLink && (
                            <ImgLink type="github" link={project?.githubLink} className="size-11" />
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-16 md:gap-4 flex-1/2">
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
