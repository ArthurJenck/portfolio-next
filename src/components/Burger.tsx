'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import ImgLink from './ImgLink'
import '../styles/Burger.scss'
import BurgerLink from './BurgerLink'

const Burger = () => {
    // Checker si le menu Burger est ouvert ou non
    const [isOpen, setIsOpen] = useState(false)

    const burgerLinks = [
        { title: 'Accueil' },
        { href: '#skills', title: 'Compétences' },
        { href: '#projets', title: 'Projets' },
        { href: '#about', title: 'À propos' },
        { href: '#contact', title: 'Contact' },
    ]

    return (
        // S'il est ouvert, le menu burger obtient la class open
        <div className={isOpen ? 'burger open' : 'burger'}>
            {/* Le toggle du burger change l'état au clic */}
            <motion.div
                className="burger-toggle relative z-4 ml-auto flex flex-col gap-2 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                {/* Le span suivant correspond à la barre centrale du burger */}
                <span className="burger-toggle__line z-6 block w-12 h-[5px] bg-white rounded-full transition-all duration-200"></span>
                {/* Le span suivant servira de fond au menu burger une fois ouvert */}
                <span className="burger-background"></span>
            </motion.div>
            {/* Cliquer sur le background du menu burger doit le fermer */}
            <div
                className="burger-menu fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-4 opacity-0 invisible transition-all duration-200 z-6"
                onClick={() => setIsOpen(!isOpen)}
            >
                <ImgLink type="logo" className="size-40" />
                <ul className="flex flex-col items-center justify-center gap-4 mt-6 mb-4">
                    {burgerLinks.map((link) => (
                        <BurgerLink key={link.title} href={link.href} title={link.title} />
                    ))}
                </ul>
                <div className="socials flex gap-3">
                    <ImgLink type="linkedin" className="size-10" />
                    <ImgLink type="github" className="size-10" />
                    <ImgLink type="cv" className="size-10" />
                </div>
            </div>
        </div>
    )
}

export default Burger
