"use client"

import SectionTitle from "@/components/SectionTitle"
import SkillType from "../components/SkillType"
import { useSkills } from "@/hooks/useSkills"

const Skills = () => {
  const { data: skills, isLoading, error } = useSkills()

  // Extraire les catégories uniques des skills
  const categs = skills
    ? [...new Set(skills.map((skill) => skill.category))]
    : []

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
        <div className="text-center text-red-500">
          Erreur lors du chargement des compétences
        </div>
      </section>
    )
  }

  return (
    <section id="skills" className="py-16 relative">
      <SectionTitle title="Compétences" />
      {/* Chaque catégorie (Front-end, Back...) aura sa propre partie */}
      {categs.map((categ, id) => {
        return (
          <SkillType categ={categ} skills={skills || []} key={`categ-${id}`} />
        )
      })}
    </section>
  )
}

export default Skills
