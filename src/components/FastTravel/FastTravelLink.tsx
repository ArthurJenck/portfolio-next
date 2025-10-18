"use client"

import Link from "next/link"
import { useScroll } from "@/hooks/useScroll"
import { FastTravelSection } from "./fastTravelConfig"

interface FastTravelLinkProps {
    section: FastTravelSection
    isActive: boolean
}

const FastTravelLink = ({ section, isActive }: FastTravelLinkProps) => {
    const scrollTo = useScroll()

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()

        // Pour le lien accueil, on scroll en haut et on nettoie l'URL
        if (section.id === "accueil") {
            scrollTo(0)
            return
        }

        // Pour les autres sections, on scroll vers l'élément
        const element = document.querySelector<HTMLElement>(`#${section.id}`)
        if (element) {
            const offsetTop = element.offsetTop
            scrollTo(offsetTop)
        }
    }

    return (
        <li>
            <Link
                href={section.href}
                onClick={handleClick}
                className={isActive ? "current" : ""}
                aria-label={section.label}
            />
        </li>
    )
}

export default FastTravelLink
