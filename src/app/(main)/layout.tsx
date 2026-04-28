import type { Metadata } from 'next'
import '@/app/globals.css'
import { QueryProvider } from '@/providers/QueryProvider'
import { PrefetchProvider } from '@/providers/PrefetchProvider'
import { MotionProvider } from '@/providers/MotionProvider'
import { cn } from '@/lib/utils'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import { Sora, Montserrat } from 'next/font/google'
import Script from 'next/script'

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

export const metadata: Metadata = {
    title: 'Arthur Jenck',
    description:
        "Portfolio d'Arthur Jenck, développeur web front-end passionné en région parisienne, spécialisé NextJS, React, Typescript et Tailwind, expert en UX/UI et Webdesign.",
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
        canonical: 'https://arthurjenck.com',
    },
    openGraph: {
        title: "Portfolio d'Arthur Jenck, Développeur Web Front-end",
        siteName: 'Arthur Jenck',
        type: 'website',
        url: 'https://arthurjenck.com/',
        description:
            "Portfolio d'Arthur Jenck, développeur web front-end passionné en région parisienne, spécialisé NextJS, React, Typescript et Tailwind, expert en UX/UI et Webdesign.",
        images: [{ url: 'https://3jrx06emyedlbjzt.public.blob.vercel-storage.com/share-preview.png' }],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@ArthurJenck',
        title: "Portfolio d'Arthur Jenck, Développeur Web Front-end",
        description:
            "Portfolio d'Arthur Jenck, développeur web front-end passionné spécialisé React, expert en UX/UI et Webdesign.",
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
        <html lang="fr">
            <head>
                <Script
                    id="schema-website"
                    type="application/ld+json"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'WebSite',
                            name: 'Arthur Jenck',
                            alternateName: 'Arthur Jenck – Portfolio',
                            url: 'https://arthurjenck.com/',
                        }),
                    }}
                />
                <Script
                    id="schema-person"
                    type="application/ld+json"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Person',
                            name: 'Arthur Jenck',
                            jobTitle: 'Développeur web front-end',
                            url: 'https://arthurjenck.com/',
                            sameAs: [
                                'https://github.com/arthurjenck',
                                'https://www.linkedin.com/in/arthurjenck/',
                                'https://x.com/ArthurJenck',
                            ],
                        }),
                    }}
                />
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
                <QueryProvider>
                    <PrefetchProvider>
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
                    </PrefetchProvider>
                </QueryProvider>
            </body>
        </html>
    )
}
