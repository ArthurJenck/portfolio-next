import { ProjectMedia } from '@/types/ProjectTypes'
import ProjectPicture from './ProjectPicture'

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
                            <>
                                {media.mobileUrl && (
                                    <video
                                        src={media.mobileUrl}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        className="absolute inset-0 w-full h-full object-cover md:hidden"
                                    />
                                )}
                                <video
                                    src={media.url}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className={`absolute inset-0 w-full h-full object-cover${media.mobileUrl ? ' hidden md:block' : ''}`}
                                />
                            </>
                        ) : (
                            <ProjectPicture
                                src={media.url}
                                mobileSrc={media.mobileUrl}
                                alt={`${projectName} - media ${i + 1}`}
                                className="object-cover"
                            />
                        )}
                    </div>
                </section>
            ))}
        </>
    )
}

export default ProjectMediasStack
