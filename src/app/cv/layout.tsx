import type { Metadata } from 'next'
import { Sora } from 'next/font/google'
import '../globals.css'

const sora = Sora({
    subsets: ['latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'Arthur Jenck • CV',
    description:
        "CV d'Arthur Jenck, développeur web front-end spécialisé en NextJS, React, TypeScript et Tailwind. Expertise en UX/UI et Webdesign.",
    robots: 'index, follow',
    openGraph: {
        title: 'CV - Arthur Jenck, Développeur Web Front-end',
        description:
            "CV d'Arthur Jenck, développeur web front-end spécialisé en NextJS, React, TypeScript et Tailwind.",
        url: 'https://arthurjenck.com/cv',
        siteName: 'Arthur Jenck',
        type: 'website',
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
        canonical: 'https://arthurjenck.com/cv',
    },
}

export default function CVLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="fr">
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
