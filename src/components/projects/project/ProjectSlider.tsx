'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { useMotionValue } from 'framer-motion'
import { useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useIsMobile } from '@/hooks/useIsMobile'
import { ProjectSliderContext } from './ProjectSliderContext'
import ProjectCoverBackground from './ProjectCoverBackground'
import { EMBLA_DURATION } from '../projects.config'

interface ProjectSliderProps {
    name: string
    coverImage: string
    mobileCoverImage?: string
    children: ReactNode
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

const ProjectSlider = ({ name, coverImage, mobileCoverImage, children }: ProjectSliderProps) => {
    const prefersReducedMotion = usePrefersReducedMotion()
    const isMobile = useIsMobile()
    const coverProgress = useMotionValue(0)

    const plugins = useMemo(() => [WheelGesturesPlugin({ forceWheelAxis: 'y' })], [])
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { axis: 'y', loop: true, dragFree: false, duration: prefersReducedMotion ? 0 : EMBLA_DURATION, watchResize: true },
        plugins,
    )

    const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi])

    useEffect(() => {
        if (!emblaApi) return

        const update = () => {
            const coverNode = emblaApi.slideNodes()[0]
            if (!coverNode) return
            const top = coverNode.getBoundingClientRect().top
            const viewportH = window.innerHeight || 1
            coverProgress.set(clamp(Math.abs(top) / viewportH, 0, 1))
        }

        update()
        emblaApi.on('scroll', update)
        emblaApi.on('reInit', update)

        return () => {
            emblaApi.off('scroll', update)
            emblaApi.off('reInit', update)
        }
    }, [emblaApi, coverProgress])

    useEffect(() => {
        if (!emblaApi) return

        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null
            if (target?.closest('a, button, input, textarea, select, [role="button"], [contenteditable]')) return

            if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') {
                event.preventDefault()
                emblaApi.scrollNext()
            } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
                event.preventDefault()
                emblaApi.scrollPrev()
            } else if (event.key === 'Home') {
                event.preventDefault()
                emblaApi.scrollTo(0)
            } else if (event.key === 'End') {
                event.preventDefault()
                emblaApi.scrollTo(emblaApi.scrollSnapList().length - 1)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [emblaApi])

    useEffect(() => {
        document.documentElement.classList.add('project-scroll-page')
        document.body.classList.add('project-scroll-page')
        return () => {
            document.documentElement.classList.remove('project-scroll-page')
            document.body.classList.remove('project-scroll-page')
        }
    }, [])

    useEffect(() => {
        emblaApi?.reInit()
    }, [emblaApi, isMobile])

    const value = useMemo(() => ({ scrollTo, coverProgress, isMobile }), [scrollTo, coverProgress, isMobile])

    return (
        <ProjectSliderContext.Provider value={value}>
            <ProjectCoverBackground name={name} coverImage={coverImage} mobileCoverImage={mobileCoverImage} />
            <div className="embla" ref={emblaRef}>
                <div className="embla__container">{children}</div>
            </div>
        </ProjectSliderContext.Provider>
    )
}

export default ProjectSlider
