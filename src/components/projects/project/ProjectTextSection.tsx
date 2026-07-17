'use client'

import { SkillChild } from '@/types/SkillsTypes'
import Markdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import ProjectStackTag from './ProjectStackTag'
import ImgLink from '@/components/header/ImgLink'
import { useProjectSlider } from './ProjectSliderContext'

interface ProjectTextSectionProps {
    subtitle?: string
    columns: string[]
    stack: SkillChild[]
    webLink?: string
    githubLink?: string
}

const ProjectTextSection = ({ subtitle, columns, stack, webLink, githubLink }: ProjectTextSectionProps) => {
    const { isMobile } = useProjectSlider()

    const meta = (webLink || githubLink || stack.length > 0) && (
        <div className="project-text-meta flex items-start gap-4">
            {(webLink || githubLink) && (
                <div className="flex items-center gap-4 shrink-0">
                    {webLink && <ImgLink type="projet" link={webLink} className="size-11" />}
                    {githubLink && <ImgLink type="github" link={githubLink} className="size-11" />}
                </div>
            )}
            {(webLink || githubLink) && stack.length > 0 && (
                <div className="w-px self-stretch bg-white/30 mx-1 shrink-0" />
            )}
            {stack.length > 0 && (
                <div className="project-text-stack flex flex-wrap items-center gap-2 md:gap-3">
                    {stack.map((skill) => (
                        <ProjectStackTag key={skill.id} skill={skill} />
                    ))}
                </div>
            )}
        </div>
    )

    if (isMobile) {
        const [first, second] = columns

        return (
            <>
                <section id="project-details" className="project-slide embla__slide project-text-slide relative z-10">
                    <div className="project-text-inner">
                        {subtitle && <h2 className="project-text-title text-white font-semibold">{subtitle}</h2>}

                        {first && (
                            <div className="project-text-columns">
                                <div className="project-text-column markdown">
                                    <Markdown remarkPlugins={[remarkBreaks]}>{first}</Markdown>
                                </div>
                            </div>
                        )}

                        {!second && meta}
                    </div>
                </section>

                {second && (
                    <section className="project-slide embla__slide project-text-slide relative z-10">
                        <div className="project-text-inner">
                            <div className="project-text-columns">
                                <div className="project-text-column markdown">
                                    <Markdown remarkPlugins={[remarkBreaks]}>{second}</Markdown>
                                </div>
                            </div>

                            {meta}
                        </div>
                    </section>
                )}
            </>
        )
    }

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

                {meta}
            </div>
        </section>
    )
}

export default ProjectTextSection
