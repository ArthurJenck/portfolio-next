import type { Metadata } from 'next'
import { Sora } from 'next/font/google'
import '../globals.css'
import { SITE_URL } from '@/lib/site-config'

const sora = Sora({
    subsets: ['latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
    display: 'swap',
})

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: 'Arthur Jenck • CV',
    description:
        "CV d'Arthur Jenck, développeur web front-end spécialisé en NextJS, React, TypeScript et Tailwind. Expertise en UX/UI et Webdesign.",
    robots: 'index, follow',
    openGraph: {
        title: 'CV - Arthur Jenck, Développeur Web Front-end',
        description:
            "CV d'Arthur Jenck, développeur web front-end spécialisé en NextJS, React, TypeScript et Tailwind.",
        url: `${SITE_URL}/cv`,
        siteName: 'Arthur Jenck',
        type: 'website',
        locale: 'fr_FR',
        images: [{ url: 'https://3jrx06emyedlbjzt.public.blob.vercel-storage.com/share-preview.png' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'CV - Arthur Jenck, Développeur Web Front-end',
        description:
            "CV d'Arthur Jenck, développeur web front-end spécialisé en NextJS, React, TypeScript et Tailwind.",
        images: ['https://3jrx06emyedlbjzt.public.blob.vercel-storage.com/share-preview.png'],
    },
    alternates: {
        canonical: `${SITE_URL}/cv`,
    },
}

export default function CVLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="fr" data-scroll-behavior="smooth">
            <body className={`${sora.className} overflow-hidden`}>
                <div
                    className="fixed inset-0 h-svh -z-10 top-svh"
                    style={{
                        background: 'var(--primary)',
                        backgroundImage: `radial-gradient(circle, rgba(120, 120, 120, 0.2) 1px, transparent 1px)`,
                        backgroundSize: '30px 30px',
                        backgroundPosition: '0 0',
                    }}
                />
                {children}
            </body>
        </html>
    )
}
