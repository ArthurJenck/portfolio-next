'use client'

import ImgLink from './ImgLink'
import Chevron from '../../assets/icons/chevron.svg'
import { useScroll } from '../../hooks/useScroll'
import './Header.scss'
import HeroVid from './HeroVid'
import Image from 'next/image'

const Header = () => {
    const scrollTo = useScroll()

    // On récupère l'emplacement vertical de la souris et on le convertit en font-weight pour animer le titre
    const handleH1Wght = (e: React.MouseEvent) => {
        document.querySelector('header')!.style.setProperty('--h1-weight', JSON.stringify(e.pageY))
    }
    //
    return (
        <header
            // Au clic, on scroll jusqu'à la section suivante
            onClick={() => scrollTo(window.innerHeight)}
            onMouseMove={(e) => handleH1Wght(e)}
            onMouseOver={(e) => handleH1Wght(e)}
            className="flex flex-col items-center justify-center scroll-smooth h-svh relative"
        >
            <h1 className="md:max-w-[50vw] text-center text-[clamp(1rem,23vw,100px)] lg:text-[11.5vw] leading-[90%]">
                Arthur
                <br />
                Jenck{' '}
                <span className="hero-typing size-fit block mx-auto tracking-normal leading-normal whitespace-nowrap overflow-hidden border-white border-r-2 text-[clamp(10px,3.5vw,1rem)] md:text-[1.5vw]">
                    Développeur Web Front-End
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
