"use client"

import skillsArr from "../data/skills"
import SkillDiv from "./SkillDiv"
import "../styles/SkillType.scss"
import { isMobileDevice } from "../hooks"

interface SkillTypeProps {
    categ: string
}

const SkillType = ({ categ }: SkillTypeProps) => {
    // Si l'appareil est un mobile, on retire le "-end" de Front-end et Back-end
    const toDisplayCateg = isMobileDevice() ? categ.split("-")[0] : categ
    return (
        <div className="skill-type">
            <h3>{toDisplayCateg}</h3>
            <ul>
                {skillsArr.map((skill, id) => {
                    // On n'affiche que les compétences appartenant à la catégorie voulue (Front-end, Back...)
                    return skill.categ === categ ? (
                        <SkillDiv
                            key={`skill-${id}`}
                            name={skill.name}
                            pic={skill.pic}
                            desc={skill.desc}
                        />
                    ) : null
                })}
            </ul>
        </div>
    )
}

export default SkillType
