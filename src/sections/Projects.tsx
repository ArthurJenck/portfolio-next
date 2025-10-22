'use client'

import MobileProjectsList from '@/components/projects/MobileProjectsList'
import ProjectsCarousel from '@/components/projects/ProjectsCarousel'
import SectionTitle from '@/components/SectionTitle'
import { useProjects } from '@/hooks/useProjects'

const Projets = () => {
    const { data: projects, isLoading, error } = useProjects()

    return (
        <section id="projets" className="relative h-full md:h-[600vh]">
            {/* Container sticky qui reste fixé pendant le scroll - contient tout */}
            <div className="sticky top-0 md:h-screen md:overflow-hidden flex flex-col">
                {/* Titre dans la zone de pinning */}
                <div className="w-full pt-[8vh]">
                    <SectionTitle title="Projets" />
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center w-full h-full">
                        <div className="text-gray-500">Chargement des projets...</div>
                    </div>
                ) : error || !projects ? (
                    <div className="flex items-center justify-center w-full h-full">
                        <div className="text-red-500">Erreur lors du chargement des projets</div>
                    </div>
                ) : (
                    <>
                        <div className="hidden md:flex items-center flex-1">
                            <ProjectsCarousel projects={projects} />
                        </div>

                        <div className="md:hidden flex-1">
                            <MobileProjectsList projects={projects} />
                        </div>
                    </>
                )}
            </div>
        </section>
    )
}

export default Projets
