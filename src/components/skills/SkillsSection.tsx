import SectionTitle from '@/components/ui/SectionTitle'
import SkillCategory from './SkillCategory'
import { SkillResponse } from '@/types/SkillsTypes'

const Skills = ({ skillCategories }: { skillCategories: SkillResponse }) => {
    return (
        <section id="skills" className="py-16 relative">
            <SectionTitle title="Compétences" />
            <div className="relative">
                {skillCategories.map((category) => (
                    <SkillCategory
                        key={category.id}
                        name={category.name}
                        truncatedName={category.truncatedName}
                        skills={category.skills}
                    />
                ))}
            </div>
        </section>
    )
}

export default Skills
