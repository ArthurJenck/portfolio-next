import { ProjectMedia } from '@/types/ProjectTypes'
import Image from 'next/image'
import './ProjectPage.scss'

interface ProjectMediasStackProps {
    medias: ProjectMedia[]
    projectName: string
}

const ProjectMediasStack = ({ medias, projectName }: ProjectMediasStackProps) => {
    if (medias.length === 0) return null

    return (
        <>
            {medias.map((media, i) => (
                <section key={i} className="project-slide embla__slide media-slide">
                    <div className="media-slide__frame">
                        {media.type === 'video' ? (
                            <video
                                src={media.url}
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <Image
                                src={media.url}
                                alt={`${projectName} - media ${i + 1}`}
                                fill
                                className="object-cover"
                                sizes="100vw"
                                priority={i === 0}
                            />
                        )}
                    </div>
                </section>
            ))}
        </>
    )
}

export default ProjectMediasStack
