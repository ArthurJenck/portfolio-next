'use client'

import { useEffect, useState } from 'react'
import '../../styles/FastTravel.scss'
import FastTravelLink from './FastTravelLink'
import { FAST_TRAVEL_SECTIONS } from './fastTravelConfig'

const FastTravel = () => {
    const [isVisible, setIsVisible] = useState(false)
    const [currentSection, setCurrentSection] = useState('accueil')

    useEffect(() => {
        let ticking = false

        const updateCurrentSection = () => {
            const scrollY = window.scrollY
            const windowHeight = window.innerHeight
            const scrollHeight = document.documentElement.scrollHeight

            // Gérer la visibilité du composant
            setIsVisible(scrollY > windowHeight / 3)

            // Liste des sections à vérifier (dans l'ordre)
            const sections = ['skills', 'projets', 'about', 'contact']

            // CAS 1 : Si on est en bas de page (moins de 50px de marge)
            if (scrollHeight - scrollY - windowHeight < 50) {
                setCurrentSection('contact')
                ticking = false
                return
            }

            // CAS 2 : Trouver la section active
            // On prend la DERNIÈRE section dont le top a atteint ou dépassé le milieu de l'écran
            // Cela garantit une transition fluide sans trou
            let currentSectionId = 'accueil'
            const midPoint = windowHeight / 2

            for (const sectionId of sections) {
                const element = document.querySelector<HTMLElement>(`#${sectionId}`)
                if (element) {
                    const rect = element.getBoundingClientRect()

                    // Si le top de la section a atteint ou dépassé le milieu de l'écran
                    if (rect.top < midPoint) {
                        currentSectionId = sectionId
                    }
                }
            }

            setCurrentSection(currentSectionId)
            ticking = false
        }

        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(updateCurrentSection)
                ticking = true
            }
        }

        // Forcer une mise à jour après un scroll programmatique
        const handleScrollToComplete = () => {
            updateCurrentSection()
        }

        // Vérifier la position initiale
        updateCurrentSection()

        // Écouter le scroll avec passive pour les performances
        window.addEventListener('scroll', handleScroll, { passive: true })

        // Écouter les scrolls programmatiques
        window.addEventListener('scrollToComplete', handleScrollToComplete)

        // Cleanup
        return () => {
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('scrollToComplete', handleScrollToComplete)
        }
    }, [])

    return (
        <ul
            className="hidden md:flex flex-col gap-[2vw] fixed right-[4vw] top-3/7 -translate-y-1/2 opacity-0 invisible transition-all duration-200 z-4"
            style={{
                visibility: isVisible ? 'visible' : 'hidden',
                opacity: isVisible ? 1 : 0,
            }}
        >
            {FAST_TRAVEL_SECTIONS.map((section) => (
                <FastTravelLink key={section.id} section={section} isActive={currentSection === section.id} />
            ))}
        </ul>
    )
}

export default FastTravel
