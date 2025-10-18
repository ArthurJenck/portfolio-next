"use client"

import { projectsArr } from "../data/projects"
import { techsArr } from "../data/techs"
import "../styles/Projets.scss"
import SectionTitle from "@/components/SectionTitle"

const Projets = () => {
    // On trie ensuite ces projets par date
    const datedProjects = projectsArr.sort((a, b) => {
        return b.date.getTime() - a.date.getTime()
    })

    // Les techs sont récupérées et triées par ordre d'apparition (indiqué manuellement dans les données d'objet)
    const baseTechs = [
        ...techsArr.sort((a, b) => {
            return a.order - b.order
        }),
    ]

    // Les techs indiquées comme actives et donc comme filtres seront ajoutées dans ce tableau
    const activeTechs = [] as Array<string>

    return (
        <section id="projets">
            <SectionTitle title="Projets" />
            {/* <TechFilter
                toUseTechs={toUseTechs}
                setToUseTechs={setToUseTechs}
                noFiltersClicked={noFiltersClicked}
                setNoFiltersClicked={setNoFiltersClicked}
            /> */}
            {/* Sur chaque rendu, on vérifie les filtres actifs */}
            {/* {datedProjects.map((project, index) => {
                activeTechs.length = 0
                // Si le projet contient tous les filtres demandés, ou bien qu'aucun filtre n'est cliqué, alors le projet est affiché
                if (activeTechs.every((tech) => project.techs.includes(tech))) {
                    return (
                        // <SingleProject
                        //     key={`projet-${index}`}
                        //     name={project.name}
                        //     desc={project.desc}
                        //     techs={project.techs}
                        //     gitLink={project.gitLink}
                        //     webLink={project.webLink}
                        //     picDesk={project.picDesk.src}
                        //     picSmol={project.picSmol.src}
                        //     picMobile={project.picMobile.src}
                        // />
                        null
                    )
                }
            })} */}
        </section>
    )
}

export default Projets
