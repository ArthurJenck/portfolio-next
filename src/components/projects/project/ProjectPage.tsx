import { DetailedProjectType } from '@/types/ProjectTypes'
import Markdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import ProjectStackTag from './ProjectStackTag'
import ImgLink from '@/components/header/ImgLink'
import ProjectMediasCarousel from './ProjectMediasCarousel'

const ProjectPage = ({ project }: { project: DetailedProjectType }) => {
    const medias =
        project.medias && project.medias.length > 0
            ? project.medias
            : [{ url: project.cover_image, type: 'image' as const }]

    return (
        <div className="flex flex-col justify-start md:items-center gap-8 px-[4vw] md:gap-24 md:max-w-[80vw] mb-12 md:mb-[10vh]">
            <div className="flex flex-col items-start md:items-center gap-0.5 w-full pr-[calc(8vw+28px)] md:pr-0">
                <h1 className="text-4xl md:text-5xl font-bold">{project.name}</h1>
                <h2 className="text-2xl italic">{project.subtitle}</h2>
            </div>
            <div className="flex flex-col-reverse md:flex-row gap-12 md:gap-28 flex-1">
                <div className="flex-1/2 flex flex-col gap-4">
                    <div className="text-md tracking-wider markdown">
                        <Markdown remarkPlugins={[remarkBreaks]}>{project.description}</Markdown>
                    </div>
                    <div className="flex items-center gap-4">
                        {project.webLink && <ImgLink type="projet" link={project.webLink} className="size-11" />}
                        {project.githubLink && <ImgLink type="github" link={project.githubLink} className="size-11" />}
                    </div>
                </div>
                <div className="flex flex-col gap-4 flex-1/2">
                    <ProjectMediasCarousel
                        medias={medias}
                        projectName={project.name}
                        projectLink={project.webLink || project.githubLink}
                    />
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
