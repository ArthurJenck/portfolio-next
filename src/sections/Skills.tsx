'use client'

import SectionTitle from '@/components/SectionTitle'
import SkillCategory from '../components/SkillCategory'
import { useSkills } from '@/hooks/useSkills'
import SkillsSkeleton from '@/components/skills/SkillsSkeleton'

const Skills = () => {
    const { data: skillCategories, isLoading, error } = useSkills()

    return (
        <section id="skills" className="py-16 relative">
            <SectionTitle title="Compétences" />
            {/* Chaque catégorie (Front-end, Back...) aura sa propre partie */}
            {isLoading ? (
                <SkillsSkeleton />
            ) : error || !skillCategories ? (
                <div>Erreur lors du chargement des compétences</div>
            ) : (
                skillCategories?.map((category) => (
                    <SkillCategory
                        key={category.id}
                        name={category.name}
                        truncatedName={category.truncatedName}
                        skills={category.skills}
                    />
                ))
            )}
        </section>
    )
}

export default Skills
