import { AUTHOR_EMAIL, AUTHOR_NAME, SITE_NAME, SITE_URL, SOCIAL_LINKS } from './site'

export const HOME_TITLE = 'Arthur Jenck · Développeur Créatif & Front-End à Paris'

export const HOME_DESCRIPTION =
    "Portfolio d'Arthur Jenck, développeur créatif & front-end à Paris. Expériences web immersives avec React, Next.js, TypeScript, GSAP et un vrai soin UX/UI."

export const HOME_KEYWORDS = [
    'Arthur Jenck',
    'Développeur Web',
    'Front-end',
    'NextJS',
    'React',
    'Typescript',
    'Tailwind',
    'UX/UI',
    'Webdesign',
    'Parisienne',
    'Région parisienne',
    'Paris',
    'France',
]

export const personSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: AUTHOR_NAME,
    jobTitle: 'Développeur créatif & front-end',
    url: `${SITE_URL}/`,
    email: `mailto:${AUTHOR_EMAIL}`,
    address: {
        '@type': 'PostalAddress',
        addressLocality: 'Paris',
        addressRegion: 'Île-de-France',
        addressCountry: 'FR',
    },
    alumniOf: [
        { '@type': 'EducationalOrganization', name: 'ECV Paris' },
        { '@type': 'EducationalOrganization', name: 'OpenClassrooms' },
        { '@type': 'EducationalOrganization', name: 'Hetic' },
    ],
    affiliation: {
        '@type': 'EducationalOrganization',
        name: "Gobelins, l'école de l'image",
    },
    knowsAbout: [
        'React',
        'Next.js',
        'TypeScript',
        'Tailwind CSS',
        'GSAP',
        'Three.js',
        'UX/UI Design',
        'Webdesign',
        'Framer Motion',
        'Node.js',
    ],
    sameAs: [SOCIAL_LINKS.github, SOCIAL_LINKS.linkedin, SOCIAL_LINKS.twitter],
})

export const websiteSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: `${SITE_NAME} – Portfolio`,
    url: `${SITE_URL}/`,
    inLanguage: 'fr-FR',
    publisher: {
        '@id': `${SITE_URL}/#person`,
    },
})

export interface BreadcrumbItem {
    name: string
    item: string
}

export const breadcrumbSchema = (items: BreadcrumbItem[]) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((entry, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: entry.name,
        item: entry.item,
    })),
})
