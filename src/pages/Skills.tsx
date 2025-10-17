import SectionTitle from "@/components/SectionTitle"
import SkillType from "../components/SkillType"
import skillsArr from "../data/skills"

const Skills = () => {
    const categs = [...new Set(skillsArr.map((skill) => skill.categ))]

    return (
        <section id="skills" className="py-16 relative">
            <SectionTitle title="Compétences" />
            {/* Chaque catégorie (Front-end, Back...) aura sa propre partie */}
            {categs.map((categ, id) => {
                return <SkillType categ={categ} key={`categ-${id}`} />
            })}
        </section>
    )
}

export default Skills
