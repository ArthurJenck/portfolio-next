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
