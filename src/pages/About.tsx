"use client"

import SectionTitle from "@/components/SectionTitle"
import AsciiPortrait from "@/components/AsciiPortrait"

const About = () => {
    return (
        <section id="about">
            <SectionTitle title="Qui suis-je ?" />
            <div className="flex flex-col xl:flex-row justify-center items-center max-w-[70vw] lg:max-w-[60vw] gap-10 md:gap-20 py-[5svh] md:py-[8vh] mx-auto">
                <AsciiPortrait />
                <div>
                    <h3 className="text-2xl lg:text-3xl font-bold mb-5">
                        Je sais centrer une div
                    </h3>
                    <p className="mb-4">
                        Fou amoureux du développement web, j'y pense le jour et
                        j'en rêve la nuit. Ma relation avec le dev a débuté il y
                        a plusieurs années, et ma soif d'apprendre s'intensifie
                        au fil du savoir que j'assimile. Mon parcours à l'ECV
                        Paris en tant que Chef de Projet Digital, ainsi que mon
                        parcours OpenClassrooms de Développeur Web m'ont permis
                        de déployer mes ailes.
                    </p>
                    <p>
                        Né en 2002, en région parisienne, je suis aussi grand
                        adepte du cinéma thriller, d'escalade, de natation et de
                        spaghettis bolognaises que je consomme en quantités
                        inquiétantes.
                    </p>
                </div>
            </div>
        </section>
    )
}

export default About
