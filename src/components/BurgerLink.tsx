import { useScroll } from '@/hooks/useScroll'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import localFont from 'next/font/local'
import { Ballet, Festive, Limelight, Meddon } from 'next/font/google'

interface BurgerLinkProps {
    href?: string
    title: string
}

const mtfDoodle = localFont({
    src: '../assets/fonts/MTFDoodle.otf',
})

const limelight = Limelight({
    subsets: ['latin'],
    weight: ['400'],
    display: 'swap',
})

const ballet = Ballet({
    subsets: ['latin'],
    weight: ['400'],
    display: 'swap',
})

const meddon = Meddon({
    subsets: ['latin'],
    weight: ['400'],
    display: 'swap',
})

const festive = Festive({
    subsets: ['latin'],
    weight: ['400'],
    display: 'swap',
})

const fonts = [
    'Sora',
    limelight.style.fontFamily,
    ballet.style.fontFamily,
    meddon.style.fontFamily,
    festive.style.fontFamily,
    mtfDoodle.style.fontFamily,
]

const BurgerLink = ({ href, title }: BurgerLinkProps) => {
    const scrollTo = useScroll()
    const pathname = usePathname()
    const isHomePage = pathname === '/'
    const [isHovered, setIsHovered] = useState(false)
    const [currentFontIndex, setCurrentFontIndex] = useState(0)

    useEffect(() => {
        if (isHovered) {
            const interval = setInterval(() => {
                setCurrentFontIndex((prevIndex) => (prevIndex + 1) % fonts.length)
            }, 350)

            return () => clearInterval(interval)
        }
    }, [isHovered])

    const handleMouseEnter = () => {
        setIsHovered(true)
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
        setCurrentFontIndex(0)
    }

    return (
        <li>
            {/* Le preventDefault sert à éviter le rechargement de la page en cliquant sur le lien. On utilise alors la fonction scrollTo pour remonter en haut de la page et nettoyer l'url */}
            <Link
                className="burger-link font-bold text-2xl tracking-[1px] relative select-none cursor-pointer"
                href={isHomePage ? href || '/' : `/${href || ''}`}
                onClick={(e) => {
                    if (!href && isHomePage) {
                        e.preventDefault()
                        scrollTo(0)
                    }
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{ fontFamily: fonts[currentFontIndex] }}
            >
                {title}
            </Link>
        </li>
    )
}

export default BurgerLink
