import { MinimalProjectType } from '@/types/ProjectTypes'
import MobileProjectItem from './MobileProjectItem'

interface MobileProjectsListProps {
    projects: MinimalProjectType[]
}

const MobileProjectsList = ({ projects }: MobileProjectsListProps) => {
    console.log(projects)

    return (
        <div className="flex flex-col gap-8 p-[5.5vw]">
            {projects.map((project) => (
                <MobileProjectItem key={project.id} project={project} />
            ))}
        </div>
    )
}

export default MobileProjectsList
