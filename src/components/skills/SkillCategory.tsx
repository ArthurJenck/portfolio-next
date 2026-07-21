import SkillDiv from './SkillDiv'
import { SkillChild } from '@/types/SkillsTypes'

interface SkillCategoryProps {
    name: string
    truncatedName: string
    skills: SkillChild[]
}

const SkillCategory = ({ name, truncatedName, skills }: SkillCategoryProps) => {
    return (
        <div className="w-fit relative left-[5.5vw] lg:left-[15vw] top-0 mt-[7svh] lg:mt-[13svh]">
            <h3 className="md:hidden font-bold sticky top-[50svh] text-[clamp(1.2rem,2.5vw,2.5vw)] float-left text-right tracking-[2px] min-w-16 z-10">
                <span className="bg-(--primary)">{truncatedName}</span>
            </h3>
            <h3 className="hidden md:block font-bold sticky top-[50svh] text-[2.5vw] float-left text-right tracking-[2px] min-w-[clamp(120px,14vw,14vw)] z-10">
                <span className="bg-(--primary)">{name}</span>
            </h3>
            <ul className="list-none flex flex-col gap-6 lg:gap-10 top-0 max-w-[68vw] lg:max-w-[55vw] pl-[3vw]">
                {skills.map((skill) => (
                    <SkillDiv key={skill.id} name={skill.name} pic={skill.icon} desc={skill.description} />
                ))}
            </ul>
        </div>
    )
}

export default SkillCategory
