import type { Metadata } from 'next'
import { Sora, Montserrat } from 'next/font/google'
import '@/app/globals.css'
import { QueryProvider } from '@/providers/QueryProvider'
import { PrefetchProvider } from '@/providers/PrefetchProvider'
import { cn } from '@/lib/utils'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'

const sora = Sora({
    subsets: ['latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
    display: 'swap',
})

const montserrat = Montserrat({
    subsets: ['latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'Arthur Jenck',
    description:
        "Portfolio d'Arthur Jenck, développeur web front-end passionné spécialisé React, expert en UX/UI et Webdesign.",
    robots: 'index',
    openGraph: {
        title: "Portfolio d'Arthur Jenck, Développeur Web Front-end",
        type: 'website',
        url: 'https://arthurjenck.com/',
        description:
            "Portfolio d'Arthur Jenck, développeur web front-end passionné spécialisé React, expert en UX/UI et Webdesign.",
        images: [
            {
                url: 'https://i.ibb.co/r6Pk1wC/share-preview.png',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@ArthurJenck',
        title: "Portfolio d'Arthur Jenck, Développeur Web Front-end",
        description:
            "Portfolio d'Arthur Jenck, développeur web front-end passionné spécialisé React, expert en UX/UI et Webdesign.",
        images: ['https://i.ibb.co/r6Pk1wC/share-preview.png'],
    },
    icons: {
        icon: [
            { url: '/favicon.ico', type: 'image/x-icon' },
            { url: '/favicon.svg', type: 'image/svg+xml' },
        ],
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
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://arthurjenck.com/',
                            '@type': 'WebSite',
                            name: 'Arthur Jenck – Portfolio',
                            url: 'https://arthurjenck.com/',
                        }),
                    }}
                />
            </head>
            <body className={cn('overflow-x-hidden', sora.className, montserrat.className)}>
                <QueryProvider>
                    <PrefetchProvider>
                        <div className="min-h-screen flex flex-col">
                            <NavBar />
                            {children}
                            <Footer />
                        </div>
                        <Analytics />
                        <SpeedInsights />
                    </PrefetchProvider>
                </QueryProvider>
            </body>
        </html>
    )
}
