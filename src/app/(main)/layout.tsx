import type { Metadata } from 'next'
import '@/app/globals.css'
import { MotionProvider } from '@/providers/MotionProvider'
import { cn } from '@/lib/utils'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import SiteLoader from '@/components/loader/SiteLoader'
import { Sora, Montserrat } from 'next/font/google'
import { SITE_URL } from '@/lib/site-config'

// Ce script doit s'exécuter avant le premier paint (pas de "next/script" ici) pour éviter
// tout flash : il pose la classe qui retient le hero (1re visite) ou masque le loader (déjà vu)
const loaderInitScript = `
try {
    if (sessionStorage.getItem('site-loaded')) {
        document.documentElement.classList.add('loader-seen');
    } else {
        document.documentElement.classList.add('loader-active');
    }
} catch (e) {}
`

const sora = Sora({
    subsets: ['latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
    display: 'swap',
    variable: '--font-sora',
})

const montserrat = Montserrat({
    subsets: ['latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
    display: 'swap',
    variable: '--font-montserrat',
})

const HOME_DESCRIPTION =
    "Portfolio d'Arthur Jenck, développeur créatif & front-end à Paris. Expériences web immersives avec React, Next.js, TypeScript, GSAP et un vrai soin UX/UI."

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: 'Arthur Jenck · Développeur Créatif & Front-End à Paris',
        template: '%s · Arthur Jenck',
    },
    description: HOME_DESCRIPTION,
    authors: [{ name: 'Arthur Jenck', url: SITE_URL }],
    creator: 'Arthur Jenck',
    robots: { index: true, follow: true },
    keywords: [
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
    ],
    icons: {
        icon: [
            { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
            { url: '/favicon-light.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: light)' },
            { url: '/favicon-dark.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: dark)' },
        ],
        apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    },
    manifest: '/site.webmanifest',
    alternates: {
        canonical: SITE_URL,
    },
    openGraph: {
        title: 'Arthur Jenck · Développeur Créatif & Front-End à Paris',
        siteName: 'Arthur Jenck',
        type: 'website',
        url: `${SITE_URL}/`,
        locale: 'fr_FR',
        description: HOME_DESCRIPTION,
        images: [
            {
                url: 'https://3jrx06emyedlbjzt.public.blob.vercel-storage.com/share-preview.png',
                width: 1199,
                height: 630,
                alt: "Portfolio d'Arthur Jenck, développeur créatif & front-end à Paris",
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@ArthurJenck',
        title: 'Arthur Jenck · Développeur Créatif & Front-End à Paris',
        description: HOME_DESCRIPTION,
        images: ['https://3jrx06emyedlbjzt.public.blob.vercel-storage.com/share-preview.png'],
    },
    appleWebApp: {
        title: 'Arthur Jenck',
        statusBarStyle: 'black-translucent',
        capable: true,
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="fr" data-scroll-behavior="smooth" suppressHydrationWarning>
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'WebSite',
                            name: 'Arthur Jenck',
                            alternateName: 'Arthur Jenck – Portfolio',
                            url: `${SITE_URL}/`,
                            inLanguage: 'fr-FR',
                            publisher: {
                                '@id': `${SITE_URL}/#person`,
                            },
                        }),
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Person',
                            '@id': `${SITE_URL}/#person`,
                            name: 'Arthur Jenck',
                            jobTitle: 'Développeur créatif & front-end',
                            url: `${SITE_URL}/`,
                            email: 'mailto:arthurjenckdev@gmail.com',
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
                            sameAs: [
                                'https://github.com/arthurjenck',
                                'https://www.linkedin.com/in/arthurjenck/',
                                'https://x.com/ArthurJenck',
                            ],
                        }),
                    }}
                />
                <script dangerouslySetInnerHTML={{ __html: loaderInitScript }} />
                <noscript>
                    <style>{'.site-loader { display: none !important; }'}</style>
                </noscript>
            </head>
            <body className={cn('overflow-x-hidden', sora.className, sora.variable, montserrat.variable)}>
                <div
                    className="fixed inset-0 h-svh -z-10 top-svh"
                    style={{
                        background: 'var(--primary)',
                        backgroundImage: `radial-gradient(circle, rgba(175, 175, 175, 0.2) 1px, transparent 1px)`,
                        backgroundSize: '30px 30px',
                        backgroundPosition: '0 0',
                    }}
                />
                <SiteLoader />
                <MotionProvider>
                    <div className="min-h-screen flex flex-col">
                        <NavBar />
                        {children}
                        <Footer />
                    </div>
                    {/* TODO: remettre le debug */}
                    <Analytics debug={false} />
                    <SpeedInsights debug={false} />
                </MotionProvider>
            </body>
        </html>
    )
}
