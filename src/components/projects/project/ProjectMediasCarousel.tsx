'use client'

import { DetailedProjectType, ProjectMedia } from '@/types/ProjectTypes'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const ProjectMediasCarousel = ({ medias, project }: { medias: ProjectMedia[]; project: DetailedProjectType }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])

    const scrollTo = useCallback(
        (index: number) => {
            if (emblaApi) emblaApi.scrollTo(index)
        },
        [emblaApi],
    )

    const onSelect = useCallback(() => {
        if (!emblaApi) return
        setSelectedIndex(emblaApi.selectedScrollSnap())
    }, [emblaApi])

    useEffect(() => {
        if (!emblaApi) return
        onSelect()
        setScrollSnaps(emblaApi.scrollSnapList())
        emblaApi.on('select', onSelect)
        emblaApi.on('reInit', onSelect)

        return () => {
            emblaApi.off('select', onSelect)
            emblaApi.off('reInit', onSelect)
        }
    }, [emblaApi, onSelect])

    // Si un seul média, pas besoin de carousel
    if (medias.length === 1) {
        const media = medias[0]
        return (
            <a
                href={project.webLink || project.githubLink || media.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative w-full overflow-hidden"
            >
                {media.type === 'image' ? (
                    <Image
                        src={media.url}
                        alt={`${project.name} - Media`}
                        width={714}
                        height={402}
                        className="w-full h-auto"
                    />
                ) : (
                    <video
                        src={media.url}
                        controls
                        muted
                        loop
                        className="w-full h-auto aspect-video"
                        preload="metadata"
                    >
                        Votre navigateur ne supporte pas la lecture de vidéos.
                    </video>
                )}
            </a>
        )
    }

    return (
        <div className="relative w-full">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {medias.map((media, index) => (
                        <a
                            key={index}
                            href={project.webLink || project.githubLink || media.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-[0_0_100%] min-w-0"
                        >
                            {media.type === 'image' ? (
                                <Image
                                    src={media.url}
                                    alt={`${project.name} - Media ${index + 1}`}
                                    width={714}
                                    height={402}
                                    className="w-full h-auto"
                                />
                            ) : (
                                <video
                                    src={media.url}
                                    controls
                                    muted
                                    loop
                                    preload="metadata"
                                    className="w-full h-auto aspect-video"
                                >
                                    Votre navigateur ne supporte pas la lecture de vidéos.
                                </video>
                            )}
                        </a>
                    ))}
                </div>
            </div>

            {/* Boutons de navigation */}
            <button
                onClick={scrollPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#2c253e]/80 hover:bg-[#714e97] text-[#fdfdfe] rounded-full p-2 transition-colors"
                aria-label="Image précédente"
            >
                <ChevronLeft size={24} />
            </button>
            <button
                onClick={scrollNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#2c253e]/80 hover:bg-[#714e97] text-[#fdfdfe] rounded-full p-2 transition-colors"
                aria-label="Image suivante"
            >
                <ChevronRight size={24} />
            </button>

            {/* Indicateurs de pagination */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex justify-center gap-2 mt-4">
                {scrollSnaps.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => scrollTo(index)}
                        className={`h-2 rounded-full transition-all ${
                            index === selectedIndex ? 'bg-[#714e97] w-6' : 'bg-[#2c253e] hover:bg-[#714e97]/50 w-2'
                        }`}
                        aria-label={`Aller au média ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}

export default ProjectMediasCarousel
