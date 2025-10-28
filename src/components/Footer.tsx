'use client'

import { Heart } from 'lucide-react'
import ImgLink from './header/ImgLink'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const Footer = () => {
    const [clicked, setClicked] = useState(false)
    const [showRays, setShowRays] = useState(false)

    const handleClick = () => {
        setClicked(!clicked)
        if (!clicked) {
            setShowRays(true)
            setTimeout(() => setShowRays(false), 600)
        }
    }

    // Créer 8 rayons positionnés en cercle
    const rays = Array.from({ length: 8 }, (_, i) => {
        const angle = (i * 360) / 8
        return {
            id: i,
            angle,
            // Calculer la position de départ et d'arrivée
            x: Math.cos((angle * Math.PI) / 180),
            y: Math.sin((angle * Math.PI) / 180),
        }
    })

    return (
        <footer className="relative bg-[var(--secondary)] flex flex-col md:flex-row justify-between items-center py-4 md:py-4 px-0 md:px-8 gap-4 md:gap-0">
            <div className="flex flex-col md:flex-row items-center gap-[1.5vw]">
                <ImgLink type="logo" className="size-16" />
                <p className="font-bold tracking-[1px] text-center md:text-left">
                    Merci d'être passé, ça vous a plu ?<span className="block">N'hésitez pas à me le dire !</span>
                </p>
                <div className="relative flex items-center justify-center">
                    <motion.div
                        className="flex items-center justify-center rounded-full bg-white p-2.5 cursor-pointer relative overflow-visible"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleClick}
                    >
                        <Heart size={25} fill={clicked ? '#FCBF32' : 'var(--secondary)'} />

                        {/* Rayons animés */}
                        <AnimatePresence>
                            {showRays &&
                                rays.map((ray) => (
                                    <motion.div
                                        key={ray.id}
                                        className="absolute rounded-full"
                                        style={{
                                            backgroundColor: '#FCBF32',
                                            width: '2px',
                                            height: '8px',
                                            left: '50%',
                                            top: '50%',
                                            transformOrigin: 'center center',
                                        }}
                                        initial={{
                                            scale: 0,
                                            x: '-50%',
                                            y: '-50%',
                                            opacity: 1,
                                            rotate: ray.angle - 90,
                                        }}
                                        animate={{
                                            scale: 1,
                                            x: `calc(-50% + ${ray.x * 20}px)`,
                                            y: `calc(-50% + ${ray.y * 20}px)`,
                                            opacity: 0,
                                            rotate: ray.angle - 90,
                                        }}
                                        exit={{ opacity: 0 }}
                                        transition={{
                                            duration: 0.5,
                                            ease: 'easeOut',
                                        }}
                                    />
                                ))}
                        </AnimatePresence>
                    </motion.div>
                    <p className="absolute -bottom-6">126</p>
                </div>
            </div>
            <div className="socials flex justify-center items-center gap-2">
                <ImgLink type="linkedin" />
                <ImgLink type="github" />
            </div>
        </footer>
    )
}

export default Footer
