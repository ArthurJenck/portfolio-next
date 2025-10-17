"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import ImgLink from "./ImgLink"
import "../styles/Burger.scss"
import { scrollTo } from "../hooks"

const Burger = () => {
    // Checker si le menu Burger est ouvert ou non
    const [isOpen, setIsOpen] = useState(false)

    return (
        // S'il est ouvert, le menu burger obtient la class open
        <div className={isOpen ? "burger open" : "burger"}>
            {/* Le toggle du burger change l'état au clic */}
            <motion.div
                className="burger-toggle"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                {/* Le span suivant correspond à la barre centrale du burger */}
                <span></span>
                {/* Le span suivant servira de fond au menu burger une fois ouvert */}
                <span className="burger-background"></span>
            </motion.div>
            {/* Cliquer sur le background du menu burger doit le fermer */}
            <div className="burger-menu" onClick={() => setIsOpen(!isOpen)}>
                <ImgLink type="logo" className="size-40" />
                <ul>
                    <li>
                        {/* Le preventDefault sert à éviter le rechargement de la page en cliquant sur le lien. On utilise alors la fonction scrollTo pour remonter en haut de la page et nettoyer l'url */}
                        <a
                            href="/"
                            onClick={(e) => {
                                e.preventDefault()
                                scrollTo(0)
                            }}
                        >
                            Accueil
                        </a>
                    </li>
                    <li>
                        <a href="#skills">Compétences</a>
                    </li>
                    <li>
                        <a href="#projets">Projets</a>
                    </li>
                    <li>
                        <a href="#about">À propos</a>
                    </li>
                    <li>
                        <a href="#contact">Contact</a>
                    </li>
                </ul>
                <div className="socials">
                    <ImgLink type="linkedin" />
                    <ImgLink type="github" />
                    <ImgLink type="cv" />
                </div>
            </div>
        </div>
    )
}

export default Burger
