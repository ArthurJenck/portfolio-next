import { SkillChild } from '@/types/SkillsTypes'
import Markdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import ProjectStackTag from './ProjectStackTag'
import ImgLink from '@/components/header/ImgLink'

interface ProjectTextSectionProps {
    subtitle?: string
    columns: string[]
    stack: SkillChild[]
    webLink?: string
    githubLink?: string
}

const ProjectTextSection = ({ subtitle, columns, stack, webLink, githubLink }: ProjectTextSectionProps) => {
    return (
        <section id="project-details" className="project-slide embla__slide project-text-slide relative z-10">
            <div className="project-text-inner">
                {subtitle && <h2 className="project-text-title text-white font-semibold">{subtitle}</h2>}

                {columns.length > 0 && (
                    <div className="project-text-columns">
                        {columns.map((col, i) => (
                            <div key={i} className="project-text-column markdown">
                                <Markdown remarkPlugins={[remarkBreaks]}>{col}</Markdown>
                            </div>
                        ))}
                    </div>
                )}

                {(webLink || githubLink || stack.length > 0) && (
                    <div className="project-text-meta flex flex-wrap items-center gap-4">
                        {webLink && <ImgLink type="projet" link={webLink} className="size-11" />}
                        {githubLink && <ImgLink type="github" link={githubLink} className="size-11" />}
                        {(webLink || githubLink) && stack.length > 0 && <div className="w-px h-8 bg-white/30 mx-1" />}
                        {stack.map((skill) => (
                            <ProjectStackTag key={skill.id} skill={skill} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default ProjectTextSection
