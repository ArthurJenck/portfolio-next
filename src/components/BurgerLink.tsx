import { useScroll } from "@/hooks/useScroll"

interface BurgerLinkProps {
    href?: string
    title: string
}

const BurgerLink = ({ href, title }: BurgerLinkProps) => {
    const scrollTo = useScroll()

    return (
        <li>
            {/* Le preventDefault sert à éviter le rechargement de la page en cliquant sur le lien. On utilise alors la fonction scrollTo pour remonter en haut de la page et nettoyer l'url */}
            <a
                className="burger-link font-bold text-2xl tracking-[1px] relative select-none"
                href={href}
                onClick={(e) => {
                    if (!href) {
                        e.preventDefault()
                        scrollTo(0)
                    }
                }}
            >
                {title}
            </a>
        </li>
    )
}

export default BurgerLink
