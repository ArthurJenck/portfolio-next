import { DetailedProjectType } from '@/types/ProjectTypes'
import ProjectSlider from './ProjectSlider'
import ProjectCover from './ProjectCover'
import ProjectTextSection from './ProjectTextSection'
import ProjectMediasStack from './ProjectMediasStack'
import './ProjectPage.scss'

const ProjectPage = ({ project }: { project: DetailedProjectType }) => {
    const medias = (project.medias ?? []).filter((media) => media.url !== project.cover_image)

    const paragraphs = project.description
        .split(/\n\s*\n/)
        .map((s) => s.trim())
        .filter(Boolean)

    return (
        <div className="project-page">
            <ProjectSlider name={project.name} coverImage={project.cover_image} mobileCoverImage={project.mobile_cover_image}>
                <ProjectCover name={project.name} />
                <ProjectTextSection
                    subtitle={project.subtitle}
                    columns={paragraphs}
                    stack={project.stack}
                    webLink={project.webLink}
                    githubLink={project.githubLink}
                />
                {medias.length > 0 && <ProjectMediasStack medias={medias} projectName={project.name} />}
            </ProjectSlider>
        </div>
    )
}

export default ProjectPage
