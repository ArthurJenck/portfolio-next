"use client"

import ImgLink from "../components/ImgLink"
import Chevron from "../assets/icons/chevron.svg"
import { scrollTo } from "../hooks"
import "../styles/Header.scss"
import HeroVid from "../components/HeroVid"
import Image from "next/image"

const Header = () => {
    // On récupère l'emplacement vertical de la souris et on le convertit en font-weight pour animer le titre
    const handleH1Wght = (e: React.MouseEvent) => {
        document
            .querySelector("header")!
            .style.setProperty("--h1-weight", JSON.stringify(e.pageY))
    }

    return (
        <header
            // Au clic, on scroll jusqu'à la section suivante
            onClick={() => scrollTo(window.innerHeight)}
            onMouseMove={(e) => handleH1Wght(e)}
            onMouseOver={(e) => handleH1Wght(e)}
        >
            <h1>
                Arthur
                <br />
                Jenck <span>Développeur Web Front-End</span>
            </h1>
            {/* Le stopPropagation évite le scroll en cliquant sur les liens extenes */}
            <div className="socials" onClick={(e) => e.stopPropagation()}>
                <ImgLink
                    type="linkedin"
                    className="w-[clamp(1rem, 14.5vw, 4rem)] md:w-[3.5vw]"
                />
                <ImgLink
                    type="github"
                    className="w-[clamp(1rem, 14.5vw, 4rem)] md:w-[3.5vw]"
                />
                <ImgLink
                    type="cv"
                    className="w-[clamp(1rem, 14.5vw, 4rem)] md:w-[3.5vw]"
                />
            </div>
            <Image
                src={Chevron}
                alt="Passer à la suite"
                className="chevron"
                width={40}
                height={40}
            />
            <HeroVid />
        </header>
    )
}

export default Header
