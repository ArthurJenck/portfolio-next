"use client"

import { useDebounce, isMobileDevice } from "../hooks"
import ImgLink from "./ImgLink"
import Burger from "./Burger"
import { useEffect } from "react"

const NavBar = () => {
    const changeNavOpacity = () => {
        // En mobile, le logo de la nav disparaît après avoir scrollé
        const navLogoOpacity = document.querySelector(".logo-link")!
        scrollY > 0
            ? navLogoOpacity.setAttribute(
                  "style",
                  "opacity:0; pointer-events: none"
              )
            : navLogoOpacity.setAttribute("style", "opacity:1")
    }

    // On ajoute un debounce sur les fonctions onScroll pour éviter la surcharge d'événements et de lag
    const debouncedChangeNavOpac = useDebounce(changeNavOpacity, 10)

    useEffect(() => {
        // On n'ajoute l'écouteur d'événement que si l'appareil est un téléphone ou une tablette
        if (isMobileDevice()) {
            window.addEventListener("scroll", debouncedChangeNavOpac, {
                passive: true,
            })

            return () => {
                window.removeEventListener("scroll", debouncedChangeNavOpac)
            }
        }
    }, [])

    return (
        <nav className="fixed top-8 left-[4vw] right-[4vw] z-50 h-16 md:h-fit flex justify-between items-center pointer-events-none">
            <ImgLink for="logo" className="size-[5vw] block" />
            <Burger />
        </nav>
    )
}

export default NavBar
