'use client'

import SectionTitle from '@/components/SectionTitle'
import SkillCategory from '../components/SkillCategory'
import { useSkills } from '@/hooks/useSkills'

const Skills = () => {
    const { data: skillCategories, isLoading, error } = useSkills()

    if (isLoading) {
        return (
            <section id="skills" className="py-16 relative">
                <SectionTitle title="Compétences" />
                <div className="text-center text-gray-500">Chargement...</div>
            </section>
        )
    }

    if (error) {
        return (
            <section id="skills" className="py-16 relative">
                <SectionTitle title="Compétences" />
                <div className="text-center text-red-500">Erreur lors du chargement des compétences</div>
            </section>
        )
    }

    return (
        <section id="skills" className="py-16 relative">
            <SectionTitle title="Compétences" />
            {/* Chaque catégorie (Front-end, Back...) aura sa propre partie */}
            {skillCategories?.map((category) => (
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
