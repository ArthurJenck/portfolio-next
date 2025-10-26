'use client'

import ImgLink from './ImgLink'
import Burger from './Burger'
import { useScroll, useMotionValue, useSpring, motion } from 'framer-motion'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NavBar = () => {
    const pathname = usePathname()
    const isLanding = pathname === '/'

    // Utilisation de useScroll de Framer Motion (optimisé avec requestAnimationFrame)
    const { scrollY } = useScroll()

    // Crée une MotionValue pour l'opacité
    const logoOpacityTarget = useMotionValue(1)

    // Ajoute un spring pour adoucir la transition
    const logoOpacity = useSpring(logoOpacityTarget, {
        stiffness: 300,
        damping: 30,
    })

    // Met à jour l'opacité selon le scroll
    useEffect(() => {
        return scrollY.on('change', (latest) => {
            logoOpacityTarget.set(latest > 0 ? 0 : 1)
        })
    }, [])

    return (
        <>
            {/* Version mobile : logo qui disparaît au scroll */}
            <nav
                className={cn(
                    'md:hidden fixed top-8 left-[4vw] right-[4vw] z-50 h-16 flex items-center pointer-events-none',
                    isLanding ? 'justify-between' : 'justify-end',
                )}
            >
                {isLanding && (
                    <motion.div
                        style={{ opacity: logoOpacity }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="pointer-events-auto"
                    >
                        <ImgLink type="logo" className="size-[4rem]" />
                    </motion.div>
                )}
                <div className="pointer-events-auto">
                    <Burger />
                </div>
            </nav>

            {/* Version desktop : logo toujours visible */}
            <nav className="hidden md:flex fixed top-8 left-[4vw] right-[4vw] z-50 h-fit justify-between items-center pointer-events-none">
                <ImgLink type="logo" className="size-[5vw] pointer-events-auto" />
                <div className="pointer-events-auto">
                    <Burger />
                </div>
            </nav>
        </>
    )
}

export default NavBar
