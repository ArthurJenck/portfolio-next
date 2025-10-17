"use client"

import skillsArr from "../data/skills"
import SkillDiv from "./SkillDiv"

interface SkillTypeProps {
    categ: string
}

const SkillType = ({ categ }: SkillTypeProps) => {
    // Si l'appareil est un mobile, on retire le "-end" de Front-end et Back-end
    return (
        <div className="w-fit relative left-[5.5vw] lg:left-[15vw] top-0 mt-[5svh] lg:mt-[20svh]">
            <h3 className="md:hidden font-bold sticky top-[50svh] text-[clamp(1.2rem,2.5vw,2.5vw)] float-left text-right tracking-[2px] min-w-16">
                {categ.split("-")[0]}
            </h3>
            <h3 className="hidden md:block font-bold sticky top-[50svh] text-[2.5vw] float-left text-right tracking-[2px] min-w-[clamp(120px,14vw,14vw)]">
                {categ}
            </h3>
            <ul className="list-none flex flex-col gap-6 lg:gap-10 top-0 max-w-[68vw] lg:max-w-[55vw] pl-[3vw]">
                {skillsArr.map((skill, id) => {
                    // On n'affiche que les compétences appartenant à la catégorie voulue (Front-end, Back...)
                    return (
                        skill.categ === categ && (
                            <SkillDiv
                                key={`skill-${id}`}
                                name={skill.name}
                                pic={skill.pic}
                                desc={skill.desc}
                            />
                        )
                    )
                })}
            </ul>
        </div>
    )
}

export default SkillType
