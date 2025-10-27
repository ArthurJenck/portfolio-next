import { SkillChild } from '@/types/SkillsTypes'
import Image from 'next/image'

interface ProjectStackTagProps {
    skill: SkillChild
}

const ProjectStackTag = ({ skill }: ProjectStackTagProps) => {
    return (
        <div className="flex items-center gap-2 bg-white rounded-full px-1.5 py-1 w-fit text-black font-semibold text-sm whitespace-nowrap">
            <Image src={skill.icon} alt={skill.name} width={20} height={20} /> {skill.name}
        </div>
    )
}

export default ProjectStackTag
