import SectionTitle from '@/components/SectionTitle'
import SkillCategory from './SkillCategory'
import { SkillResponse } from '@/types/SkillsTypes'

const Skills = ({ skillCategories }: { skillCategories: SkillResponse }) => {
    return (
        <section id="skills" className="py-16 relative">
            <SectionTitle title="Compétences" />
            {skillCategories.map((category) => (
                <SkillCategory
                    key={category.id}
                    name={category.name}
                    truncatedName={category.truncatedName}
                    skills={category.skills}
                />
            ))}
        </section>
    )
}

export default Skills
