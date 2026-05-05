import MobileProjectsList from './MobileProjectsList'
import ProjectsCarousel from './ProjectsCarousel'
import SectionTitle from '@/components/SectionTitle'
import { ProjectResponse } from '@/types/ProjectTypes'

const Projets = ({ projects }: { projects: ProjectResponse }) => {
    return (
        <section id="projets" className="relative h-full md:h-[600vh]">
            {/* Container sticky qui reste fixé pendant le scroll - contient tout */}
            <div className="sticky top-0 md:h-screen md:overflow-hidden flex flex-col">
                {/* Titre dans la zone de pinning */}
                <div className="w-full pt-[8vh]">
                    <SectionTitle title="Projets" />
                </div>

                <div className="hidden md:flex items-center flex-1">
                    <ProjectsCarousel projects={projects} />
                </div>

                <div className="md:hidden flex-1">
                    <MobileProjectsList projects={projects} />
                </div>
            </div>
        </section>
    )
}

export default Projets
