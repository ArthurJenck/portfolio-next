import { ProjectMedia } from '@/types/ProjectTypes'
import Image from 'next/image'

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
                            <>
                                {media.mobileUrl && (
                                    <Image
                                        src={media.mobileUrl}
                                        alt={`${projectName} - media ${i + 1}`}
                                        fill
                                        className="object-cover md:hidden"
                                        sizes="100vw"
                                        quality={90}
                                    />
                                )}
                                <Image
                                    src={media.url}
                                    alt={`${projectName} - media ${i + 1}`}
                                    fill
                                    className={`object-cover${media.mobileUrl ? ' hidden md:block' : ''}`}
                                    sizes="100vw"
                                    quality={90}
                                />
                            </>
                        )}
                    </div>
                </section>
            ))}
        </>
    )
}

export default ProjectMediasStack
