'use client'

import Image from 'next/image'
import Chevron from '@/assets/icons/chevron.svg'
import { type KeyboardEvent } from 'react'
import { useProjectSlider } from './ProjectSliderContext'
import './ProjectPage.scss'

interface ProjectCoverProps {
    name: string
}

const ProjectCover = ({ name }: ProjectCoverProps) => {
    const { scrollTo } = useProjectSlider()

    const scrollToDetails = () => scrollTo(1)

    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        scrollToDetails()
    }

    return (
        <section
            className="project-slide embla__slide project-cover-slide flex flex-col items-center justify-center relative z-10"
            role="button"
            tabIndex={0}
            onClick={scrollToDetails}
            onKeyDown={handleKeyDown}
            aria-label="Defiler vers les details du projet"
        >
            <h1 className="cover-title text-white text-4xl md:text-6xl lg:text-7xl font-bold text-center px-8 max-w-4xl leading-tight">
                {name}
            </h1>
            <div className="cover-divider w-px h-16 bg-white/60 my-6" />
            <div className="cover-discover flex flex-col items-center gap-2">
                <span className="text-white/60 text-xs tracking-[0.2em] uppercase">Défiler pour découvrir</span>
                <Image
                    src={Chevron}
                    alt="Défiler pour découvrir"
                    width={32}
                    height={32}
                    className="w-6 md:w-8 opacity-80"
                />
            </div>
        </section>
    )
}

export default ProjectCover
