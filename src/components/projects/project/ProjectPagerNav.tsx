import Link from 'next/link'
import { getPublicProjects } from '@/lib/public-content'
import { ArrowLeft, ArrowRight, MoveLeft, MoveRight } from 'lucide-react'

const ProjectPagerNav = async ({ slug }: { slug: string }) => {
    const projects = await getPublicProjects()

    if (projects.length < 2) {
        return null
    }

    const currentIndex = projects.findIndex((project) => project.slug === slug)

    if (currentIndex === -1) {
        return null
    }

    const previous = projects[(currentIndex + 1) % projects.length]
    const isFirst = currentIndex === 0
    const next = projects[(currentIndex - 1 + projects.length) % projects.length]
    const isLast = currentIndex === projects.length - 1

    const linkClass =
        'pointer-events-auto max-w-[45%] group flex flex-col gap-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white'
    const labelClass =
        'text-[0.6rem] uppercase tracking-[0.2em] text-white/50 group-hover:text-white/70 transition-colors flex items-center gap-2'
    const nameClass = 'truncate text-sm md:text-base text-white/80 group-hover:text-white transition-colors'

    return (
        <nav
            aria-label="Navigation entre les projets"
            className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex items-end justify-between gap-6 px-[4vw] pb-5 md:pb-7 [text-shadow:0_2px_14px_rgba(0,0,0,0.55)]"
        >
            <Link data-sfx="link" href={`/${next.slug}`} className={linkClass} rel="next">
                <span className={labelClass}>
                    <MoveLeft size={20} />
                    {isFirst ? 'Aller à la fin' : 'Projet précédent'}
                </span>
                <span className={nameClass}>{next.name}</span>
            </Link>

            <Link
                data-sfx="link"
                href={`/${previous.slug}`}
                className={`${linkClass} items-end text-right`}
                rel="previous"
            >
                <span className={labelClass}>
                    {isLast ? 'Retour au début' : 'Projet suivant'}
                    <MoveRight size={20} />
                </span>
                <span className={nameClass}>{previous.name}</span>
            </Link>
        </nav>
    )
}

export default ProjectPagerNav
