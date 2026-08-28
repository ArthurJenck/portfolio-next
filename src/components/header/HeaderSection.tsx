'use client'

import { useEffect, useRef } from 'react'
import ImgLink from './ImgLink'
import Chevron from '../../assets/icons/chevron.svg'
import { useScroll } from '../../hooks/useScroll'
import './Header.scss'
import HeroVid from './HeroVid'
import Image from 'next/image'

const Header = () => {
    const scrollTo = useScroll()
    const typingRef = useRef<HTMLSpanElement>(null)

    // On récupère l'emplacement vertical de la souris et on le convertit en font-weight pour animer le titre
    const handleH1Wght = (e: React.MouseEvent) => {
        document.querySelector('header')!.style.setProperty('--h1-weight', JSON.stringify(e.pageY))
    }

    useEffect(() => {
        const el = typingRef.current
        if (!el) return

        el.style.setProperty('--type-steps', `${el.textContent?.length ?? 0}`)

        const updateWidth = () => {
            const borderRight = parseFloat(getComputedStyle(el).borderRightWidth) || 0
            el.style.setProperty('--type-width', `${el.scrollWidth + borderRight}px`)
        }
        updateWidth()

        const handleAnimationEnd = (e: AnimationEvent) => {
            if (e.animationName === 'typing-reveal') el.classList.add('is-typed')
        }

        window.addEventListener('resize', updateWidth)
        el.addEventListener('animationend', handleAnimationEnd)
        return () => {
            window.removeEventListener('resize', updateWidth)
            el.removeEventListener('animationend', handleAnimationEnd)
        }
    }, [])
    //
    // Au clic, on scroll jusqu'à la section suivante. On vise la section elle-même et non
    // une hauteur d'écran : le bloc de transition du tunnel s'intercale entre les deux, et
    // un saut d'un écran s'arrêterait au milieu.
    const scrollToNextSection = () => {
        const next = document.querySelector<HTMLElement>('#skills')
        scrollTo(next ? next.offsetTop : window.innerHeight)
    }

    return (
        <header
            onClick={scrollToNextSection}
            onMouseMove={(e) => handleH1Wght(e)}
            onMouseOver={(e) => handleH1Wght(e)}
            className="flex flex-col items-center justify-center scroll-smooth h-svh relative"
        >
            <h1 className="md:max-w-[50vw] text-center text-[clamp(1rem,23vw,100px)] lg:text-[11.5vw] leading-[90%]">
                Arthur
                <br />
                Jenck{' '}
                <span
                    ref={typingRef}
                    className="hero-typing block mx-auto tracking-normal leading-normal whitespace-nowrap overflow-hidden border-white border-r-2 text-[clamp(10px,3.5vw,1rem)] md:text-[1.5vw]"
                >
                    Développeur Créatif sur Paris
                </span>
            </h1>
            {/* Le stopPropagation évite le scroll en cliquant sur les liens extenes */}
            <div
                className="socials flex justify-center items-center gap-6 lg:gap-[1.5vw] mt-6 lg:mt-[1.5vw]"
                onClick={(e) => e.stopPropagation()}
            >
                <ImgLink type="linkedin" className="w-[clamp(1rem,14.5vw,4rem)] md:w-[clamp(3rem,3.5vw,3.5vw)]" />
                <ImgLink type="github" className="w-[clamp(1rem,14.5vw,4rem)] md:w-[clamp(3rem,3.5vw,3.5vw)]" />
                <ImgLink type="cv" className="w-[clamp(1rem,14.5vw,4rem)] md:w-[clamp(3rem,3.5vw,3.5vw)]" />
            </div>
            <Image
                src={Chevron}
                alt="Passer à la suite"
                className="chevron absolute bottom-0 left-1/2 transform -translate-x-1/2 cursor-pointer w-8 md:w-[1.5vw]"
                width={40}
                height={40}
            />
            <HeroVid />
        </header>
    )
}

export default Header
