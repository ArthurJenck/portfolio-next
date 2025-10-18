"use client"

import { ProjectsCarousel } from "@/components/projects/ProjectsCarousel"
import SectionTitle from "@/components/SectionTitle"

const Projets = () => {
    return (
        <section id="projets" className="relative h-[400vh]">
            {/* Container sticky qui reste fixé pendant le scroll - contient tout */}
            <div className="sticky top-0 h-screen overflow-hidden flex flex-col">
                {/* Titre dans la zone de pinning */}
                <div className="w-full pt-[8vh]">
                    <SectionTitle title="Projets" />
                </div>

                {/* Carousel */}
                <div className="flex-1 flex items-center">
                    <ProjectsCarousel />
                </div>
            </div>
        </section>
    )
}

export default Projets
