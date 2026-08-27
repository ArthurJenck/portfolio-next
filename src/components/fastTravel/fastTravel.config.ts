// Le composant apparaît après un tiers d'écran de scroll, et verrouille sur
// "contact" à l'approche du bas de page (marge en px).
export const VISIBILITY_THRESHOLD_DIVISOR = 3
export const BOTTOM_MARGIN_PX = 50

export interface FastTravelSection {
    id: string
    label: string
    href: string
}

export const FAST_TRAVEL_SECTIONS: FastTravelSection[] = [
    {
        id: 'accueil',
        label: 'lien vers accueil',
        href: '/',
    },
    {
        id: 'skills',
        label: 'lien vers compétences',
        href: '#skills',
    },
    {
        id: 'projets',
        label: 'lien vers projets',
        href: '#projets',
    },
    {
        id: 'about',
        label: 'lien vers à propos',
        href: '#about',
    },
    {
        id: 'contact',
        label: 'lien vers contact',
        href: '#contact',
    },
]
